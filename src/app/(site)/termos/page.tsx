import type { Metadata } from "next";
import Link from "next/link";
import { enderecoLinha, stand } from "@/data/stand";

/**
 * ⚠️ RASCUNHO — NÃO PUBLICAR SEM APROVAÇÃO DO CLIENTE.
 *
 * O texto abaixo não foi inventado: cada cláusula corresponde a uma resposta
 * do cliente, dadas a 25 e 26/08/2026 e registadas na #32. Mas um documento
 * que fixa condições de venda tem consequências, e nenhuma delas recai sobre
 * quem o escreveu — recai sobre quem o assina.
 *
 * Para publicar, por esta ordem:
 *   1. o cliente lê o texto todo e aprova por escrito;
 *   2. escrever a data dessa aprovação no fim da página;
 *   3. remover o aviso de rascunho e o `robots: noindex` daqui;
 *   4. pôr a página no sitemap e ligá-la no rodapé (ver Footer.tsx);
 *   5. actualizar `docs/seo.md`.
 *
 * Três pontos que merecem um segundo olhar antes de isso acontecer:
 *
 * **Garantia.** O cliente pediu, com estas palavras, que ficasse escrito que
 * "assume tudo". Está escrito. Mas a garantia comercial que ele descreve —
 * 18 meses, motor e caixa — vive ao lado da garantia legal de conformidade,
 * que existe por lei e não depende do que este texto diga. As duas estão
 * separadas de propósito: juntá-las daria a entender que se está a limitar um
 * direito que não se pode limitar.
 *
 * **Financiamento.** O stand não intermedeia crédito: encaminha para a AMCO.
 * É isso, e só isso, que aqui se diz. Falta o número de registo da AMCO no
 * Banco de Portugal, que devia constar.
 *
 * **Entidade de resolução de litígios.** O CICAP é a entidade territorialmente
 * competente para o Porto. O cliente percebeu a pergunta mas não confirmou o
 * nome com quem lhe trata do jurídico.
 */
export const metadata: Metadata = {
  title: "Termos e Condições",
  description:
    "Condições de utilização do site do Império Auto Concept e informação sobre preços, reservas, garantia e entrega das viaturas.",
  alternates: { canonical: "/termos" },
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

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <div className="rounded-2xl border border-gold/40 bg-raised px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Rascunho</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Este texto ainda não foi aprovado pelo stand. Não tem valor legal
          enquanto estiver com este aviso.
        </p>
      </div>

      <header className="mt-10">
        <h1 className="font-display h-section text-ink">
          Termos e <span className="italic text-gold">Condições</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Estas condições aplicam-se à utilização deste site e à informação
          nele publicada sobre as viaturas em stock.
        </p>
      </header>

      <Seccao titulo="Quem somos">
        <p>
          Ricardo Moura Rodrigues Unipessoal, Lda., pessoa coletiva n.º
          518932400, com sede em {enderecoLinha}, que explora o estabelecimento{" "}
          {stand.nome}.
        </p>
        <p>
          Contacto: {stand.email}, {stand.telemovel}.
        </p>
      </Seccao>

      <Seccao titulo="O que este site é">
        <p>
          Este site mostra as viaturas disponíveis no stand.{" "}
          <strong className="text-ink">Não vende online</strong>: não há
          carrinho de compras, nem pagamento, nem contrato celebrado à
          distância. A compra faz-se presencialmente, no stand.
        </p>
        <p>
          A informação publicada tem natureza informativa e não constitui, por
          si só, uma proposta contratual. A disponibilidade de cada viatura é
          confirmada no momento do contacto.
        </p>
      </Seccao>

      <Seccao titulo="Preços">
        <p>
          Os preços apresentados incluem IVA e são o valor final da viatura
          pronta a entregar: incluem o Imposto Sobre Veículos, a legalização, a
          documentação e o serviço do stand.
        </p>
        <p>
          Nenhuma das viaturas atualmente em stock permite dedução de IVA.
          Quando alguma o permitir, o anúncio dessa viatura indica-o.
        </p>
        <p>
          Um preço publicado com erro manifesto — por lapso de escrita ou falha
          informática, quando o valor esteja evidentemente desfasado do preço
          de mercado da viatura — não vincula o stand à venda por esse valor. O
          erro é comunicado a quem tenha manifestado interesse, com o preço
          correto.
        </p>
      </Seccao>

      <Seccao titulo="Reserva e sinal">
        <p>
          Uma viatura pode ser reservada mediante sinal, cujo valor é acordado
          caso a caso e depende da viatura.
        </p>
        <p>
          Não se concretizando a venda, o sinal é devolvido.
        </p>
      </Seccao>

      <Seccao titulo="Retoma">
        <p>
          O stand aceita viaturas em retoma. O valor é apurado por avaliação
          feita pelo stand, tendo em conta o estado da viatura e o mercado à
          data, e é comunicado antes de qualquer compromisso.
        </p>
      </Seccao>

      <Seccao titulo="Ensaio de condução">
        <p>
          É possível experimentar a viatura antes de comprar, mediante
          apresentação de carta de condução válida e documento de
          identificação.
        </p>
      </Seccao>

      <Seccao titulo="Entrega">
        <p>
          A entrega no Porto não tem custo. Fora do Porto, o transporte é
          assegurado mediante pagamento do respetivo custo, comunicado antes da
          entrega.
        </p>
      </Seccao>

      <Seccao titulo="Garantia">
        <p>
          <strong className="text-ink">Garantia legal de conformidade.</strong>{" "}
          Aplica-se, nos termos da lei, a todas as viaturas vendidas a
          consumidores. Nada nestas condições a afasta ou limita.
        </p>
        <p>
          <strong className="text-ink">Garantia do stand.</strong> Além da
          anterior, o stand presta uma garantia de 18 meses, nos termos
          acordados por escrito no contrato de compra e venda, que cobre motor
          e caixa de velocidades. Ficam excluídas as peças de desgaste normal.
        </p>
        <p>
          Dentro dessa cobertura, é o stand que responde perante o comprador e
          assume a reparação, independentemente de a ter ou não contratado a
          terceiros.
        </p>
      </Seccao>

      <Seccao titulo="Financiamento">
        <p>
          O stand não presta serviços de intermediação de crédito. Quem
          pretenda financiamento é encaminhado, com o seu acordo, para a AMCO
          Intermediários de Crédito{" "}
          <span className="text-muted/70">
            ({POR_CONFIRMAR} número de registo no Banco de Portugal)
          </span>
          , que é quem trata do processo e com quem o cliente contrata.
        </p>
        <p>
          A aprovação de crédito é decidida pela instituição financiadora e não
          pelo stand.
        </p>
      </Seccao>

      <Seccao titulo="Fotografias e conteúdos">
        <p>
          As fotografias das viaturas são do próprio stand e retratam a viatura
          efetivamente à venda. Os textos, imagens e demais conteúdos deste
          site não podem ser reproduzidos sem autorização.
        </p>
        <p>
          As marcas e logótipos dos fabricantes pertencem aos respetivos
          titulares e são usados apenas para identificar as viaturas em stock.
        </p>
      </Seccao>

      <Seccao titulo="Reclamações">
        <p>
          Qualquer reclamação pode ser apresentada no{" "}
          <a
            href="https://www.livroreclamacoes.pt/inicio"
            target="_blank"
            rel="noreferrer"
            className="text-champagne underline-offset-4 hover:text-gold-bright hover:underline"
          >
            Livro de Reclamações eletrónico
          </a>
          , ou diretamente para {stand.email}.
        </p>
        <p>
          Não havendo acordo, o consumidor pode recorrer ao CICAP — Centro de
          Informação de Consumo e Arbitragem do Porto (
          <a
            href="https://www.cicap.pt"
            target="_blank"
            rel="noreferrer"
            className="text-champagne underline-offset-4 hover:text-gold-bright hover:underline"
          >
            cicap.pt
          </a>
          ), entidade de resolução alternativa de litígios de consumo
          territorialmente competente.
        </p>
      </Seccao>

      <Seccao titulo="Dados pessoais">
        <p>
          O tratamento de dados pessoais está descrito na{" "}
          <Link
            href="/privacidade"
            className="text-champagne underline-offset-4 hover:text-gold-bright hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </Seccao>

      <Seccao titulo="Lei aplicável">
        <p>
          Aplica-se a lei portuguesa. Os direitos que a lei confere ao
          consumidor mantêm-se, seja o que for que aqui esteja escrito.
        </p>
      </Seccao>

      <p className="mt-12 text-xs text-muted">
        Última atualização: {POR_CONFIRMAR} data de aprovação.
      </p>
    </div>
  );
}
