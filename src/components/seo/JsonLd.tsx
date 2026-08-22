/**
 * Injeta um bloco de dados estruturados.
 *
 * O `<` é escapado para `<`: `JSON.stringify` não sanitiza strings e
 * qualquer texto do inventário que contivesse `</script>` fechava a tag a
 * meio. É a recomendação da documentação do Next.
 *
 * Script nativo, não `next/script`: isto é dados, não código a executar.
 */
export function JsonLd({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, "\\u003c"),
      }}
    />
  );
}
