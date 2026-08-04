# Painel de gestão `/admin`

Especificação do painel que permitirá ao cliente gerir os anúncios de viaturas sem tocar em código: adicionar, editar, apagar, marcar como reservado ou vendido, e pôr ou tirar de destaque.

## Estado — ler antes de tudo o resto

**O painel não existe no código de hoje.** O site é estático e lê `src/data/viaturas.ts`.

Mas **já foi construído uma vez**. O PR #12 (commit `bf14fed`) implementou-o por inteiro — 46 ficheiros, cerca de 8 600 linhas — e foi revertido no PR #14 (`4c4f8e6`) por uma razão registada na mensagem do commit:

> O merge do #12 (painel /admin + Neon/R2) passou a exigir base de dados para o site correr. Revertido para o site voltar a funcionar sem configuração externa (dados estáticos em src/data/viaturas.ts). O trabalho de admin/BD fica preservado no PR #12 para reintegração futura quando o Neon+R2 estiverem prontos.

O código continua todo no histórico e recupera-se ficheiro a ficheiro:

```bash
git show bf14fed:src/db/schema.ts
git show bf14fed:src/components/admin/ViaturaForm.tsx
git show --stat --format="" bf14fed        # os 46 ficheiros
```

Logo, isto **não é um projeto de raiz**. É reintegrar o que existe, corrigindo três coisas: o defeito que causou o revert, a autenticação (o #12 tinha só palavra-passe) e os detalhes de utilização que o cliente pediu.

## Quando

O site vai para o ar **como está** — estático, sem painel. A integração começa depois de o cliente pagar metade do desenvolvimento. Estes documentos existem para que essa fase seja execução, não descoberta.

## Índice

| Documento | O que responde |
|---|---|
| [01 — Arquitetura](01-arquitetura.md) | Como as peças encaixam e porque o site tem de correr sem base de dados |
| [02 — Infraestrutura](02-infraestrutura.md) | Neon, R2, Resend, Vercel: setup, variáveis e custos |
| [03 — Autenticação](03-autenticacao.md) | Login em dois passos, código por email, bloqueios |
| [04 — Segurança](04-seguranca.md) | Segredos fora do frontend, limites de pedidos |
| [05 — UX do painel](05-painel-ux.md) | Listagem, formulário, e que regras da marca se aplicam |
| [06 — Reintegração](06-reintegracao.md) | Roteiro por fases e o mapa do que se recupera do PR #12 |

Ordem sugerida na primeira leitura: `01` → `03` → `06`. Os restantes consultam-se conforme a fase.

## Decisões já tomadas

| Tema | Decisão | Porquê |
|---|---|---|
| Base de dados | **Neon** (Postgres) via Drizzle | Tier grátis permanente, até 100 projetos — uma base isolada por cliente |
| Fotos | **Cloudflare R2** | 10 GB grátis e tráfego de saída sem custo |
| Login | **Palavra-passe + código por email** | Dois fatores reais: algo que se sabe, algo que se recebe |
| Envio de email | **Resend** | 3 000 emails/mês grátis, muito acima do necessário |
| Dados | **Base de dados com recurso ao estático** | Sem credenciais, o site funciona na mesma. Evita repetir o revert |

O critério transversal é o mesmo do resto do projeto: **tiers gratuitos e isolamento por cliente**, para o molde servir outros stands sem mensalidades por cliente.

## Relação com `docs/brand/`

O [sistema de design](../brand/README.md) descreve o site público. O painel herda dele os tokens de cor e as fontes, mas não a linguagem editorial — ver [05 — UX do painel](05-painel-ux.md), secção *Regras de design*.
