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

const nextConfig: NextConfig = {
  async headers() {
    return [
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
