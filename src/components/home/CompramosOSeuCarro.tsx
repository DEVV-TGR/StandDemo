import Link from "next/link";
import { BotaoLink } from "@/components/ui/Botao";
import { Reveal } from "@/components/ui/Reveal";

/*
  A secção que diz, a quem veio ver o catálogo, que o stand também compra.

  Fica entre a grelha de marcas e o «Sobre», e não mais acima: quem chega à
  home vem ver carros, e interromper isso com uma proposta de venda seria pôr
  o stand à frente de quem o visita. Depois de passar pelos destaques e pelas
  marcas, a pergunta "e o carro que já tenho?" é a seguinte natural.

  Segue o desenho dos «Destaques» — título à esquerda, ligação discreta à
  direita, botão de contorno ao centro no telemóvel — porque é a mesma coisa:
  uma secção da home que aponta para uma página.
*/
export function CompramosOSeuCarro() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display h-section text-ink">
              Compramos o seu <span className="italic text-gold">carro</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Venda directa ou retoma na compra de outra viatura. Descreva o que
              tem e dizemos-lhe quanto vale, sem compromisso.
            </p>
          </div>
          <BotaoLink
            href="/compramos"
            variante="fantasma"
            className="hidden shrink-0 sm:inline-flex"
          >
            Pedir avaliação →
          </BotaoLink>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted">
          E se procura uma viatura que não temos,{" "}
          <Link
            href="/importamos"
            className="text-champagne transition-colors hover:text-gold-bright"
          >
            importamos por encomenda →
          </Link>
        </p>
      </Reveal>

      <div className="mt-8 text-center sm:hidden">
        <BotaoLink href="/compramos" variante="contorno">
          Pedir avaliação
        </BotaoLink>
      </div>
    </section>
  );
}
