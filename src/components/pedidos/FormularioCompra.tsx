"use client";

import { enviarPedidoDeCompra } from "@/app/(site)/acoes-pedidos";
import { CampoFotos } from "@/components/pedidos/CampoFotos";
import { Bloco, FormularioPedido } from "@/components/pedidos/FormularioPedido";
import { Campo, CampoArea, CampoEscolha, CampoNumero, CampoSelecao } from "@/components/ui/campos";
import { INTENCOES, MESES, SIM_NAO } from "@/lib/pedidos/schema";
import { COMBUSTIVEIS, TRANSMISSOES } from "@/lib/viatura-schema";

/*
  «Compramos o seu carro» — os campos, e mais nada.

  A ordem é a de quem responde de cabeça: primeiro o que está no documento
  único, depois o que se sabe do carro, depois o que só o dono sabe, e no
  fim a pergunta que muda a conversa toda — vender ou dar de retoma.

  O `campo("matricula")` traz o valor, o `onChange`, a frase de erro e o
  momento de a mostrar. A chave é a do schema, e é por aí que os três se
  encontram: mudar o nome de um campo em `pedidos/schema.ts` sem o mudar
  aqui deixa de compilar o pedido, e não passa em silêncio.
*/

const ANO_ACTUAL = new Date().getFullYear();

export function FormularioCompra() {
  return (
    <FormularioPedido
      tipo="compra"
      accao={enviarPedidoDeCompra}
      sucesso={{
        titulo: (
          <>
            Pedido <span className="italic text-gold">enviado</span>
          </>
        ),
        texto:
          "Recebemos a descrição da sua viatura. Vemos o que temos de ver e entramos em contacto pelo telefone ou email que indicou. Se preferir adiantar, fale connosco no WhatsApp.",
      }}
    >
      {({ campo, desativado, aoMudarFotos }) => (
        <>
          <Bloco titulo="A sua" gold="viatura">
            <Campo
              nome="matricula"
              rotulo="Matrícula"
              {...campo("matricula")}
              obrigatorio
              desativado={desativado}
              exemplo="AA-00-AA"
              maximo={12}
            />
            <Campo
              nome="marca"
              rotulo="Marca"
              {...campo("marca")}
              obrigatorio
              desativado={desativado}
              exemplo="BMW"
              maximo={60}
            />
            <Campo
              nome="modelo"
              rotulo="Modelo e versão"
              {...campo("modelo")}
              obrigatorio
              desativado={desativado}
              exemplo="Série 3 320d Pack M"
              maximo={120}
              largo
            />
            <CampoSelecao
              nome="registoMes"
              rotulo="Mês da matrícula"
              {...campo("registoMes")}
              obrigatorio
              desativado={desativado}
              vazio="Escolher"
              opcoes={MESES.map((m, i) => [String(i + 1), m] as const)}
            />
            <CampoNumero
              nome="registoAno"
              rotulo="Ano da matrícula"
              {...campo("registoAno")}
              obrigatorio
              desativado={desativado}
              minimo={1950}
              maximo={ANO_ACTUAL + 1}
              exemplo={String(ANO_ACTUAL - 8)}
            />
            <CampoSelecao
              nome="combustivel"
              rotulo="Combustível"
              {...campo("combustivel")}
              obrigatorio
              desativado={desativado}
              vazio="Escolher"
              opcoes={COMBUSTIVEIS}
            />
            <CampoSelecao
              nome="transmissao"
              rotulo="Caixa"
              {...campo("transmissao")}
              obrigatorio
              desativado={desativado}
              vazio="Escolher"
              opcoes={TRANSMISSOES}
            />
            <CampoNumero
              nome="quilometros"
              rotulo="Quilómetros"
              {...campo("quilometros")}
              obrigatorio
              desativado={desativado}
              minimo={0}
              exemplo="120000"
              sufixo="km"
            />
            <CampoSelecao
              nome="livroRevisoes"
              rotulo="Livro de revisões"
              {...campo("livroRevisoes")}
              desativado={desativado}
              vazio="Não sei"
              opcoes={SIM_NAO.map((o) => [o.valor, o.rotulo] as const)}
            />
            <CampoNumero
              nome="proprietarios"
              rotulo="Proprietários"
              {...campo("proprietarios")}
              desativado={desativado}
              minimo={1}
              maximo={20}
              exemplo="2"
            />
            <CampoArea
              nome="estado"
              rotulo="Estado da viatura"
              {...campo("estado")}
              desativado={desativado}
              maximo={2000}
              largo
              exemplo="Riscos, pneus, revisões feitas, algo a precisar de reparação…"
              nota="Quanto mais souber, mais certeira é a avaliação — e menos surpresas há quando virmos o carro."
            />
            <CampoFotos
              rotulo="Fotografias da viatura"
              nota="Até 6. Frente, traseira, interior e o que quiser mostrar."
              desativado={desativado}
              aoMudarQuantidade={aoMudarFotos}
            />
          </Bloco>

          <Bloco titulo="O que" gold="pretende">
            <CampoEscolha
              nome="intencao"
              rotulo="Venda directa ou retoma"
              {...campo("intencao")}
              desativado={desativado}
              opcoes={INTENCOES.map((o) => [o.valor, o.rotulo] as const)}
              largo
            />
          </Bloco>

          <Bloco titulo="Como o" gold="contactamos">
            <Campo
              nome="nome"
              rotulo="Nome"
              {...campo("nome")}
              obrigatorio
              desativado={desativado}
              autoPreencher="name"
              maximo={80}
            />
            <Campo
              tipo="tel"
              nome="telefone"
              rotulo="Telefone"
              {...campo("telefone")}
              obrigatorio
              desativado={desativado}
              autoPreencher="tel"
              exemplo="912 345 678"
            />
            <Campo
              tipo="email"
              nome="email"
              rotulo="Email"
              {...campo("email")}
              obrigatorio
              desativado={desativado}
              autoPreencher="email"
              exemplo="o.seu@email.pt"
              maximo={120}
              largo
            />
          </Bloco>
        </>
      )}
    </FormularioPedido>
  );
}
