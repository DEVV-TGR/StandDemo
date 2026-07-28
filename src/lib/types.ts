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
}
