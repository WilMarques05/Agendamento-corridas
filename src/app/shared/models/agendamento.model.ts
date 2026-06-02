export interface Agendamento {
  id?: string;
  idMotorista: string;
  idPassageiro: string;
  nomePassageiro: string;
  telefonePassageiro: string;

  localPartida: string;
  localDestino: string;
  distanciaKm: number;
  valorTotal: number;

  dataCorrida: string;
  horarioCorrida: string;

  status: 'Pendente' | 'Aceito' | 'Recusado' | 'Expirado';
  horarioSolicitacao: string;
}
