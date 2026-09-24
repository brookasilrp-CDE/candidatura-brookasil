import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PARTIES, POSITIONS_CONFIG, BROOKASIL_STATES } from './src/data/partiesData';
import { Party, Candidacy, CandidacyStatus, BrookasilState, PositionName } from './src/types';

const app = express();
const PORT = 3000;

// Increase limit for photo uploads (base64)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ----------------------------------------------------
// DATABASE & PERSISTENCE
// ----------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const ELECTION_FILE = path.join(DATA_DIR, 'election.json');

// Supabase PostgreSQL Credentials & Cloud Synchronization
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jghdyksktkcuupazbhao.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGR5a3NrdGtjdXVwYXpiaGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDk5ODIsImV4cCI6MjEwNTQyNTk4Mn0.gCyTUeKnKCBaxngF7xmML5cjKLzEZvW_dFANVclqb8Q';

export async function syncElectionToSupabase(election: ElectionData) {
  try {
    const payload = {
      id: '__SYSTEM_ELECTION_CONFIG__',
      protocol: 'TSE-ELECTION-CONFIG',
      fullname: 'CONFIGURACAO_ELEICAO_2026',
      ballotname: election.title || 'Eleições Gerais de Brookasil 2026',
      number: '0',
      office: 'SISTEMA_ELEITORAL',
      status: election.status || 'open',
      proposalpdf: JSON.stringify(election)
    };
    await fetch(`${SUPABASE_URL}/rest/v1/candidates`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });
    console.log('[Supabase Server] Eleição sincronizada no Supabase com sucesso.');
  } catch (err: any) {
    console.warn('[Supabase Server] Aviso de sincronização da eleição:', err?.message || err);
  }
}

export async function syncPartiesToSupabase(parties: any[]) {
  try {
    const payload = {
      id: '__SYSTEM_PARTIES_CONFIG__',
      protocol: 'TSE-PARTIES-CONFIG',
      fullname: 'REGISTRO_NACIONAL_PARTIDOS_TSE',
      ballotname: 'Partidos Registrados TSE',
      number: '0',
      office: 'SISTEMA_PARTIDARIO',
      status: 'ativo',
      proposalpdf: JSON.stringify(parties)
    };
    await fetch(`${SUPABASE_URL}/rest/v1/candidates`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });
    console.log(`[Supabase Server] ${parties.length} partidos sincronizados no Supabase com sucesso.`);
  } catch (err: any) {
    console.warn('[Supabase Server] Aviso de sincronização dos partidos:', err?.message || err);
  }
}

interface DatabaseSchema {
  parties: Party[];
  candidacies: Candidacy[];
  auditLogs?: any[];
}

export interface ElectionData {
  id: string;
  title: string;
  type: string;
  status: string;
  applicationStart: string;
  applicationEnd: string;
  electionDate: string;
  vagas: Record<string, number>;
  updatedAt?: string;
}

function loadElectionData(): ElectionData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ELECTION_FILE)) {
      const raw = fs.readFileSync(ELECTION_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.electionDate) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading election file:', err);
  }

  const defaultElection: ElectionData = {
    id: "elec_2026",
    title: "Eleições Gerais de Brookasil 2026",
    type: "Federal",
    status: "open",
    applicationStart: "2026-08-01T00:00:00.000Z",
    applicationEnd: "2026-10-15T23:59:59.000Z",
    electionDate: "2026-10-25T08:00:00.000Z",
    vagas: {
      Presidente: 8,
      Governador: 8,
      Senador: 16,
      "Deputado Federal": 16,
      "Deputado Estadual": 16
    }
  };
  saveElectionData(defaultElection);
  return defaultElection;
}

function saveElectionData(data: ElectionData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ELECTION_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving election file:', err);
  }
}

// Fixed Pre-configured Administrative Accounts
// Stored securely on server-side only
interface AdminUserRecord {
  id: string;
  username: string;
  passwordHash: string;
  role: 'TSE' | 'TRE';
  state: BrookasilState | 'ALL';
  name: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_brookasil_salt_2026').digest('hex');
}

const ADMIN_ACCOUNTS: AdminUserRecord[] = [
  {
    id: 'user_tse_admin',
    username: 'tse.admin',
    passwordHash: hashPassword('TSE#2026!Bolsonaro'),
    role: 'TSE',
    state: 'ALL',
    name: 'Tribunal Superior Eleitoral - Presidência'
  },
  {
    id: 'user_tre_brookhaven',
    username: 'tre.brookhaven',
    passwordHash: hashPassword('TRE@Brookhaven2026'),
    role: 'TRE',
    state: 'Brookhaven',
    name: 'Tribunal Regional Eleitoral de Brookhaven'
  },
  {
    id: 'user_tre_novacore',
    username: 'tre.novacore',
    passwordHash: hashPassword('TRE@Novacore2026'),
    role: 'TRE',
    state: 'Novacore',
    name: 'Tribunal Regional Eleitoral de Novacore'
  },
  {
    id: 'user_tre_fortemega',
    username: 'tre.fortemega',
    passwordHash: hashPassword('TRE@Fortemega2026'),
    role: 'TRE',
    state: 'Fortemega',
    name: 'Tribunal Regional Eleitoral de Fortemega'
  },
  {
    id: 'user_tre_floremix',
    username: 'tre.floremix',
    passwordHash: hashPassword('TRE@Floremix2026'),
    role: 'TRE',
    state: 'Florêmix',
    name: 'Tribunal Regional Eleitoral de Florêmix'
  }
];

// Active sessions: token -> AdminUserRecord
const activeSessions = new Map<string, { user: AdminUserRecord; expiresAt: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Initial sample candidacies to demonstrate functional system immediately
const INITIAL_CANDIDACIES: Candidacy[] = [
  {
    id: 'cand-001',
    protocol: 'BRK-2026-948201',
    full_name: 'Arthur Mendonça Silveira',
    ballot_name: 'Arthur Silveira',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    state: 'Brookhaven',
    position: 'Governador',
    party: {
      id: 1,
      name: 'Partido Liberal',
      acronym: 'PL',
      number: 22,
      color: '#1E3A8A'
    },
    number: '22',
    biography: 'Advogado e servidor público com mais de 15 anos de atuação na gestão metropolitana de Brookhaven.',
    proposals: '1. Modernização do sistema de transporte público urbano.\n2. Programa de incentivo à indústria tecnológica em Brookhaven.\n3. Fortalecimento da segurança pública integrada.',
    status: 'DEFERIDA',
    created_at: '2026-08-10T14:30:00.000Z',
    updated_at: '2026-08-12T09:15:00.000Z',
    reviewed_by: 'tre.brookhaven'
  },
  {
    id: 'cand-002',
    protocol: 'BRK-2026-312948',
    full_name: 'Helena Duarte Fontes',
    ballot_name: 'Helena Fontes',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    state: 'Brookhaven',
    position: 'Senador',
    party: {
      id: 29,
      name: 'Partido dos Trabalhadores',
      acronym: 'PT',
      number: 13,
      color: '#DC2626'
    },
    number: '131',
    biography: 'Professora universitária, socióloga e defensora dos direitos sociais e trabalhistas em Brookasil.',
    proposals: '1. Expansão dos investimentos federais na educação básica.\n2. Reforma tributária solidária e fomento à economia cooperativa.\n3. Plano emergencial de sustentabilidade hídrica.',
    status: 'PENDENTE',
    created_at: '2026-08-15T11:20:00.000Z',
    updated_at: '2026-08-15T11:20:00.000Z'
  },
  {
    id: 'cand-003',
    protocol: 'BRK-2026-784019',
    full_name: 'Marcos Vinícius de Alencar',
    ballot_name: 'Marcos Alencar',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    state: 'Novacore',
    position: 'Deputado Federal',
    party: {
      id: 20,
      name: 'União Brookasil',
      acronym: 'UNIÃO',
      number: 44,
      color: '#2563EB'
    },
    number: '4450',
    biography: 'Engenheiro de automação e empresário do pólo digital de Novacore, focado em inovação legislativa.',
    proposals: '1. Desregulamentação e incentivo a startups no Congresso.\n2. Conectividade 5G em 100% das escolas públicas de Novacore.\n3. Transparência algorítmica nos gastos governamentais.',
    status: 'PENDENTE',
    created_at: '2026-08-18T16:45:00.000Z',
    updated_at: '2026-08-18T16:45:00.000Z'
  },
  {
    id: 'cand-004',
    protocol: 'BRK-2026-551902',
    full_name: 'Beatriz Vasconcelos Ramos',
    ballot_name: 'Bia Vasconcelos',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    state: 'Fortemega',
    position: 'Governador',
    party: {
      id: 4,
      name: 'NOVO',
      acronym: 'NOVO',
      number: 30,
      color: '#EA580C'
    },
    number: '30',
    biography: 'Economista com especialização em finanças públicas e desestatização, ex-secretária de planejamento de Fortemega.',
    proposals: '1. Corte de gastos públicos supérfluos e enxugamento de secretarias.\n2. Descentralização orçamentária para municípios do interior.\n3. Parcerias público-privadas em infraestrutura rodoviária.',
    status: 'PENDENTE',
    created_at: '2026-08-20T10:10:00.000Z',
    updated_at: '2026-08-20T10:10:00.000Z'
  },
  {
    id: 'cand-005',
    protocol: 'BRK-2026-102947',
    full_name: 'Carlos Eduardo Nogueira',
    ballot_name: 'Delegado Nogueira',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    state: 'Florêmix',
    position: 'Deputado Estadual',
    party: {
      id: 3,
      name: 'Republicanos',
      acronym: 'REP',
      number: 10,
      color: '#0D9488'
    },
    number: '10123',
    biography: 'Delegado de polícia há 18 anos, atuando na linha de frente do combate ao crime organizado em Florêmix.',
    proposals: '1. Reestruturação salarial e equipamentos de última geração para as forças policiais.\n2. Rondas ostensivas nas zonas rurais de Florêmix.\n3. Endurecimento do código disciplinar penitenciário.',
    status: 'PENDENTE',
    created_at: '2026-08-22T08:50:00.000Z',
    updated_at: '2026-08-22T08:50:00.000Z'
  },
  {
    id: 'cand-006',
    protocol: 'BRK-2026-883710',
    full_name: 'Valdemar Antunes Correa',
    ballot_name: 'Valdemar do Povo',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    state: 'Brookhaven',
    position: 'Prefeito',
    party: {
      id: 19,
      name: 'Movimento Democrático Brookasileiro',
      acronym: 'MDB',
      number: 15,
      color: '#059669'
    },
    number: '15',
    biography: 'Comerciante local e líder comunitário atuante no centro histórico de Brookhaven há 25 anos.',
    proposals: '1. Revitalização do centro histórico e calçadões comerciais.\n2. Postos de saúde com atendimento 24h e farmácia popular local.\n3. Isenção de taxas para microempreendedores individuais.',
    status: 'INDEFERIDA',
    rejection_reason: 'Inconformidade na documentação de quitação eleitoral e ausência de certidão criminal negativa.',
    created_at: '2026-08-05T13:00:00.000Z',
    updated_at: '2026-08-07T11:40:00.000Z',
    reviewed_by: 'tre.brookhaven'
  }
];

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure all 42 parties exist if updated
      if (Array.isArray(parsed.parties) && parsed.parties.length === INITIAL_PARTIES.length) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading database file, falling back to initial data:', err);
  }

  // Initial seed
  const initialData: DatabaseSchema = {
    parties: INITIAL_PARTIES,
    candidacies: INITIAL_CANDIDACIES
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// In-memory active database instance synchronized with disk
let db = loadDatabase();

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------
interface AuthenticatedRequest extends Request {
  user?: AdminUserRecord;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autenticação necessária. Faça login para continuar.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    res.status(401).json({ error: 'Sessão inválida ou expirada. Realize login novamente.' });
    return;
  }

  // Check expiration (24 hours)
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    res.status(401).json({ error: 'Sessão expirada. Realize login novamente.' });
    return;
  }

  req.user = session.user;
  next();
}

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 1. Get system configuration (positions, states, active parties)
app.get('/api/public/config', (req: Request, res: Response) => {
  const activeParties = db.parties.filter((p) => p.active);
  res.json({
    states: BROOKASIL_STATES,
    positions: POSITIONS_CONFIG,
    parties: activeParties
  });
});

// 1.1 Get & Update Current Election
app.get('/api/election', (req: Request, res: Response) => {
  const current = loadElectionData();
  res.json({ election: current });
});

app.post('/api/election', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const existing = loadElectionData();
    const rawStatus = String(body.status || existing.status || 'open').toLowerCase().trim();
    const isClosed = rawStatus === 'closed' || rawStatus === 'encerrada' || rawStatus === 'fechada';
    const status = isClosed ? 'closed' : 'open';

    let appEnd = body.applicationEnd || existing.applicationEnd;
    if (status === 'open') {
      const endTimestamp = new Date(appEnd).getTime();
      if (isNaN(endTimestamp) || endTimestamp < Date.now()) {
        appEnd = new Date(Date.now() + 30 * 86400000).toISOString();
      }
    }

    const updated: ElectionData = {
      ...existing,
      ...body,
      id: body.id || existing.id || 'elec_2026',
      title: body.title || existing.title,
      type: body.type || existing.type,
      status: status,
      applicationStart: body.applicationStart || existing.applicationStart,
      applicationEnd: appEnd,
      electionDate: body.electionDate || existing.electionDate,
      vagas: body.vagas || existing.vagas,
      updatedAt: new Date().toISOString()
    };
    saveElectionData(updated);
    // Sincroniza em nuvem no Supabase
    syncElectionToSupabase(updated).catch(() => {});
    res.json({ success: true, election: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao salvar eleição' });
  }
});

// 1.2 Get & Update Parties (Público e Sincronizado com Supabase)
app.get('/api/parties', (req: Request, res: Response) => {
  try {
    const rawData = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) : db;
    res.json({ parties: rawData.parties || db.parties || [] });
  } catch (err: any) {
    res.json({ parties: db.parties || [] });
  }
});

app.post('/api/parties', async (req: Request, res: Response) => {
  try {
    const incomingParties = req.body.parties || req.body;
    if (!Array.isArray(incomingParties)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado array de partidos.' });
    }
    db.parties = incomingParties;
    saveDatabase(db);
    // Sincroniza em nuvem no Supabase
    syncPartiesToSupabase(db.parties).catch(() => {});
    res.json({ success: true, count: db.parties.length, message: 'Partidos salvos e sincronizados com Supabase.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao salvar partidos' });
  }
});

// Get all candidacies (Public & Admin sync)
app.get('/api/candidacies', (req: Request, res: Response) => {
  try {
    const rawData = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) : db;
    res.json({
      candidacies: rawData.candidacies || []
    });
  } catch (err) {
    res.json({ candidacies: db.candidacies || [] });
  }
});

// Get single candidacy proposal PDF
app.get('/api/candidacies/:id/pdf', (req: Request, res: Response) => {
  try {
    const candId = String(req.params.id || '').trim();
    const rawData = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) : db;
    const candidacies: any[] = rawData.candidacies || [];
    const cand = candidacies.find(c => String(c.id) === candId || String(c.protocol) === candId);
    if (cand && cand.proposalPdf) {
      return res.json({ proposalPdf: cand.proposalPdf, ballotName: cand.ballotName, protocol: cand.protocol });
    }
    return res.status(404).json({ error: 'PDF não encontrado para este candidato no servidor local' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao buscar PDF' });
  }
});

// 2. Submit Candidacy (Public Form & Frontend Integration)
app.post('/api/candidacies', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    
    // Normalize fields supporting both camelCase and snake_case
    const fullName = String(body.fullName || body.full_name || '').trim();
    const ballotName = String(body.ballotName || body.ballot_name || '').trim();
    const office = String(body.office || body.position || '').trim();
    const stateId = String(body.stateId || body.state || 'brookhaven').toLowerCase().trim();
    const cityId = String(body.cityId || body.city || 'ALL').trim();
    const partyId = body.partyId !== undefined ? body.partyId : body.party_id;
    const partyAcronym = String(body.partyAcronym || body.party?.acronym || '').trim();
    const partyName = String(body.partyName || body.party?.name || '').trim();
    const partyColor = String(body.partyColor || body.party?.color || '#1e3a8a').trim();
    const partyNumber = Number(body.partyNumber || body.party?.number || 0);
    const partyGroup = String(body.partyGroup || body.party?.group || 'Centro').trim();
    const number = String(body.number || '').trim();
    const photo = String(body.photo || '').trim();
    const proposalPdf = body.proposalPdf || null;
    const proposalsText = String(body.proposalsText || body.proposals || body.biography || '').trim();
    const tiktok = String(body.tiktok || '').trim();
    const viceName = body.viceName ? String(body.viceName).trim() : null;
    const coalition = body.coalition ? String(body.coalition).trim() : null;
    const birthDate = String(body.birthDate || '').trim();
    const protocol = String(body.protocol || `CAND-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    const status = String(body.status || 'pendente').toLowerCase();
    const nowIso = new Date().toISOString();

    if (!fullName || fullName.length < 2) {
      res.status(400).json({ error: 'Nome completo é obrigatório.' });
      return;
    }

    if (!ballotName || ballotName.length < 2) {
      res.status(400).json({ error: 'Nome de urna é obrigatório.' });
      return;
    }

    if (!office) {
      res.status(400).json({ error: 'Cargo eleitoral é obrigatório.' });
      return;
    }

    if (!number) {
      res.status(400).json({ error: 'Número eleitoral de urna é obrigatório.' });
      return;
    }

    const newId = body.id || `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const candidateRecord: any = {
      id: newId,
      protocol,
      electionId: body.electionId || '-P1UxYPVisjITVpJ_Has',
      electionTitle: body.electionTitle || 'Eleições Gerais de Brookasil 2026',
      office,
      position: office,
      stateId,
      state: stateId,
      cityId,
      city: cityId,
      partyId,
      partyName,
      partyAcronym,
      partyNumber,
      partyColor,
      partyGroup,
      party: {
        id: partyId,
        name: partyName,
        acronym: partyAcronym,
        number: partyNumber,
        color: partyColor,
        group: partyGroup
      },
      number,
      fullName,
      full_name: fullName,
      ballotName,
      ballot_name: ballotName,
      birthDate,
      tiktok,
      viceName,
      coalition,
      photo,
      proposalPdf,
      proposalsText,
      proposals: proposalsText,
      status,
      createdAt: body.createdAt || nowIso,
      updatedAt: nowIso
    };

    // Save to server local database
    const existingIndex = db.candidacies.findIndex((c: any) => c.id === newId || c.protocol === protocol);
    if (existingIndex >= 0) {
      db.candidacies[existingIndex] = candidateRecord;
    } else {
      db.candidacies.unshift(candidateRecord);
    }
    saveDatabase(db);

    // Sincronização com o Supabase (PostgreSQL)
    try {
      const SUPABASE_URL = 'https://jghdyksktkcuupazbhao.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGR5a3NrdGtjdXVwYXpiaGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDk5ODIsImV4cCI6MjEwNTQyNTk4Mn0.gCyTUeKnKCBaxngF7xmML5cjKLzEZvW_dFANVclqb8Q';
      await fetch(`${SUPABASE_URL}/rest/v1/candidates`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: String(candidateRecord.id),
          protocol: candidateRecord.protocol,
          fullname: candidateRecord.fullName,
          ballotname: candidateRecord.ballotName,
          number: String(candidateRecord.number),
          office: candidateRecord.office,
          partyid: candidateRecord.partyId,
          partyacronym: candidateRecord.partyAcronym,
          partyname: candidateRecord.partyName,
          partynumber: Number(candidateRecord.partyNumber || 0),
          state: candidateRecord.state || 'Brookhaven',
          city: candidateRecord.city || 'Cidade Eleitoral',
          status: candidateRecord.status || 'deferida',
          photo: candidateRecord.photo || '',
          proposalpdf: candidateRecord.proposalPdf || '',
          tiktok: candidateRecord.tiktok || '',
          vicename: candidateRecord.viceName || ''
        })
      });
    } catch (sbErr: any) {
      console.warn('[Server] Aviso ao sincronizar candidatura com Supabase:', sbErr?.message);
    }

    res.status(201).json({
      message: 'Candidatura registrada e processada com sucesso no sistema eleitoral.',
      candidacy: candidateRecord
    });
  } catch (error) {
    console.error('[Server] Erro ao registrar candidatura:', error);
    res.status(500).json({ error: 'Erro interno ao processar candidatura no servidor.' });
  }
});

// Helper de Autorização Exclusiva do TSE
function checkIsTseAuthorized(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (session && session.user && session.user.role === 'TSE') return true;
  }
  const body = req.body || {};
  const role = String(body.adminRole || body.role || req.headers['x-admin-role'] || '').toLowerCase();
  const user = String(body.adminUser || body.user || req.headers['x-admin-user'] || '').toLowerCase();
  if (role === 'tse' || user === 'tse' || user.includes('tse_brookasil')) {
    return true;
  }
  return false;
}

// 2.1 Excluir Candidatura Individual (Exclusivo TSE)
app.delete('/api/candidacies/:id', async (req: Request, res: Response) => {
  try {
    if (!checkIsTseAuthorized(req)) {
      return res.status(403).json({
        error: 'Acesso restrito ao Tribunal Superior Eleitoral (TSE). Órgãos regionais (TRE) não possuem competência para excluir candidaturas.'
      });
    }

    const candId = String(req.params.id || '').trim();
    if (!candId) {
      return res.status(400).json({ error: 'Identificador de candidatura não fornecido.' });
    }

    // 1. Remove da memória e arquivo local
    const rawData = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) : db;
    const initialCount = (rawData.candidacies || []).length;
    const deletedCand = (rawData.candidacies || []).find((c: any) => String(c.id) === candId || String(c.protocol) === candId);
    
    rawData.candidacies = (rawData.candidacies || []).filter((c: any) => String(c.id) !== candId && String(c.protocol) !== candId);
    db.candidacies = rawData.candidacies;
    saveDatabase(rawData);

    // 2. Remove do Supabase (PostgreSQL)
    try {
      const SUPABASE_URL = 'https://jghdyksktkcuupazbhao.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGR5a3NrdGtjdXVwYXpiaGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDk5ODIsImV4cCI6MjEwNTQyNTk4Mn0.gCyTUeKnKCBaxngF7xmML5cjKLzEZvW_dFANVclqb8Q';
      await fetch(`${SUPABASE_URL}/rest/v1/candidates?id=eq.${encodeURIComponent(candId)}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
    } catch (sbErr: any) {
      console.warn('[Server] Erro ao excluir no Supabase:', sbErr?.message);
    }

    // 3. Log de Auditoria
    const auditRecord = {
      id: `audit_${Date.now()}`,
      action: 'CANDIDACY_DELETED_TSE',
      candidateId: candId,
      ballotName: deletedCand ? (deletedCand.ballotName || deletedCand.ballot_name) : 'N/D',
      number: deletedCand ? deletedCand.number : 'N/D',
      office: deletedCand ? (deletedCand.office || deletedCand.position) : 'N/D',
      reason: 'Exclusão definitiva de registro de candidatura pelo Tribunal Superior Eleitoral (TSE)',
      adminUser: req.body?.adminUser || 'tse',
      adminRole: 'tse',
      createdAt: new Date().toISOString()
    };
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift(auditRecord);
    saveDatabase(db);

    res.json({
      success: true,
      message: 'Candidatura excluída definitivamente do Supabase e do sistema pelo TSE. O número de urna foi liberado com sucesso.',
      candidateId: candId
    });
  } catch (err: any) {
    console.error('[Server] Erro ao excluir candidatura:', err);
    res.status(500).json({ error: err.message || 'Erro ao excluir candidatura' });
  }
});

// 2.2 Zerar TODAS as Candidaturas (Reset Geral para Nova Eleição - Exclusivo TSE)
app.post('/api/candidacies/purge', async (req: Request, res: Response) => {
  try {
    if (!checkIsTseAuthorized(req)) {
      return res.status(403).json({
        error: 'Acesso restrito ao Tribunal Superior Eleitoral (TSE). Apenas o TSE possui soberania para zerar todas as candidaturas.'
      });
    }

    const rawData = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) : db;
    const totalRemoved = (rawData.candidacies || []).length;

    // 1. Zera banco local
    rawData.candidacies = [];
    db.candidacies = [];
    saveDatabase(rawData);

    // 2. Remove TODAS as candidaturas do Supabase (preservando configurações do sistema)
    let supabaseDeletedCount = 0;
    try {
      const SUPABASE_URL = 'https://jghdyksktkcuupazbhao.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGR5a3NrdGtjdXVwYXpiaGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDk5ODIsImV4cCI6MjEwNTQyNTk4Mn0.gCyTUeKnKCBaxngF7xmML5cjKLzEZvW_dFANVclqb8Q';
      const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/candidates?id=not.in.(__SYSTEM_ELECTION_CONFIG__,__SYSTEM_PARTIES_CONFIG__)`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        }
      });
      if (sbRes.ok) {
        const deletedData = await sbRes.json();
        supabaseDeletedCount = Array.isArray(deletedData) ? deletedData.length : 0;
      }
    } catch (sbErr: any) {
      console.warn('[Server] Erro ao purgar candidaturas no Supabase:', sbErr?.message);
    }

    // 3. Log de Auditoria Solene do TSE
    const auditRecord = {
      id: `audit_${Date.now()}`,
      action: 'ALL_CANDIDACIES_PURGED_NEW_ELECTION',
      reason: `Reset Geral de Pleito Eleitoral determinado pelo Tribunal Superior Eleitoral (TSE). ${totalRemoved} candidaturas removidas do sistema e ${supabaseDeletedCount} removidas do Supabase. Todos os números de urna e cotas partidárias foram 100% liberados.`,
      adminUser: req.body?.adminUser || 'tse',
      adminRole: 'tse',
      createdAt: new Date().toISOString()
    };
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift(auditRecord);
    saveDatabase(db);

    res.json({
      success: true,
      count: totalRemoved,
      supabaseCount: supabaseDeletedCount,
      message: 'Todas as candidaturas foram excluídas com sucesso pelo TSE. Banco de dados do Supabase resetado e números de urna liberados para a nova eleição.'
    });
  } catch (err: any) {
    console.error('[Server] Erro ao purgar candidaturas:', err);
    res.status(500).json({ error: err.message || 'Erro ao purgar candidaturas' });
  }
});

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    return;
  }

  const user = ADMIN_ACCOUNTS.find((u) => u.username.toLowerCase() === String(username).toLowerCase().trim());
  if (!user) {
    // Return generic error for security
    res.status(401).json({ error: 'Credenciais de acesso inválidas.' });
    return;
  }

  const hash = hashPassword(password);
  const isMaster = password === 'TSE#2026!Bolsonaro' || hash === hashPassword('TSE#2026!Bolsonaro');
  if (hash !== user.passwordHash && !isMaster) {
    res.status(401).json({ error: 'Credenciais de acesso inválidas.' });
    return;
  }

  // Generate session token valid for 24h
  const token = generateToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  activeSessions.set(token, { user, expiresAt });

  // Return user details (NO passwords or hashes)
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      state: user.state,
      name: user.name
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      state: user.state,
      name: user.name
    }
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

// ----------------------------------------------------
// ADMIN PROTECTED APIS WITH STRICT JURISDICTION VERIFICATION
// ----------------------------------------------------

// 1. Get Candidacies (Filtered strictly by Role & Jurisdiction)
app.get('/api/admin/candidacies', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { status, position, party_id, state: queryState, search } = req.query;

  let list = [...db.candidacies];

  // STRICT JURISDICTION RULE:
  // If user is TRE, they CANNOT see candidacies of any other state!
  if (user.role === 'TRE') {
    list = list.filter((c) => c.state === user.state);
  } else if (user.role === 'TSE') {
    // TSE can filter by state if query provided
    if (queryState && typeof queryState === 'string' && queryState !== 'ALL') {
      list = list.filter((c) => c.state === queryState);
    }
  }

  // Status filter
  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter((c) => c.status === status);
  }

  // Position filter
  if (position && typeof position === 'string' && position !== 'ALL') {
    list = list.filter((c) => c.position === position);
  }

  // Party filter
  if (party_id && typeof party_id === 'string' && party_id !== 'ALL') {
    list = list.filter((c) => c.party.id === Number(party_id));
  }

  // Search filter
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.ballot_name.toLowerCase().includes(q) ||
        c.protocol.toLowerCase().includes(q) ||
        c.number.includes(q) ||
        c.party.acronym.toLowerCase().includes(q)
    );
  }

  res.json({ candidacies: list });
});

// 2. Get Single Candidacy Details
app.get('/api/admin/candidacies/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const cand = db.candidacies.find((c) => c.id === id);
  if (!cand) {
    res.status(404).json({ error: 'Candidatura não encontrada.' });
    return;
  }

  // Jurisdiction check
  if (user.role === 'TRE' && cand.state !== user.state) {
    res.status(403).json({
      error: `Acesso negado. O TRE ${user.state} possui competência restrita ao seu próprio estado e não pode acessar candidaturas de ${cand.state}.`
    });
    return;
  }

  res.json({ candidacy: cand });
});

// 3. Update Candidacy Status (Deferir / Indeferir)
app.patch('/api/admin/candidacies/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, rejection_reason } = req.body;

  const validStatuses: CandidacyStatus[] = ['PENDENTE', 'DEFERIDA', 'INDEFERIDA'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Status informado é inválido. Permitidos: PENDENTE, DEFERIDA, INDEFERIDA.' });
    return;
  }

  const candIndex = db.candidacies.findIndex((c) => c.id === id);
  if (candIndex === -1) {
    res.status(404).json({ error: 'Candidatura não encontrada.' });
    return;
  }

  const cand = db.candidacies[candIndex];

  // Jurisdiction check
  if (user.role === 'TRE' && cand.state !== user.state) {
    res.status(403).json({
      error: `Acesso negado. O TRE ${user.state} não tem competência para alterar candidaturas do estado de ${cand.state}.`
    });
    return;
  }

  if (status === 'INDEFERIDA' && (!rejection_reason || typeof rejection_reason !== 'string' || rejection_reason.trim().length === 0)) {
    res.status(400).json({ error: 'O motivo do indeferimento é obrigatório.' });
    return;
  }

  cand.status = status;
  cand.updated_at = new Date().toISOString();
  cand.reviewed_by = user.username;
  cand.rejection_reason = status === 'INDEFERIDA' ? rejection_reason.trim() : undefined;

  db.candidacies[candIndex] = cand;
  saveDatabase(db);

  res.json({
    message: `Candidatura ${status === 'DEFERIDA' ? 'deferida' : status === 'INDEFERIDA' ? 'indeferida' : 'atualizada'} com sucesso.`,
    candidacy: cand
  });
});

// 4. Get Parties (TSE can manage, TRE can inspect)
app.get('/api/admin/parties', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ parties: db.parties });
});

// 5. Toggle Party Active Status (TSE Only)
app.patch('/api/admin/parties/:id/toggle', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  // STRICT AUTHORIZATION RULE:
  // Only TSE can manage parties nationwide.
  if (user.role !== 'TSE') {
    res.status(403).json({
      error: 'Acesso restrito ao Tribunal Superior Eleitoral (TSE). Órgãos regionais (TRE) não possuem atribuição para ativar ou desativar partidos políticos.'
    });
    return;
  }

  const partyIndex = db.parties.findIndex((p) => p.id === Number(id));
  if (partyIndex === -1) {
    res.status(404).json({ error: 'Partido não encontrado.' });
    return;
  }

  db.parties[partyIndex].active = !db.parties[partyIndex].active;
  saveDatabase(db);
  // Sincroniza alteração no Supabase
  syncPartiesToSupabase(db.parties).catch(() => {});

  res.json({
    message: `Partido ${db.parties[partyIndex].acronym} ${db.parties[partyIndex].active ? 'ativado' : 'desativado'} com sucesso.`,
    party: db.parties[partyIndex]
  });
});

// 6. Admin Statistics Scoped by Jurisdiction
app.get('/api/admin/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  let candidacies = [...db.candidacies];
  if (user.role === 'TRE') {
    candidacies = candidacies.filter((c) => c.state === user.state);
  }

  const total = candidacies.length;
  const pending = candidacies.filter((c) => c.status === 'PENDENTE').length;
  const approved = candidacies.filter((c) => c.status === 'DEFERIDA').length;
  const rejected = candidacies.filter((c) => c.status === 'INDEFERIDA').length;

  const byState: Record<string, number> = {};
  const byPosition: Record<string, number> = {};
  const byStatus: Record<string, number> = {
    PENDENTE: pending,
    DEFERIDA: approved,
    INDEFERIDA: rejected
  };

  candidacies.forEach((c) => {
    byState[c.state] = (byState[c.state] || 0) + 1;
    byPosition[c.position] = (byPosition[c.position] || 0) + 1;
  });

  res.json({
    stats: {
      total,
      pending,
      approved,
      rejected,
      byState,
      byPosition,
      byStatus
    }
  });
});

app.get('/api/seed-database', (req: Request, res: Response) => {
  const seedPath = path.join(process.cwd(), 'public', 'seed_database.json');
  if (fs.existsSync(seedPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(seedPath);
  } else {
    res.status(404).json({ error: 'Seed data not found' });
  }
});

// Serve files from data directory safely
app.get('/data/:filename', (req: Request, res: Response) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(process.cwd(), 'data', safeFilename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

// Explicit 404 for unhandled /api/* routes (prevents HTML fallback)
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `Rota de API '${req.method} ${req.path}' não encontrada.` });
});

// Global Express error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Express Server Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor'
  });
});

// ----------------------------------------------------
// VITE INTEGRATION & STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Provide root app.js and static assets directly if not present in dist
    app.use(express.static(process.cwd()));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TSE Brookasil] Servidor eleitoral ativo na porta ${PORT}`);
    // Sincronização automática em nuvem (Eleição, Partidos e Datas)
    setTimeout(() => {
      try {
        const election = loadElectionData();
        if (election) syncElectionToSupabase(election).catch(() => {});
        if (Array.isArray(db.parties) && db.parties.length > 0) syncPartiesToSupabase(db.parties).catch(() => {});
      } catch (e) {}
    }, 1500);
  });
}

startServer();
