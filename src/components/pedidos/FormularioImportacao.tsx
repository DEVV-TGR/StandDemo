"use client";

import { enviarPedidoDeImportacao } from "@/app/(site)/acoes-pedidos";
import { CampoFotos } from "@/components/pedidos/CampoFotos";
import { Bloco, FormularioPedido } from "@/components/pedidos/FormularioPedido";
import { Campo, CampoArea, CampoNumero, CampoSelecao } from "@/components/ui/campos";
import { PRAZOS } from "@/lib/pedidos/schema";
import { COMBUSTIVEIS, TRANSMISSOES } from "@/lib/viatura-schema";

/*
  «Importamos o seu carro» — os campos, e mais nada.

  Ao contrário do outro formulário, aqui quase tudo é indiferente até não
  ser: quem procura um carro por encomenda costuma ter três ou quatro
  exigências e ser flexível no resto. Daí os campos opcionais serem tantos, e
  os selects abrirem em "Indiferente" em vez de obrigarem a escolher.

  Obrigatórios ficam os quatro que decidem se o pedido é realizável: o que
  se procura, a partir de que ano, quanto se pode gastar e para quando.
*/

const ANO_ACTUAL = new Date().getFullYear();

export function FormularioImportacao() {
  return (
    <FormularioPedido
      tipo="importacao"
      accao={enviarPedidoDeImportacao}
      sucesso={{
        titulo: (
          <>
            Pedido <span className="italic text-gold">enviado</span>
          </>
        ),
        texto:
          "Já sabemos o que procura. Vamos ao mercado ver o que aparece dentro do que nos disse e entramos em contacto pelo telefone ou email que indicou. Se quiser acrescentar alguma coisa, fale connosco no WhatsApp.",
      }}
    >
      {({ valores, mudar, desativado, aoMudarFotos }) => (
        <>
          <Bloco titulo="O que" gold="procura">
            <Campo
              nome="marca"
              rotulo="Marca"
              valor={valores.marca ?? ""}
              aoMudar={mudar("marca")}
              obrigatorio
              desativado={desativado}
              exemplo="Porsche"
              maximo={60}
            />
            <Campo
              nome="modelo"
              rotulo="Modelo e versão"
              valor={valores.modelo ?? ""}
              aoMudar={mudar("modelo")}
              obrigatorio
              desativado={desativado}
              exemplo="Macan S"
              maximo={120}
            />
            <CampoNumero
              nome="anoMinimo"
              rotulo="Ano mínimo"
              valor={valores.anoMinimo ?? ""}
              aoMudar={mudar("anoMinimo")}
              obrigatorio
              desativado={desativado}
              minimo={1990}
              maximo={ANO_ACTUAL + 1}
              exemplo={String(ANO_ACTUAL - 5)}
            />
            <CampoNumero
              nome="kmMaximos"
              rotulo="Quilómetros máximos"
              valor={valores.kmMaximos ?? ""}
              aoMudar={mudar("kmMaximos")}
              desativado={desativado}
              minimo={0}
              exemplo="100000"
              sufixo="km"
            />
            <CampoSelecao
              nome="combustivel"
              rotulo="Combustível"
              valor={valores.combustivel ?? ""}
              aoMudar={mudar("combustivel")}
              desativado={desativado}
              vazio="Indiferente"
              opcoes={COMBUSTIVEIS}
            />
            <CampoSelecao
              nome="transmissao"
              rotulo="Caixa"
              valor={valores.transmissao ?? ""}
              aoMudar={mudar("transmissao")}
              desativado={desativado}
              vazio="Indiferente"
              opcoes={TRANSMISSOES}
            />
            <Campo
              nome="cor"
              rotulo="Cor"
              valor={valores.cor ?? ""}
              aoMudar={mudar("cor")}
              desativado={desativado}
              exemplo="Cinzento, preto — ou indiferente"
              maximo={60}
              largo
            />
            <CampoArea
              nome="extras"
              rotulo="Extras que não podem faltar"
              valor={valores.extras ?? ""}
              aoMudar={mudar("extras")}
              desativado={desativado}
              maximo={2000}
              largo
              exemplo="Tecto de abrir, bancos em pele, tracção integral…"
              nota="É isto que separa o carro certo de um parecido. Diga também o que não quer."
            />
            <CampoFotos
              rotulo="Fotografias de referência"
              nota="Até 6. Um anúncio que viu, uma cor, um interior."
              desativado={desativado}
              aoMudarQuantidade={aoMudarFotos}
            />
          </Bloco>

          <Bloco titulo="Orçamento e" gold="prazo">
            <CampoNumero
              nome="orcamento"
              rotulo="Orçamento"
              valor={valores.orcamento ?? ""}
              aoMudar={mudar("orcamento")}
              obrigatorio
              desativado={desativado}
              minimo={1000}
              exemplo="45000"
              sufixo="€"
              nota="Um valor de referência chega. Serve para procurar no sítio certo, não é compromisso."
            />
            <CampoSelecao
              nome="prazo"
              rotulo="Para quando"
              valor={valores.prazo ?? ""}
              aoMudar={mudar("prazo")}
              obrigatorio
              desativado={desativado}
              vazio="Escolher"
              opcoes={PRAZOS}
            />
          </Bloco>

          <Bloco titulo="Como o" gold="contactamos">
            <Campo
              nome="nome"
              rotulo="Nome"
              valor={valores.nome ?? ""}
              aoMudar={mudar("nome")}
              obrigatorio
              desativado={desativado}
              autoPreencher="name"
              maximo={80}
            />
            <Campo
              tipo="tel"
              nome="telefone"
              rotulo="Telefone"
              valor={valores.telefone ?? ""}
              aoMudar={mudar("telefone")}
              obrigatorio
              desativado={desativado}
              autoPreencher="tel"
              exemplo="912 345 678"
            />
            <Campo
              tipo="email"
              nome="email"
              rotulo="Email"
              valor={valores.email ?? ""}
              aoMudar={mudar("email")}
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
