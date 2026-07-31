import Image from "next/image";
import Link from "next/link";
import { AcoesViatura } from "./AcoesViatura";
import { formatarPreco, formatarRegisto } from "@/lib/format";
import { getViaturas } from "@/lib/viaturas";
import type { EstadoVenda } from "@/lib/types";

export const dynamic = "force-dynamic";

const ESTADO_ETIQUETA: Record<EstadoVenda, { texto: string; classe: string }> = {
  disponivel: {
    texto: "Disponível",
    classe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  reservado: {
    texto: "Reservado",
    classe: "border-gold/40 bg-gold/10 text-gold-bright",
  },
  vendido: {
    texto: "Vendido",
    classe: "border-line bg-surface text-muted",
  },
};

export default async function AdminHome() {
  const viaturas = await getViaturas();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Viaturas</h1>
          <p className="mt-1 text-sm text-muted">
            {viaturas.length}{" "}
            {viaturas.length === 1 ? "anúncio publicado" : "anúncios publicados"}
          </p>
        </div>
        <Link
          href="/admin/viaturas/nova"
          className="gold-metal-fill inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium tracking-wide text-background"
        >
          <span className="text-lg leading-none">+</span> Adicionar viatura
        </Link>
      </div>

      {viaturas.length === 0 ? (
        <div className="border border-line/60 bg-surface px-8 py-20 text-center">
          <p className="font-display text-2xl text-ink">
            Ainda não há <span className="italic text-gold">viaturas</span>
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Adicione o primeiro anúncio para o mostrar no site.
          </p>
          <Link
            href="/admin/viaturas/nova"
            className="mt-6 inline-flex border border-gold/40 px-6 py-3 text-sm text-champagne transition-colors hover:border-gold hover:text-gold-bright"
          >
            + Adicionar viatura
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line/60 bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-widest text-muted">
                <th className="px-4 py-4 font-normal">Viatura</th>
                <th className="px-4 py-4 font-normal">Estado</th>
                <th className="px-4 py-4 font-normal">Preço</th>
                <th className="px-4 py-4 font-normal">Registo</th>
                <th className="px-4 py-4 text-right font-normal">Ações</th>
              </tr>
            </thead>
            <tbody>
              {viaturas.map((v) => {
                const estado = ESTADO_ETIQUETA[v.estadoVenda];
                const nome = `${v.marca} ${v.modelo} ${v.versao}`.trim();
                return (
                  <tr
                    key={v.id}
                    className="border-b border-line/50 transition-colors last:border-0 hover:bg-raised/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden bg-background">
                          {v.fotos[0] ? (
                            <Image
                              src={v.fotos[0]}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                              sem foto
                            </div>
                          )}
                          {v.destaque && (
                            <span
                              title="Em destaque"
                              className="absolute left-1 top-1 h-2 w-2 rounded-full bg-gold"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {v.marca} {v.modelo}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {v.versao || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block border px-2.5 py-1 text-[11px] uppercase tracking-wider ${estado.classe}`}
                      >
                        {estado.texto}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-champagne">
                      {formatarPreco(v.preco)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatarRegisto(v.registoMes, v.registoAno)}
                    </td>
                    <td className="px-4 py-3">
                      <AcoesViatura id={v.id} nome={nome} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
