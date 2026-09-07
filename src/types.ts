export type UserRole = 'TSE' | 'TRE';

export type BrookasilState = 'Brookhaven' | 'Novacore' | 'Fortemega' | 'Florêmix';

export type PoliticalGroup = 'Direita' | 'Centro' | 'Esquerda';

export type CandidacyStatus = 'PENDENTE' | 'DEFERIDA' | 'INDEFERIDA';

export type PositionName =
  | 'Presidente'
  | 'Governador'
  | 'Senador'
  | 'Deputado Federal'
  | 'Deputado Estadual'
  | 'Prefeito'
  | 'Vereador';

export interface PositionConfig {
  name: PositionName;
  scope: 'Federal' | 'Estadual' | 'Municipal';
  digits: number;
  description: string;
}

export interface Party {
  id: number;
  name: string;
  acronym: string;
  number: number;
  group: PoliticalGroup;
  color: string;
  active: boolean;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  state: BrookasilState | 'ALL';
  name: string;
}

export interface Candidacy {
  id: string;
  protocol: string;
  full_name: string;
  ballot_name: string;
  photo: string;
  state: BrookasilState;
  position: PositionName;
  party: {
    id: number;
    name: string;
    acronym: string;
    number: number;
    color: string;
  };
  number: string;
  biography: string;
  proposals: string;
  status: CandidacyStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
}

export interface CandidacyInput {
  full_name: string;
  ballot_name: string;
  photo: string;
  state: BrookasilState;
  position: PositionName;
  party_id: number;
  number: string;
  biography: string;
  proposals: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byState: Record<string, number>;
  byPosition: Record<string, number>;
  byStatus: Record<string, number>;
}
