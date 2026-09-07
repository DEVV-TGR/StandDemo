/*
  O campo que ninguém preenche de propósito.

  Chama-se `website` porque é o nome que os preenchedores automáticos
  procuram, e está fora do ecrã, sem foco e escondido dos leitores de ecrã.
  Uma pessoa não lhe chega; um script preenche-o. Quando vem preenchido, o
  servidor responde **sucesso** — dizer que falhou é ensinar quem escreveu o
  script a contornar isto na tentativa seguinte.

  Não se usa `display: none` nem `hidden`: os preenchedores mais capazes já
  saltam o que está escondido dessa forma, e o campo deixava de servir. Fica
  fora do ecrã, que continua a apanhar os simples — que são a maioria do que
  bate num formulário destes.

  O outro guarda, o relógio, **não vive aqui**. Esteve, escrito num `<input>`
  por um efeito, e foi um erro: depois de uma server action o React 19 faz
  reset ao `<form>`, o campo voltava a vazio, e a segunda tentativa de quem
  se enganou num campo era recusada com "enviado depressa de mais" para
  sempre. Passou para uma referência dentro do `FormularioPedido`, escrita no
  `FormData` no momento do envio — fora do alcance do reset.
*/
export function CamposAntiSpam() {
  return (
    <div aria-hidden className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
      <label>
        Não preencha este campo
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}
