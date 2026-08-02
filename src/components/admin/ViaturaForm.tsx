"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { criarViatura, atualizarViatura, uploadFotos } from "@/app/admin/actions";
import { MESES_ABREV } from "@/lib/format";
import type { Viatura } from "@/lib/types";
import {
  COMBUSTIVEIS,
  ESTADOS_VENDA,
  SEGMENTOS,
  TRANSMISSOES,
  type ViaturaInput,
} from "@/lib/viatura-schema";

type ExtraForm = { categoria: string; itens: string[] };

type FormState = {
  marca: string;
  modelo: string;
  versao: string;
  preco: string;
  registoMes: string;
  registoAno: string;
  quilometros: string;
  lugares: string;
  portas: string;
  segmento: string;
  combustivel: string;
  potenciaCv: string;
  cilindradaCc: string;
  transmissao: string;
  cor: string;
  corInterior: string;
  origem: string;
  estado: string;
  garantia: string;
  livroRevisoes: boolean;
  segundaChave: boolean;
  classePortagem: string;
  matricula: string;
  vin: string;
  fotos: string[];
  extras: ExtraForm[];
  destaque: boolean;
  estadoVenda: string;
  ivaDedutivel: boolean;
  descricao: string;
};

function estadoInicial(v?: Viatura): FormState {
  return {
    marca: v?.marca ?? "",
    modelo: v?.modelo ?? "",
    versao: v?.versao ?? "",
    preco: v ? String(v.preco) : "",
    registoMes: v ? String(v.registoMes) : "1",
    registoAno: v ? String(v.registoAno) : String(new Date().getFullYear()),
    quilometros: v ? String(v.quilometros) : "",
    lugares: v ? String(v.lugares) : "5",
    portas: v ? String(v.portas) : "5",
    segmento: v?.segmento ?? SEGMENTOS[1],
    combustivel: v?.combustivel ?? COMBUSTIVEIS[0],
    potenciaCv: v ? String(v.potenciaCv) : "",
    cilindradaCc: v ? String(v.cilindradaCc) : "",
    transmissao: v?.transmissao ?? TRANSMISSOES[0],
    cor: v?.cor ?? "",
    corInterior: v?.corInterior ?? "",
    origem: v?.origem ?? "",
    estado: v?.estado ?? "Usado",
    garantia: v?.garantia ?? "",
    livroRevisoes: v?.livroRevisoes ?? false,
    segundaChave: v?.segundaChave ?? false,
    classePortagem: v?.classePortagem ?? "",
    matricula: v?.matricula ?? "",
    vin: v?.vin ?? "",
    fotos: v?.fotos ?? [],
    extras: v?.extras.map((e) => ({ ...e, itens: [...e.itens] })) ?? [],
    destaque: v?.destaque ?? false,
    estadoVenda: v?.estadoVenda ?? "disponivel",
    ivaDedutivel: v?.ivaDedutivel ?? false,
    descricao: v?.descricao ?? "",
  };
}

const inputBase =
  "w-full border border-line bg-background px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold";
const labelBase = "mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted";

export function ViaturaForm({ viatura }: { viatura?: Viatura }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => estadoInicial(viatura));
  const [erro, setErro] = useState<string | null>(null);
  const [aEnviarFotos, setAEnviarFotos] = useState(false);
  const [aGuardar, startGuardar] = useTransition();

  const edicao = Boolean(viatura);

  function set<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setF((prev) => ({ ...prev, [campo]: valor }));
  }

  // ---- Fotos ----
  async function enviarFotos(files: FileList) {
    const fd = new FormData();
    for (const file of Array.from(files)) fd.append("fotos", file);
    setAEnviarFotos(true);
    setErro(null);
    try {
      const urls = await uploadFotos(fd);
      setF((prev) => ({ ...prev, fotos: [...prev.fotos, ...urls] }));
    } catch {
      setErro(
        "Não foi possível enviar as fotos. Confirme a configuração do armazenamento (R2).",
      );
    } finally {
      setAEnviarFotos(false);
    }
  }

  function moverFoto(i: number, dir: -1 | 1) {
    setF((prev) => {
      const fotos = [...prev.fotos];
      const j = i + dir;
      if (j < 0 || j >= fotos.length) return prev;
      [fotos[i], fotos[j]] = [fotos[j], fotos[i]];
      return { ...prev, fotos };
    });
  }

  function removerFoto(i: number) {
    setF((prev) => ({ ...prev, fotos: prev.fotos.filter((_, k) => k !== i) }));
  }

  // ---- Extras ----
  function addCategoria() {
    setF((prev) => ({
      ...prev,
      extras: [...prev.extras, { categoria: "", itens: [""] }],
    }));
  }
  function updCategoria(i: number, valor: string) {
    setF((prev) => {
      const extras = [...prev.extras];
      extras[i] = { ...extras[i], categoria: valor };
      return { ...prev, extras };
    });
  }
  function removerCategoria(i: number) {
    setF((prev) => ({ ...prev, extras: prev.extras.filter((_, k) => k !== i) }));
  }
  function addItem(ci: number) {
    setF((prev) => {
      const extras = [...prev.extras];
      extras[ci] = { ...extras[ci], itens: [...extras[ci].itens, ""] };
      return { ...prev, extras };
    });
  }
  function updItem(ci: number, ii: number, valor: string) {
    setF((prev) => {
      const extras = [...prev.extras];
      const itens = [...extras[ci].itens];
      itens[ii] = valor;
      extras[ci] = { ...extras[ci], itens };
      return { ...prev, extras };
    });
  }
  function removerItem(ci: number, ii: number) {
    setF((prev) => {
      const extras = [...prev.extras];
      extras[ci] = {
        ...extras[ci],
        itens: extras[ci].itens.filter((_, k) => k !== ii),
      };
      return { ...prev, extras };
    });
  }

  // ---- Submeter ----
  function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!f.marca.trim() || !f.modelo.trim()) {
      setErro("Marca e modelo são obrigatórios.");
      return;
    }

    const payload: ViaturaInput = {
      marca: f.marca.trim(),
      modelo: f.modelo.trim(),
      versao: f.versao.trim(),
      preco: Number(f.preco) || 0,
      registoMes: Number(f.registoMes) || 1,
      registoAno: Number(f.registoAno) || new Date().getFullYear(),
      quilometros: Number(f.quilometros) || 0,
      lugares: Number(f.lugares) || 5,
      portas: Number(f.portas) || 5,
      segmento: f.segmento as ViaturaInput["segmento"],
      combustivel: f.combustivel as ViaturaInput["combustivel"],
      potenciaCv: Number(f.potenciaCv) || 0,
      cilindradaCc: Number(f.cilindradaCc) || 0,
      transmissao: f.transmissao as ViaturaInput["transmissao"],
      cor: f.cor.trim(),
      corInterior: f.corInterior.trim(),
      origem: f.origem.trim(),
      estado: f.estado.trim() || "Usado",
      garantia: f.garantia.trim(),
      livroRevisoes: f.livroRevisoes,
      segundaChave: f.segundaChave,
      classePortagem: f.classePortagem.trim(),
      matricula: f.matricula.trim(),
      vin: f.vin.trim(),
      fotos: f.fotos,
      extras: f.extras
        .map((ex) => ({
          categoria: ex.categoria.trim(),
          itens: ex.itens.map((it) => it.trim()).filter(Boolean),
        }))
        .filter((ex) => ex.categoria && ex.itens.length > 0),
      destaque: f.destaque,
      estadoVenda: f.estadoVenda as ViaturaInput["estadoVenda"],
      ivaDedutivel: f.ivaDedutivel,
      descricao: f.descricao.trim(),
    };

    startGuardar(async () => {
      try {
        if (viatura) {
          await atualizarViatura(viatura.id, payload);
        } else {
          await criarViatura(payload);
        }
        // Em caso de sucesso a action redireciona para /admin.
      } catch {
        setErro("Não foi possível guardar. Verifique os campos e tente de novo.");
      }
    });
  }

  return (
    <form onSubmit={submeter} className="space-y-10">
      {/* Identificação */}
      <Seccao titulo="Identificação">
        <Grelha>
          <Texto
            rotulo="Marca *"
            valor={f.marca}
            onChange={(v) => set("marca", v)}
            placeholder="Ex.: BMW"
          />
          <Texto
            rotulo="Modelo *"
            valor={f.modelo}
            onChange={(v) => set("modelo", v)}
            placeholder="Ex.: 520d Touring"
          />
          <Texto
            rotulo="Versão"
            valor={f.versao}
            onChange={(v) => set("versao", v)}
            placeholder="Ex.: Pack M"
          />
        </Grelha>
      </Seccao>

      {/* Preço e estado */}
      <Seccao titulo="Preço e estado">
        <Grelha>
          <Numero
            rotulo="Preço (€)"
            valor={f.preco}
            onChange={(v) => set("preco", v)}
          />
          <Selecao
            rotulo="Estado de venda"
            valor={f.estadoVenda}
            onChange={(v) => set("estadoVenda", v)}
            opcoes={ESTADOS_VENDA.map((e) => ({
              valor: e.valor,
              rotulo: e.rotulo,
            }))}
          />
          <div className="flex flex-col justify-end gap-2 pb-1">
            <Interruptor
              rotulo="Em destaque"
              ativo={f.destaque}
              onChange={(v) => set("destaque", v)}
            />
            <Interruptor
              rotulo="IVA dedutível"
              ativo={f.ivaDedutivel}
              onChange={(v) => set("ivaDedutivel", v)}
            />
          </div>
        </Grelha>
      </Seccao>

      {/* Ficha técnica */}
      <Seccao titulo="Ficha técnica">
        <Grelha>
          <Selecao
            rotulo="Mês de registo"
            valor={f.registoMes}
            onChange={(v) => set("registoMes", v)}
            opcoes={MESES_ABREV.map((m, i) => ({
              valor: String(i + 1),
              rotulo: m,
            }))}
          />
          <Numero
            rotulo="Ano de registo"
            valor={f.registoAno}
            onChange={(v) => set("registoAno", v)}
          />
          <Numero
            rotulo="Quilómetros"
            valor={f.quilometros}
            onChange={(v) => set("quilometros", v)}
          />
          <Selecao
            rotulo="Combustível"
            valor={f.combustivel}
            onChange={(v) => set("combustivel", v)}
            opcoes={COMBUSTIVEIS.map((c) => ({ valor: c, rotulo: c }))}
          />
          <Selecao
            rotulo="Transmissão"
            valor={f.transmissao}
            onChange={(v) => set("transmissao", v)}
            opcoes={TRANSMISSOES.map((t) => ({ valor: t, rotulo: t }))}
          />
          <Selecao
            rotulo="Segmento"
            valor={f.segmento}
            onChange={(v) => set("segmento", v)}
            opcoes={SEGMENTOS.map((s) => ({ valor: s, rotulo: s }))}
          />
          <Numero
            rotulo="Potência (cv)"
            valor={f.potenciaCv}
            onChange={(v) => set("potenciaCv", v)}
          />
          <Numero
            rotulo="Cilindrada (cc)"
            valor={f.cilindradaCc}
            onChange={(v) => set("cilindradaCc", v)}
          />
          <Numero
            rotulo="Lugares"
            valor={f.lugares}
            onChange={(v) => set("lugares", v)}
          />
          <Numero
            rotulo="Portas"
            valor={f.portas}
            onChange={(v) => set("portas", v)}
          />
          <Texto rotulo="Cor" valor={f.cor} onChange={(v) => set("cor", v)} />
          <Texto
            rotulo="Cor interior"
            valor={f.corInterior}
            onChange={(v) => set("corInterior", v)}
          />
          <Texto
            rotulo="Origem"
            valor={f.origem}
            onChange={(v) => set("origem", v)}
            placeholder="Ex.: Importado"
          />
          <Texto
            rotulo="Estado"
            valor={f.estado}
            onChange={(v) => set("estado", v)}
            placeholder="Ex.: Usado"
          />
          <Texto
            rotulo="Garantia"
            valor={f.garantia}
            onChange={(v) => set("garantia", v)}
            placeholder="Ex.: 12 meses"
          />
          <Texto
            rotulo="Classe de portagem"
            valor={f.classePortagem}
            onChange={(v) => set("classePortagem", v)}
          />
          <Texto
            rotulo="Matrícula"
            valor={f.matricula}
            onChange={(v) => set("matricula", v)}
          />
          <Texto rotulo="VIN" valor={f.vin} onChange={(v) => set("vin", v)} />
        </Grelha>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          <Interruptor
            rotulo="Livro de revisões"
            ativo={f.livroRevisoes}
            onChange={(v) => set("livroRevisoes", v)}
          />
          <Interruptor
            rotulo="2ª chave"
            ativo={f.segundaChave}
            onChange={(v) => set("segundaChave", v)}
          />
        </div>
      </Seccao>

      {/* Descrição */}
      <Seccao titulo="Descrição">
        <label className={labelBase}>Texto do anúncio</label>
        <textarea
          value={f.descricao}
          onChange={(e) => set("descricao", e.target.value)}
          rows={5}
          className={inputBase}
          placeholder="Descreva a viatura, o equipamento e o estado geral…"
        />
      </Seccao>

      {/* Extras */}
      <Seccao titulo="Extras e equipamento">
        <div className="space-y-5">
          {f.extras.map((cat, ci) => (
            <div key={ci} className="border border-line/60 bg-background p-4">
              <div className="flex items-center gap-3">
                <input
                  value={cat.categoria}
                  onChange={(e) => updCategoria(ci, e.target.value)}
                  placeholder="Categoria (ex.: Conforto)"
                  className={`${inputBase} font-medium`}
                />
                <button
                  type="button"
                  onClick={() => removerCategoria(ci)}
                  className="shrink-0 px-2 py-2 text-xs text-muted transition-colors hover:text-red-400"
                >
                  Remover
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {cat.itens.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2">
                    <span className="text-gold-deep">•</span>
                    <input
                      value={item}
                      onChange={(e) => updItem(ci, ii, e.target.value)}
                      placeholder="Item de equipamento"
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={() => removerItem(ci, ii)}
                      className="shrink-0 px-2 py-2 text-xs text-muted transition-colors hover:text-red-400"
                      aria-label="Remover item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(ci)}
                  className="text-xs tracking-wide text-gold transition-colors hover:text-gold-bright"
                >
                  + Adicionar item
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCategoria}
            className="border border-gold/40 px-4 py-2.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold-bright"
          >
            + Adicionar categoria
          </button>
        </div>
      </Seccao>

      {/* Fotos */}
      <Seccao titulo="Fotos">
        {f.fotos.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {f.fotos.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="group relative aspect-[4/3] overflow-hidden border border-line/60 bg-background"
              >
                <Image
                  src={url}
                  alt={`Foto ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 bg-gold px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background">
                    Capa
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/85 px-1.5 py-1 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moverFoto(i, -1)}
                    disabled={i === 0}
                    className="px-1.5 text-xs text-champagne disabled:opacity-30"
                    aria-label="Mover para trás"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => removerFoto(i)}
                    className="px-1.5 text-xs text-red-300 hover:text-red-400"
                    aria-label="Remover foto"
                  >
                    Apagar
                  </button>
                  <button
                    type="button"
                    onClick={() => moverFoto(i, 1)}
                    disabled={i === f.fotos.length - 1}
                    className="px-1.5 text-xs text-champagne disabled:opacity-30"
                    aria-label="Mover para a frente"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="inline-flex cursor-pointer items-center gap-2 border border-gold/40 px-4 py-2.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold-bright">
          {aEnviarFotos ? "A enviar…" : "+ Carregar fotos"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={aEnviarFotos}
            onChange={(e) => {
              if (e.target.files?.length) enviarFotos(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>
        <p className="mt-2 text-xs text-muted">
          A primeira foto é a capa do anúncio. Arraste pelos botões para reordenar.
        </p>
      </Seccao>

      {/* Barra de ações */}
      {erro && (
        <p
          className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {erro}
        </p>
      )}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-line bg-background/90 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-5 py-2.5 text-sm tracking-wide text-muted transition-colors hover:text-champagne"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={aGuardar || aEnviarFotos}
          className="gold-metal-fill px-6 py-2.5 text-sm font-medium tracking-wide text-background disabled:opacity-60"
        >
          {aGuardar
            ? "A guardar…"
            : edicao
              ? "Guardar alterações"
              : "Publicar viatura"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Primitivas de campo ---------- */

function Seccao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display mb-4 text-xl text-ink">{titulo}</h2>
      <div className="hairline mb-5" />
      {children}
    </section>
  );
}

function Grelha({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function Texto({
  rotulo,
  valor,
  onChange,
  placeholder,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelBase}>{rotulo}</span>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputBase}
      />
    </label>
  );
}

function Numero({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelBase}>{rotulo}</span>
      <input
        type="number"
        inputMode="numeric"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      />
    </label>
  );
}

function Selecao({
  rotulo,
  valor,
  onChange,
  opcoes,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
}) {
  return (
    <label className="block">
      <span className={labelBase}>{rotulo}</span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} appearance-none [&>option]:bg-surface`}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

function Interruptor({
  rotulo,
  ativo,
  onChange,
}: {
  rotulo: string;
  ativo: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={ativo}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-gold"
      />
      {rotulo}
    </label>
  );
}
