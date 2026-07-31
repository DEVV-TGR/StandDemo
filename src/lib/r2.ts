import "server-only";
import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicUrl = process.env.R2_PUBLIC_URL; // ex.: https://cdn.exemplo.pt ou https://<hash>.r2.dev

export function r2Configurado(): boolean {
  return Boolean(
    accountId && accessKeyId && secretAccessKey && bucket && publicUrl,
  );
}

let clienteCache: S3Client | null = null;

function cliente(): S3Client {
  if (!r2Configurado()) {
    throw new Error(
      "Cloudflare R2 não configurado. Defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET e R2_PUBLIC_URL (ver .env.example).",
    );
  }
  if (!clienteCache) {
    clienteCache = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }
  return clienteCache;
}

const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Envia um ficheiro de imagem para o R2 e devolve o URL público. */
export async function uploadFoto(file: File): Promise<string> {
  const ext = EXTENSOES[file.type];
  if (!ext) {
    throw new Error(`Tipo de imagem não suportado: ${file.type}`);
  }
  const chave = `viaturas/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await cliente().send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: chave,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${publicUrl!.replace(/\/$/, "")}/${chave}`;
}

/** Apaga uma foto do R2 a partir do seu URL público. Ignora URLs externos/locais. */
export async function apagarFoto(url: string): Promise<void> {
  if (!publicUrl || !url.startsWith(publicUrl.replace(/\/$/, ""))) return;
  const chave = url.slice(publicUrl.replace(/\/$/, "").length + 1);
  if (!chave) return;
  try {
    await cliente().send(
      new DeleteObjectCommand({ Bucket: bucket!, Key: chave }),
    );
  } catch (err) {
    // não bloqueia a operação principal se a foto já não existir
    console.error("Falha a apagar foto do R2:", err);
  }
}
