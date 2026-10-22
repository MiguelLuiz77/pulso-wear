import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import {
  agentCatalog,
  calculateOrder,
  claimWebhookMessage,
  finishWebhookMessage,
  interpretCustomerMessage,
  isWhatsAppSignatureValid,
  parseWebsiteOrder,
  processCustomerMessage,
  ProviderError,
  resetAgentEphemeralStateForTests,
  sendWhatsAppText,
  supportedShippingStates,
} from "../lib/pulso-agent.ts";
import { GET, POST } from "../app/api/whatsapp/webhook/route.ts";

const fixedNow = Date.parse("2026-10-21T15:00:00.000Z");
const asJsonResponse = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });

function mockInterpretation(value: object): typeof fetch {
  return async () => asJsonResponse({ choices: [{ message: { content: JSON.stringify(value) } }] });
}

const intent = (overrides: Record<string, unknown> = {}) => ({
  intent: "build_order",
  productIds: [],
  items: [],
  state: null,
  payment: null,
  couponCode: null,
  replyDraft: "",
  ...overrides,
});

test("catálogo JSON contém os produtos e valores definidos e exclui a camiseta do Brasil", () => {
  const prices = new Map(agentCatalog.map((product) => [product.id, product.priceCents]));
  assert.equal(agentCatalog.length, 18);
  assert.equal(prices.get("calca-jeans"), 10500);
  assert.equal(prices.get("bermuda-tecnologica"), 5900);
  assert.equal(prices.get("cuecas"), 3300);
  assert.equal(agentCatalog.some((product) => /brasil/i.test(product.name)), false);
  assert.deepEqual(agentCatalog.find((product) => product.id === "calca-de-moletom")?.sizes, ["M", "G"]);
  assert.deepEqual(agentCatalog.find((product) => product.id === "bermuda-tecnologica")?.sizes, ["P", "M", "G", "G1", "G2", "G3", "G4"]);
  assert.deepEqual(agentCatalog.find((product) => product.id === "bermuda-de-sarja")?.sizes, ["38", "40", "42", "44", "46", "48"]);
  assert.equal(agentCatalog.find((product) => product.id === "calca-feminina")?.availability, "coming-soon");
});

test("desconto por quantidade: 3 peças sem desconto e 4 peças com R$ 5 por peça", () => {
  const three = calculateOrder([{ productId: "calca-jeans", size: "38", quantity: 3 }], "SP");
  assert.equal(three.subtotalCents, 31500);
  assert.equal(three.wholesaleDiscountCents, 0);
  assert.equal(three.totalCents, 33500);

  const four = calculateOrder([{ productId: "calca-jeans", size: "38", quantity: 4 }], "SP");
  assert.equal(four.subtotalCents, 42000);
  assert.equal(four.wholesaleDiscountCents, 2000);
  assert.equal(four.totalCents, 42000);
});

test("frete determinístico para todas as UFs cadastradas e pendente para as demais", () => {
  const shipping = new Map<string, number>([["SP", 2000], ["RJ", 2500], ["MG", 2500], ["ES", 2800], ["PR", 2800], ["SC", 3000], ["RS", 3200], ["DF", 3000], ["GO", 3000]]);
  assert.deepEqual([...supportedShippingStates].sort(), [...shipping.keys()].sort());
  for (const [state, cents] of shipping) assert.equal(calculateOrder([{ productId: "cuecas", size: "P", quantity: 1 }], state).shippingCents, cents);
  const unlisted = calculateOrder([{ productId: "cuecas", size: "P", quantity: 1 }], "PA");
  assert.equal(unlisted.shippingCents, null);
  assert.equal(unlisted.totalCents, null);
});

test("cupom influ10, cupom pulso5 dentro do prazo e pulso5 expirado", () => {
  const items = [{ productId: "camiseta-peruana", size: "M", quantity: 1 }];
  assert.equal(calculateOrder(items, "SP", "influ10", fixedNow).couponDiscountCents, 550);
  assert.equal(calculateOrder(items, "SP", "pulso5", fixedNow).couponDiscountCents, 275);
  assert.throws(() => calculateOrder(items, "SP", "pulso5", Date.parse("2026-10-25T00:00:00Z")), /expirou/);
});

test("dados de pedido ausentes ou inválidos não são aceitos", () => {
  assert.throws(() => calculateOrder([], "SP"), /ao menos um produto/);
  assert.throws(() => calculateOrder([{ productId: "inventado", size: "M", quantity: 1 }], "SP"), /catálogo/);
  assert.throws(() => calculateOrder([{ productId: "calca-de-moletom", size: "P", quantity: 1 }], "SP"), /Tamanho inválido/);
  assert.throws(() => calculateOrder([{ productId: "cuecas", size: "M", quantity: 0 }], "SP"), /quantidade/);
  assert.throws(() => calculateOrder([{ productId: "calca-feminina", size: "40", quantity: 1 }], "SP"), /em breve/);
  assert.throws(() => calculateOrder([{ productId: "calca-social", size: "40", quantity: 1, modelIndex: 99 }], "SP"), /Modelo inválido/);
});

test("pedido mantém modelos distintos do mesmo produto e tamanho", () => {
  const result = calculateOrder([
    { productId: "calca-social", size: "40", quantity: 1, modelIndex: 0 },
    { productId: "calca-social", size: "40", quantity: 1, modelIndex: 1 },
  ], "SP");
  assert.equal(result.items.length, 2);
  assert.deepEqual(result.items.map((item) => item.modelIndex), [0, 1]);
  assert.equal(result.pieces, 2);
});

test("pedido completo do site é reconhecido e preços/totais do navegador são ignorados", async () => {
  resetAgentEphemeralStateForTests();
  const message = `Olá! Gostaria de fazer um pedido na PULSO°.\n\nMeu pedido:\n\n- Calça jeans\n  Modelo 01 · Tamanho: 40\n  Quantidade: 4\n  Preço original por unidade: R$ 1,00\n  Subtotal: R$ 0,01\n\nQuantidade total: 4 peça(s)\nSubtotal original: R$ 0,01\nDesconto de atacado: R$ 0,00\nCupom aplicado: nenhum\nTotal final: R$ 0,01`;
  const parsed = parseWebsiteOrder(message);
  assert.equal(parsed.isWebsiteOrder, true);
  assert.deepEqual(parsed.items, [{ productId: "calca-jeans", size: "40", quantity: 4, modelIndex: 0 }]);
  const first = await processCustomerMessage("5511999990001", message, { env: {}, now: fixedNow });
  assert.match(first, /Subtotal: R\$\s*420,00/);
  assert.match(first, /Desconto por quantidade: R\$\s*20,00/);
  assert.match(first, /Pix ou cartão/);
  assert.doesNotMatch(first, /qual é a UF/);
  const second = await processCustomerMessage("5511999990001", "Pix", { env: {}, now: fixedNow + 1000 });
  assert.match(second, /qual é a UF/);
  const third = await processCustomerMessage("5511999990001", "UF: SP", { env: {}, now: fixedNow + 2000 });
  assert.match(third, /Subtotal: R\$\s*420,00/);
  assert.match(third, /Desconto por quantidade: R\$\s*20,00/);
  assert.match(third, /Frete: R\$\s*20,00/);
  assert.match(third, /Total final: R\$\s*420,00/);
  assert.match(third, /Chave Pix:/);
});

test("pagamento Pix só mostra a chave na etapa adequada e não confirma pagamento", async () => {
  resetAgentEphemeralStateForTests();
  const message = `Meu pedido:\n- Cuecas\n  Modelo 01 · Tamanho: M\n  Quantidade: 1\nSubtotal original: R$ 33,00`;
  await processCustomerMessage("5511999990002", message, { env: {}, now: fixedNow });
  await processCustomerMessage("5511999990002", "UF: RJ", { env: {}, now: fixedNow + 1000 });
  const reply = await processCustomerMessage("5511999990002", "Pix", { env: {}, now: fixedNow + 2000 });
  assert.match(reply, /69\.565\.840\/0001-06/);
  assert.match(reply, /confira o nome e os dados do destinatário/);
  assert.match(reply, /não confirma pagamento automaticamente/);
});

test("UF sem frete cadastrado deixa o total pendente e não mostra a chave Pix", async () => {
  resetAgentEphemeralStateForTests();
  const message = `Meu pedido:\n- Cuecas\n  Modelo 01 · Tamanho: M\n  Quantidade: 1\nSubtotal original: R$ 33,00`;
  await processCustomerMessage("5511999990011", message, { env: {}, now: fixedNow });
  const reply = await processCustomerMessage("5511999990011", "UF: PA e Pix", { env: {}, now: fixedNow + 1000 });
  assert.match(reply, /frete cadastrado/);
  assert.match(reply, /Total final: A confirmar após consultar o frete/);
  assert.doesNotMatch(reply, /Chave Pix:/);
});

test("cartão encaminha para humano e nunca pede dados de cartão", async () => {
  resetAgentEphemeralStateForTests();
  const message = `Meu pedido:\n- Cuecas\n  Modelo 01 · Tamanho: M\n  Quantidade: 1\nSubtotal original: R$ 33,00`;
  await processCustomerMessage("5511999990003", message, { env: {}, now: fixedNow });
  await processCustomerMessage("5511999990003", "UF: GO", { env: {}, now: fixedNow + 1000 });
  const reply = await processCustomerMessage("5511999990003", "Cartão de crédito", { env: {}, now: fixedNow + 2000 });
  assert.match(reply, /atendimento humano enviará/);
  assert.match(reply, /Não envie número do cartão/);
  assert.doesNotMatch(reply, /Chave Pix:/);
});

test("interpretação por IA faz extração estruturada e valores continuam determinísticos", async () => {
  resetAgentEphemeralStateForTests();
  const env = { AI_API_KEY: "test-only-key", AI_MODEL: "test-model" };
  const fetcher = mockInterpretation(intent({
    productIds: ["calca-jeans"],
    items: [{ productId: "calca-jeans", size: "40", quantity: 4, modelIndex: null }],
    state: "SP",
    payment: "pix",
  }));
  const reply = await processCustomerMessage("5511999990004", "Quero 4 calças jeans tamanho 40, em SP, pagar por pix.", { env, fetcher, now: fixedNow });
  assert.match(reply, /R\$\s*420,00/);
  assert.match(reply, /Chave Pix: 69\.565\.840\/0001-06/);
  assert.match(reply, /Desconto por quantidade: R\$\s*20,00/);
});

test("falha ou ausência do provedor de IA encaminha sem alegar atendimento automático", async () => {
  const noCredentials = await processCustomerMessage("5511999990010", "Olá", { env: {} });
  assert.match(noCredentials, /ainda não está configurado/);

  await assert.rejects(
    () => interpretCustomerMessage("Olá", { AI_API_KEY: "test-only-key", AI_MODEL: "test-model" }, async () => asJsonResponse({}, 502)),
    (error: unknown) => error instanceof ProviderError && error.provider === "ai" && error.code === "http_502" && !error.message.includes("test-only-key"),
  );
});

test("falha do provedor WhatsApp não expõe token e é identificada", async () => {
  const env = { WHATSAPP_ACCESS_TOKEN: "test-only-secret", WHATSAPP_PHONE_NUMBER_ID: "123456", WHATSAPP_GRAPH_API_VERSION: "v99.0" };
  await assert.rejects(
    () => sendWhatsAppText("5511999990000", "oi", env, async () => asJsonResponse({}, 401)),
    (error: unknown) => error instanceof ProviderError && error.provider === "whatsapp" && error.code === "http_401" && !error.message.includes("test-only-secret"),
  );
  await assert.rejects(() => sendWhatsAppText("5511999990000", "oi", {}), /not_configured/);
});

test("assinatura HMAC protege o webhook; conteúdo ou segredo ausentes são rejeitados", () => {
  const body = "{\"entry\":[]}";
  const secret = "test-secret";
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  assert.equal(isWhatsAppSignatureValid(body, signature, secret), true);
  assert.equal(isWhatsAppSignatureValid(body, signature, undefined), false);
  assert.equal(isWhatsAppSignatureValid(body, "sha256=bad", secret), false);
  assert.equal(isWhatsAppSignatureValid(`${body} `, signature, secret), false);
});

test("duplicatas são suprimidas no processo e voltam a aceitar depois do TTL", () => {
  resetAgentEphemeralStateForTests();
  assert.equal(claimWebhookMessage("wamid.1", fixedNow), true);
  assert.equal(claimWebhookMessage("wamid.1", fixedNow), false);
  finishWebhookMessage("wamid.1", true, fixedNow);
  assert.equal(claimWebhookMessage("wamid.1", fixedNow + 1000), false);
  assert.equal(claimWebhookMessage("wamid.1", fixedNow + 24 * 60 * 60 * 1000 + 1), true);
});

test("endpoint GET exige token e POST rejeita corpo sem assinatura válida", async () => {
  const oldVerify = process.env.WHATSAPP_VERIFY_TOKEN;
  const oldSecret = process.env.WHATSAPP_APP_SECRET;
  try {
    delete process.env.WHATSAPP_VERIFY_TOKEN;
    assert.equal((await GET(new Request("https://example.test/api/whatsapp/webhook"))).status, 503);
    process.env.WHATSAPP_VERIFY_TOKEN = "verify-test-token";
    assert.equal((await GET(new Request("https://example.test/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=abc"))).status, 403);
    const verified = await GET(new Request("https://example.test/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-test-token&hub.challenge=abc123"));
    assert.equal(verified.status, 200);
    assert.equal(await verified.text(), "abc123");

    process.env.WHATSAPP_APP_SECRET = "webhook-test-secret";
    const invalidSignature = await POST(new Request("https://example.test/api/whatsapp/webhook", { method: "POST", body: "{}" }));
    assert.equal(invalidSignature.status, 401);
  } finally {
    if (oldVerify === undefined) delete process.env.WHATSAPP_VERIFY_TOKEN;
    else process.env.WHATSAPP_VERIFY_TOKEN = oldVerify;
    if (oldSecret === undefined) delete process.env.WHATSAPP_APP_SECRET;
    else process.env.WHATSAPP_APP_SECRET = oldSecret;
  }
});

test("webhook reconhece duplicata e não envia segunda resposta (provedor simulado)", async () => {
  resetAgentEphemeralStateForTests();
  const names = ["WHATSAPP_APP_SECRET", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_GRAPH_API_VERSION"] as const;
  const previous = new Map(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  let sends = 0;
  const secret = "webhook-test-secret";
  process.env.WHATSAPP_APP_SECRET = secret;
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789";
  process.env.WHATSAPP_ACCESS_TOKEN = "test-only-secret";
  process.env.WHATSAPP_GRAPH_API_VERSION = "v99.0";
  globalThis.fetch = async () => { sends += 1; return asJsonResponse({ messages: [{ id: "out-1" }] }); };
  const body = JSON.stringify({ entry: [{ changes: [{ value: { metadata: { phone_number_id: "123456789" }, messages: [{ id: "wamid.duplicate", from: "5511999990009", type: "text", text: { body: "oi" } }] } }] }] });
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const makeRequest = () => new Request("https://example.test/api/whatsapp/webhook", { method: "POST", body, headers: { "x-hub-signature-256": signature } });
  try {
    assert.equal((await POST(makeRequest())).status, 200);
    assert.equal((await POST(makeRequest())).status, 200);
    assert.equal(sends, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      const value = previous.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
