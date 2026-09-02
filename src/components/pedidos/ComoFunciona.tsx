import { stand, telHref } from "@/data/stand";

/*
  A coluna ao lado do formulário: o que acontece depois de carregar no botão.

  Existe por uma razão só — um formulário longo sem nada à volta parece um
  processo, e quem está a pensar em vender o carro quer saber ao que se
  compromete antes de escrever a matrícula.

  **Nenhum passo promete prazo.** Não é timidez: enquanto o cliente não
  fechar o que promete quanto a prazos, sinal e legalização, uma frase como
  "resposta em 24 horas" é uma condição contratual escrita por engano. Os
  Termos dizem o mesmo, e é de propósito que dizem.
*/
export function ComoFunciona({
  titulo,
  passos,
}: {
  titulo: string;
  passos: { titulo: string; texto: string }[];
}) {
  return (
    <aside className="rounded-2xl border border-line/60 bg-surface/60 p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{titulo}</p>

      <ol className="mt-6 space-y-6">
        {passos.map((p, i) => (
          <li key={p.titulo} className="flex gap-4">
            <span
              aria-hidden
              className="font-display shrink-0 text-lg leading-none text-gold/60"
            >
              {i + 1}
            </span>
            <div>
              <p className="text-sm text-ink">{p.titulo}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="hairline my-7" />

      <p className="text-sm leading-relaxed text-muted">
        Prefere falar? Ligue ou mande mensagem — respondemos do mesmo lado.
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <a
          href={telHref(stand.telemovel)}
          className="block text-champagne transition-colors hover:text-gold-bright"
        >
          {stand.telemovel}
        </a>
        <a
          href={stand.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="block text-champagne transition-colors hover:text-gold-bright"
        >
          WhatsApp ↗
        </a>
      </div>
    </aside>
  );
}
