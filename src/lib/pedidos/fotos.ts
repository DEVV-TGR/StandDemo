/*
  Os limites das fotografias que acompanham um pedido.

  Vive fora do `anexos.ts` porque o campo do formulário — que corre no
  browser — precisa dos mesmos números para não deixar a pessoa escolher o
  que o servidor vai recusar. Um limite escrito em dois sítios é um limite
  que um dia diverge.

  ## Os números

  - **Seis fotografias.** Chega para mostrar um carro por fora e por dentro.
  - **3,5 MB no total.** O corpo de um pedido a uma função da Vercel não pode
    passar dos 4,5 MB, e o formulário leva mais coisas além das fotografias.
    O browser encolhe cada uma antes de a enviar (`prepararFoto`), o que
    deixa seis fotografias de telemóvel bem abaixo disto.
  - **Os mesmos tipos que o painel aceita**, e o SVG fica de fora pelas
    mesmas razões: é um documento com scripts lá dentro
    (ver `src/lib/painel/r2.ts`).
*/

export const FOTOS_MAXIMAS = 6;
export const TOTAL_MAXIMO = 3.5 * 1024 * 1024;

/** Tipo → extensão. O nome do ficheiro que sai daqui é nosso, não o de quem carrega. */
export const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const TIPOS_ACEITES = Object.keys(EXTENSOES);

export class ErroDeFotos extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeFotos";
  }
}
