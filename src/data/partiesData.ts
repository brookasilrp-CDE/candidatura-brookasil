import { Party, PositionConfig, BrookasilState } from '../types';

export const BROOKASIL_STATES: BrookasilState[] = [
  'Brookhaven',
  'Novacore',
  'Fortemega',
  'Florêmix'
];

export const POSITIONS_CONFIG: PositionConfig[] = [
  {
    name: 'Presidente',
    scope: 'Federal',
    digits: 2,
    description: 'Chefe do Poder Executivo da República de Brookasil'
  },
  {
    name: 'Governador',
    scope: 'Estadual',
    digits: 2,
    description: 'Chefe do Poder Executivo Estadual'
  },
  {
    name: 'Senador',
    scope: 'Federal',
    digits: 3,
    description: 'Representante Estadual no Senado Federal'
  },
  {
    name: 'Deputado Federal',
    scope: 'Federal',
    digits: 4,
    description: 'Representante do Povo na Câmara dos Deputados'
  },
  {
    name: 'Deputado Estadual',
    scope: 'Estadual',
    digits: 5,
    description: 'Membro da Assembleia Legislativa do Estado'
  },
  {
    name: 'Prefeito',
    scope: 'Municipal',
    digits: 2,
    description: 'Chefe do Poder Executivo Municipal'
  },
  {
    name: 'Vereador',
    scope: 'Municipal',
    digits: 5,
    description: 'Membro da Câmara Municipal'
  }
];

export const INITIAL_PARTIES: Party[] = [
  // PARTIDOS DE DIREITA (1 a 18)
  { id: 1, name: 'Partido Liberal', acronym: 'PL', number: 22, group: 'Direita', color: '#1E3A8A', active: true },
  { id: 2, name: 'Partido Progressista', acronym: 'PP', number: 11, group: 'Direita', color: '#0284C7', active: true },
  { id: 3, name: 'Republicanos', acronym: 'REP', number: 10, group: 'Direita', color: '#0D9488', active: true },
  { id: 4, name: 'NOVO', acronym: 'NOVO', number: 30, group: 'Direita', color: '#EA580C', active: true },
  { id: 5, name: 'Democracia Cristã', acronym: 'DC', number: 27, group: 'Direita', color: '#2563EB', active: true },
  { id: 6, name: 'Agir', acronym: 'AGIR', number: 36, group: 'Direita', color: '#4F46E5', active: true },
  { id: 7, name: 'Democratas', acronym: 'DEM', number: 35, group: 'Direita', color: '#0369A1', active: true },
  { id: 8, name: 'Patriota', acronym: 'PATRIOTA', number: 51, group: 'Direita', color: '#15803D', active: true },
  { id: 9, name: 'Partido Renovador Trabalhista Brookasileiro', acronym: 'PRTB', number: 28, group: 'Direita', color: '#B45309', active: true },
  { id: 10, name: 'Partido Nacional Trabalhista Brookasileiro', acronym: 'PNTB', number: 75, group: 'Direita', color: '#4338CA', active: true },
  { id: 11, name: 'Partido da Ordem e Liberdade', acronym: 'POL', number: 81, group: 'Direita', color: '#1E293B', active: true },
  { id: 12, name: 'Aliança Cristã Nacional', acronym: 'ACN', number: 84, group: 'Direita', color: '#6B21A8', active: true },
  { id: 13, name: 'Partido da Reedificação da Ordem Nacional', acronym: 'PRONA', number: 57, group: 'Direita', color: '#312E81', active: true },
  { id: 14, name: 'Partido da Liberdade Nacional', acronym: 'PLN', number: 17, group: 'Direita', color: '#065F46', active: true },
  { id: 15, name: 'Partido da Esperança', acronym: 'PESP', number: 48, group: 'Direita', color: '#047857', active: true },
  { id: 16, name: 'Partido Militar Nacionalista', acronym: 'PMNL', number: 86, group: 'Direita', color: '#292524', active: true },
  { id: 17, name: 'Partido Revolucionário Inconstitucional', acronym: 'PRI', number: 26, group: 'Direita', color: '#7C2D12', active: true },
  { id: 18, name: 'Partido da Unidade e Liberdade Nacional', acronym: 'PULN', number: 24, group: 'Direita', color: '#164E63', active: true },

  // PARTIDOS DE CENTRO (19 a 28)
  { id: 19, name: 'Movimento Democrático Brookasileiro', acronym: 'MDB', number: 15, group: 'Centro', color: '#059669', active: true },
  { id: 20, name: 'União Brookasil', acronym: 'UNIÃO', number: 44, group: 'Centro', color: '#2563EB', active: true },
  { id: 21, name: 'Partido Social Democrático', acronym: 'PSD', number: 55, group: 'Centro', color: '#D97706', active: true },
  { id: 22, name: 'Podemos', acronym: 'PODEMOS', number: 20, group: 'Centro', color: '#0284C7', active: true },
  { id: 23, name: 'Partido da Social Democracia Brookasileira', acronym: 'PSDB', number: 45, group: 'Centro', color: '#1D4ED8', active: true },
  { id: 24, name: 'Cidadania', acronym: 'CIDADANIA', number: 23, group: 'Centro', color: '#E11D48', active: true },
  { id: 25, name: 'Solidariedade', acronym: 'SOLIDARIEDADE', number: 77, group: 'Centro', color: '#EA580C', active: true },
  { id: 26, name: 'Avante', acronym: 'AVANTE', number: 70, group: 'Centro', color: '#D97706', active: true },
  { id: 27, name: 'Partido da Reconstrução Nacional Brookasileira', acronym: 'PRNB', number: 67, group: 'Centro', color: '#4F46E5', active: true },
  { id: 28, name: 'Partido Mobilização Nacional', acronym: 'PMN', number: 33, group: 'Centro', color: '#9333EA', active: true },

  // PARTIDOS DE ESQUERDA (29 a 42)
  { id: 29, name: 'Partido dos Trabalhadores', acronym: 'PT', number: 13, group: 'Esquerda', color: '#DC2626', active: true },
  { id: 30, name: 'Partido Socialismo e Liberdade', acronym: 'PSOL', number: 50, group: 'Esquerda', color: '#E11D48', active: true },
  { id: 31, name: 'Partido Comunista de Brookasil', acronym: 'PCdoB', number: 65, group: 'Esquerda', color: '#B91C1C', active: true },
  { id: 32, name: 'REDE', acronym: 'REDE', number: 18, group: 'Esquerda', color: '#059669', active: true },
  { id: 33, name: 'Partido Democrático Trabalhista', acronym: 'PDT', number: 12, group: 'Esquerda', color: '#C2410C', active: true },
  { id: 34, name: 'Unidade Popular', acronym: 'UP', number: 80, group: 'Esquerda', color: '#991B1B', active: true },
  { id: 35, name: 'Partido da Causa Operária', acronym: 'PCO', number: 29, group: 'Esquerda', color: '#7F1D1D', active: true },
  { id: 36, name: 'Partido Comunista Brookasileiro', acronym: 'PCB', number: 21, group: 'Esquerda', color: '#991B1B', active: true },
  { id: 37, name: 'Partido Socialista dos Trabalhadores Unificado', acronym: 'PSTU', number: 16, group: 'Esquerda', color: '#DC2626', active: true },
  { id: 38, name: 'Partido Pátria Livre', acronym: 'PPL', number: 54, group: 'Esquerda', color: '#B45309', active: true },
  { id: 39, name: 'Partido Socialista Brookasileiro', acronym: 'PSB', number: 40, group: 'Esquerda', color: '#F59E0B', active: true },
  { id: 40, name: 'Partido da Frente Socialista', acronym: 'PFS', number: 60, group: 'Esquerda', color: '#EF4444', active: true },
  { id: 41, name: 'Partido Socialista', acronym: 'PS', number: 56, group: 'Esquerda', color: '#E11D48', active: true },
  { id: 42, name: 'Partido Social Trabalhista Nacional', acronym: 'PSTN', number: 31, group: 'Esquerda', color: '#0D9488', active: true }
];
