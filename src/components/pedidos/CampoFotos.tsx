"use client";

import { useEffect, useRef, useState } from "react";
import { labelBase } from "@/components/ui/campos";
import { prepararFoto } from "@/lib/painel/redimensionar";
import { FOTOS_MAXIMAS, TIPOS_ACEITES, TOTAL_MAXIMO } from "@/lib/pedidos/fotos";

/*
  As fotografias que acompanham um pedido.

  ## Dois inputs, e a razão de serem dois

  O formulário submete-se por uma server action, e o `FormData` é construído
  pelo browser a partir dos campos do `<form>`. Um array de ficheiros em
  estado não vai lá parar. Por isso as fotografias vivem num
  `<input type="file" name="fotos">` escondido — o **depósito** — cujo
  conteúdo se substitui por um `DataTransfer` a cada mudança. É o que permite
  acumular fotografias de várias escolhas e tirar uma do meio.

  O que abre o seleccionador é **outro** input, sem `name`, que por isso não
  é submetido. Existe para se lhe poder limpar o `value` a seguir a cada
  escolha: sem isso, escolher outra vez o mesmo ficheiro não dispara evento
  nenhum, e quem tirou uma fotografia por engano não a conseguia voltar a
  pôr. Limpar o `value` do depósito apagaria as fotografias todas.

  ## Encolher aqui não é uma optimização

  Uma fotografia de telemóvel recente tem 4 a 8 MB, e o corpo de um pedido a
  uma função da Vercel não passa dos 4,5 MB. Seis originais nem começavam a
  subir. O `prepararFoto` — o mesmo que o painel usa — deixa cada uma entre
  400 e 900 KB, e é o que torna "junte umas fotos do carro" uma frase que se
  pode escrever no site.

  O servidor valida na mesma o tipo, o tamanho e a quantidade: isto corre no
  browser, e o que corre no browser é conveniência, não fronteira.
*/

type Foto = { ficheiro: File; url: string };

function kb(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

export function CampoFotos({
  rotulo,
  nota,
  desativado,
  aoMudarQuantidade,
}: {
  rotulo: string;
  nota: string;
  desativado?: boolean;
  /** A mensagem do WhatsApp menciona quantas fotografias seguem. */
  aoMudarQuantidade?: (quantas: number) => void;
}) {
  const seletor = useRef<HTMLInputElement>(null);
  const deposito = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [aPreparar, setAPreparar] = useState(false);
  const [aviso, setAviso] = useState("");

  /* Os `blob:` de quem já saiu da lista libertam-se ao desmontar. */
  useEffect(() => {
    return () => {
      for (const f of fotos) URL.revokeObjectURL(f.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao desmontar
  }, []);

  function fixar(novas: Foto[]) {
    const transferencia = new DataTransfer();
    for (const f of novas) transferencia.items.add(f.ficheiro);
    if (deposito.current) deposito.current.files = transferencia.files;
    setFotos(novas);
    aoMudarQuantidade?.(novas.length);
  }

  async function juntar(escolhidas: FileList | null) {
    if (!escolhidas?.length) return;
    setAviso("");
    setAPreparar(true);

    const cabem = FOTOS_MAXIMAS - fotos.length;
    const aceites: Foto[] = [];
    let recusadasPorTipo = false;

    for (const original of [...escolhidas].slice(0, cabem)) {
      if (!TIPOS_ACEITES.includes(original.type)) {
        recusadasPorTipo = true;
        continue;
      }
      const { ficheiro } = await prepararFoto(original);
      aceites.push({ ficheiro, url: URL.createObjectURL(ficheiro) });
    }

    const juntas = [...fotos, ...aceites];
    const total = juntas.reduce((soma, f) => soma + f.ficheiro.size, 0);

    if (total > TOTAL_MAXIMO) {
      /*
        Recusa-se o lote que passou do tecto em vez de cortar pelo meio: a
        pessoa escolheu aquelas fotografias, e ficar com metade sem perceber
        quais é pior do que não ficar com nenhuma.
      */
      for (const f of aceites) URL.revokeObjectURL(f.url);
      setAviso(
        `No conjunto ficam demasiado pesadas (${kb(total)}). Junte menos de cada vez, ou tire uma das que já estão.`,
      );
    } else {
      if (escolhidas.length > cabem) {
        setAviso(`Só cabem ${FOTOS_MAXIMAS} fotografias; as restantes ficaram de fora.`);
      } else if (recusadasPorTipo) {
        setAviso("Algumas ficaram de fora: só aceitamos JPEG, PNG, WebP ou AVIF.");
      }
      fixar(juntas);
    }

    setAPreparar(false);
  }

  function tirar(indice: number) {
    URL.revokeObjectURL(fotos[indice].url);
    fixar(fotos.filter((_, i) => i !== indice));
    setAviso("");
  }

  const total = fotos.reduce((soma, f) => soma + f.ficheiro.size, 0);
  const cheio = fotos.length >= FOTOS_MAXIMAS;

  return (
    <div className="sm:col-span-2">
      <span className={labelBase}>
        {rotulo}
        <span className="ml-1.5 normal-case tracking-normal">(opcional)</span>
      </span>

      {/* O que abre o seleccionador. Sem `name`, logo não é submetido. */}
      <input
        ref={seletor}
        type="file"
        multiple
        accept={TIPOS_ACEITES.join(",")}
        onChange={async (e) => {
          await juntar(e.target.files);
          e.target.value = "";
        }}
        disabled={desativado}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />

      {/* O depósito: é este que vai no `FormData`. */}
      <input
        ref={deposito}
        type="file"
        name="fotos"
        multiple
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />

      {fotos.length > 0 && (
        <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {fotos.map((f, i) => (
            <li key={f.url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- `blob:` local, sem optimização a fazer */}
              <img
                src={f.url}
                alt={`Fotografia ${i + 1}`}
                className="aspect-4/3 w-full rounded-2xl border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => tirar(i)}
                disabled={desativado}
                aria-label={`Tirar a fotografia ${i + 1}`}
                className="press absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-sm text-muted hover:border-gold hover:text-gold-bright"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => seletor.current?.click()}
          disabled={desativado || cheio || aPreparar}
          className="press inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-sm tracking-wide text-champagne hover:border-gold hover:text-gold-bright disabled:opacity-60"
        >
          {aPreparar
            ? "A preparar…"
            : fotos.length === 0
              ? "Juntar fotografias"
              : "Juntar mais"}
        </button>

        <p className="text-xs text-muted" aria-live="polite">
          {fotos.length === 0
            ? nota
            : `${fotos.length} de ${FOTOS_MAXIMAS} · ${kb(total)}`}
        </p>
      </div>

      {aviso && (
        <p role="status" className="mt-3 text-xs leading-relaxed text-muted">
          {aviso}
        </p>
      )}
    </div>
  );
}
