/**
 * Valida a metadata de todas as páginas do sitemap.
 *
 * Escrever titles curtos uma vez não resolve nada: o conteúdo vem do
 * inventário e um modelo com nome comprido rebenta os limites sem ninguém
 * reparar. Este script corre contra o site servido e falha o processo se
 * houver metadata em falta, repetida ou fora de medida.
 *
 * Uso:
 *   npm run build && npx next start -p 3000
 *   npm run check:seo                    # ou BASE_URL=... npm run check:seo
 */

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const LIMITES = { title: 60, description: 160 };

const erros = [];
const avisos = [];

function extrair(html, regex) {
  const m = html.match(regex);
  return m ? decodeHtml(m[1].trim()) : null;
}

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const locs = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) erros.push("sitemap.xml não devolveu nenhum <loc>");

// o sitemap declara o domínio de produção; os pedidos vão para o BASE local
const caminhos = locs.map((u) => new URL(u).pathname || "/");

const robots = await fetch(`${BASE}/robots.txt`);
if (!robots.ok) erros.push(`/robots.txt devolveu ${robots.status}`);
else {
  const txt = await robots.text();
  if (/^\s*Disallow:\s*\/\s*$/im.test(txt)) erros.push("robots.txt bloqueia o site inteiro");
  if (!/Sitemap:/i.test(txt)) erros.push("robots.txt não declara o sitemap");
}

const vistos = { title: new Map(), description: new Map() };

for (const caminho of caminhos) {
  const url = `${BASE}${caminho === "/" ? "" : caminho}`;
  const res = await fetch(url);
  const html = await res.text();
  const rotulo = caminho;

  if (!res.ok) {
    erros.push(`${rotulo}: HTTP ${res.status}`);
    continue;
  }

  const title = extrair(html, /<title>(.*?)<\/title>/s);
  const desc = extrair(html, /<meta name="description" content="(.*?)"\/?>/s);
  const canonical = extrair(html, /<link rel="canonical" href="(.*?)"\/?>/);
  const ogImage = extrair(html, /<meta property="og:image" content="(.*?)"\/?>/);
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  if (!title) erros.push(`${rotulo}: sem <title>`);
  else if (title.length > LIMITES.title)
    erros.push(`${rotulo}: title com ${title.length} caracteres (máx ${LIMITES.title})`);

  if (!desc) erros.push(`${rotulo}: sem meta description`);
  else if (desc.length > LIMITES.description)
    erros.push(`${rotulo}: description com ${desc.length} caracteres (máx ${LIMITES.description})`);

  if (!canonical) erros.push(`${rotulo}: sem <link rel="canonical">`);
  else {
    if (!canonical.startsWith("http"))
      erros.push(`${rotulo}: canonical não é absoluto (${canonical})`);
    const esperado = new URL(locs.find((l) => (new URL(l).pathname || "/") === caminho));
    if (new URL(canonical).pathname.replace(/\/$/, "") !== esperado.pathname.replace(/\/$/, ""))
      erros.push(`${rotulo}: canonical não é auto-referencial (${canonical})`);
  }

  if (!ogImage) erros.push(`${rotulo}: sem og:image`);
  if (noindex) erros.push(`${rotulo}: está no sitemap mas tem noindex`);

  if (h1s === 0) erros.push(`${rotulo}: sem <h1>`);
  else if (h1s > 1) avisos.push(`${rotulo}: ${h1s} elementos <h1>`);

  // duplicados: com stock pequeno, dois carros do mesmo modelo e ano podem
  // acabar com o mesmo title se a versão não entrar
  for (const [campo, valor] of [["title", title], ["description", desc]]) {
    if (!valor) continue;
    const anterior = vistos[campo].get(valor);
    if (anterior) erros.push(`${rotulo}: ${campo} duplicado de ${anterior}`);
    else vistos[campo].set(valor, rotulo);
  }
}

console.log(`Verificadas ${caminhos.length} páginas em ${BASE}`);
for (const a of avisos) console.log(`  aviso  ${a}`);
for (const e of erros) console.log(`  ERRO   ${e}`);

if (erros.length > 0) {
  console.log(`\n${erros.length} ${erros.length === 1 ? "erro" : "erros"}.`);
  process.exit(1);
}
console.log("Sem erros.");
