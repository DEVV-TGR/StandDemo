"use client";

import { useEffect, useState } from "react";

/*
  Uma contagem decrescente, para o tempo de espera não envelhecer no ecrã.

  Um "faltam 7 minutos" escrito uma vez fica a mentir a partir do minuto
  seguinte, e quem está à espera não sabe se recarrega ou se aguarda. A
  contagem responde à pergunta sozinha — e quando chega a zero diz que já pode
  tentar, que é a única coisa que a pessoa quer saber.

  ## Duas regras do React 19 a respeitar ao mesmo tempo

  **O relógio não se lê durante o render.** `Date.now()` é impuro: dois renders
  do mesmo estado dariam resultados diferentes, e o React precisa que não dêem.
  Por isso o instante actual é estado, e quem o actualiza é o intervalo.

  **E não se chama `setState` de forma síncrona dentro do efeito** — é a
  cascata de renders que já corrigimos noutros dois sítios. O efeito aqui só
  agenda; a primeira actualização chega um segundo depois, e até lá vale o
  instante capturado no arranque.

  Guardar o *fim* em vez dos *segundos que faltam* dá ainda uma propriedade que
  um contador decrescente não teria: se o separador ficar em segundo plano e o
  browser adormecer o intervalo, ao voltar mostra o tempo certo em vez do tempo
  que lhe faltou contar.
*/

function formatar(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Contagem({ segundos }: { segundos: number }) {
  const [fim] = useState(() => Date.now() + segundos * 1000);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const restam = Math.max(0, Math.ceil((fim - agora) / 1000));

  if (restam <= 0) {
    return <span className="text-sucesso">Já pode tentar de novo.</span>;
  }

  return (
    <span>
      Faltam <span className="font-mono tabular-nums">{formatar(restam)}</span>.
    </span>
  );
}
