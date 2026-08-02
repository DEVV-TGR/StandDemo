import type { Metadata } from "next";

// Shell neutro para toda a área /admin. A proteção de sessão é feita no layout
// do painel (admin/(painel)/layout.tsx); a página de login vive fora dele.
export const metadata: Metadata = {
  title: "Gestão",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
