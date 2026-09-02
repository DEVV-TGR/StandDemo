# 07 — Tarefas de configuração e custos

> **Aplica-se a** — o que tem de ser feito fora do código, por quem tem acesso às contas.
> **Ler antes de** — abrir o PR da Fase 1. Os passos do Bloco 1 demoram mais a chegar do que a fazer.

Este documento existe porque metade do que falta não se escreve em TypeScript: são contas, chaves e uma linha de DNS. Está ordenado por quando é preciso, não por importância.

---

## Custos — o objectivo é zero, e é atingível

| Serviço | Para quê | Plano | Custo |
|---|---|---|---|
| **Vercel** | Alojar o site | **Pro** — obrigatório, ver abaixo | Já pago pela agência |
| **Neon** | Base de dados das viaturas | Free | 0 € |
| **Cloudflare R2** | Fotografias | Free | 0 € |
| **Resend** | Enviar o código de acesso | Free | 0 € |
| **GitHub** | Repositório | Free | 0 € |
| **Domínio** `imperioautoconcept.com` | — | — | ~10–15 €/ano, já registado |

**Total de serviços novos: 0 €/mês.**

**Mas o R2 exige um método de pagamento** — cartão ou PayPal — para ser activado, mesmo ficando no plano gratuito. Não cobra nada dentro dos limites, e o nosso consumo previsto são 49 MB contra 10 GB. O Neon e o Resend não pedem nada.

### O plano Hobby da Vercel não serve, e não é detalhe

As Fair Use Guidelines da Vercel são explícitas:

> **Hobby teams are restricted to non-commercial personal use only.** All commercial usage of the platform requires either a Pro or Enterprise plan.

E a definição de uso comercial inclui, à letra, *"receiving payment to create, update, or host the site"* e *"advertising the sale of a product or service"*. Um stand a anunciar viaturas, feito por alguém que foi pago para o fazer, é uso comercial duas vezes. O projecto tem de viver numa equipa **Pro** — não numa conta pessoal Hobby.

Como a agência já tem Pro, o custo é o que já se paga. **O que é preciso confirmar é que este projecto está lá dentro**, e não numa conta pessoal por hábito.

### Onde o custo zero se pode partir — e é num sítio só

O plano gratuito do Neon dá **100 CU-hours por mês**, e ao esgotar qualquer limite mensal *suspende o compute até ao mês seguinte*. Não cobra — bloqueia. É bom para a factura e mau para o site.

A conta que interessa: o compute mínimo do Neon é 0,25 CU, e a base adormece ao fim de 5 minutos sem consultas. Cem CU-hours dão para **cerca de 400 horas de base acordada por mês**, e um mês tem 730.

Isto tem uma consequência directa numa decisão de arquitectura:

- **Se as páginas do site forem dinâmicas** (`force-dynamic`, uma consulta por visita), basta haver uma visita a cada cinco minutos para a base nunca adormecer. Treze horas por dia de trânsito normal chegam a ~98 CU-hours — no limite, a meio do mês, sem margem nenhuma para um pico.
- **Se as páginas forem estáticas e regeneradas quando o painel grava** (ISR + `revalidatePath`, que as actions já chamam), a base é consultada no build e a cada alteração do cliente. São dezenas de consultas por mês. O consumo fica perto de zero, e o site fica mais rápido de caminho.

**Vamos pela segunda.** O plano original previa `force-dynamic` por ser o caminho mais simples, com uma optimização adiada para depois; com o custo em cima da mesa, a optimização passa a ser a escolha de partida. É a alteração que mantém o Neon confortavelmente dentro do plano gratuito em vez de o pôr a raspar o tecto.

Os outros dois nem se aproximam dos limites: as fotografias actuais são 49 MB contra 10 GB de R2 (dá para umas mil viaturas, com o tráfego de saída a custo zero), e o acesso ao painel gasta talvez dez emails por mês contra 3 000.

---

## Bloco 0 — Antes de publicar

### 0.1 · Confirmar que o projecto está na equipa Pro da Vercel

Vercel → o projecto → Settings → General, e ver a que equipa pertence. Se estiver numa conta pessoal Hobby, transferir para a equipa Pro (Settings → General → Transfer).

Pela razão da secção acima: não é uma questão de limites, é dos termos de utilização.

### 0.2 · Domínio e DNS

O `src/lib/site.ts` já fixa `https://www.imperioautoconcept.com` como identidade do site. Falta:

- Confirmar que o domínio está registado e a quem — **idealmente em nome do cliente**, não da agência. Um domínio no nome de quem construiu o site é uma conversa desagradável no dia em que a relação acabar.
- Vercel → Settings → Domains → adicionar `imperioautoconcept.com` **e** `www.imperioautoconcept.com`, deixando o `www` como primário. A Vercel trata o 308 da variante sem `www` sozinha.
- No registrar, apontar os registos que a Vercel indicar.

O `.pt` não existe e não está registado — se algum dia for, é só apontá-lo à Vercel como redirect.

### 0.3 · Rever a página de privacidade

O trabalho de SEO já criou `/privacidade` e divulgou o Livro de Reclamações. Vale uma leitura tua antes de ir para o ar: o texto fala em nome do cliente, e há uma decisão por tomar sobre o mapa do Google, que coloca cookies de terceiro sem consentimento prévio. As saídas são carregar o mapa só depois de a pessoa concordar, ou substituí-lo por uma imagem com link. Diz-me qual preferes e trato disso.

---

## Bloco 1 — Contas para o painel

**Podes fazer isto já, em paralelo com o código.** Nada aqui depende do que estou a escrever, e a Fase 1 não fecha sem estas credenciais.

### 1.1 · Neon — a base de dados

1. Criar conta em [neon.com](https://neon.com) com a conta da agência (não a pessoal do cliente).
2. Criar um projecto, região **Europa**. Está em `AWS Europe West 2 (London)`: fica fora da UE, mas a Comissão Europeia renovou a decisão de adequação do Reino Unido até 27 de dezembro de 2031, portanto as transferências são permitidas sem salvaguardas adicionais — e Londres é mais perto do Porto que Frankfurt.
3. O projecto nasce com um branch `main`. Criar um segundo, `dev`, em Branches → New Branch. O plano gratuito dá dez.
4. Copiar as duas connection strings (Dashboard → Connect), a do `main` e a do `dev`. São elas o `DATABASE_URL`.

**Porquê dois branches:** o `dev` é onde as migrações se experimentam e onde o `db:push` pode correr à vontade. Contra o `main` correm-se migrações versionadas, porque lá estão os dados reais do cliente e esses não se recriam.

**A guardar para o fim:** o Neon adormece ao fim de 5 minutos. Medido contra esta base: o primeiro pedido depois de adormecer levou **1 292 ms**; com ela acordada, a mediana é **99 ms**. Não é avaria — e é mais um motivo para o site público ser estático, porque assim esse arranque acontece no build e não à frente de um visitante.

### 1.2 · Cloudflare R2 — as fotografias

1. Conta em [cloudflare.com](https://cloudflare.com) (a da agência).
2. R2 → Create bucket, nome `imperio-viaturas`. Dois campos que parecem o mesmo e não são:

   - **Location hint** → `Europe (EU)`. É só desempenho, uma sugestão de onde os dados ficam.
   - **Jurisdiction** → **deixar em branco**. É uma garantia legal vinculativa e **não pode ser alterada depois**; escolhê-la muda o endpoint da API para `<ACCOUNT_ID>.eu.r2.cloudflarestorage.com`, para sempre. O que vai para o bucket são fotografias de viaturas à venda — material público, sem dados pessoais e sem EXIF. A jurisdição existe para registos com dados pessoais.
3. Settings do bucket → **Public Development URL → Enable** (escrever `allow` a confirmar). Copiar o URL `https://pub-….r2.dev` que aparece — é o `R2_PUBLIC_URL`.

   **Isto serve para desenvolvimento, não para produção.** A documentação da Cloudflare é explícita: o `r2.dev` é limitado por taxa e *"should only be used for development purposes"*. Em produção é preciso um domínio próprio (ex.: `fotos.imperioautoconcept.com`) ligado ao bucket em **Custom Domains** — grátis, mas obriga a que o DNS do domínio passe a ser gerido pela Cloudflare. O site continua na Vercel; muda só quem responde às perguntas de DNS. Decidir na Fase 6.

   Não confundir com o **endpoint S3** (`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`), que é por onde o servidor *escreve* e exige assinatura em cada pedido. O código constrói-o a partir do `R2_ACCOUNT_ID`; não vai para variável nenhuma.
4. R2 → Manage API Tokens → Create token:
   - **Object Read & Write**, e nada mais
   - **restrito a este bucket**, não à conta inteira
   - guardar o Access Key ID e o Secret Access Key — o secret só aparece uma vez
5. O Account ID está na página inicial do R2.

**O erro comum** é criar o token com permissões de conta em vez de bucket. Funciona na mesma, e é exactamente por isso que ninguém dá por ele até haver um problema.

### 1.3 · Resend — o email do código de acesso

Não é preciso criar conta nova: usar a da agência, que já envia para o Taskuinha.

**O passo que interessa é um só:** abrir Resend → Domains e **copiar à letra o que lá está como *Verified***. No Taskuinha o domínio verificado é `send.devplus.pt` e não `devplus.pt` — para o Resend a raiz e o subdomínio são domínios diferentes, e um remetente no domínio errado é recusado com 403. Essa confusão já custou uma hora de procura numa chave de API que não tinha problema nenhum.

O remetente fica então `Painel Império <noreply@[o-que-lá-estiver]>`.

O domínio verificado governa o **remetente**, não o destinatário: dá para enviar para o Gmail do cliente sem verificar `imperioautoconcept.com`. E o plano gratuito agora aceita três domínios verificados, portanto se quiseres que o email saia do domínio do cliente, também há vaga — mas obriga a mexer no DNS dele, e não traz nada que o painel precise.

**Vale a pena ligar um alerta de falha.** No plano gratuito, ao atingir o limite diário o envio pausa em vez de ser cobrado. Para quem está à espera do código isso é indistinguível de uma avaria, e ninguém avisa.

### 1.4 · A conversa com o cliente — trinta segundos, e é a mais importante

O acesso ao painel é por código enviado ao email. Isso significa que **a caixa de correio dele é a chave mestra**: quem a controlar, controla o painel. Não é uma fraqueza do que vamos construir, é o modelo — e é honesto assumi-lo em vez de o disfarçar com uma password que ele não escolheu.

Duas coisas a confirmar com ele, e a segunda não é negociável:

1. **Um endereço individual**, não um `geral@`. Um email visto por cinco pessoas não autentica ninguém.
2. **Verificação em dois passos activa no Gmail dele.** É literalmente a única coisa que separa o painel de um atacante. Se não tiver, vale a pena ajudá-lo a ligar — leva cinco minutos e faz mais pela segurança disto do que qualquer linha de código que eu escreva.

O endereço confirmado é o que entra na variável de quem pode entrar.

### 1.5 · Quando alguma coisa parecer avariada

| O que se vê | O que é |
|---|---|
| `npm run dev` pendurado ao carregar uma foto, e ao fim de 15 s um `ETIMEDOUT` | O `r2.cloudflarestorage.com` não responde por IPv6 em algumas redes. Por IPv4 responde em 0,1 s. Correr com `NODE_OPTIONS="--dns-result-order=ipv4first"`. Não afecta a Vercel. |
| O primeiro pedido à base demora mais de um segundo | O Neon estava a dormir. Ver 1.1. |
| As fotos não aparecem, e o URL delas tem `r2.cloudflarestorage.com` | O `R2_PUBLIC_URL` está com o endpoint S3 em vez do `pub-….r2.dev`. São coisas diferentes — ver 1.2. |
| O upload dá `AccessDenied` | O token não abrange este bucket, ou é `Object Read only`. |

---

## Bloco 2 — Configuração na Vercel

Isto é do fim, quando o painel estiver a funcionar em desenvolvimento.

### 2.1 · Variáveis de ambiente

Vercel → Settings → Environment Variables. As de produção só no ambiente **Production**; as de `dev` em **Preview** e **Development**.

| Variável | De onde vem | Ambientes |
|---|---|---|
| `DATABASE_URL` | Neon (1.1) — a do `main` em Production, a do `dev` em Preview | todos |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare (1.2) | todos |
| `R2_PUBLIC_URL` | Cloudflare (1.2) | todos |
| `RESEND_API_KEY`, `RESEND_REMETENTE` | Resend (1.3) | todos |
| `PAINEL_EMAILS` | o endereço confirmado em 1.4 | todos |

Nenhuma leva o prefixo `NEXT_PUBLIC_`. Uma variável com esse prefixo é embutida no JavaScript que vai para o browser e fica visível a quem abrir o código-fonte da página — ver [04 — Segurança](04-seguranca.md).

> **Mudar uma variável não afecta o que já está publicado.** É preciso um redeploy para a nova valer. É a explicação de metade dos "mas eu já mudei isso".

### 2.2 · Proteger os previews

A partir do momento em que o painel existe, **cada preview deploy expõe um `/admin` na internet**. Vercel → Settings → Deployment Protection → activar para Preview.

E nunca apontar um preview ao `DATABASE_URL` de produção: é a diferença entre experimentar e apagar as viaturas do cliente.

### 2.3 · Regra de firewall no login

Trava volume bruto antes de haver compute — um pedido parado aqui não custa nada nem toca no Neon.

Vercel → o projecto → Firewall → Configure → New Rule:

- **If:** `Request Path` *starts with* `/admin/entrar` **AND** `Request Method` *equals* `POST`
- **Then:** Rate Limit, janela **60 s**, limite **5**, chave **IP Address**, acção **Challenge**

Três coisas decidem se funciona:

- **O filtro `POST` é obrigatório.** A entrada é uma server action, e uma server action é um POST para o caminho da própria página. Sem o filtro, a regra conta também os GETs de quem abre o ecrã e o contador esgota-se sozinho.
- **`Challenge`, não `Deny`.** Quem se engana resolve um desafio e continua; um script não resolve.
- **Começar com a acção `Log`** durante uns dias, ver quantos pedidos legítimos apanharia, e só depois passar a `Challenge`.

**Os formulários do site precisam da mesma regra.** `/compramos` e `/importamos` são também server actions, e também enviam email pela Resend — partilham com o painel a quota de 100 envios por dia do plano gratuito, o que significa que um script a bater no formulário público pode deixar o cliente sem conseguir entrar no painel. Segunda regra, igual em forma:

- **If:** `Request Path` *starts with* `/compramos` **OR** `/importamos`, **AND** `Request Method` *equals* `POST`
- **Then:** Rate Limit, janela **60 s**, limite **5**, chave **IP Address**, acção **Challenge**

O código tem um limite próprio (`src/lib/pedidos/limites.ts`: três por origem e trinta por instância, em quinze minutos), mas vive em memória e cada instância tem a sua. Apanha o uso normal e o script simples; volume distribuído é trabalho do Firewall, que corre antes de haver compute.

---

## Resumo — o que preciso de ti, e quando

| Quando | O quê | Demora |
|---|---|---|
| **Agora** | 0.1 confirmar equipa Pro · 0.2 domínio e DNS · 0.3 decisão sobre o mapa | 20 min |
| **Esta semana** | 1.1 Neon · 1.2 R2 · 1.3 confirmar o domínio do Resend · 1.4 falar com o cliente | 45 min |
| **Quando o painel estiver pronto** | 2.1 variáveis · 2.2 proteger previews · 2.3 firewall | 30 min |

O Bloco 1 é o que me bloqueia: a Fase 1 não fecha sem as credenciais do Neon, e a Fase 6 não fecha sem as do R2.
