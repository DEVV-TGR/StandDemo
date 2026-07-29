/**
 * Avisa o overlay de transição sempre que uma navegação começa.
 * É o único ponto que apanha todas as navegações do router — cliques em <Link>
 * e chamadas a router.push() (ex.: a pesquisa do hero).
 */
export function onRouterTransitionStart(url: string) {
  window.dispatchEvent(new CustomEvent("rota:inicio", { detail: { url } }));
}
