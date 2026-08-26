export type Combustivel = "Gasolina" | "Diesel" | "Híbrido" | "Elétrico";
export type Transmissao = "Automática" | "Manual";
export type Segmento = "Coupé" | "SUV" | "Carrinha" | "Berlina" | "Cabrio" | "Citadino";
export type EstadoVenda = "disponivel" | "reservado" | "vendido";

export interface ExtrasCategoria {
  categoria: string;
  itens: string[];
}

export interface Viatura {
  id: string;
  marca: string;
  marcaSlug: string;
  modelo: string;
  modeloSlug: string;
  versao: string;
  preco: number;
  registoMes: number;
  registoAno: number;
  quilometros: number;
  lugares: number;
  portas: number;
  segmento: Segmento;
  combustivel: Combustivel;
  potenciaCv: number;
  cilindradaCc: number;
  transmissao: Transmissao;
  cor: string;
  corInterior: string;
  origem: string;
  estado: string;
  garantia: string;
  livroRevisoes: boolean;
  segundaChave: boolean;
  classePortagem: string;
  matricula: string;
  vin: string;
  fotos: string[];
  extras: ExtrasCategoria[];
  destaque: boolean;
  estadoVenda: EstadoVenda;
  ivaDedutivel: boolean;
  descricao: string;
  /*
    Quando o anúncio foi publicado e quando foi alterado pela última vez.

    Opcionais porque só existem para quem vem da base. O inventário estático
    de `src/data/viaturas.ts` — que também é um `Viatura[]` e serve de recurso
    quando a base não responde — não as tem, e datas escritas à mão num
    ficheiro seriam datas inventadas a dizer ao Google que a página mudou.
  */
  criadoEm?: Date;
  atualizadoEm?: Date;
}
