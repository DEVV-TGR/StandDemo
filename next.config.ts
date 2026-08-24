import type { NextConfig } from "next";

/*
  Os cabeçalhos de segurança.

  Sem eles o site ia para o ar a responder sem nenhum: qualquer domínio o podia
  embeber num `<iframe>` e sobrepor-lhe a sua própria interface por cima dos
  botões de ligar e do WhatsApp, e o endereço completo de cada página seguia nos
  pedidos ao Instagram, ao Facebook e ao Google.

  A Vercel injecta o `Strict-Transport-Security` sozinha — não vai aqui, para
  não haver dois cabeçalhos a dizer a mesma coisa. Todos os outros são nossos.
*/

/*
  A política de conteúdos, com o alcance dito sem exagero.

  O `'unsafe-inline'` em `script-src` não é preguiça: o Next injecta os seus
  próprios scripts inline, e a alternativa — `nonce` — exige um `proxy.ts` a
  correr em cada pedido, o que tornaria dinâmicas oito páginas que hoje saem do
  CDN. Para um site de montra é trocar a coisa errada.

  O que fica a valer, e vale bastante: nenhum script de outro domínio carrega,
  nenhum formulário submete para fora, e a página não pode ser embebida.

  O `frame-src` do Google existe por causa de uma coisa só — o mapa embebido em
  `src/components/contactos/MapaStand.tsx`. Se o mapa sair, sai daqui também.

  O `style-src` precisa de `'unsafe-inline'` pelo Next e pelo `motion`, que
  anima escrevendo estilos no elemento.
*/
const politicaDeConteudos = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const cabecalhos = [
  /*
    `frame-ancestors` é o mecanismo moderno e já está na política acima; este
    fica para os browsers que ainda não o lêem. Dizem os dois o mesmo.
  */
  { key: "X-Frame-Options", value: "DENY" },

  /*
    Impede o browser de adivinhar o tipo de um ficheiro a partir do conteúdo em
    vez do cabeçalho. Interessa sobretudo no dia em que o painel aceitar
    imagens carregadas por quem quer que seja.
  */
  { key: "X-Content-Type-Options", value: "nosniff" },

  /*
    Para fora do site segue só a origem, nunca o endereço completo. Sem isto, o
    Instagram e o Facebook ficavam a saber exactamente que viatura a pessoa
    estava a ver quando carregou no link.
  */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  /*
    O site não usa nada disto. Declará-lo fechado significa que um script que
    venha a entrar por engano também não usa.
  */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

/*
  Os parâmetros que o catálogo aceita no endereço.

  Cada combinação produz uma variante quase idêntica da mesma listagem, e há
  dezenas. Só a listagem limpa é indexável: as variantes levam `noindex,
  follow` — não entram no índice, mas os links para as fichas continuam a ser
  seguidos. O canonical de `/viaturas` já apontava para si próprio.

  Isto era feito no `generateMetadata` da página, a partir dos `searchParams`.
  Passou para aqui quando a página se tornou estática: um ficheiro
  pré-renderizado é o mesmo para todos os endereços, e a distinção tem de
  acontecer na resposta HTTP. O `X-Robots-Tag` vale o mesmo que a meta tag.

  Faz falta a sério — há links internos para `/viaturas?marca=…` na grelha de
  marcas, nas fichas de viatura e no JSON-LD, e o Google segue-os.
*/
const PARAMS_FILTRO = [
  "marca",
  "modelo",
  "combustivel",
  "transmissao",
  "segmento",
  "precoMin",
  "precoMax",
  "anoMin",
  "anoMax",
  "kmMin",
  "kmMax",
  "ordenar",
] as const;

const nextConfig: NextConfig = {
  /*
    O corpo de uma server action está limitado a 1 MB por omissão, e o
    carregamento de uma fotografia passa disso à vontade — o erro nem chega ao
    nosso código: rebenta antes, e só aparece no registo do servidor.

    Quatro megabytes e meio é o tecto da própria Vercel, que não se configura.
    Ficamos um pouco abaixo, e o browser encolhe as fotos antes de as enviar
    (`src/lib/painel/redimensionar.ts`) para nem se chegar perto.
  */
  experimental: {
    serverActions: { bodySizeLimit: "4.4mb" },
  },

  async headers() {
    return [
      // Um `has` só corresponde se **todos** os itens baterem, e o que aqui se
      // quer é "qualquer um destes" — daí uma entrada por parâmetro.
      ...PARAMS_FILTRO.map((key) => ({
        source: "/viaturas",
        has: [{ type: "query" as const, key }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      })),
      {
        source: "/:path*",
        headers: [
          ...cabecalhos,
          /*
            A política só se aplica em produção.

            Em desenvolvimento o Next precisa de `eval` e de um websocket para
            recarregar o browser a cada gravação, e uma política que os proíba
            transforma `npm run dev` num ecrã em branco com erros na consola.
            Afrouxá-la com `'unsafe-eval'` para os dois ambientes seria pior:
            ficaria a valer também no ar.
          */
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: politicaDeConteudos }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
