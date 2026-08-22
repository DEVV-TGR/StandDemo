"use client";

import { Botao, BotaoLink } from "@/components/ui/Botao";
import { stand } from "@/data/stand";

/**
 * Sem este ficheiro, qualquer exceção em runtime servia o ecrã genérico do
 * Next — em produção, uma página branca com "Application error". O custo em
 * SEO é indireto (o Googlebot que rastreie durante uma falha regista uma
 * página vazia); o custo em negócio é imediato: quem abre um link do
 * WhatsApp e vê um ecrã branco não volta.
 *
 * Distingue-se do 404 de propósito: aqui a página existe e rebentou, por
 * isso a primeira ação oferecida é tentar de novo.
 */
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">
        Algo correu mal
      </p>
      <h1 className="mt-4 font-display h-section text-ink">
        Não foi possível carregar esta{" "}
        <span className="italic text-gold">página</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        Foi uma falha momentânea, não um erro seu. Tente de novo — se
        continuar, ligue-nos ou mande mensagem, respondemos no imediato.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Botao onClick={reset}>Tentar de novo</Botao>
        <BotaoLink href="/viaturas" variante="contorno">
          Ver viaturas
        </BotaoLink>
        <a
          href={stand.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="press inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide text-muted hover:text-gold-bright"
        >
          WhatsApp ↗
        </a>
      </div>
    </div>
  );
}
