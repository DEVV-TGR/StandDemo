import type { NextConfig } from "next";

// Autoriza o <Image> a carregar fotos do bucket R2 (host definido em R2_PUBLIC_URL),
// e ainda os domínios *.r2.dev usados quando o bucket é servido sem domínio próprio.
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "*.r2.dev" },
  { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
];

const publicUrl = process.env.R2_PUBLIC_URL;
if (publicUrl) {
  try {
    const { hostname } = new URL(publicUrl);
    if (!remotePatterns.some((p) => p.hostname === hostname)) {
      remotePatterns.push({ protocol: "https", hostname });
    }
  } catch {
    // R2_PUBLIC_URL inválido — ignora, mantém os padrões por defeito
  }
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
