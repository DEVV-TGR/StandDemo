import "server-only";
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { semAspas } from "./env";

/*
  As fotografias das viaturas, no Cloudflare R2.

  **O upload passa pelo servidor**: o ficheiro sobe numa server action, e é o
  servidor que fala com o R2. As chaves nunca saem daqui — não há URLs
  pré-assinados de escrita directa do browser, e passar a haver mudaria quem
  controla o que é escrito no bucket.

  A leitura é outra história: as imagens são servidas pelo `R2_PUBLIC_URL`, que
  é público por natureza e só dá leitura.
*/

/*
  As variáveis são lidas **dentro** das funções, nunca no topo do ficheiro.

  O `r2.ts` do PR #12 lia-as em module scope, e é o padrão de erro que já nos
  custou tempo noutro sítio: o `next build` do CI corre sem uma única variável
  definida, e um módulo que as leia ao ser importado rebenta o build inteiro
  por causa de uma funcionalidade que nem sequer está a ser usada.
*/
function config() {
  /*
    Tudo passa pelo `semAspas`. O `R2_PUBLIC_URL` é o mais traiçoeiro do
    conjunto: com aspas, as fotografias deixam de carregar e não há erro
    nenhum — só espaços vazios no site.
  */
  return {
    accountId: semAspas(process.env.R2_ACCOUNT_ID),
    accessKeyId: semAspas(process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: semAspas(process.env.R2_SECRET_ACCESS_KEY),
    bucket: semAspas(process.env.R2_BUCKET),
    publicUrl: semAspas(process.env.R2_PUBLIC_URL)?.replace(/\/$/, ""),
  };
}

export function r2Configurado(): boolean {
  const c = config();
  return Boolean(
    c.accountId && c.accessKeyId && c.secretAccessKey && c.bucket && c.publicUrl,
  );
}

let clienteCache: S3Client | null = null;

function cliente(): S3Client {
  const c = config();
  if (!r2Configurado()) {
    throw new ErroDeFoto(
      "O armazenamento de fotografias ainda não está configurado.",
    );
  }
  if (!clienteCache) {
    clienteCache = new S3Client({
      region: "auto",
      endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: c.accessKeyId!,
        secretAccessKey: c.secretAccessKey!,
      },
    });
  }
  return clienteCache;
}

export class ErroDeFoto extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeFoto";
  }
}

/*
  Lista fechada de tipos, e o **SVG fica de fora**.

  Um SVG é um documento com scripts lá dentro, e servido do mesmo domínio das
  imagens corre JavaScript nessa origem. Para fotografias de carros não perde
  nada; ganha fechar uma porta que não tem razão para estar aberta.

  A extensão sai daqui, do tipo declarado — nunca do nome do ficheiro, que quem
  carrega escolhe.
*/
const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/*
  Quatro megabytes por ficheiro, e o número não é escolhido por gosto.

  **O limite de corpo de um pedido a uma função da Vercel é 4,5 MB**, imposto
  pela plataforma e não configurável; acima disso a resposta é `413
  FUNCTION_PAYLOAD_TOO_LARGE`. Quatro deixa margem para o que o `multipart`
  acrescenta em fronteiras e cabeçalhos.

  Uma fotografia de telemóvel recente passa dos 4,5 MB sozinha, e é por isso
  que o browser a encolhe antes de a enviar — ver
  `src/lib/painel/redimensionar.ts`. Este limite é a rede que apanha o que
  escapar a isso, incluindo quem chame a acção sem passar pelo formulário.
*/
export const TAMANHO_MAXIMO = 4 * 1024 * 1024;
export const FOTOS_MAXIMAS = 30;

/** Envia uma imagem e devolve o URL público. */
export async function guardarFoto(ficheiro: File): Promise<string> {
  const c = config();
  const extensao = EXTENSOES[ficheiro.type];

  if (!extensao) {
    throw new ErroDeFoto(
      `“${ficheiro.name}” não é uma imagem suportada. Aceitamos JPG, PNG, WebP e AVIF.`,
    );
  }
  if (ficheiro.size > TAMANHO_MAXIMO) {
    const mb = (ficheiro.size / 1024 / 1024).toFixed(1);
    throw new ErroDeFoto(
      `“${ficheiro.name}” tem ${mb} MB e o limite são 4 MB por foto.`,
    );
  }

  /*
    O nome é gerado aqui, e o que a pessoa deu nunca chega ao bucket. Evita
    travessia de caminhos (`../`), colisões entre viaturas, e nomes com
    acentos ou espaços que depois dão dores de cabeça no URL.
  */
  const chave = `viaturas/${randomUUID()}.${extensao}`;

  await cliente().send(
    new PutObjectCommand({
      Bucket: c.bucket!,
      Key: chave,
      Body: Buffer.from(await ficheiro.arrayBuffer()),
      ContentType: ficheiro.type,
      /*
        Um ano, imutável: o nome é único por ficheiro, portanto o conteúdo
        nunca muda debaixo do mesmo URL. Trocar a foto gera outro nome.
      */
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${c.publicUrl}/${chave}`;
}

/**
 * Apaga uma foto do bucket.
 *
 * Ignora URLs que não sejam nossos — as viaturas semeadas apontam para
 * ficheiros em `public/`, do repositório, e esses não têm nada que ver com o
 * R2. Engole erros de propósito: não conseguir apagar uma foto que já não
 * existe não pode fazer falhar a remoção da viatura.
 */
export async function apagarFoto(url: string): Promise<void> {
  const c = config();
  if (!c.publicUrl || !url.startsWith(c.publicUrl)) return;

  const chave = url.slice(c.publicUrl.length + 1);
  if (!chave) return;

  try {
    await cliente().send(
      new DeleteObjectCommand({ Bucket: c.bucket!, Key: chave }),
    );
  } catch (erro) {
    console.error("[painel] falha ao apagar foto do R2:", erro);
  }
}
