# 08 — Pôr o painel em produção

> **Aplica-se a** — a configuração fora do código, depois de o painel estar feito.
> **Fazer por esta ordem.** Cada passo assume o anterior.

Tempo total: cerca de uma hora, quase toda à espera de DNS.

---

## Antes de começar

**Fazer merge dos PRs #18 e #19.** O #19 é o que faz o site aceitar fotografias vindas do bucket — sem ele, uma viatura publicada com fotos novas aparece com os espaços vazios, e nada no ecrã explica porquê.

---

## 1 · As variáveis na Vercel

**Onde:** Vercel → o projecto → Settings → Environment Variables.

São nove, e **é preciso separá-las por ambiente**. A tabela abaixo diz de onde vem cada uma e onde entra:

| Variável | Production | Preview | De onde vem |
|---|---|---|---|
| `DATABASE_URL` | branch `main` | branch **`dev`** | Neon → Connect, a string **com `-pooler`** |
| `R2_ACCOUNT_ID` | igual | igual | R2 → Overview, Account Details |
| `R2_ACCESS_KEY_ID` | igual | igual | o token que criaste |
| `R2_SECRET_ACCESS_KEY` | igual | igual | idem — só é mostrado uma vez |
| `R2_BUCKET` | `imperio-viaturas` | igual | — |
| `R2_PUBLIC_URL` | ver o passo 4 | `https://pub-….r2.dev` | — |
| `RESEND_API_KEY` | igual | igual | Resend → API Keys |
| `RESEND_REMETENTE` | `Painel Império <noreply@send.devplus.pt>` | igual | — |
| `PAINEL_EMAILS` | `developerplusteam@gmail.com` | igual | ver abaixo |

**O `DATABASE_URL` é o único que tem de divergir, e a diferença não é cosmética.** Um preview apontado à base de produção é a diferença entre experimentar e apagar as viaturas do cliente. Nunca ponhas a string do `main` no ambiente Preview.

**O `PAINEL_EMAILS` em produção é uma decisão, não uma cópia.** Cada endereço na lista é uma chave mestra permanente num sistema de factor único, e o argumento que usámos para o cliente — o email tem de ter 2FA — vale por igual para todos os que lá estiverem. Uma lista com dois endereços são duas caixas de correio para comprometer, não uma.

**A decisão deste projeto: em produção fica só `developerplusteam@gmail.com`** (#24). O painel é operado pela equipa e o endereço do cliente não está na lista — **o acesso dele faz parte da entrega final e entra quando o projeto fechar**, não antes. Não é uma medida de segurança: é o âmbito do que está entregue.

Quando essa altura chegar, ligar o acesso é acrescentar o email do cliente à variável e fazer redeploy. Não há mais nada a implementar do lado do código — vale a pena saber isso antes de prometer prazos. E a pergunta a fazer nesse momento é se o endereço da equipa ainda faz falta na lista, ou se o suporte pontual se resolve como qualquer acesso temporário: entra, faz-se o que há a fazer, e sai.

Manter os ambientes alinhados: o `.env.local` de desenvolvimento tem o mesmo endereço, para nenhum teste local passar por causa de um acesso que produção não dá.

> **Mudar uma variável não afecta o que já está publicado.** É preciso um redeploy para a nova valer. É a explicação de metade dos *"mas eu já mudei isso"*.

**Depois de as pôr:** Deployments → o mais recente → ⋯ → Redeploy.

---

## 2 · Proteger os previews

**Onde:** Vercel → Settings → Deployment Protection → **Vercel Authentication**, para Preview.

A partir do momento em que o painel existe, **cada preview deploy expõe um `/admin` na internet**. Já verifiquei que tens isto ligado — confirma que continua depois de mexeres nas variáveis.

---

## 3 · Semear a base de produção

O branch `main` do Neon está vazio. As migrações e o seed correm da tua máquina, apontando lá:

```bash
# 1. guardar a string de produção temporariamente
cp .env.local .env.local.dev
# 2. editar .env.local e pôr o DATABASE_URL do branch `main`
# 3. correr
npm run db:migrate
npm run db:seed
# 4. repor
mv .env.local.dev .env.local
```

O `db:migrate` cria as quatro tabelas. O `db:seed` põe as seis viaturas do ficheiro estático — que é o que já está no site hoje, portanto nada muda visualmente.

**Nunca `db:push` contra produção.** O `push` compara e altera o schema directamente; contra dados reais é uma forma de perder colunas sem dar por isso. Só migrações versionadas.

Se a rede da tua máquina não chegar ao Neon por IPv6 — acontece —, prefixa os comandos com `NODE_OPTIONS="--dns-result-order=ipv4first"`.

---

## 4 · Um domínio próprio para as fotografias

**Porquê:** o `pub-….r2.dev` é limitado por taxa e a documentação da Cloudflare diz que *"should only be used for development purposes"*. Em produção, com o site a carregar quinze fotos por ficha, isso trava.

**O que implica:** o domínio passa a ter o DNS gerido pela Cloudflare. O site continua na Vercel; muda só quem responde às perguntas de DNS.

1. Cloudflare → Add a site → `imperioautoconcept.com`, plano **Free**.
2. A Cloudflare mostra dois nameservers. No registrar do domínio, substituir os actuais por esses. **Propaga em minutos a horas.**
3. Confirmar que os registos que a Cloudflare importou apontam para a Vercel — e que o site continua a responder antes de avançar.
4. R2 → o bucket → Settings → **Custom Domains** → Add → `fotos.imperioautoconcept.com`.
5. Actualizar o `R2_PUBLIC_URL` em Production para `https://fotos.imperioautoconcept.com` e fazer redeploy.

**As fotos já carregadas continuam a funcionar?** Não — os URLs guardados na base apontam para o `r2.dev`. Se já houver fotos carregadas quando fizeres isto, é preciso actualizá-los. Enquanto o painel for novo e o bucket estiver vazio, faz-se sem custo. **Por isso vale a pena fazer este passo cedo.**

> Podes adiar e ficar no `r2.dev` — o site funciona. Só não é o que a Cloudflare recomenda para tráfego real.

---

## 5 · A regra de firewall no login

**Onde:** Vercel → o projecto → Firewall → Configure → New Rule.

- **If:** `Request Path` *starts with* `/admin/entrar` **AND** `Request Method` *equals* `POST`
- **Then:** Rate Limit — janela **60 s**, limite **5**, chave **IP Address**, acção **Challenge**

Isto trava volume bruto na borda, antes de haver compute. Os limites que já estão no código são por email e por IP; este é por volume, e um pedido parado aqui não custa nada nem toca no Neon.

Três coisas decidem se funciona:

- **O filtro `POST` é obrigatório.** A entrada é uma server action, e uma server action é um POST para o caminho da própria página. Sem o filtro, a regra conta também os GETs de quem abre o ecrã e o contador esgota-se sozinho.
- **`Challenge`, não `Deny`.** Quem se engana resolve um desafio e continua; um script não resolve.
- **Começar com a acção `Log`** durante uns dias, ver quantos pedidos legítimos apanharia, e só depois passar a `Challenge`.

---

## 6 · Rodar as credenciais

A password do Neon e o secret do R2 passaram por uma conversa que ficou gravada em disco. Não é urgente — nenhuma delas esteve exposta publicamente — mas é higiene de fecho, e faz-se em cinco minutos:

**Neon** → Roles → `neondb_owner` → Reset password. Actualizar `DATABASE_URL` em Production, Preview e no `.env.local`.

**R2** → Manage API Tokens → apagar o token actual → criar outro, com **Object Read & Write restrito ao bucket**. Actualizar as duas variáveis.

**Resend** → API Keys → o mesmo, se quiseres. Esta nunca foi colada em texto, portanto é a menos urgente.

Redeploy no fim.

---

## 7 · Entregar ao cliente

**Antes de lhe dar o endereço**, confirmar por esta ordem:

1. Entrar em `/admin` com o email dele — o código chega ao Gmail, não ao spam.
2. Criar uma viatura de raiz, com fotos tiradas do telemóvel. É o teste que interessa: as fotos de telemóvel são grandes, e é onde o redimensionamento se paga.
3. Ver essa viatura no site — card, galeria e ficha.
4. Marcar como vendida e confirmar o badge vermelho, a foto sem cor e o preço a dizer "Vendido".
5. Apagá-la e confirmar que desaparece do site e que a ficha dá 404.

**O que dizer-lhe**, e é a parte que não é técnica:

> O acesso ao painel é o seu email. Não há palavra-passe — recebe um código de cada vez que entra num aparelho novo, e o aparelho fica reconhecido 30 dias.
>
> Isso significa que **a sua caixa de correio é a chave do painel**. É por isso que insistimos na verificação em dois passos do Gmail: se alguém entrar no seu email, entra no painel.

---

## Quando alguma coisa correr mal

| O que se vê | O que é |
|---|---|
| O código não chega | Resend → Logs. Domínio deixou de estar verificado, limite diário atingido, ou foi para o spam |
| *"O domínio do remetente não está verificado"* | O `RESEND_REMETENTE` não usa o domínio que está como *Verified*. A raiz e o subdomínio contam como domínios diferentes |
| Escreveu o email e não recebeu nada, sem erro | O email não está em `PAINEL_EMAILS`, ou o limite de 3 pedidos/15 min esgotou-se. É de propósito que o ecrã não distingue os dois |
| As fotos não aparecem no site | O `R2_PUBLIC_URL` está com o endpoint S3 em vez do domínio público, ou faltou o redeploy depois de o mudar |
| O upload fica pendurado e falha ao fim de 15 s | Só em desenvolvimento: o R2 não responde por IPv6 em algumas redes. `NODE_OPTIONS="--dns-result-order=ipv4first"` |
| O painel diz que não consegue falar com a base | O Neon esgotou as CU-hours do mês, ou o `DATABASE_URL` está errado. O **site público continua a funcionar** com o inventário estático — é para isso que esse recurso existe |
| Pede código todas as vezes | O browser apaga cookies ao fechar, ou é janela anónima. É o comportamento certo |

**Expulsar toda a gente**, se for preciso: apagar a linha `painel:segredo` da tabela `configuracao`. Caem as sessões, os códigos a meio e os aparelhos lembrados.
