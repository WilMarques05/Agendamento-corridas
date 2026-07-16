export interface Motorista {
  id?: string;
  nomeCompleto: string;
  cidade: string;
  telefone: string;
  email: string;
  fotoPerfilBase64: string;
  avaliacao: number;
  valorPorKm: number;

  marcaCarro: string;
  modeloCarro: string;
  placaCarro: string;
  corCarro: string;
  fotoCarroExternaBase64: string;
  fotoCarroInternaBase64: string;
}
