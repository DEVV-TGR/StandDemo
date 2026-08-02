import Link from "next/link";
import { notFound } from "next/navigation";
import { ViaturaForm } from "@/components/admin/ViaturaForm";
import { getViatura } from "@/lib/viaturas";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editar viatura" };

export default async function EditarViaturaPage({
  params,
}: PageProps<"/admin/viaturas/[id]">) {
  const { id } = await params;
  const viatura = await getViatura(id);
  if (!viatura) notFound();

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
          Editar{" "}
          <span className="italic text-gold">
            {viatura.marca} {viatura.modelo}
          </span>
        </h1>
      </div>
      <ViaturaForm viatura={viatura} />
    </div>
  );
}
