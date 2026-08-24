"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  criarViatura,
  atualizarViatura,
  carregarFotos,
} from "@/app/admin/acoes-viaturas";
import { prepararFoto } from "@/lib/painel/redimensionar";
import { MESES_ABREV } from "@/lib/format";
import type { Viatura } from "@/lib/types";

/** O mesmo valor que `src/lib/painel/r2.ts` valida do lado do servidor. */
const FOTOS_MAX = 30;
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

export function ViaturaForm({
  viatura,
  marcas = [],
  modelos = [],
}: {
  viatura?: Viatura;
  /** Marcas e modelos já usados, para o `datalist` — ver o componente `Texto`. */
  marcas?: string[];
  modelos?: string[];
}) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => estadoInicial(viatura));
  const [erro, setErro] = useState<string | null>(null);
  const [aGuardar, startGuardar] = useTransition();
  const [aEnviar, setAEnviar] = useState<{ feitas: number; total: number } | null>(null);

  const reduzido = useReducedMotion();
  const [anuncio, setAnuncio] = useState("");
  const [desfazer, setDesfazer] = useState<{ url: string; indice: number } | null>(null);

  const edicao = Boolean(viatura);

  function set<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setF((prev) => ({ ...prev, [campo]: valor }));
  }

  // ---- Fotos ----
  /*
    Uma foto de cada vez, e encolhida antes de sair do browser.

    **Uma de cada vez** porque o corpo de um pedido à Vercel não passa de
    4,5 MB: quinze fotos juntas nunca caberiam, por muito que se encolham. E
    tem a vantagem de o progresso ser visível e de uma que falhe não levar as
    outras atrás.

    **Encolhida** porque uma fotografia de telemóvel recente passa desses
    4,5 MB sozinha. Ver `src/lib/painel/redimensionar.ts`.
  */
  async function enviarFotos(files: FileList) {
    setErro(null);
    const lista = Array.from(files);
    const cabem = Math.min(lista.length, FOTOS_MAX - f.fotos.length);

    if (cabem <= 0) {
      setErro(`São ${FOTOS_MAX} fotos no máximo por viatura.`);
      return;
    }
    if (cabem < lista.length) {
      setErro(
        `Só cabem mais ${cabem} ${cabem === 1 ? "foto" : "fotos"} nesta viatura — as restantes ficaram de fora.`,
      );
    }

    for (let i = 0; i < cabem; i++) {
      setAEnviar({ feitas: i, total: cabem });

      const { ficheiro } = await prepararFoto(lista[i]);
      const fd = new FormData();
      fd.append("fotos", ficheiro);

      const r = await carregarFotos(fd, f.fotos.length + i);

      if (r.erro) {
        setErro(r.erro);
        break;
      }
      if (r.urls?.length) {
        setF((prev) => ({ ...prev, fotos: [...prev.fotos, ...r.urls!] }));
        // Fotos novas mudam os índices — o "Anular" guardado deixa de valer.
        setDesfazer(null);
      }
    }

    setAEnviar(null);
  }

  // ---- Reordenar ----
  /*
    Reordenar é a operação mais usada desta secção — e era a que estava partida
    no telemóvel: os controlos viviam atrás de `group-hover`, e no Tailwind v4
    todo o `hover:` nasce dentro de `@media (hover: hover)`. Em touch a regra
    nem sequer existe, portanto a barra era invisível. E como `opacity-0` não
    tira `pointer-events`, um toque às cegas acertava em "Apagar".

    Agora são botões sempre visíveis — que é também o único caminho que o
    teclado e o leitor de ecrã conseguem percorrer.
  */

  /*
    Um `aria-live` só reanuncia quando o texto muda. Mover duas fotos
    diferentes para a mesma posição gerava a mesma frase e ficava mudo — o
    espaço de largura zero alterna e resolve, sem se ver.
  */
  function anunciar(texto: string) {
    setAnuncio((antes) => (antes === texto ? `${texto}\u200B` : texto));
  }

  function frasePosicao(j: number, total: number) {
    return j === 0
      ? "Foto movida para a 1.ª posição — passou a ser a capa."
      : `Foto movida para a ${j + 1}.ª posição de ${total}.`;
  }

  function moverFoto(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= f.fotos.length) return;
    setF((prev) => {
      const fotos = [...prev.fotos];
      [fotos[i], fotos[j]] = [fotos[j], fotos[i]];
      return { ...prev, fotos };
    });
    setDesfazer(null);
    anunciar(frasePosicao(j, f.fotos.length));
  }

  /** Sem isto, pôr a foto 22 na capa eram 21 toques. */
  function tornarCapa(i: number) {
    if (i === 0) return;
    setF((prev) => {
      const fotos = [...prev.fotos];
      const [foto] = fotos.splice(i, 1);
      fotos.unshift(foto);
      return { ...prev, fotos };
    });
    setDesfazer(null);
    anunciar(frasePosicao(0, f.fotos.length));
  }

  /*
    Anular em vez de confirmar.

    O modal de `AcoesViatura` faz sentido para apagar uma viatura inteira, que
    é raro e irreversível. Remover uma foto é frequente e barato — um diálogo
    a cada uma seriam trinta diálogos. Mas também não é indolor: o ficheiro já
    subiu ao R2. Daí o "Anular", que dá a mesma rede sem pôr um passo no
    caminho de quem acertou no botão à primeira.
  */
  function removerFoto(i: number) {
    const url = f.fotos[i];
    setF((prev) => ({ ...prev, fotos: prev.fotos.filter((_, k) => k !== i) }));
    setDesfazer({ url, indice: i });
    anunciar(`Foto ${i + 1} removida.`);
  }

  function anularRemocao() {
    if (!desfazer) return;
    const { url, indice } = desfazer;
    setF((prev) => {
      const fotos = [...prev.fotos];
      fotos.splice(Math.min(indice, fotos.length), 0, url);
      return { ...prev, fotos };
    });
    setDesfazer(null);
    anunciar(`Foto reposta na ${indice + 1}.ª posição.`);
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

    /*
      **Sem `try/catch` à volta**, e é deliberado: em caso de sucesso a acção
      chama `redirect()`, que funciona atirando uma excepção para o Next
      apanhar. Um `catch` genérico engolia-a — a pessoa gravava, ficava no
      formulário, e via uma mensagem de erro a dizer que correu mal.

      O que a acção devolve é o erro de validação, e é esse que se mostra.
    */
    startGuardar(async () => {
      const r = viatura
        ? await atualizarViatura(viatura.id, payload)
        : await criarViatura(payload);

      if (r?.erro) setErro(r.erro);
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
            sugestoes={marcas}
          />
          <Texto
            rotulo="Modelo *"
            valor={f.modelo}
            onChange={(v) => set("modelo", v)}
            placeholder="Ex.: 520d Touring"
            sugestoes={modelos}
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
              nota="Ligado, aparece em “Viaturas em Destaque” na página inicial."
              ativo={f.destaque}
              onChange={(v) => set("destaque", v)}
            />
            <Interruptor
              rotulo="IVA dedutível"
              nota="Ligado, mostra o selo “IVA Dedutível” no anúncio."
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
            nota="Aparece na ficha técnica do anúncio."
            ativo={f.livroRevisoes}
            onChange={(v) => set("livroRevisoes", v)}
          />
          <Interruptor
            rotulo="2ª chave"
            nota="Aparece na ficha técnica do anúncio."
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
                  className="shrink-0 px-2 py-2 text-xs text-muted transition-colors hover:text-red-bright"
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
                      className="shrink-0 px-2 py-2 text-xs text-muted transition-colors hover:text-red-bright"
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
          <motion.ul
            className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          >
            {f.fotos.map((url, i) => (
                /*
                  A chave é só o `url`, e não `${url}-${i}`.

                  Com o índice na chave, trocar duas fotos mudava a chave das
                  duas: o React desmontava e remontava ambos os `<Image>`, e
                  via-se o flash. Sem ele, o React *move* os nós — a foto não
                  pisca e, de graça, o botão que está com foco viaja com ela.

                  Os URLs são únicos por construção: `randomUUID()` no upload
                  (`lib/painel/r2.ts`) e `1.jpg`…`15.jpg` nas viaturas semeadas.
                */
                <motion.li
                  key={url}
                  layout={reduzido ? false : "position"}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="scroll-mb-24 border border-line/60 bg-surface"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-background">
                    <Image
                      src={url}
                      alt={`Foto ${i + 1}`}
                      fill
                      sizes="200px"
                      draggable={false}
                      className="select-none object-cover"
                    />

                    {/*
                      A posição, que é a informação que falta quando são trinta
                      fotos. `aria-hidden` porque o `alt` da imagem e os rótulos
                      dos botões já dizem de que foto se trata.
                    */}
                    <span
                      aria-hidden
                      className={`absolute left-1.5 top-1.5 flex h-6 items-center px-1.5 text-[10px] font-medium uppercase tracking-wider tabular-nums ${
                        i === 0
                          ? "bg-gold text-background"
                          : "bg-background/70 text-champagne backdrop-blur"
                      }`}
                    >
                      {i === 0 ? "Capa" : i + 1}
                    </span>

                    {/*
                      Apagar sai da barra dos movimentos e vai para o canto
                      oposto: 44×44 de área de toque, 28×28 de mancha. Quem
                      quer mover não passa por cima do que destrói.
                    */}
                    <button
                      type="button"
                      onClick={() => removerFoto(i)}
                      aria-label={`Remover foto ${i + 1}`}
                      title="Remover"
                      className="press absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-champagne hover:text-red-bright"
                    >
                      <span
                        aria-hidden
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-background/60 text-xs backdrop-blur"
                      >
                        ✕
                      </span>
                    </button>
                  </div>

                  {/*
                    `grid-cols-3` e não `justify-between`: a 320 px a célula tem
                    138 px, e três terços dão 46 px cada — acima dos 44 da HIG.
                    Com larguras fixas, os três botões encostavam-se.
                  */}
                  <div className="grid grid-cols-3 divide-x divide-line/60 border-t border-line/60">
                    {/*
                      `aria-disabled` e não `disabled`: o browser tira o foco a
                      um elemento que passa a `disabled`, e era isso que
                      acontecia ao empurrar uma foto até à última posição — o
                      dedo seguinte já não sabia onde estava. Inerte ao ponteiro
                      por `pointer-events-none`; ao teclado, a guarda está no
                      handler.
                    */}
                    <button
                      type="button"
                      onClick={() => moverFoto(i, -1)}
                      aria-disabled={i === 0}
                      aria-label={`Mover a foto ${i + 1} para trás`}
                      title="Mover para trás"
                      className="press flex h-11 items-center justify-center text-champagne hover:text-gold-bright aria-disabled:pointer-events-none aria-disabled:opacity-30"
                    >
                      <span aria-hidden>←</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => tornarCapa(i)}
                      aria-disabled={i === 0}
                      aria-label={`Tornar a foto ${i + 1} a capa`}
                      title="Tornar capa"
                      className="press flex h-11 items-center justify-center text-[11px] uppercase tracking-[0.12em] text-muted hover:text-gold-bright aria-disabled:pointer-events-none aria-disabled:opacity-30"
                    >
                      Capa
                    </button>
                    <button
                      type="button"
                      onClick={() => moverFoto(i, 1)}
                      aria-disabled={i === f.fotos.length - 1}
                      aria-label={`Mover a foto ${i + 1} para a frente`}
                      title="Mover para a frente"
                      className="press flex h-11 items-center justify-center text-champagne hover:text-gold-bright aria-disabled:pointer-events-none aria-disabled:opacity-30"
                    >
                      <span aria-hidden>→</span>
                    </button>
                  </div>
                </motion.li>
            ))}
          </motion.ul>
        )}

        {/*
          A linha de estado. Visível *e* `aria-live`: a troca era invisível para
          quem não vê, e fácil de perder de vista com trinta miniaturas. O botão
          fica fora da região viva — um controlo lá dentro seria reanunciado a
          cada atualização.
        */}
        {f.fotos.length > 0 && (
          <div className="mb-5 flex min-h-5 flex-wrap items-center gap-x-3 text-xs text-muted">
            <p aria-live="polite">{desfazer ? "Foto removida." : anuncio}</p>
            {desfazer && (
              <button
                type="button"
                onClick={anularRemocao}
                className="press underline underline-offset-4 hover:text-gold-bright"
              >
                Anular
              </button>
            )}
          </div>
        )}

        <label className="press inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold-bright">
          {aEnviar
            ? `A carregar ${aEnviar.feitas + 1} de ${aEnviar.total}…`
            : "+ Carregar fotos"}
          <input
            type="file"
            /*
              A mesma lista fechada que o servidor valida, para o seletor de
              ficheiros não oferecer o que vai ser recusado. Não substitui a
              validação de lá — é conveniência, não fronteira.
            */
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={Boolean(aEnviar)}
            onChange={(e) => {
              if (e.target.files?.length) void enviarFotos(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          A primeira foto é a capa — é a que aparece no card e nos resultados
          de pesquisa. As setas trocam com a foto ao lado; “Capa” salta uma
          foto directamente para primeiro. Até 30 fotos. As maiores são
          reduzidas automaticamente antes de subirem.
        </p>
      </Seccao>

      {/* Barra de ações */}
      {erro && (
        <p
          className="rounded-xl border border-red-deep bg-red/10 px-4 py-3 text-sm text-red-bright"
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
          disabled={aGuardar}
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

/*
  Campo de texto, com sugestões opcionais.

  As sugestões são um `datalist`, e a escolha é deliberada: sugere sem fechar.
  Escrever livremente continua possível — é assim que entra uma marca nova —
  mas ver "BMW" na lista evita que ela e "Bmw" se tornem duas marcas distintas
  na grelha da homepage, que é derivada do inventário e não tem forma de
  adivinhar que são a mesma.

  Uma lista fechada seria impossível de sujar, mas obrigava a um passo à parte
  para acrescentar marca — e o custo de uma gralha aqui é recuperável: edita-se
  a viatura.
*/
function Texto({
  rotulo,
  valor,
  onChange,
  placeholder,
  sugestoes,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  sugestoes?: string[];
}) {
  const idLista = sugestoes?.length
    ? `sugestoes-${rotulo.toLowerCase().replace(/\W+/g, "-")}`
    : undefined;

  return (
    <label className="block">
      <span className={labelBase}>{rotulo}</span>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={idLista}
        className={inputBase}
      />
      {idLista && (
        <datalist id={idLista}>
          {sugestoes!.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      )}
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

/*
  Cada interruptor diz o que acontece no site quando fica ligado.

  O cliente não pensa em "campos" — pensa em "pôr em destaque" e "marcar como
  vendido". Sem a frase ao lado, a dúvida vira telefonema; com ela, o controlo
  explica-se sozinho. É a razão de a `nota` não ser opcional.
*/
function Interruptor({
  rotulo,
  nota,
  ativo,
  onChange,
}: {
  rotulo: string;
  nota: string;
  ativo: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={ativo}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
      />
      <span>
        <span className="block text-sm text-ink">{rotulo}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
          {nota}
        </span>
      </span>
    </label>
  );
}
