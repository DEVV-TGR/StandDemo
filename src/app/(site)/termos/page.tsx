import type { Metadata } from "next";
import Link from "next/link";
import { enderecoLinha, stand } from "@/data/stand";

/**
 * Aprovada pelo cliente a 26/08/2026 (ver a #32). Publicada: sem aviso de
 * rascunho, no índice, no sitemap e ligada no rodapé.
 *
 * Cada cláusula corresponde a uma resposta dele, dadas a 25 e 26/08/2026. Não
 * houve validação jurídica — dispensou-a por escrito, e é a aprovação dele que
 * sustenta esta página.
 *
 * **Revista quando o site passou a aceitar pedidos** — «Compramos o seu
 * carro» e «Importamos o seu carro» (#39, #40). A cláusula da retoma passou a
 * cobrir também a compra a particulares e a procura por encomenda, e diz o
 * essencial: um pedido enviado pelo site não vincula ninguém. Carece de nova
 * aprovação do cliente, como a primeira versão.
 *
 * **O que a cláusula nova deliberadamente não diz:** prazos de entrega,
 * valores de sinal, e quem suporta o ISV e a legalização de uma viatura
 * importada. São condições contratuais que o cliente ainda não fechou (#40),
 * e anunciá-las no site seria fechá-las por ele.
 *
 * Duas cláusulas a tratar com cuidado se alguma vez forem mexidas:
 *
 * **Garantia.** O que o stand dá (18 meses, motor e caixa) está em cláusula
 * separada da garantia legal de conformidade, que existe por lei e não é este
 * texto que a define. Juntá-las daria a entender que se limita um direito que
 * não se pode limitar.
 *
 * **Financiamento.** O stand não intermedeia crédito: encaminha para a AMCO,
 * que é a registada no Banco de Portugal. É isso, e só isso, que aqui se diz.
 */
export const metadata: Metadata = {
  title: "Termos e Condições",
  description:
    "Condições de utilização do site do Império Auto Concept e informação sobre preços, reservas, garantia e entrega das viaturas.",
  alternates: { canonical: "/termos" },
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

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <header>
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
          Este site mostra as viaturas disponíveis no stand e permite enviar
          pedidos de avaliação de uma viatura para venda ou retoma e pedidos de
          viatura por encomenda.{" "}
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

      <Seccao titulo="Compra, retoma e viaturas por encomenda">
        <p>
          O stand aceita viaturas em retoma e compra viaturas a particulares. O
          valor é apurado por avaliação feita pelo stand, tendo em conta o
          estado da viatura e o mercado à data, e é comunicado antes de
          qualquer compromisso.
        </p>
        <p>
          O stand procura ainda viaturas por encomenda, a pedido de quem não
          encontra no stand o que procura.
        </p>
        <p>
          <strong className="text-ink">
            Um pedido enviado pelo site não cria compromisso para nenhuma das
            partes.
          </strong>{" "}
          A avaliação de uma viatura e as condições de uma procura por
          encomenda — preço, eventuais custos de importação e legalização,
          sinal e prazos — são comunicadas por escrito antes de qualquer
          acordo, e é esse acordo, e só ele, que vincula as partes.
        </p>
        <p>
          A avaliação feita a partir da descrição enviada pelo site é
          provisória e depende de confirmação com a viatura à frente.
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
          Intermediários de Crédito, Lda., registada no Banco de Portugal sob
          o n.º 0000759, na categoria de intermediário de crédito vinculado,
          que é quem trata do processo e com quem o cliente contrata.
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
        Última atualização: 2 de setembro de 2026.
      </p>
    </div>
  );
}
