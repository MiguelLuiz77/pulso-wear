# Agente de atendimento PULSO°

## Arquitetura

- `data/product-catalog.json` é a fonte única dos produtos, preços em centavos, tamanhos e disponibilidade; o catálogo visual existente importa os mesmos dados.
- `data/agent-commerce.json` contém desconto por quantidade, fretes, prazo de postagem, cupons e chave Pix.
- `app/api/whatsapp/webhook/route.ts` recebe eventos da WhatsApp Cloud API, valida assinatura HMAC e envia respostas pela API oficial.
- `lib/pulso-agent.ts` valida pedidos e tamanhos, calcula valores em centavos, interpreta texto pelo endpoint de Chat Completions com resposta JSON estruturada e formata respostas sem delegar cálculos à IA.
- A rota do webhook aceita apenas eventos assinados com o segredo do app Meta. O botão `wa.me` do site permanece inalterado.

Não existe banco de dados nem armazenamento em arquivo. A sessão do pedido e a proteção contra eventos repetidos usam memória temporária do processo, com expiração de 30 minutos para o pedido e 24 horas para o identificador do evento. Em funções serverless, uma instância pode ser encerrada, substituída ou escalada em paralelo; portanto, sessão e deduplicação não são duráveis nem globais. O comprador pode precisar repetir dados depois de uma reinicialização. Garantia durável entre instâncias exigiria um serviço externo de estado idempotente, que não foi adicionado.

## Variáveis

Copie `.env.example` para `.env.local` apenas no ambiente local. Nunca versionar `.env.local` nem colocar chaves em variáveis `NEXT_PUBLIC_*`.

| Variável | Finalidade |
| --- | --- |
| `AI_API_KEY` | Chave do provedor compatível com a API OpenAI. |
| `AI_BASE_URL` | Base da API compatível; por padrão aponta para OpenAI. |
| `AI_MODEL` | Modelo disponível no provedor escolhido, com suporte a JSON Schema estrito. |
| `WHATSAPP_ACCESS_TOKEN` | Token de envio da Cloud API. |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número conectado à Cloud API. |
| `WHATSAPP_VERIFY_TOKEN` | Segredo aleatório escolhido para validar o desafio inicial do webhook. |
| `WHATSAPP_APP_SECRET` | App Secret Meta usado para validar `X-Hub-Signature-256`. |
| `WHATSAPP_GRAPH_API_VERSION` | Versão Graph ainda suportada pela conta Meta, como `vNN.0`. |

A chave Pix fornecida pela loja fica no arquivo server-side `data/agent-commerce.json` e só é incluída na resposta depois que o cliente escolhe Pix, há itens validados e o frete está definido. O atendente instrui a conferir o destinatário e não confirma pagamento.

## Ativação na Vercel e na Meta

1. Configure as oito variáveis da tabela nas configurações de ambiente do projeto Vercel existente (Production e Preview apenas se desejar atendimentos nesses ambientes) e publique uma nova versão.
2. Na Meta, confirme que o número atual é compatível e habilitado para Cloud API. Este repositório não presume migração do número nem faz alterações na conta Meta.
3. Cadastre `https://pulsowear.vercel.app/api/whatsapp/webhook` como callback do app Meta, use o mesmo `WHATSAPP_VERIFY_TOKEN` e assine o campo `messages`.
4. Faça uma verificação de ponta a ponta com um número autorizado de teste. Confirme recebimento, resposta, entrega pelo WhatsApp e configuração de cobrança do provedor de IA antes de anunciar o atendimento como ativo.

Sem credenciais/configuração, o GET de verificação e o POST de eventos respondem como não configurados ou não autorizados; o código não finge receber/enviar mensagens. O POST rejeita assinatura ausente ou inválida. Dados pessoais e texto de conversa não são registrados nos logs.

## Limitações comerciais deliberadas

- Estoque não é conhecido; a IA só informa tamanhos cadastrados e orienta a confirmar disponibilidade com a loja.
- Fretes disponíveis vêm do JSON; outras UFs ficam pendentes do atendimento humano.
- O prazo citado é de postagem de até 3 dias, separado do prazo de entrega.
- Cartão sempre vai para atendimento humano. A automação nunca pede dados do cartão.
- Conversas sem pedido originado pelo site precisam de `AI_API_KEY` e `AI_MODEL`. Pedidos completos do carrinho do site são reconhecidos e validados com os preços/tamanhos do servidor, mesmo sem IA.
- O pedido do carrinho não carrega UF; se ausente, o agente apresenta o resumo validado e pergunta primeiro a forma de pagamento. Antes de mostrar frete ou chave Pix, solicita a UF do destino.
