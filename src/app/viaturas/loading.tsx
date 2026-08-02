import { LogoAnel } from "@/components/ui/LogoAnel";

export default function Loading() {
  return (
    <div className="grid min-h-[70svh] place-items-center px-4 pt-24">
      <LogoAnel tamanho="pequeno" />
      <span className="sr-only">A carregar viaturas</span>
    </div>
  );
}
