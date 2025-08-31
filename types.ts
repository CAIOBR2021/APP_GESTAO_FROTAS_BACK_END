// sgrm-backend/types.ts
export interface Entrega {
  id?: number;
  data_hora_solicitacao: string;
  local_armazenagem: string;
  local_obra: string;
  item_nome: string;
  item_quantidade: number;
  item_unidade_medida: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  status?: string;
}