import Link from "next/link";
import { ViaturaForm } from "@/components/admin/ViaturaForm";

export const metadata = { title: "Nova viatura" };

export default function NovaViaturaPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-xs tracking-wide text-muted transition-colors hover:text-gold"
        >
          ← Voltar
        </Link>
        <h1 className="font-display mt-3 text-3xl text-ink">
          Nova <span className="italic text-gold">viatura</span>
        </h1>
      </div>
      <ViaturaForm />
    </div>
  );
}
