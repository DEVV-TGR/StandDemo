"use client";

export function SelectField({
  rotulo,
  valor,
  onChange,
  opcoes,
  todos = "Todos",
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
  todos?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted">
        {rotulo}
      </span>
      <span className="relative block">
        <select
          className="w-full appearance-none rounded-xl border border-line bg-surface/80 px-4 py-3 pr-10 text-sm text-ink outline-none transition-colors focus:border-gold [&>option]:bg-surface"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{todos}</option>
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold"
        >
          ▾
        </span>
      </span>
    </label>
  );
}
