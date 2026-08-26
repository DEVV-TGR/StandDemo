import type { Metadata } from "next";
import { enderecoLinha, stand } from "@/data/stand";

/**
 * Aprovada pelo cliente a 26/08/2026 (ver a #32). Publicada: sem aviso de
 * rascunho, no índice, no sitemap e ligada no rodapé.
 *
 * O texto descreve o que se observa no próprio site — que dados saem daqui,
 * para onde vão, que serviços de terceiros são carregados — e o resto veio das
 * respostas do cliente. Não houve validação jurídica: dispensou-a por escrito.
 *
 * Dois pontos a não perder de vista:
 *
 * **"Serviços de terceiros" diz que não há píxeis nem cookies de seguimento.**
 * É verdade hoje. Se algum dia entrar publicidade dirigida, esta secção muda e
 * passa a ser preciso consentimento prévio.
 *
 * **O prazo dos documentos de venda não tem número, e é de propósito.** O
 * cliente disse "2 anos por aí", mas quem manda nesse prazo é a obrigação
 * fiscal e é bem mais longa — escrever dois anos era escrever uma coisa que
 * ele não cumpre nem pode cumprir.
 */
export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Império Auto Concept trata os dados pessoais de quem visita o site e entra em contacto.",
  alternates: { canonical: "/privacidade" },
};

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
      <header>
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
        Última atualização: 26 de agosto de 2026.
      </p>
    </div>
  );
}
