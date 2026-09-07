"use client";

import { useEffect, useRef } from "react";

/*
  Os dois campos que ninguém preenche de propósito.

  ## O campo isco

  Chama-se `website` porque é o nome que os preenchedores automáticos
  procuram, e está fora do ecrã, sem foco e escondido dos leitores de ecrã.
  Uma pessoa não lhe chega; um script preenche-o. Quando vem preenchido, o
  servidor responde **sucesso** — dizer que falhou é ensinar quem escreveu o
  script a contornar isto na tentativa seguinte.

  Não se usa `display: none` nem `hidden`: os preenchedores mais capazes já
  saltam o que está escondido dessa forma, e o campo deixava de servir. Fica
  fora do ecrã, que continua a apanhar os simples — que são a maioria do que
  bate num formulário destes.

  ## O relógio

  O momento em que a página ficou pronta, escrito **num efeito** e não no
  render: no servidor o `Date.now()` daria outro valor e o HTML não batia
  certo com o do browser. Quem submete em menos de quatro segundos não
  preencheu nada — leu-se, ninguém escreve marca, modelo, quilómetros e
  contacto nesse tempo.
*/
export function CamposAntiSpam() {
  const relogio = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (relogio.current) relogio.current.value = String(Date.now());
  }, []);

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
      <input ref={relogio} type="text" name="iniciadoEm" tabIndex={-1} defaultValue="" />
    </div>
  );
}
