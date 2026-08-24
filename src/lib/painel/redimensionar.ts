/*
  Encolher a fotografia no browser, antes de a enviar.

  ## Porque é obrigatório, e não uma optimização

  O limite de corpo de um pedido a uma função da Vercel é **4,5 MB**, imposto
  pela plataforma e não configurável — passar disso devolve `413
  FUNCTION_PAYLOAD_TOO_LARGE`. Uma fotografia de um telemóvel recente passa
  disso sozinha.

  Sem isto, o cliente escolhia uma foto tirada com o telemóvel e o upload
  falhava. Não é caso raro: é o caso normal.

  ## E porque não estraga nada

  As fotografias do site são servidas com 1440px de lado maior. Guardar o
  original de 4000px não melhora nada visível e multiplica por dez o espaço no
  R2 e o tempo de carregamento de quem está a publicar.

  1920px deixa margem confortável para o `next/image` gerar as variantes de que
  precisa, e uma foto de 8 MB fica tipicamente entre 400 KB e 900 KB.

  ## O que fica no servidor

  Isto corre no browser e é conveniência — não é fronteira. O servidor valida o
  tipo e o tamanho na mesma, porque uma server action pode ser chamada sem
  passar por aqui.
*/

/** Lado maior, em pixels. As fotos do site são servidas a 1440. */
const LADO_MAXIMO = 1920;

/** Compromisso habitual para fotografia: acima disto o ficheiro cresce sem se ver. */
const QUALIDADE = 0.85;

/** Abaixo disto não vale a pena mexer — já cabe e recomprimir só degrada. */
const DEIXAR_PASSAR = 1_000_000;

export type FotoPreparada = { ficheiro: File; encolhida: boolean };

export async function prepararFoto(original: File): Promise<FotoPreparada> {
  if (original.size <= DEIXAR_PASSAR) {
    return { ficheiro: original, encolhida: false };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(original);
  } catch {
    /*
      Ficheiro que o browser não consegue descodificar. Deixa passar tal e
      qual: o servidor vai recusá-lo com uma mensagem própria, que é melhor do
      que inventar aqui uma sobre um formato que não sabemos qual é.
    */
    return { ficheiro: original, encolhida: false };
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));

  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;

  const ctx = tela.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { ficheiro: original, encolhida: false };
  }

  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    tela.toBlob(resolve, "image/jpeg", QUALIDADE),
  );

  /* Se o resultado não ficou menor, não vale a pena trocar. */
  if (!blob || blob.size >= original.size) {
    return { ficheiro: original, encolhida: false };
  }

  const nome = original.name.replace(/\.[^.]+$/, "") + ".jpg";
  return {
    ficheiro: new File([blob], nome, { type: "image/jpeg" }),
    encolhida: true,
  };
}
