import {
  claimWebhookMessage,
  constantTimeStringEqual,
  finishWebhookMessage,
  isWhatsAppSignatureValid,
  processCustomerMessage,
  ProviderError,
  safeWebhookError,
  sendWhatsAppText,
} from "../../../../lib/pulso-agent.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const MAX_WEBHOOK_BYTES = 1_000_000;

async function readBoundedBody(request: Request): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_WEBHOOK_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token") || "";
  const challenge = url.searchParams.get("hub.challenge") || "";
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expectedToken) return new Response("Webhook not configured", { status: 503 });
  if (mode !== "subscribe" || !challenge || !constantTimeStringEqual(token, expectedToken)) {
    return new Response("Forbidden", { status: 403 });
  }
  return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

type WhatsAppMessage = { id?: string; from?: string; type?: string; text?: { body?: string } };
type WebhookBody = { entry?: Array<{ changes?: Array<{ value?: { metadata?: { phone_number_id?: string }; messages?: WhatsAppMessage[] } }> }> };

export async function POST(request: Request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return json({ error: "webhook_not_configured" }, 503);
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_WEBHOOK_BYTES) return json({ error: "payload_too_large" }, 413);

  let rawBody: string;
  try {
    const boundedBody = await readBoundedBody(request);
    if (boundedBody === null) return json({ error: "payload_too_large" }, 413);
    rawBody = boundedBody;
  } catch { return json({ error: "invalid_payload" }, 400); }
  if (!isWhatsAppSignatureValid(rawBody, request.headers.get("x-hub-signature-256"), appSecret)) {
    return json({ error: "invalid_signature" }, 401);
  }

  let body: WebhookBody;
  try { body = JSON.parse(rawBody) as WebhookBody; }
  catch { return json({ error: "invalid_json" }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body) || (body.entry !== undefined && !Array.isArray(body.entry))) {
    return json({ error: "invalid_payload" }, 400);
  }
  const expectedPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!expectedPhoneNumberId) return json({ error: "whatsapp_not_configured" }, 503);

  const messages = (body.entry ?? []).flatMap((entry) => Array.isArray(entry?.changes) ? entry.changes : []).flatMap((change) => {
    if (!change || typeof change !== "object") return [];
    const value = change.value;
    if (!value || !Array.isArray(value.messages) || value.metadata?.phone_number_id !== expectedPhoneNumberId) return [];
    return value.messages;
  });

  for (const incoming of messages) {
    if (!incoming || typeof incoming !== "object") continue;
    const id = incoming.id;
    const phone = incoming.from;
    if (!id || !phone || !/^\d{8,15}$/.test(phone)) continue;
    if (!claimWebhookMessage(id)) continue;
    let succeeded = false;
    try {
      const message = incoming.type === "text" && typeof incoming.text?.body === "string"
        ? incoming.text.body.slice(0, 4000)
        : "Recebi uma mensagem em formato que não consigo ler por aqui. Por favor, escreva sua dúvida em texto ou fale com a equipe pelo WhatsApp.";
      const reply = await processCustomerMessage(phone, message);
      await sendWhatsAppText(phone, reply);
      succeeded = true;
    } catch (error) {
      const code = safeWebhookError(error);
      console.warn("[pulso-agent] WhatsApp webhook processing failed", { code });
      finishWebhookMessage(id, false);
      return json({ error: "temporarily_unavailable", provider: error instanceof ProviderError ? error.provider : undefined }, 503);
    } finally {
      if (succeeded) finishWebhookMessage(id, true);
    }
  }

  return json({ received: true });
}
