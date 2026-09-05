/*
  Uma duração em segundos, dita como se diz.

  Serve os dois limitadores — o do painel, que conta na base, e o dos
  formulários do site, que conta em memória — e é por isso que vive fora de
  qualquer um deles.
*/

/** `430` → `"7 minutos"`, `45` → `"menos de um minuto"`. */
export function emPortugues(segundos: number): string {
  if (segundos < 60) return "menos de um minuto";
  const minutos = Math.ceil(segundos / 60);
  return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
}
