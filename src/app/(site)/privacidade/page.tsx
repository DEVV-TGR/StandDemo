import type { Metadata } from "next";
import { enderecoLinha, stand } from "@/data/stand";

/**
 * ⚠️ RASCUNHO — NÃO PUBLICAR SEM VALIDAÇÃO.
 *
 * Esta página existe para dar estrutura ao texto que falta, não para o
 * substituir. O conteúdo de uma política de privacidade tem consequências
 * legais e tem de ser validado por quem tenha competência jurídica, ou no
 * mínimo aprovado formalmente pelo cliente. Copiar a política de outro site
 * não serve: é outra entidade, outro tratamento, outro responsável.
 *
 * O que está escrito abaixo é o que se observa no próprio site (que dados
 * saem daqui, para onde vão, que serviços de terceiros são carregados) e os
 * campos que só o cliente pode preencher estão marcados como POR CONFIRMAR.
 *
 * O texto está completo — as respostas do cliente chegaram a 25 e 26/08/2026
 * e estão registadas na #32. O que falta não é conteúdo, é aprovação.
 *
 * Para publicar, por esta ordem:
 *   1. o cliente lê o texto todo e aprova por escrito;
 *   2. escrever a data dessa aprovação no fim da página;
 *   3. remover o aviso de rascunho e o `robots: noindex` daqui;
 *   4. pôr a página no sitemap e ligá-la no rodapé (ver Footer.tsx);
 *   5. actualizar `docs/seo.md`, que a descreve como estando fora do índice.
 *
 * O prazo de conservação dos documentos de venda ficou sem número de
 * propósito. O cliente disse "2 anos por aí", mas quem manda nesse prazo é a
 * obrigação fiscal, que é bem mais longa — escrever dois anos era escrever
 * uma coisa que ele não cumpre nem pode cumprir.
 *
 * Atenção à secção "Serviços de terceiros": diz que o site não tem píxeis nem
 * cookies de seguimento. É verdade hoje. O cliente pediu publicidade dirigida
 * (ver a issue do banner de consentimento) — se isso entrar, esta secção muda
 * e passa a ser preciso consentimento prévio.
 */
export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Império Auto Concept trata os dados pessoais de quem visita o site e entra em contacto.",
  alternates: { canonical: "/privacidade" },
  // Enquanto for rascunho, fora do índice. Também não está no sitemap.
  robots: { index: false, follow: true },
};

const POR_CONFIRMAR = "[POR CONFIRMAR]";

function Seccao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display h-sub text-ink">{titulo}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <div className="rounded-2xl border border-gold/40 bg-raised px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">
          Rascunho
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Este texto ainda não foi validado juridicamente nem aprovado pelo
          stand. Não tem valor legal enquanto estiver com este aviso.
        </p>
      </div>

      <header className="mt-10">
        <h1 className="font-display h-section text-ink">
          Política de <span className="italic text-gold">Privacidade</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Esta política explica que dados pessoais são tratados a partir deste
          site, com que finalidade, durante quanto tempo e quais os direitos de
          quem nos contacta.
        </p>
      </header>

      <Seccao titulo="Responsável pelo tratamento">
        <p>
          Ricardo Moura Rodrigues Unipessoal, Lda., pessoa coletiva n.º
          518932400, com sede em {enderecoLinha}, que explora o
          estabelecimento {stand.nome}.
        </p>
        <p>
          A sede é também o estabelecimento onde as viaturas são mostradas.
          Contacto: {stand.email}, {stand.telemovel}.
        </p>
      </Seccao>

      <Seccao titulo="Que dados são tratados">
        <p>
          O site não tem formulários. Os dados que chegam ao stand são os que
          cada pessoa decide enviar ao usar os contactos publicados — telefone,
          email ou WhatsApp — e resumem-se, tipicamente, a nome, contacto e ao
          conteúdo da mensagem.
        </p>
        <p>
          Como em qualquer site, o servidor regista dados técnicos de acesso
          (endereço IP, data e hora, tipo de dispositivo e navegador), por
          motivos de segurança e funcionamento.
        </p>
      </Seccao>

      <Seccao titulo="Finalidades e fundamento jurídico">
        <p>
          Responder a pedidos de informação sobre viaturas e acompanhar o
          processo de compra, com fundamento nas diligências pré-contratuais
          solicitadas pelo próprio; e garantir o funcionamento e a segurança do
          site, com fundamento no interesse legítimo.
        </p>
        <p>
          Quando um pedido de informação fica sem resposta durante algum tempo,
          o stand pode voltar a contactar quem o enviou, no seguimento desse
          mesmo pedido. Não são enviadas campanhas nem comunicações de
          marketing a quem não as tenha pedido.
        </p>
      </Seccao>

      <Seccao titulo="Prazos de conservação">
        <p>
          Os contactos de quem pediu informação e não chegou a comprar são
          conservados durante dois anos a contar do último contacto.
        </p>
        <p>
          Os documentos associados a uma venda são conservados durante o prazo
          exigido pelas obrigações legais, fiscais e contabilísticas
          aplicáveis a essa venda.
        </p>
      </Seccao>

      <Seccao titulo="Serviços de terceiros">
        <p>
          O site é alojado na Vercel, que trata dados técnicos de acesso em
          nome do stand.
        </p>
        <p>
          A página de contactos e a homepage embebem um mapa do Google Maps.
          Ao carregar esse mapa, o navegador comunica com servidores da Google,
          que pode recolher dados nos termos da sua própria política.
        </p>
        <p>
          Fora do site, e apenas quando o processo de compra o exige, os dados
          necessários podem ser comunicados a instituições de crédito e
          intermediários de crédito, a seguradoras, a oficinas, a empresas de
          transporte e à contabilidade do stand. Em cada caso é comunicado o
          mínimo indispensável para o efeito em causa.
        </p>
        <p>
          Quem contacta o stand por WhatsApp fá-lo através de um serviço da
          Meta, que trata esses dados nos termos da sua própria política. O
          acesso a essas conversas está limitado às pessoas do stand que fazem
          o atendimento.
        </p>
        <p>
          Não há analytics, píxeis de redes sociais nem cookies de seguimento
          instalados neste site. Se algum vier a ser adicionado, esta secção
          tem de ser atualizada e passa a ser necessário um pedido de
          consentimento prévio.
        </p>
      </Seccao>

      <Seccao titulo="Direitos de quem nos contacta">
        <p>
          Acesso, retificação, apagamento, limitação, portabilidade e oposição,
          nos termos do Regulamento Geral sobre a Proteção de Dados. Para os
          exercer, basta escrever para {stand.email}.
        </p>
        <p>
          Havendo motivo para reclamação, pode ser apresentada à Comissão
          Nacional de Proteção de Dados (cnpd.pt).
        </p>
      </Seccao>

      <p className="mt-12 text-xs text-muted">
        Última atualização: {POR_CONFIRMAR} data de aprovação.
      </p>
    </div>
  );
}
