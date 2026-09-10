/**
 * CANDIDATURAS | BROOKASIL RP 🇬🇦
 * Sistema Oficial de Registro e Consulta de Candidaturas
 * Tribunal Superior Eleitoral & Tribunais Regionais
 */

// 1. CONFIGURAÇÃO OFICIAL DO FIREBASE REALTIME DATABASE
const firebaseConfig = {
  apiKey: "AIzaSyAwFLV5X9ICB3mvU4WU1ihxGUeG9UsrbtQ",
  authDomain: "candidatura-cde.firebaseapp.com",
  databaseURL: "https://candidatura-cde-default-rtdb.firebaseio.com",
  projectId: "candidatura-cde",
  storageBucket: "candidatura-cde.firebasestorage.app",
  messagingSenderId: "958958180950",
  appId: "1:958958180950:web:51427276d0a83978fdb9f7"
};

// Inicialização segura do Firebase
let app, db;
try {
  if (typeof firebase !== "undefined") {
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    db = firebase.database();
  }
} catch (e) {
  console.error("Falha na inicialização segura dos serviços eleitorais:", e.message || e);
}

// ========================================================
// SISTEMA CRIPTOGRÁFICO DE CREDENCIAIS ELEITORAIS (TSE & TREs)
// ========================================================
const CRYPTO_SALT = "BK_JUSTICA_ELEITORAL_2026_SIGILO_TSE";

function safeAtob(str) {
  if (!str || typeof str !== "string") return "";
  try {
    return atob(str.trim());
  } catch (e) {
    try {
      const cleaned = str.trim().replace(/[^A-Za-z0-9+/=]/g, "");
      return atob(cleaned);
    } catch (err) {
      return "";
    }
  }
}

function encryptSecret(str, salt = CRYPTO_SALT) {
  if (!str) return "";
  let encoded = "";
  for (let i = 0; i < str.length; i++) {
    encoded += String.fromCharCode(str.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
  }
  return "BK_ENC_" + btoa(encodeURIComponent(encoded));
}

function decryptSecret(cipher, salt = CRYPTO_SALT) {
  if (!cipher || typeof cipher !== "string") return "";
  if (!cipher.startsWith("BK_ENC_")) return cipher; // Fallback de compatibilidade
  try {
    const rawB64 = cipher.replace("BK_ENC_", "").trim();
    const b64Decoded = safeAtob(rawB64);
    if (!b64Decoded) return cipher;
    const raw = decodeURIComponent(b64Decoded);
    let decoded = "";
    for (let i = 0; i < raw.length; i++) {
      decoded += String.fromCharCode(raw.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
    }
    return decoded;
  } catch (e) {
    return cipher;
  }
}

// Credenciais Padrão Criptografadas (Senhas protegidas contra inspeção)
const DEFAULT_COURT_CREDENTIALS = [
  {
    id: "tse",
    login: "TSE_Brookasil@2026",
    role: "tse",
    name: "Tribunal Superior Eleitoral",
    state: "ALL",
    city: "ALL",
    type: "tse",
    aliases: [
      "tse",
      "master",
      "painel master",
      "tse master",
      "admin",
      "presidencia",
      "arthur",
      "tse_brookasil",
      "tse_brookasil@2026",
      "tse-master",
      "tse@2026"
    ],
    encPass: "BK_ENC_JTAzJTE5JTBCJTAyJTAwJTAxJTE0eHp2bg=="
  },
  {
    id: "tre_brookhaven",
    login: "TRE_Brookhaven@2026",
    role: "tre_estadual",
    name: "TRE Brookhaven",
    state: "brookhaven",
    city: "ALL",
    type: "tre_estadual",
    aliases: ["tre_brookhaven", "brookhaven", "tre-brookhaven", "tre_brookhaven@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBJTBBJTE3JTAxJTFCJTA2JTA4JTA5JTFFJTEzJTA5JTBC"
  },
  {
    id: "tre_floremix",
    login: "TRE_Florêmix@2026",
    role: "tre_estadual",
    name: "TRE Florêmix",
    state: "floremix",
    city: "ALL",
    type: "tre_estadual",
    aliases: ["tre_floremix", "floremix", "tre-floremix", "tre_floremix@2026", "tre_florêmix"],
    encPass: "BK_ENC_JTE2JTE5JTFBJTBBJTEzJTFGJTFCJTFCJUMyJTg5JTBDJTE2JTFE"
  },
  {
    id: "tre_fortemega",
    login: "TRE_Fortemega@2026",
    role: "tre_estadual",
    name: "TRE Fortemega",
    state: "fortemega",
    city: "ALL",
    type: "tre_estadual",
    aliases: ["tre_fortemega", "fortemega", "tre-fortemega", "tre_fortemega@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBJTBBJTEzJTFDJTA2JTFEJTA2JTBDJTFBJTAyJTBE"
  },
  {
    id: "tre_novacore",
    login: "TRE_Novacore@2026",
    role: "tre_estadual",
    name: "TRE Novacore",
    state: "novacore",
    city: "ALL",
    type: "tre_estadual",
    aliases: ["tre_novacore", "novacore", "tre-novacore", "tre_novacore@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBJTBBJTFCJTFDJTAyJTA4JTAwJTBFJTBEJTAw"
  },
  {
    id: "tre_cidadeeleitoral",
    login: "TRE_CidadeEleitoral@2026",
    role: "tre_municipal",
    name: "TRE Cidade Eleitoral",
    state: "brookhaven",
    city: "cidade_eleitoral",
    type: "tre_municipal",
    aliases: ["TRE_CidadeEleitoral@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZDYlM0EwKCclMjQlM0EpKSUyQyUzRCUzQiUzRDMt"
  },
  {
    id: "tre_braviland",
    login: "TRE_Braviland@2026",
    role: "tre_municipal",
    name: "TRE Braviland",
    state: "brookhaven",
    city: "braviland",
    type: "tre_municipal",
    aliases: ["TRE_Braviland@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZDchNSUzRiotJTNFJTJCKA=="
  },
  {
    id: "tre_florapolis",
    login: "TRE_Florápolis@2026",
    role: "tre_municipal",
    name: "TRE Florápolis",
    state: "floremix",
    city: "florapolis",
    type: "tre_municipal",
    aliases: ["TRE_Florapolis@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZDMlM0YlM0IlM0IlMjIxMCklMjU2"
  },
  {
    id: "tre_riomarina",
    login: "TRE_Riomarina@2026",
    role: "tre_municipal",
    name: "TRE Riomarina",
    state: "floremix",
    city: "riomarina",
    type: "tre_municipal",
    aliases: ["TRE_Riomarina@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZCclM0ElM0IlMjQlMjIzNiUyQi0="
  },
  {
    id: "tre_portorubi",
    login: "TRE_PortoRubi@2026",
    role: "tre_municipal",
    name: "TRE Porto Rubi",
    state: "fortemega",
    city: "porto_rubi",
    type: "tre_municipal",
    aliases: ["TRE_PortoRubi@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZCUyNSUzQyUyNiUzRCUyQzMqJyUyNQ=="
  },
  {
    id: "tre_fortelume",
    login: "TRE_Fortelume@2026",
    role: "tre_municipal",
    name: "TRE Fortelume",
    state: "fortemega",
    city: "fortelume",
    type: "tre_municipal",
    aliases: ["TRE_Fortelume@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZDMlM0MlMjYlM0QlMjYtKigp"
  },
  {
    id: "tre_napolis",
    login: "TRE_Nápolis@2026",
    role: "tre_municipal",
    name: "TRE Nápolis",
    state: "novacore",
    city: "napolis",
    type: "tre_municipal",
    aliases: ["TRE_Napolis@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZCUzQjIlMjQlMjYlMkYoJTJD"
  },
  {
    id: "tre_catarinia",
    login: "TRE_Catarinía@2026",
    role: "tre_municipal",
    name: "TRE Catarinía",
    state: "novacore",
    city: "catarinia",
    type: "tre_municipal",
    aliases: ["TRE_Catarinia@2026"],
    encPass: "BK_ENC_JTE2JTE5JTFBZDYyJTIwKDEoMSUyQy0="
  }
];

// Estado dinâmico de credenciais sincronizado em tempo real com Firebase
let activeCourtCredentials = DEFAULT_COURT_CREDENTIALS.map(c => ({ ...c }));
const ADMIN_CREDENTIALS = activeCourtCredentials;

// 3. ESTRUTURA GEOGRÁFICA DE BROOKASIL
const BROOKASIL_GEO = {
  brookhaven: { name: "Brookhaven", cities: { cidade_eleitoral: "Cidade Eleitoral", braviland: "Braviland" } },
  floremix: { name: "Florêmix", cities: { florapolis: "Florápolis", riomarina: "Riomarina" } },
  fortemega: { name: "Fortemega", cities: { porto_rubi: "Porto Rubi", fortelume: "Fortelume" } },
  novacore: { name: "Novacore", cities: { napolis: "Nápolis", catarinia: "Catarinía" } }
};

// 4. PARTIDOS POLÍTICOS OFICIAIS (43 LEGENDAS)
const OFFICIAL_PARTIES = [
  // DIREITA (19)
  { id: 1, name: "Partido Liberal", acronym: "PL", number: 22, group: "Direita", color: "#1E3A8A" },
  { id: 2, name: "Progressistas", acronym: "PP", number: 11, group: "Direita", color: "#0284C7" },
  { id: 3, name: "Republicanos", acronym: "REP", number: 10, group: "Direita", color: "#0D9488" },
  { id: 4, name: "Partido Novo", acronym: "NOVO", number: 30, group: "Direita", color: "#EA580C" },
  { id: 5, name: "Democracia Cristã", acronym: "DC", number: 27, group: "Direita", color: "#2563EB" },
  { id: 6, name: "Agir", acronym: "AGIR", number: 36, group: "Direita", color: "#4F46E5" },
  { id: 7, name: "Partido da Mulher Brookasileira", acronym: "PMB", number: 35, group: "Direita", color: "#DB2777" },
  { id: 8, name: "Patriota", acronym: "PATRIOTA", number: 51, group: "Direita", color: "#15803D" },
  { id: 9, name: "Partido Renovador Trabalhista Brookasileiro", acronym: "PRTB", number: 28, group: "Direita", color: "#B45309" },
  { id: 10, name: "União Democrática Brookasileira", acronym: "UDB", number: 38, group: "Direita", color: "#3B82F6" },
  { id: 11, name: "Partido da Ordem e Liberdade", acronym: "POL", number: 81, group: "Direita", color: "#1E293B" },
  { id: 12, name: "Aliança Cristã Nacional", acronym: "ACN", number: 84, group: "Direita", color: "#7E22CE" },
  { id: 13, name: "Partido da Reedificação da Ordem Nacional", acronym: "PRONA", number: 57, group: "Direita", color: "#312E81" },
  { id: 14, name: "Partido da Liberdade Nacional", acronym: "PLN", number: 17, group: "Direita", color: "#047857" },
  { id: 15, name: "Partido da Esperança", acronym: "PESP", number: 48, group: "Direita", color: "#059669" },
  { id: 16, name: "Partido Militar Nacionalista", acronym: "PMNL", number: 86, group: "Direita", color: "#292524" },
  { id: 17, name: "Partido Renovador Trabalhista Nacional", acronym: "PRTN", number: 75, group: "Direita", color: "#4338CA" },
  { id: 18, name: "Partido Revolucionário Institucional", acronym: "PRI", number: 26, group: "Direita", color: "#991B1B" },
  { id: 19, name: "Partido da Unidade e Liberdade Nacional", acronym: "PULN", number: 24, group: "Direita", color: "#155E75" },

  // CENTRO (10)
  { id: 20, name: "Movimento Democrático Brookasileiro", acronym: "MDB", number: 15, group: "Centro", color: "#059669" },
  { id: 21, name: "União Brookasil", acronym: "UNIÃO", number: 44, group: "Centro", color: "#2563EB" },
  { id: 22, name: "Partido Social Democrático", acronym: "PSD", number: 55, group: "Centro", color: "#D97706" },
  { id: 23, name: "Podemos", acronym: "PODEMOS", number: 20, group: "Centro", color: "#0284C7" },
  { id: 24, name: "Partido da Social Democracia Brookasileira", acronym: "PSDB", number: 45, group: "Centro", color: "#1D4ED8" },
  { id: 25, name: "Cidadania", acronym: "CIDADANIA", number: 23, group: "Centro", color: "#E11D48" },
  { id: 26, name: "Solidariedade", acronym: "SOLIDARIEDADE", number: 77, group: "Centro", color: "#EA580C" },
  { id: 27, name: "Avante", acronym: "AVANTE", number: 70, group: "Centro", color: "#D97706" },
  { id: 28, name: "Partido da Reconstrução Nacional Brookasileira", acronym: "PRNB", number: 76, group: "Centro", color: "#4F46E5" },
  { id: 29, name: "Partido da Mobilização Nacional", acronym: "PMN", number: 33, group: "Centro", color: "#9333EA" },

  // ESQUERDA (14)
  { id: 30, name: "Partido dos Trabalhadores", acronym: "PT", number: 13, group: "Esquerda", color: "#DC2626" },
  { id: 31, name: "Partido Socialismo e Liberdade", acronym: "PSOL", number: 50, group: "Esquerda", color: "#E11D48" },
  { id: 32, name: "Partido Comunista de Brookasil", acronym: "PCdoB", number: 65, group: "Esquerda", color: "#B91C1C" },
  { id: 33, name: "Rede Sustentabilidade", acronym: "REDE", number: 18, group: "Esquerda", color: "#059669" },
  { id: 34, name: "Partido Democrático Trabalhista", acronym: "PDT", number: 12, group: "Esquerda", color: "#C2410C" },
  { id: 35, name: "Unidade Popular", acronym: "UP", number: 80, group: "Esquerda", color: "#991B1B" },
  { id: 36, name: "Partido da Causa Operária", acronym: "PCO", number: 29, group: "Esquerda", color: "#7F1D1D" },
  { id: 37, name: "Partido Comunista Brookasileiro", acronym: "PCB", number: 21, group: "Esquerda", color: "#991B1B" },
  { id: 38, name: "Partido Socialista dos Trabalhadores Unificado", acronym: "PSTU", number: 16, group: "Esquerda", color: "#DC2626" },
  { id: 39, name: "Partido Pátria Livre", acronym: "PPL", number: 54, group: "Esquerda", color: "#B45309" },
  { id: 40, name: "Partido Socialista Brookasileiro", acronym: "PSB", number: 40, group: "Esquerda", color: "#F59E0B" },
  { id: 41, name: "Partido da Frente Socialista", acronym: "PFS", number: 60, group: "Esquerda", color: "#EF4444" },
  { id: 42, name: "Partido Socialista", acronym: "PS", number: 56, group: "Esquerda", color: "#E11D48" },
  { id: 43, name: "Partido Social Trabalhista Nacional", acronym: "PSTN", number: 31, group: "Esquerda", color: "#0D9488" }
];

// 5. CONFIGURAÇÃO DE CARGOS E NÚMEROS
const OFFICES_CONFIG = {
  Federal: [
    { id: "Presidente", name: "Presidente", digits: 2, major: true, needsVice: true, needsPdf: true, defaultVagas: 8 },
    { id: "Governador", name: "Governador", digits: 2, major: true, needsVice: true, needsPdf: true, defaultVagas: 8 },
    { id: "Senador", name: "Senador", digits: 3, major: false, needsVice: false, needsPdf: false, defaultVagas: 16 },
    { id: "Deputado Federal", name: "Deputado Federal", digits: 4, major: false, needsVice: false, needsPdf: false, defaultVagas: 16 },
    { id: "Deputado Estadual", name: "Deputado Estadual", digits: 5, major: false, needsVice: false, needsPdf: false, defaultVagas: 16 }
  ],
  Municipal: [
    { id: "Prefeito", name: "Prefeito", digits: 2, major: true, needsVice: true, needsPdf: true, defaultVagas: 10 },
    { id: "Vereador", name: "Vereador", digits: 5, major: false, needsVice: false, needsPdf: false, defaultVagas: 20 }
  ]
};

// ESTADO GLOBAL DA APLICAÇÃO
let currentUser = null;
let currentElection = null;
let candidaciesList = [];
let partiesList = [...OFFICIAL_PARTIES];
let activePartyTab = 'ALL';
let activeAdminStatusFilter = 'ALL';
let selectedCandForJudgment = null;
let uploadedPhotoBase64 = '';
let uploadedPdfBase64 = '';

// ========================================================
// INICIALIZAÇÃO E SINCRONIZAÇÃO EM TEMPO REAL
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  checkAuthSession();
  setupNetworkListeners();
  bootstrapFirebaseData();
  initCourtCredentialsListener();
  startCountdownTimer();
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Detecção de Conexão
function setupNetworkListeners() {
  window.addEventListener('online', () => {
    document.getElementById('offline-banner').classList.add('hidden');
    showToast('success', 'Conexão restabelecida com sucesso!');
  });
  window.addEventListener('offline', () => {
    document.getElementById('offline-banner').classList.remove('hidden');
    showToast('error', 'Sem conexão com a internet.');
  });

  if (db) {
    const connectedRef = db.ref(".info/connected");
    connectedRef.on("value", (snap) => {
      if (snap.val() === false) {
        document.getElementById('offline-banner').classList.remove('hidden');
      } else {
        document.getElementById('offline-banner').classList.add('hidden');
      }
    });
  }
}

// Inicializa dados no Firebase se vazios
async function bootstrapFirebaseData() {
  if (!db) return;

  // Escuta Eleição Ativa
  db.ref('elections').on('value', (snap) => {
    const data = snap.val();
    if (data) {
      const electionsArr = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      const openElection = electionsArr.find(e => e.status === 'open') || electionsArr[0];
      currentElection = openElection;
    } else {
      // Criar Eleição Padrão Federal
      const defaultElec = {
        title: "Eleições Gerais de Brookasil 2026",
        type: "Federal",
        status: "open",
        applicationStart: "2026-08-01T00:00:00Z",
        applicationEnd: "2026-10-15T23:59:59Z",
        electionDate: "2026-10-25T08:00:00Z",
        vagas: {
          Presidente: 8,
          Governador: 8,
          Senador: 16,
          "Deputado Federal": 16,
          "Deputado Estadual": 16
        }
      };
      const newRef = db.ref('elections').push(defaultElec);
      currentElection = { id: newRef.key, ...defaultElec };
    }
    updateElectionUI();
    populateFormSelects();
  });

  // Escuta Candidaturas em tempo real
  db.ref('candidates').on('value', (snap) => {
    const data = snap.val();
    if (data) {
      if (Array.isArray(data)) {
        candidaciesList = data
          .map((val, idx) => (val && typeof val === 'object') ? ({ id: val.id !== undefined ? val.id : String(idx), ...val }) : null)
          .filter(Boolean);
      } else {
        candidaciesList = Object.entries(data)
          .map(([id, val]) => (val && typeof val === 'object') ? ({ id: val.id !== undefined ? val.id : id, ...val }) : null)
          .filter(Boolean);
      }
    } else {
      candidaciesList = [];
    }
    updateGlobalStats();
    renderConfirmedCandidates();
    if (currentUser) {
      renderAdminCandidacies();
      updateAdminCharts();
    }
  });

  // Escuta Partidos
  db.ref('parties').on('value', (snap) => {
    const data = snap.val();
    if (data) {
      if (Array.isArray(data)) {
        partiesList = data
          .map((val, idx) => (val && typeof val === 'object') ? ({ id: val.id !== undefined ? val.id : idx, ...val }) : null)
          .filter(p => p && (p.acronym || p.name));
      } else {
        partiesList = Object.entries(data)
          .map(([id, val]) => (val && typeof val === 'object') ? ({ id: val.id !== undefined ? val.id : id, ...val }) : null)
          .filter(p => p && (p.acronym || p.name));
      }
    } else {
      // Sincroniza os 43 partidos oficiais
      OFFICIAL_PARTIES.forEach(p => {
        db.ref('parties/' + p.id).set(p);
      });
      partiesList = [...OFFICIAL_PARTIES];
    }
    renderPartiesCatalog();
    populatePartySelects();
    if (currentUser) {
      renderAdminParties();
    }
  });

  // Escuta Logs de Auditoria
  db.ref('auditLogs').limitToLast(50).on('value', (snap) => {
    const data = snap.val();
    if (data && currentUser) {
      const logs = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
      renderAuditLogs(logs.reverse());
    }
  });
}

// ========================================================
// ROTEAMENTO DE VISUALIZAÇÕES (SPA SEM REFRESH)
// ========================================================
function navigateTo(viewId) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewId) {
      btn.classList.add('text-brand-electric', 'bg-white/10');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('text-brand-electric', 'bg-white/10');
      btn.classList.add('text-slate-300');
    }
  });

  // Atualização sincronizada da barra inferior móvel (Bottom Navigation)
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    const bView = btn.getAttribute('data-bottom-view');
    if (bView === viewId) {
      btn.classList.add('text-brand-electric', 'font-bold');
      btn.classList.remove('text-slate-400');
    } else {
      if (bView !== 'candidaturas') {
        btn.classList.remove('text-brand-electric', 'font-bold');
        btn.classList.add('text-slate-400');
      }
    }
  });

  const target = document.getElementById('view-' + viewId);
  if (target) {
    target.classList.add('active');
    try {
      if (window.location.hash !== '#' + viewId) {
        history.replaceState(null, '', '#' + viewId);
      }
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  initIcons();
}

function handleBottomNavAdminClick() {
  if (currentUser) {
    navigateTo('admin');
  } else {
    openLoginModal('tse');
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
    initIcons();
  }
}

function toggleTheme() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  html.classList.toggle('light');
  initIcons();
}

// ========================================================
// ATUALIZAÇÃO DE CONTEÚDOS ELEITORAIS & CRONÔMETRO
// ========================================================
function updateElectionUI() {
  if (!currentElection) return;

  // Home Banner
  document.getElementById('home-election-title').textContent = currentElection.title;
  document.getElementById('home-election-dates').textContent = `Inscrições até: ${new Date(currentElection.applicationEnd).toLocaleDateString('pt-BR')} • Votação: ${new Date(currentElection.electionDate).toLocaleDateString('pt-BR')}`;

  // Eleições View
  const elecCard = document.getElementById('election-detail-card');
  if (elecCard) {
    elecCard.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${currentElection.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'}">
            ${currentElection.status === 'open' ? '● ELEIÇÃO ABERTA' : '● ELEIÇÃO ENCERRADA'}
          </span>
          <h3 class="text-2xl sm:text-3xl font-cinzel font-bold text-white mt-2">${currentElection.title}</h3>
          <p class="text-sm text-slate-300 mt-1">Modalidade: <strong>${currentElection.type}</strong> • 4 Estados Representados</p>
        </div>
        <button onclick="navigateTo('candidaturas')" class="px-6 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-brand-gold to-yellow-500 hover:to-brand-gold transition shadow-glow-gold text-sm whitespace-nowrap">
          Participar da Disputa
        </button>
      </div>
    `;
  }

  // Vagas Grid
  const vagasGrid = document.getElementById('vagas-grid');
  if (vagasGrid && currentElection.vagas) {
    vagasGrid.innerHTML = Object.entries(currentElection.vagas).map(([office, qty]) => {
      const deferidosCount = candidaciesList.filter(c => c.status === 'deferida' && c.office === office).length;
      return `
        <div class="glass-panel p-5 rounded-2xl border border-brand-border hover:border-brand-electric/50 transition">
          <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">${office}</span>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-2xl font-extrabold text-white font-mono">${qty} <span class="text-xs text-slate-400 font-normal">vagas</span></span>
            <span class="text-xs font-semibold ${deferidosCount >= qty ? 'text-amber-400' : 'text-emerald-400'}">${deferidosCount} deferidos</span>
          </div>
          <div class="w-full bg-brand-navy rounded-full h-1.5 mt-3 overflow-hidden">
            <div class="bg-brand-electric h-full rounded-full" style="width: ${Math.min(100, (deferidosCount / qty) * 100)}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Candidacy period validation
  const now = new Date();
  const start = new Date(currentElection.applicationStart);
  const end = new Date(currentElection.applicationEnd);
  const isOpen = currentElection.status === 'open' && now >= start && now <= end;

  const closedAlert = document.getElementById('candidacy-closed-alert');
  const form = document.getElementById('candidacy-form');
  const badge = document.getElementById('candidacy-period-badge');

  if (!isOpen) {
    closedAlert.classList.remove('hidden');
    form.classList.add('opacity-50', 'pointer-events-none');
    badge.className = "px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-2";
    badge.innerHTML = "Período Encerrado";
  } else {
    closedAlert.classList.add('hidden');
    form.classList.remove('opacity-50', 'pointer-events-none');
    badge.className = "px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-2";
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Inscrições Abertas';
  }
}

function startCountdownTimer() {
  setInterval(() => {
    if (!currentElection || !currentElection.electionDate) return;
    const diff = new Date(currentElection.electionDate) - new Date();
    if (diff <= 0) {
      document.getElementById('timer-days').textContent = "00";
      document.getElementById('timer-hours').textContent = "00";
      document.getElementById('timer-minutes').textContent = "00";
      document.getElementById('timer-seconds').textContent = "00";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('timer-days').textContent = String(days).padStart(2, '0');
    document.getElementById('timer-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('timer-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('timer-seconds').textContent = String(seconds).padStart(2, '0');
  }, 1000);
}

function updateGlobalStats() {
  const total = candidaciesList.length;
  const deferidas = candidaciesList.filter(c => c.status === 'deferida').length;
  document.getElementById('stat-total-candidacies').textContent = total;
  document.getElementById('stat-deferidas').textContent = deferidas;
}

// ========================================================
// FORMULÁRIO DE CANDIDATURA (WIZARD & VALIDAÇÃO)
// ========================================================
function populateFormSelects() {
  const elecSelect = document.getElementById('form-election-select');
  if (elecSelect && currentElection) {
    elecSelect.innerHTML = `<option value="${currentElection.id}">${currentElection.title} (${currentElection.type})</option>`;
  }
  onElectionChange();
}

function onElectionChange() {
  const officeSelect = document.getElementById('form-office-select');
  if (!officeSelect) return;

  const type = currentElection ? currentElection.type : 'Federal';
  const offices = OFFICES_CONFIG[type] || OFFICES_CONFIG.Federal;

  officeSelect.innerHTML = offices.map(o => `<option value="${o.id}">${o.name} (${o.digits} dígitos)</option>`).join('');
  onOfficeChange();
}

function onOfficeChange() {
  const officeId = document.getElementById('form-office-select').value;
  const type = currentElection ? currentElection.type : 'Federal';
  const office = (OFFICES_CONFIG[type] || []).find(o => o.id === officeId) || OFFICES_CONFIG.Federal[0];

  // Regra de Cidades (Municipal exige Cidade, Estadual exige Estado)
  const cityCont = document.getElementById('form-city-container');
  if (type === 'Municipal' || officeId === 'Prefeito' || officeId === 'Vereador') {
    cityCont.classList.remove('hidden');
    document.getElementById('form-city-select').setAttribute('required', 'true');
  } else {
    cityCont.classList.add('hidden');
    document.getElementById('form-city-select').removeAttribute('required');
  }

  // Majoritário precisa de Vice e PDF
  const viceCont = document.getElementById('form-vice-container');
  const pdfInput = document.getElementById('form-pdf-input');
  const pdfLabel = document.getElementById('form-proposal-label');

  if (office.needsVice) {
    viceCont.classList.remove('hidden');
    document.getElementById('form-vice-name').setAttribute('required', 'true');
  } else {
    viceCont.classList.add('hidden');
    document.getElementById('form-vice-name').removeAttribute('required');
  }

  if (office.needsPdf) {
    pdfLabel.innerHTML = 'Plano de Governo em PDF * <span class="text-brand-gold font-normal">(Obrigatório para cargos Executivos)</span>';
    pdfInput.setAttribute('required', 'true');
  } else {
    pdfLabel.innerHTML = 'Proposta em PDF (Opcional)';
    pdfInput.removeAttribute('required');
  }

  updateNumberPrefixAndSuffixConfig();
}

function getCityDisplayName(stateId, cityId) {
  if (stateId && cityId && BROOKASIL_GEO[stateId] && BROOKASIL_GEO[stateId].cities && BROOKASIL_GEO[stateId].cities[cityId]) {
    return BROOKASIL_GEO[stateId].cities[cityId];
  }
  return cityId && cityId !== 'ALL' ? cityId : 'Município';
}

function getStateDisplayName(stateId) {
  if (stateId && BROOKASIL_GEO[stateId] && BROOKASIL_GEO[stateId].name) {
    return BROOKASIL_GEO[stateId].name;
  }
  return stateId && stateId !== 'ALL' ? stateId : 'Estado';
}

function getOfficeConfig(officeId) {
  const type = currentElection ? currentElection.type : 'Federal';
  const list = (OFFICES_CONFIG[type] || []).concat(OFFICES_CONFIG.Federal || [], OFFICES_CONFIG.Municipal || []);
  return list.find(o => o.id === officeId) || { id: officeId, name: officeId, digits: 2, major: false };
}

function isMunicipalOffice(officeId) {
  const type = currentElection ? currentElection.type : 'Federal';
  return type === 'Municipal' || officeId === 'Prefeito' || officeId === 'Vereador';
}

function isStateOffice(officeId) {
  return officeId === 'Governador' || officeId === 'Senador' || officeId === 'Deputado Federal' || officeId === 'Deputado Estadual';
}

function isNationalOffice(officeId) {
  return officeId === 'Presidente';
}

function isMajorOffice(officeId) {
  const off = getOfficeConfig(officeId);
  return off.major === true || off.digits === 2 || officeId === 'Prefeito' || officeId === 'Governador' || officeId === 'Presidente';
}

function onStateChange() {
  const stateKey = document.getElementById('form-state-select').value;
  const citySelect = document.getElementById('form-city-select');
  if (!citySelect) return;

  if (stateKey && BROOKASIL_GEO[stateKey]) {
    citySelect.innerHTML = '<option value="">Selecione a Cidade</option>' +
      Object.entries(BROOKASIL_GEO[stateKey].cities).map(([key, name]) => `<option value="${key}">${name}</option>`).join('');
  } else {
    citySelect.innerHTML = '<option value="">Selecione primeiro o Estado</option>';
  }

  validateNumberSuffix();
}

function onCityChange() {
  validateNumberSuffix();
}

function populatePartySelects() {
  const partySelect = document.getElementById('form-party-select');
  if (!partySelect) return;

  partySelect.innerHTML = '<option value="">Selecione o Partido</option>' +
    partiesList.map(p => `<option value="${p.id}" data-number="${p.number}">[${p.acronym}] ${p.name} - Número ${p.number} (${p.group})</option>`).join('');
}

function onPartyChange() {
  updateNumberPrefixAndSuffixConfig();
}

function updateNumberPrefixAndSuffixConfig() {
  const partySelect = document.getElementById('form-party-select');
  const selectedOpt = partySelect.options[partySelect.selectedIndex];
  const partyNum = selectedOpt && selectedOpt.dataset.number ? selectedOpt.dataset.number : '--';

  const prefixEl = document.getElementById('form-party-prefix');
  const suffixInput = document.getElementById('form-number-suffix');
  const helpEl = document.getElementById('form-number-help');

  prefixEl.textContent = partyNum;

  const officeId = document.getElementById('form-office-select').value;
  const office = getOfficeConfig(officeId);

  if (office.digits === 2) {
    // Majoritário: exatamente 2 dígitos do partido!
    suffixInput.value = '';
    suffixInput.disabled = true;
    suffixInput.placeholder = "Fixo";
    suffixInput.removeAttribute('required');
    helpEl.textContent = `Cargo Majoritário: Seu número de urna é EXATAMENTE o número partidário (${partyNum}).`;
    validateNumberSuffix();
  } else {
    suffixInput.disabled = false;
    suffixInput.setAttribute('required', 'true');
    const suffixLength = office.digits - 2;
    suffixInput.maxLength = suffixLength;
    suffixInput.placeholder = "X".repeat(suffixLength);
    helpEl.textContent = `Cargo ${office.name}: Número total terá ${office.digits} dígitos (${partyNum} + ${suffixLength} dígitos do candidato).`;
    validateNumberSuffix();
  }
}

function validateNumberSuffix() {
  const partyPrefix = document.getElementById('form-party-prefix').textContent;
  const suffixInput = document.getElementById('form-number-suffix');
  const statusEl = document.getElementById('form-number-status');
  if (!statusEl) return false;

  const partySelect = document.getElementById('form-party-select');
  const selectedPartyId = partySelect ? partySelect.value : '';
  const selectedParty = partiesList.find(p => String(p.id) === String(selectedPartyId));

  if (partyPrefix === '--' || !selectedParty) {
    statusEl.textContent = "Selecione o partido primeiro.";
    statusEl.className = "text-xs text-amber-400 mt-1 font-semibold";
    return false;
  }

  const officeId = document.getElementById('form-office-select').value;
  const office = getOfficeConfig(officeId);
  const stateId = document.getElementById('form-state-select')?.value || '';
  const citySelect = document.getElementById('form-city-select');
  const cityId = citySelect?.value || '';

  // Validação geográfica prévia para cargos municipais e estaduais
  if (isMunicipalOffice(officeId)) {
    if (!stateId) {
      statusEl.textContent = "ℹ️ Selecione o Estado e o Município para verificar a disponibilidade de legenda e número.";
      statusEl.className = "text-xs text-brand-gold mt-1 font-semibold";
      return false;
    }
    if (!cityId) {
      statusEl.textContent = "ℹ️ Selecione o Município para verificar a disponibilidade de vaga e número na sua cidade.";
      statusEl.className = "text-xs text-brand-gold mt-1 font-semibold";
      return false;
    }
  } else if (isStateOffice(officeId)) {
    if (!stateId) {
      statusEl.textContent = "ℹ️ Selecione o Estado para verificar a disponibilidade na circunscrição estadual.";
      statusEl.className = "text-xs text-brand-gold mt-1 font-semibold";
      return false;
    }
  }

  const fullNumber = office.digits === 2 ? partyPrefix : (partyPrefix + (suffixInput ? suffixInput.value.trim() : ''));

  if (fullNumber.length !== office.digits) {
    statusEl.textContent = `O número precisa ter exatamente ${office.digits} dígitos.`;
    statusEl.className = "text-xs text-amber-400 mt-1 font-semibold";
    return false;
  }

  // 1. REGRA MAJORITÁRIA: Proibir que candidatos da mesma circunscrição concorram pelo mesmo partido
  // Em cidades diferentes, o partido PODE ter candidatos a Prefeito com o número do partido!
  if (isMunicipalOffice(officeId) && isMajorOffice(officeId)) {
    const existingPartyMajorCand = candidaciesList.find(c =>
      c.status !== 'excluida' &&
      c.electionId === currentElection.id &&
      c.office === officeId &&
      String(c.partyId) === String(selectedParty.id) &&
      c.cityId === cityId
    );

    if (existingPartyMajorCand) {
      const cityName = getCityDisplayName(stateId, cityId);
      statusEl.textContent = `❌ Impedimento Eleitoral: O partido [${selectedParty.acronym}] já possui candidato a ${office.name} em ${cityName} (${existingPartyMajorCand.ballotName}). Pessoas da mesma cidade não podem concorrer ao cargo majoritário pela mesma legenda!`;
      statusEl.className = "text-xs text-red-400 mt-1 font-bold";
      return false;
    }
  } else if (isStateOffice(officeId) && isMajorOffice(officeId)) {
    const existingPartyMajorState = candidaciesList.find(c =>
      c.status !== 'excluida' &&
      c.electionId === currentElection.id &&
      c.office === officeId &&
      String(c.partyId) === String(selectedParty.id) &&
      c.stateId === stateId
    );

    if (existingPartyMajorState) {
      const stateName = getStateDisplayName(stateId);
      statusEl.textContent = `❌ Impedimento Eleitoral: O partido [${selectedParty.acronym}] já possui candidato a ${office.name} no estado de ${stateName} (${existingPartyMajorState.ballotName}).`;
      statusEl.className = "text-xs text-red-400 mt-1 font-bold";
      return false;
    }
  } else if (isNationalOffice(officeId) && isMajorOffice(officeId)) {
    const existingPartyMajorPres = candidaciesList.find(c =>
      c.status !== 'excluida' &&
      c.electionId === currentElection.id &&
      c.office === officeId &&
      String(c.partyId) === String(selectedParty.id)
    );

    if (existingPartyMajorPres) {
      statusEl.textContent = `❌ Impedimento Eleitoral: O partido [${selectedParty.acronym}] já possui candidato a Presidente (${existingPartyMajorPres.ballotName}).`;
      statusEl.className = "text-xs text-red-400 mt-1 font-bold";
      return false;
    }
  }

  // 2. UNICIDADE DE NÚMERO POR CIRCUNSCRIÇÃO ELEITORAL
  // Candidatos de cidades diferentes NÃO conflitam entre si no número de urna
  const isTaken = candidaciesList.some(c => {
    if (c.status === 'excluida') return false;
    if (c.electionId !== currentElection.id) return false;
    if (c.office !== officeId) return false;
    if (String(c.number) !== String(fullNumber)) return false;

    // Em eleições/cargos municipais: conflito apenas se for no MESMO MUNICÍPIO
    if (isMunicipalOffice(officeId)) {
      return c.cityId === cityId;
    }

    // Em cargos estaduais: conflito apenas se for no MESMO ESTADO
    if (isStateOffice(officeId)) {
      return c.stateId === stateId;
    }

    // Cargo nacional (Presidente): conflito em todo o país
    return true;
  });

  if (isTaken) {
    const circDesc = isMunicipalOffice(officeId)
      ? `no município de ${getCityDisplayName(stateId, cityId)}`
      : (isStateOffice(officeId) ? `no estado de ${getStateDisplayName(stateId)}` : 'nesta eleição');

    statusEl.textContent = `❌ O número ${fullNumber} já está registrado por outro candidato ${circDesc}!`;
    statusEl.className = "text-xs text-red-400 mt-1 font-bold";
    return false;
  } else {
    const circDesc = isMunicipalOffice(officeId)
      ? `em ${getCityDisplayName(stateId, cityId)} - ${getStateDisplayName(stateId)}`
      : (isStateOffice(officeId) ? `em ${getStateDisplayName(stateId)}` : 'âmbito nacional');

    statusEl.textContent = `✅ Número ${fullNumber} e legenda disponíveis para ${office.name} (${circDesc})!`;
    statusEl.className = "text-xs text-emerald-400 mt-1 font-bold";
    return true;
  }
}

function generateAutoNumber() {
  const partySelect = document.getElementById('form-party-select');
  const selectedOpt = partySelect ? partySelect.options[partySelect.selectedIndex] : null;
  if (!selectedOpt || !selectedOpt.dataset.number) {
    showToast('error', 'Selecione um partido primeiro para gerar o número.');
    return;
  }
  const partyNum = selectedOpt.dataset.number;
  const officeId = document.getElementById('form-office-select').value;
  const office = getOfficeConfig(officeId);

  if (office.digits === 2) {
    showToast('info', 'Cargos majoritários utilizam unicamente o número da legenda (' + partyNum + ').');
    return;
  }

  const stateId = document.getElementById('form-state-select')?.value || '';
  const cityId = document.getElementById('form-city-select')?.value || '';

  if (isMunicipalOffice(officeId) && !cityId) {
    showToast('error', 'Selecione a Cidade/Município primeiro para gerar um número vago na sua cidade.');
    return;
  }

  if (isStateOffice(officeId) && !stateId) {
    showToast('error', 'Selecione o Estado primeiro para gerar um número vago no seu estado.');
    return;
  }

  const suffixLength = office.digits - 2;
  const maxSuffix = Math.pow(10, suffixLength) - 1;

  for (let i = 1; i <= maxSuffix; i++) {
    const candidateSuffix = String(i).padStart(suffixLength, '0');
    const testNumber = partyNum + candidateSuffix;
    const isTaken = candidaciesList.some(c => {
      if (c.status === 'excluida') return false;
      if (c.electionId !== currentElection.id) return false;
      if (c.office !== officeId) return false;
      if (String(c.number) !== String(testNumber)) return false;

      if (isMunicipalOffice(officeId)) {
        return c.cityId === cityId;
      }
      if (isStateOffice(officeId)) {
        return c.stateId === stateId;
      }
      return true;
    });

    if (!isTaken) {
      document.getElementById('form-number-suffix').value = candidateSuffix;
      validateNumberSuffix();
      showToast('success', `Número gerado: ${testNumber}`);
      return;
    }
  }
  showToast('error', 'Nenhum número vago localizado para esta faixa partidária nesta circunscrição.');
}

// ========================================================
// RECURSO OFICIAL DE ENQUADRAMENTO E CORTE DE FOTO (3x4)
// ========================================================
let cropperZoom = 1.0;
let cropperPanX = 0;
let cropperPanY = 0;
let cropperRotation = 0;
let isCropperDragging = false;
let cropperDragStartX = 0;
let cropperDragStartY = 0;
let cropperInitialPanX = 0;
let cropperInitialPanY = 0;
let cropperTargetContext = 'form'; // 'form' ou 'tse_edit'
let rawUploadedPhotoDataUrl = '';
let cropperLoadedImg = new Image();
let cropperListenersAttached = false;

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('error', 'O arquivo selecionado não é uma imagem válida.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    rawUploadedPhotoDataUrl = evt.target.result;
    // Abre imediatamente o ajustador interativo para o candidato centralizar/posicionar
    openPhotoCropperModal(rawUploadedPhotoDataUrl, 'form');
  };
  reader.readAsDataURL(file);
}

function openPhotoCropperModal(imageSrc = null, targetContext = 'form') {
  cropperTargetContext = targetContext;

  const src = imageSrc || (targetContext === 'tse_edit' ? (tseEditPhotoBase64 || selectedCandForTseEdit?.photo || '') : (rawUploadedPhotoDataUrl || uploadedPhotoBase64));
  if (!src) {
    showToast('error', 'Selecione uma imagem primeiro para poder ajustar o enquadramento.');
    return;
  }

  cropperZoom = 1.0;
  cropperPanX = 0;
  cropperPanY = 0;
  cropperRotation = 0;

  const modal = document.getElementById('photo-cropper-modal');
  const imgEl = document.getElementById('cropper-preview-img');
  const zoomRange = document.getElementById('cropper-zoom-range');
  const zoomVal = document.getElementById('cropper-zoom-val');

  if (zoomRange) zoomRange.value = "1.0";
  if (zoomVal) zoomVal.textContent = "100%";

  cropperLoadedImg = new Image();
  cropperLoadedImg.onload = function() {
    if (imgEl) {
      imgEl.src = cropperLoadedImg.src;
      fitImageToCropperViewport(cropperLoadedImg.naturalWidth, cropperLoadedImg.naturalHeight);
      updateCropperTransform();
    }
  };
  cropperLoadedImg.src = src;

  if (modal) {
    modal.classList.remove('hidden');
    initIcons();
  }

  initCropperDragListeners();
}

function fitImageToCropperViewport(imgWidth, imgHeight) {
  const vp = document.getElementById('cropper-viewport');
  const vpWidth = vp ? (vp.clientWidth || 285) : 285;
  const vpHeight = vp ? (vp.clientHeight || 380) : 380;

  const imgEl = document.getElementById('cropper-preview-img');
  if (!imgEl) return;

  const scaleX = vpWidth / imgWidth;
  const scaleY = vpHeight / imgHeight;
  const initialScale = Math.max(scaleX, scaleY);

  const displayW = Math.round(imgWidth * initialScale);
  const displayH = Math.round(imgHeight * initialScale);

  imgEl.style.width = `${displayW}px`;
  imgEl.style.height = `${displayH}px`;
  imgEl.style.left = `${Math.round((vpWidth - displayW) / 2)}px`;
  imgEl.style.top = `${Math.round((vpHeight - displayH) / 2)}px`;

  cropperPanX = 0;
  cropperPanY = 0;
  cropperZoom = 1.0;
}

function updateCropperTransform() {
  const imgEl = document.getElementById('cropper-preview-img');
  if (!imgEl) return;
  imgEl.style.transform = `translate(${cropperPanX}px, ${cropperPanY}px) scale(${cropperZoom}) rotate(${cropperRotation}deg)`;

  const zoomVal = document.getElementById('cropper-zoom-val');
  if (zoomVal) {
    zoomVal.textContent = `${Math.round(cropperZoom * 100)}%`;
  }
}

function setCropperZoom(val) {
  cropperZoom = parseFloat(val) || 1.0;
  updateCropperTransform();
}

function stepCropperZoom(delta) {
  const zoomRange = document.getElementById('cropper-zoom-range');
  let newZoom = Math.min(Math.max(cropperZoom + delta, 0.5), 3.0);
  newZoom = Math.round(newZoom * 100) / 100;
  cropperZoom = newZoom;
  if (zoomRange) zoomRange.value = newZoom.toString();
  updateCropperTransform();
}

function centerCropper() {
  cropperPanX = 0;
  cropperPanY = 0;
  updateCropperTransform();
  showToast('info', 'Foto centralizada na moldura.');
}

function rotateCropper() {
  cropperRotation = (cropperRotation + 90) % 360;
  updateCropperTransform();
}

function resetCropper() {
  cropperZoom = 1.0;
  cropperPanX = 0;
  cropperPanY = 0;
  cropperRotation = 0;
  const zoomRange = document.getElementById('cropper-zoom-range');
  if (zoomRange) zoomRange.value = "1.0";
  updateCropperTransform();
}

function initCropperDragListeners() {
  if (cropperListenersAttached) return;
  cropperListenersAttached = true;

  const vp = document.getElementById('cropper-viewport');
  if (!vp) return;

  // Mouse Drag para Desktop
  vp.addEventListener('mousedown', (e) => {
    isCropperDragging = true;
    cropperDragStartX = e.clientX;
    cropperDragStartY = e.clientY;
    cropperInitialPanX = cropperPanX;
    cropperInitialPanY = cropperPanY;
    vp.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isCropperDragging) return;
    const dx = e.clientX - cropperDragStartX;
    const dy = e.clientY - cropperDragStartY;
    cropperPanX = cropperInitialPanX + dx;
    cropperPanY = cropperInitialPanY + dy;
    updateCropperTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isCropperDragging) {
      isCropperDragging = false;
      const vpEl = document.getElementById('cropper-viewport');
      if (vpEl) vpEl.style.cursor = 'grab';
    }
  });

  // Touch Drag para Mobile (Vertical / Horizontal)
  vp.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isCropperDragging = true;
      cropperDragStartX = e.touches[0].clientX;
      cropperDragStartY = e.touches[0].clientY;
      cropperInitialPanX = cropperPanX;
      cropperInitialPanY = cropperPanY;
    }
  }, { passive: false });

  vp.addEventListener('touchmove', (e) => {
    if (!isCropperDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - cropperDragStartX;
    const dy = e.touches[0].clientY - cropperDragStartY;
    cropperPanX = cropperInitialPanX + dx;
    cropperPanY = cropperInitialPanY + dy;
    updateCropperTransform();
  }, { passive: false });

  vp.addEventListener('touchend', () => {
    isCropperDragging = false;
  });
}

function applyCroppedPhoto() {
  const vp = document.getElementById('cropper-viewport');
  const imgEl = document.getElementById('cropper-preview-img');
  if (!vp || !imgEl || !cropperLoadedImg.src) {
    closePhotoCropperModal();
    return;
  }

  // Canvas oficial 3x4 de alta resolução (450x600 px)
  const outWidth = 450;
  const outHeight = 600;
  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Fundo profissional de urna
  ctx.fillStyle = '#060d1f';
  ctx.fillRect(0, 0, outWidth, outHeight);

  // Escala exata entre a viewport do modal e o canvas de saída
  const vpRect = vp.getBoundingClientRect();
  const scaleRatio = outWidth / (vpRect.width || 285);

  const imgRect = imgEl.getBoundingClientRect();
  const relX = (imgRect.left - vpRect.left) * scaleRatio;
  const relY = (imgRect.top - vpRect.top) * scaleRatio;
  const relW = imgRect.width * scaleRatio;
  const relH = imgRect.height * scaleRatio;

  ctx.save();
  ctx.translate(relX + relW / 2, relY + relH / 2);
  ctx.rotate((cropperRotation * Math.PI) / 180);
  ctx.drawImage(cropperLoadedImg, -relW / 2, -relH / 2, relW, relH);
  ctx.restore();

  const finalBase64 = canvas.toDataURL('image/jpeg', 0.86);

  if (cropperTargetContext === 'form') {
    uploadedPhotoBase64 = finalBase64;
    const previewImg = document.getElementById('photo-preview-img');
    const placeholder = document.getElementById('photo-placeholder');
    const cropBtn = document.getElementById('form-crop-btn');
    const overlayCropBtn = document.getElementById('photo-overlay-crop-btn');

    if (previewImg) {
      previewImg.src = finalBase64;
      previewImg.classList.remove('hidden');
    }
    if (placeholder) placeholder.classList.add('hidden');
    if (cropBtn) cropBtn.classList.remove('hidden');
    if (overlayCropBtn) overlayCropBtn.classList.remove('hidden');

    showToast('success', 'Foto do candidato enquadrada e centralizada com sucesso!');
  } else if (cropperTargetContext === 'tse_edit') {
    tseEditPhotoBase64 = finalBase64;
    const tsePreview = document.getElementById('tse-edit-photo-preview');
    if (tsePreview) tsePreview.src = finalBase64;
    showToast('success', 'Foto da candidatura retificada e enquadrada!');
  }

  closePhotoCropperModal();
}

function closePhotoCropperModal() {
  const modal = document.getElementById('photo-cropper-modal');
  if (modal) modal.classList.add('hidden');
  isCropperDragging = false;
}

function handlePdfUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    showToast('error', 'Por favor, selecione um arquivo em formato PDF.');
    e.target.value = '';
    return;
  }

  if (file.size > 4 * 1024 * 1024) { // 4MB
    showToast('error', 'O arquivo PDF deve ter menos de 4MB.');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    uploadedPdfBase64 = evt.target.result;
    const badge = document.getElementById('pdf-status-badge');
    badge.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i> ${file.name} (${Math.round(file.size / 1024)} KB)`;
    badge.className = "text-xs text-emerald-400 flex items-center gap-1.5 font-semibold";
    initIcons();
    showToast('success', 'Plano de governo anexado com sucesso!');
  };
  reader.readAsDataURL(file);
}

// ========================================================
// ENVIO DA CANDIDATURA PARA O FIREBASE
// ========================================================
async function handleCandidacySubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('btn-submit-candidacy');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="animate-spin inline-block mr-2">⟳</span> Enviando ao Tribunal...';

  try {
    const partySelect = document.getElementById('form-party-select');
    const selectedParty = partiesList.find(p => String(p.id) === String(partySelect.value));
    if (!selectedParty) {
      showToast('error', 'Selecione uma agremiação partidária válida.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Submeter Candidatura Oficial';
      initIcons();
      return;
    }

    const officeId = document.getElementById('form-office-select').value;
    const office = getOfficeConfig(officeId);
    const stateId = document.getElementById('form-state-select').value;
    const cityId = document.getElementById('form-city-select').value || 'ALL';

    if (isMunicipalOffice(officeId) && (!stateId || !cityId || cityId === 'ALL')) {
      showToast('error', 'Selecione o Estado e a Cidade para candidaturas municipais.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Submeter Candidatura Oficial';
      initIcons();
      return;
    }

    if (!validateNumberSuffix()) {
      showToast('error', 'Corrija os impedimentos de número ou legenda antes de submeter.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Submeter Candidatura Oficial';
      initIcons();
      return;
    }

    if (!uploadedPhotoBase64) {
      showToast('error', 'É obrigatório anexar a foto oficial do candidato.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Submeter Candidatura Oficial';
      initIcons();
      return;
    }

    // Validação estrita: Proibir que candidatos da mesma cidade concorram ao cargo majoritário pelo mesmo partido
    if (isMunicipalOffice(officeId) && isMajorOffice(officeId)) {
      const existingMajor = candidaciesList.find(c =>
        c.status !== 'excluida' &&
        c.electionId === currentElection.id &&
        c.office === officeId &&
        String(c.partyId) === String(selectedParty.id) &&
        c.cityId === cityId
      );
      if (existingMajor) {
        showToast('error', `O partido ${selectedParty.acronym} já possui candidatura a Prefeito em ${getCityDisplayName(stateId, cityId)}. Pessoas da mesma cidade não podem concorrer pelo mesmo partido ao cargo majoritário.`);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Submeter Candidatura Oficial';
        initIcons();
        return;
      }
    }

    const partyPrefix = document.getElementById('form-party-prefix').textContent;
    const suffix = document.getElementById('form-number-suffix').value.trim();
    const finalNumber = office.digits === 2 ? partyPrefix : (partyPrefix + suffix);

    // Verificação de colisão de número de urna na circunscrição
    const numberCollision = candidaciesList.find(c => {
      if (c.status === 'excluida') return false;
      if (c.electionId !== currentElection.id) return false;
      if (c.office !== officeId) return false;
      if (String(c.number) !== String(finalNumber)) return false;

      if (isMunicipalOffice(officeId)) {
        return c.cityId === cityId;
      }
      if (isStateOffice(officeId)) {
        return c.stateId === stateId;
      }
      return true;
    });

    if (numberCollision) {
      showToast('error', `O número de urna ${finalNumber} já está registrado nesta circunscrição.`);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Submeter Candidatura Oficial';
      initIcons();
      return;
    }

    const protocol = `CAND-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const candidateData = {
      protocol: protocol,
      electionId: currentElection.id,
      electionTitle: currentElection.title,
      office: officeId,
      stateId: stateId,
      state: stateId,
      cityId: cityId,
      city: cityId,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      partyAcronym: selectedParty.acronym,
      partyNumber: selectedParty.number,
      partyColor: selectedParty.color,
      partyGroup: selectedParty.group,
      number: finalNumber,
      fullName: document.getElementById('form-full-name').value.trim(),
      ballotName: document.getElementById('form-ballot-name').value.trim().toUpperCase(),
      birthDate: document.getElementById('form-birth-date').value,
      tiktok: document.getElementById('form-tiktok').value.trim(),
      viceName: document.getElementById('form-vice-name').value.trim() || null,
      coalition: document.getElementById('form-coalition').value.trim() || null,
      photo: uploadedPhotoBase64,
      proposalPdf: uploadedPdfBase64 || null,
      proposalsText: document.getElementById('form-proposals-text').value.trim(),
      status: 'pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Gravação resiliente no Realtime Database
    let candidateKey = null;
    if (db) {
      try {
        const newCandRef = db.ref('candidates').push();
        candidateKey = newCandRef.key;
        await newCandRef.set(candidateData);
      } catch (dbErr) {
        console.warn("Aviso ao gravar no Firebase RTDB (usando fallback local):", dbErr);
      }
    }

    const finalKey = candidateKey || (`cand_loc_${Date.now()}`);
    const savedCand = { id: finalKey, ...candidateData };

    // Atualização otimista imediata da lista local
    const existingIdx = candidaciesList.findIndex(c => c.id === finalKey || c.protocol === protocol);
    if (existingIdx >= 0) {
      candidaciesList[existingIdx] = savedCand;
    } else {
      candidaciesList.unshift(savedCand);
    }

    // Persistência local em caso de oscilação de rede
    try {
      localStorage.setItem('brookasil_last_submitted_protocol', protocol);
      localStorage.setItem('brookasil_last_submitted_cand', JSON.stringify(savedCand));
    } catch (e) {}

    updateGlobalStats();
    renderConfirmedCandidates();
    if (currentUser) {
      renderAdminCandidacies();
      updateAdminCharts();
    }

    // Registro da reserva de número na circunscrição
    if (db && candidateKey) {
      try {
        const jurisdictionKey = isMunicipalOffice(officeId)
          ? `${candidateData.stateId}_${candidateData.cityId}`
          : (isStateOffice(officeId) ? candidateData.stateId : 'NACIONAL');

        await db.ref(`numberRegistry/${currentElection.id}/${officeId}/${jurisdictionKey}/${finalNumber}`).set({
          candidateId: candidateKey,
          protocol: protocol,
          reservedAt: new Date().toISOString()
        });
      } catch (numErr) {
        console.warn("Aviso ao registrar número no RTDB:", numErr);
      }
    }

    const circInfo = isMunicipalOffice(officeId)
      ? `em ${getCityDisplayName(stateId, cityId)}`
      : (isStateOffice(officeId) ? `em ${getStateDisplayName(stateId)}` : '');

    // Tentativa segura de criar notificação administrativa (ignora se houver restrição de segurança no RTDB)
    if (db) {
      try {
        await db.ref('notifications').push({
          type: 'new_candidacy',
          text: `Nova candidatura registrada: ${candidateData.ballotName} (${candidateData.partyAcronym} - ${finalNumber}) para ${officeId} ${circInfo}`,
          timestamp: new Date().toISOString(),
          read: false
        });
      } catch (notifErr) {
        console.warn("Notificação não gravada no Firebase (permissão restrita):", notifErr);
      }
    }

    // ========================================================
    // EXIBIÇÃO DA MENSAGEM DE SUCESSO DE SUBMISSÃO
    // ========================================================
    window.lastSubmittedProtocol = protocol;

    // 1. Toast oficial de envio com protocolo
    showToast('success', `Candidatura enviada com sucesso ao Tribunal! Protocolo: ${protocol}`);

    // 2. Banner de confirmação no topo do formulário
    const bannerEl = document.getElementById('candidacy-success-banner');
    const bannerProto = document.getElementById('banner-protocol-text');
    if (bannerEl) {
      if (bannerProto) bannerProto.textContent = protocol;
      bannerEl.classList.remove('hidden');
      bannerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 3. Modal de confirmação oficial com protocolo e detalhes
    const protoEl = document.getElementById('success-protocol-text');
    const nameEl = document.getElementById('success-name-text');
    const officeEl = document.getElementById('success-office-text');
    if (protoEl) protoEl.textContent = protocol;
    if (nameEl) nameEl.textContent = candidateData.ballotName;
    if (officeEl) officeEl.textContent = `${officeId} • Número ${finalNumber} (${selectedParty.acronym}) ${circInfo}`;

    const successModal = document.getElementById('success-modal');
    if (successModal) {
      successModal.classList.remove('hidden');
    }

    // 4. Efeito festivo de confetes
    if (window.confetti) {
      try {
        window.confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 } });
      } catch (e) {}
    }

    // 5. Reseta campos do formulário
    document.getElementById('candidacy-form').reset();
    uploadedPhotoBase64 = '';
    uploadedPdfBase64 = '';
    const previewImg = document.getElementById('photo-preview-img');
    const previewPlaceholder = document.getElementById('photo-placeholder');
    if (previewImg) previewImg.classList.add('hidden');
    if (previewPlaceholder) previewPlaceholder.classList.remove('hidden');
    const pdfBadge = document.getElementById('pdf-status-badge');
    if (pdfBadge) {
      pdfBadge.innerHTML = '<i data-lucide="info" class="w-3.5 h-3.5"></i> Nenhum arquivo selecionado';
      pdfBadge.className = 'text-xs text-slate-400 flex items-center gap-1.5';
    }
    const numStatusEl = document.getElementById('form-number-status');
    if (numStatusEl) {
      numStatusEl.textContent = '';
      numStatusEl.className = 'text-xs text-slate-400 mt-1';
    }
    const partyPrefixEl = document.getElementById('form-party-prefix');
    if (partyPrefixEl) partyPrefixEl.textContent = '--';

  } catch (error) {
    console.error("Erro ao submeter:", error);
    showToast('error', 'Falha ao conectar com o banco de dados. Tente novamente.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Submeter Candidatura Oficial';
    initIcons();
  }
}

function closeSuccessModal() {
  document.getElementById('success-modal').classList.add('hidden');
  navigateTo('home');
}

function viewSubmittedCandidacyInPublicList() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.classList.add('hidden');
  navigateTo('consultar');
  const searchInput = document.getElementById('quick-search-input');
  if (searchInput && window.lastSubmittedProtocol) {
    searchInput.value = window.lastSubmittedProtocol;
  }
  executeQuickSearch();
  showToast('info', 'Protocolo localizado! Sua candidatura está EM ANÁLISE aguardando decisão do TRE.');
}

// ========================================================
// CONSULTA PÚBLICA DE CANDIDATOS (STATUS === 'DEFERIDA')
// ========================================================
function onPublicStateFilterChange() {
  const stateSelect = document.getElementById('filter-estado');
  const citySelect = document.getElementById('filter-cidade');
  if (!stateSelect || !citySelect) {
    renderConfirmedCandidates();
    return;
  }

  const selectedState = stateSelect.value;
  if (selectedState === 'ALL' || !BROOKASIL_GEO[selectedState]) {
    citySelect.classList.add('hidden');
    citySelect.innerHTML = '<option value="ALL">Todas as Cidades</option>';
    citySelect.value = 'ALL';
  } else {
    const geo = BROOKASIL_GEO[selectedState];
    let optionsHtml = `<option value="ALL">Todas as Cidades (${geo.name})</option>`;
    if (geo.cities) {
      Object.entries(geo.cities).forEach(([cityKey, cityName]) => {
        optionsHtml += `<option value="${cityKey}">${cityName}</option>`;
      });
    }
    citySelect.innerHTML = optionsHtml;
    citySelect.value = 'ALL';
    citySelect.classList.remove('hidden');
  }

  renderConfirmedCandidates();
}

function renderConfirmedCandidates() {
  const grid = document.getElementById('confirmed-candidates-grid');
  if (!grid) return;

  const cargoFilter = document.getElementById('filter-cargo')?.value || 'ALL';
  const estadoFilter = document.getElementById('filter-estado')?.value || 'ALL';
  const cidadeFilterEl = document.getElementById('filter-cidade');
  const cidadeFilter = (cidadeFilterEl && !cidadeFilterEl.classList.contains('hidden')) ? (cidadeFilterEl.value || 'ALL') : 'ALL';
  const partidoFilter = document.getElementById('filter-partido')?.value || 'ALL';
  const statusFilter = document.getElementById('filter-status')?.value || 'deferida';
  const searchInput = document.getElementById('filter-search');
  const searchFilter = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();

  const filtered = candidaciesList.filter(c => {
    if (!c) return false;
    if (c.status === 'excluida') return false;

    // REGRA DE HOMOLOGAÇÃO: O status DEVE ser rigorosamente respeitado!
    // Se o filtro for 'deferida' (padrão), NUNCA exibe pendentes, mesmo se houver busca de texto!
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

    if (searchFilter) {
      const bName = String(c.ballotName || '').toLowerCase();
      const fName = String(c.fullName || '').toLowerCase();
      const num = String(c.number !== undefined && c.number !== null ? c.number : '');
      const pAcronym = String(c.partyAcronym || '').toLowerCase();
      const prot = String(c.protocol || '').toLowerCase();
      const matchesSearch = bName.includes(searchFilter) || fName.includes(searchFilter) || num.includes(searchFilter) || pAcronym.includes(searchFilter) || prot.includes(searchFilter);
      if (!matchesSearch) return false;
    }

    if (cargoFilter !== 'ALL' && c.office !== cargoFilter) return false;
    if (estadoFilter !== 'ALL' && String(c.stateId || c.state || '').toLowerCase() !== estadoFilter.toLowerCase()) return false;
    if (cidadeFilter !== 'ALL' && String(c.cityId || c.city || '').toLowerCase() !== cidadeFilter.toLowerCase()) return false;
    if (partidoFilter !== 'ALL' && String(c.partyId) !== String(partidoFilter)) return false;

    return true;
  });

  const badge = document.getElementById('confirmed-count-badge');
  if (badge) {
    const deferidasCount = candidaciesList.filter(c => c.status === 'deferida').length;
    const pendentesCount = candidaciesList.filter(c => c.status === 'pendente').length;
    if (statusFilter === 'deferida') {
      badge.textContent = `${filtered.length} Candidato${filtered.length === 1 ? '' : 's'} Homologado${filtered.length === 1 ? '' : 's'} (Deferidos)`;
    } else if (statusFilter === 'pendente') {
      badge.textContent = `${filtered.length} Candidatura${filtered.length === 1 ? '' : 's'} em Análise (Aguardando Decisão do TRE)`;
    } else if (statusFilter === 'indeferida') {
      badge.textContent = `${filtered.length} Candidatura${filtered.length === 1 ? '' : 's'} Indeferida${filtered.length === 1 ? '' : 's'}`;
    } else {
      badge.textContent = `${filtered.length} Total (${deferidasCount} Homologadas, ${pendentesCount} em Análise)`;
    }
  }

  if (filtered.length === 0) {
    const isPendenteFilter = statusFilter === 'pendente';
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500">
        <i data-lucide="${isPendenteFilter ? 'clock' : 'users'}" class="w-12 h-12 mx-auto text-slate-600 mb-3"></i>
        <p class="font-bold text-base text-slate-400">Nenhuma candidatura localizada com os filtros selecionados.</p>
        <p class="text-xs text-slate-500 mt-1">${statusFilter === 'deferida' ? 'Apenas candidaturas homologadas pelo TRE são listadas nesta tela oficial. Candidaturas recém-enviadas estão em análise e podem ser consultadas no menu "Consultar".' : 'Tente alterar os termos de busca ou filtros.'}</p>
      </div>
    `;
    initIcons();
    return;
  }

  grid.innerHTML = filtered.map(c => {
    const isPendente = c.status === 'pendente';
    const isIndeferida = c.status === 'indeferida';
    const isDeferida = c.status === 'deferida';

    return `
    <div class="glass-panel rounded-3xl border ${isPendente ? 'border-amber-500/60 bg-amber-950/20' : (isIndeferida ? 'border-red-500/60 bg-red-950/20' : 'border-brand-border/70 hover:border-brand-electric/50')} transition-all p-5 flex flex-col justify-between group">
      <div>
        ${isPendente ? `
          <div class="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-[11px] text-amber-300 font-extrabold flex items-center gap-1.5">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
            <span>⚠️ NÃO HOMOLOGADO • Aguarda Julgamento do TRE</span>
          </div>
        ` : (isIndeferida ? `
          <div class="mb-3 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/50 text-[11px] text-red-300 font-extrabold flex items-center gap-1.5">
            <i data-lucide="x-circle" class="w-3.5 h-3.5 text-red-400 shrink-0"></i>
            <span>❌ INDEFERIDO • Rejeitado pelo Tribunal</span>
          </div>
        ` : `
          <div class="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold flex items-center gap-1.5">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>
            <span>✅ HOMOLOGADO • Apto pelo TRE</span>
          </div>
        `)}

        <div class="relative h-48 rounded-2xl overflow-hidden mb-4 bg-brand-deep">
          <img src="${c.photo}" alt="${c.ballotName}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute top-3 right-3 px-3 py-1 rounded-xl bg-brand-navy/90 backdrop-blur-md border border-brand-border text-brand-gold font-mono font-bold text-sm shadow-md">
            ${c.number}
          </div>
          <div class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
            isDeferida ? 'bg-emerald-500 text-slate-950 shadow-md' :
            isPendente ? 'bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md border border-amber-300' :
            'bg-red-500 text-white shadow-md'
          }">
            ${isPendente ? '<span class="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping inline-block"></span> ⏳ Em Análise' : (isDeferida ? '✅ Homologado' : '❌ Indeferido')}
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-brand-electric uppercase tracking-wider">${c.office}</span>
            <span class="text-xs font-bold text-slate-300" style="color: ${c.partyColor || '#fff'}">${c.partyAcronym}</span>
          </div>
          <h4 class="text-lg font-bold text-white tracking-wide truncate">${c.ballotName}</h4>
          <p class="text-xs text-slate-400 truncate">${c.partyName}</p>
        </div>

        <div class="mt-4 pt-3 border-t border-brand-border/40 text-xs text-slate-400 space-y-1.5">
          <div class="flex justify-between">
            <span>Circunscrição:</span>
            <strong class="text-slate-200">${c.cityId && c.cityId !== 'ALL' ? (getCityDisplayName(c.stateId, c.cityId) + ' (' + getStateDisplayName(c.stateId) + ')') : getStateDisplayName(c.stateId)}</strong>
          </div>
          ${c.viceName ? `
            <div class="flex justify-between">
              <span>Vice:</span>
              <strong class="text-slate-200 truncate max-w-[130px]">${c.viceName}</strong>
            </div>
          ` : ''}
          <div class="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
            <span>Protocolo:</span>
            <strong class="text-brand-electric">${c.protocol || 'N/D'}</strong>
          </div>
          <div class="flex justify-between items-center text-[10px] pt-1">
            <span class="text-slate-400">Decisão TRE:</span>
            <strong class="${isDeferida ? 'text-emerald-400' : (isPendente ? 'text-amber-400' : 'text-red-400')}">
              ${isDeferida ? 'Homologado / Apto' : (isPendente ? 'Aguardando Julgamento' : 'Indeferido')}
            </strong>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-1.5">
          <a href="${c.tiktok.startsWith('http') ? c.tiktok : 'https://tiktok.com/' + c.tiktok}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-brand-electric text-xs font-semibold flex items-center gap-1.5 transition">
            <span>🎵</span> TikTok
          </a>
          <button onclick="viewCandidacyDetails('${c.id}')" class="px-3 py-2 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 active:bg-brand-blue/40 text-brand-electric text-xs font-semibold flex items-center gap-1.5 transition">
            <i data-lucide="info" class="w-3.5 h-3.5"></i> Ficha
          </button>
        </div>
        ${c.proposalPdf ? `
          <button onclick="downloadOrViewPdf('${c.id}')" class="px-3 py-2 rounded-xl bg-brand-gold/15 hover:bg-brand-gold/25 active:bg-brand-gold/30 text-brand-gold text-xs font-semibold flex items-center gap-1.5 transition">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Proposta
          </button>
        ` : ''}
      </div>
    </div>
    `;
  }).join('');
  initIcons();
}

function downloadOrViewPdf(candId) {
  const cand = candidaciesList.find(c => c.id === candId);
  if (!cand || !cand.proposalPdf) {
    showToast('info', 'Esta candidatura não possui documento PDF anexado.');
    return;
  }
  const w = window.open("");
  if (w) {
    w.document.write(`<iframe src="${cand.proposalPdf}" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  } else {
    // Caso bloqueador de pop-ups impeça window.open
    const link = document.createElement('a');
    link.href = cand.proposalPdf;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `plano_governo_${cand.ballotName || cand.protocol || 'candidato'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ========================================================
// SISTEMA DE SEGURANÇA E COMPETÊNCIA JURISDICIONAL ELEITORAL
// ========================================================
function getCompetentCourtInfo(c) {
  if (!c) {
    return {
      courtId: 'tse',
      courtName: 'Tribunal Superior Eleitoral (TSE)',
      level: 'Federal (TSE Nacional)',
      levelCode: 'tse',
      stateName: 'Nacional',
      cityName: 'Nacional',
      jurisdictionDesc: 'Todo o Território Nacional'
    };
  }

  // 1. Cargo de Presidente da República: Competência originária privativa do TSE Nacional
  if (c.office === 'Presidente') {
    return {
      courtId: 'tse',
      courtName: 'Tribunal Superior Eleitoral (TSE)',
      level: 'Federal (TSE Nacional)',
      levelCode: 'tse',
      stateName: 'Nacional',
      cityName: 'Nacional',
      jurisdictionDesc: 'Todo o Território Nacional'
    };
  }

  const stateKey = String(c.stateId || c.state || 'brookhaven').toLowerCase().trim();
  const stateConfig = BROOKASIL_GEO[stateKey];
  const stateName = stateConfig ? stateConfig.name : (getStateDisplayName(stateKey) || stateKey);

  // 2. Cargos Municipais (Prefeito e Vereador): Competência originária do respectivo TRE Municipal
  if (isMunicipalOffice(c.office)) {
    const cityKey = String(c.cityId || c.city || '').toLowerCase().trim();
    const cityName = stateConfig?.cities?.[cityKey] || getCityDisplayName(stateKey, cityKey) || cityKey;

    const cred = (activeCourtCredentials || []).find(cr => 
      cr.role === 'tre_municipal' &&
      String(cr.state).toLowerCase().trim() === stateKey &&
      String(cr.city).toLowerCase().trim() === cityKey
    );

    const officialName = cred ? cred.name : `TRE ${cityName}`;
    return {
      courtId: cred ? cred.id : `tre_${cityKey}`,
      courtName: officialName,
      level: '1ª Instância Municipal',
      levelCode: 'tre_municipal',
      stateKey,
      cityKey,
      stateName,
      cityName,
      jurisdictionDesc: `Município de ${cityName} (${stateName})`
    };
  }

  // 3. Cargos Estaduais / Federais Proporcionais (Governador, Senador, Dep. Federal, Dep. Estadual):
  // Competência privativa do TRE Estadual
  const cred = (activeCourtCredentials || []).find(cr => 
    cr.role === 'tre_estadual' &&
    String(cr.state).toLowerCase().trim() === stateKey
  );
  const officialName = cred ? cred.name : `TRE ${stateName}`;
  return {
    courtId: cred ? cred.id : `tre_${stateKey}`,
    courtName: officialName,
    level: '1ª Instância Estadual',
    levelCode: 'tre_estadual',
    stateKey,
    stateName,
    cityName: 'Estado Inteiro',
    jurisdictionDesc: `Estado de ${stateName}`
  };
}

function canUserJudgeCandidate(c, user) {
  if (!user) {
    return {
      allowed: false,
      reason: 'Acesso negado: Nenhuma sessão judicial ativa.',
      competentCourtName: 'Não identificado'
    };
  }
  if (!c) {
    return {
      allowed: false,
      reason: 'Candidatura inválida.',
      competentCourtName: 'Não identificado'
    };
  }

  const comp = getCompetentCourtInfo(c);

  // 1. Cargo de Presidente: Exclusividade do TSE Nacional
  if (c.office === 'Presidente') {
    if (user.role === 'tse' || user.id === 'tse') {
      return {
        allowed: true,
        competentCourtName: comp.courtName,
        level: comp.level,
        isOriginatingCourt: true
      };
    }
    return {
      allowed: false,
      competentCourtName: comp.courtName,
      level: comp.level,
      reason: `Incompetência Jurisdicional: O julgamento e homologação de candidatura a Presidente da República são de competência originária exclusiva do Tribunal Superior Eleitoral (TSE). O tribunal "${user.name}" não possui jurisdição eleitoral federal.`
    };
  }

  // 2. Cargos Municipais (Prefeito e Vereador): Exclusividade do TRE Municipal daquela comarca
  if (isMunicipalOffice(c.office)) {
    const candState = String(c.stateId || c.state || '').toLowerCase().trim();
    const candCity = String(c.cityId || c.city || '').toLowerCase().trim();
    const userState = String(user.state || '').toLowerCase().trim();
    const userCity = String(user.city || '').toLowerCase().trim();

    if (user.role === 'tre_municipal' && userState === candState && userCity === candCity) {
      return {
        allowed: true,
        competentCourtName: comp.courtName,
        level: comp.level,
        isOriginatingCourt: true
      };
    }

    if (user.role === 'tse' || user.id === 'tse') {
      return {
        allowed: false,
        competentCourtName: comp.courtName,
        level: comp.level,
        reason: `Incompetência de 1ª Instância: Esta candidatura é MUNICIPAL (${c.office} em ${comp.cityName}) e tramita sob a competência privativa do ${comp.courtName}. A legislação eleitoral proíbe que o TSE homologue registros municipais sem a prévia homologação pelo TRE local competente.`
      };
    }

    if (user.role === 'tre_estadual') {
      return {
        allowed: false,
        competentCourtName: comp.courtName,
        level: comp.level,
        reason: `Incompetência de Grau: Candidaturas municipais de ${comp.cityName} devem ser homologadas pelo ${comp.courtName}, não pelo TRE Estadual.`
      };
    }

    return {
      allowed: false,
      competentCourtName: comp.courtName,
      level: comp.level,
      reason: `Incompetência Territorial: Esta candidatura pertence à jurisdição exclusiva do ${comp.courtName}. O tribunal "${user.name}" não possui competência sobre este município.`
    };
  }

  // 3. Cargos Estaduais (Governador, Senador, Deputado Federal, Deputado Estadual): Competência do TRE Estadual
  const candState = String(c.stateId || c.state || '').toLowerCase().trim();
  const userState = String(user.state || '').toLowerCase().trim();

  if (user.role === 'tre_estadual' && userState === candState) {
    return {
      allowed: true,
      competentCourtName: comp.courtName,
      level: comp.level,
      isOriginatingCourt: true
    };
  }

  if (user.role === 'tse' || user.id === 'tse') {
    return {
      allowed: false,
      competentCourtName: comp.courtName,
      level: comp.level,
      reason: `Incompetência Originária: Esta candidatura estadual (${c.office} - ${comp.stateName}) é de competência privativa do ${comp.courtName}. O TSE não homologa registros estaduais originários.`
    };
  }

  return {
    allowed: false,
    competentCourtName: comp.courtName,
    level: comp.level,
    reason: `Incompetência Territorial: Esta candidatura tramita perante o ${comp.courtName}. Seu tribunal ("${user.name}") não possui jurisdição sobre o estado de ${comp.stateName}.`
  };
}

// ========================================================
// FICHA OFICIAL / DETALHES COMPLETOS DA CANDIDATURA
// ========================================================
let selectedCandForDetails = null;

function viewCandidacyDetails(candId) {
  const c = candidaciesList.find(item => String(item.id) === String(candId));
  if (!c) {
    showToast('error', 'Candidatura não localizada no registro oficial.');
    return;
  }
  selectedCandForDetails = c;

  const modal = document.getElementById('candidacy-details-modal');
  if (!modal) return;

  // Foto
  const photoEl = document.getElementById('details-cand-photo');
  if (photoEl) {
    photoEl.src = c.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
    photoEl.alt = c.ballotName || 'Candidato';
  }

  // Nome e Protocolo
  const badgeEl = document.getElementById('details-cand-badge');
  if (badgeEl) {
    const st = c.status || 'pendente';
    badgeEl.textContent = st === 'deferida' ? 'APTA (HOMOLOGADA)' : (st === 'indeferida' ? 'INDEFERIDA' : (st === 'excluida' ? 'EXCLUÍDA' : 'EM ANÁLISE'));
    badgeEl.className = `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      st === 'deferida' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
      st === 'indeferida' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
      st === 'excluida' ? 'bg-slate-700 text-slate-300' :
      'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    }`;
  }

  const protoEl = document.getElementById('details-cand-protocol');
  if (protoEl) protoEl.textContent = `PROT: ${c.protocol || 'N/D'}`;

  const nameEl = document.getElementById('details-cand-name');
  if (nameEl) nameEl.textContent = c.ballotName || 'Candidato';

  const fullNameEl = document.getElementById('details-cand-fullname');
  if (fullNameEl) fullNameEl.textContent = c.fullName ? `Nome Legal: ${c.fullName}` : '';

  const circ = c.cityId && c.cityId !== 'ALL' 
    ? `${getCityDisplayName(c.stateId, c.cityId)} - ${getStateDisplayName(c.stateId)}`
    : getStateDisplayName(c.stateId);
  const subEl = document.getElementById('details-cand-sub');
  if (subEl) subEl.textContent = `${c.office} • ${c.partyAcronym} • ${circ}`;

  // Número
  const numEl = document.getElementById('details-cand-number');
  if (numEl) numEl.textContent = c.number || '--';

  // Partido
  const partyBox = document.getElementById('details-cand-party-box');
  if (partyBox) {
    partyBox.textContent = c.partyAcronym || '--';
    partyBox.style.backgroundColor = c.partyColor || '#2563eb';
  }
  const partyNameEl = document.getElementById('details-cand-party-name');
  if (partyNameEl) partyNameEl.textContent = `${c.partyName || ''} (${c.partyNumber || c.partyAcronym || ''})`;

  // Cargo e Circunscrição
  const officeEl = document.getElementById('details-cand-office');
  if (officeEl) officeEl.textContent = c.office || '--';

  const jurisEl = document.getElementById('details-cand-jurisdiction');
  if (jurisEl) jurisEl.textContent = circ;

  // Vice e Coligação
  const viceEl = document.getElementById('details-cand-vice');
  if (viceEl) viceEl.textContent = c.viceName || 'Não aplicável (Cargo proporcional ou sem vice informado)';

  const colEl = document.getElementById('details-cand-coalition');
  if (colEl) colEl.textContent = c.coalition || 'Candidatura Isolada / Sem Coligação';

  // TikTok
  const tiktokLink = document.getElementById('details-cand-tiktok');
  const tiktokText = document.getElementById('details-cand-tiktok-text');
  if (tiktokLink && tiktokText) {
    if (c.tiktok) {
      tiktokText.textContent = c.tiktok;
      tiktokLink.href = c.tiktok.startsWith('http') ? c.tiktok : `https://tiktok.com/${c.tiktok.replace(/^@/, '')}`;
      tiktokLink.classList.remove('pointer-events-none', 'opacity-50');
    } else {
      tiktokText.textContent = 'Não informado';
      tiktokLink.href = '#';
      tiktokLink.classList.add('pointer-events-none', 'opacity-50');
    }
  }

  // PDF
  const pdfContainer = document.getElementById('details-cand-pdf-container');
  if (pdfContainer) {
    if (c.proposalPdf) {
      pdfContainer.innerHTML = `
        <button onclick="downloadOrViewPdf('${c.id}')" class="px-3 py-1.5 rounded-xl bg-brand-gold/20 hover:bg-brand-gold/30 active:bg-brand-gold/40 text-brand-gold font-bold text-xs flex items-center gap-1.5 transition">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Abrir Plano de Governo (PDF)
        </button>
      `;
    } else {
      pdfContainer.innerHTML = `<span class="text-slate-500 italic text-xs">Nenhum PDF anexado na inscrição</span>`;
    }
  }

  // Competência Jurisdicional de 1ª Instância
  const compInfo = getCompetentCourtInfo(c);
  const courtNameEl = document.getElementById('details-cand-competent-court-name');
  if (courtNameEl) courtNameEl.textContent = `${compInfo.courtName} • ${compInfo.jurisdictionDesc}`;

  const compBadgeEl = document.getElementById('details-cand-competence-badge');
  if (compBadgeEl) {
    compBadgeEl.textContent = compInfo.level;
    compBadgeEl.className = `px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 self-start sm:self-center ${
      compInfo.levelCode === 'tse' 
        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        : (compInfo.levelCode === 'tre_estadual' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
    }`;
  }

  // Propostas texto
  const propSec = document.getElementById('details-cand-proposals-section');
  const propText = document.getElementById('details-cand-proposals-text');
  if (propSec && propText) {
    if (c.proposalsText && c.proposalsText.trim()) {
      propText.textContent = c.proposalsText;
      propSec.classList.remove('hidden');
    } else {
      propSec.classList.add('hidden');
    }
  }

  // Decisão Judicial
  const judSec = document.getElementById('details-cand-judgment-section');
  const judReason = document.getElementById('details-cand-judgment-reason');
  const judBy = document.getElementById('details-cand-judged-by');
  if (judSec && judReason && judBy) {
    if (c.rejectionReason || c.judgedBy || c.status === 'deferida' || c.status === 'indeferida') {
      judReason.textContent = c.rejectionReason || (c.status === 'deferida' ? 'Candidatura deferida pelo Tribunal após preenchimento tempestivo de todas as exigências legais e constitucionais de elegibilidade.' : 'Sem despacho fundamentado.');
      judBy.textContent = c.judgedBy ? `Magistrado: ${c.judgedBy}` : (c.competentCourt ? `Tribunal: ${c.competentCourt}` : 'Tribunal Eleitoral');
      judSec.classList.remove('hidden');
    } else {
      judSec.classList.add('hidden');
    }
  }

  // Data de criação
  const dateEl = document.getElementById('details-cand-created-at');
  if (dateEl) {
    dateEl.textContent = c.createdAt ? new Date(c.createdAt).toLocaleString('pt-BR') : '--';
  }

  // Ações do Juiz (se autenticado)
  const judgeActionsEl = document.getElementById('details-cand-judge-actions');
  if (judgeActionsEl) {
    if (currentUser) {
      const judgeAuth = canUserJudgeCandidate(c, currentUser);
      let html = '';

      if (currentUser.role === 'tse') {
        html += `
          <button onclick="closeCandidacyDetailsModal(); openTseEditCandidateModal('${c.id}');" class="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50 active:scale-98 font-bold text-xs flex items-center gap-1.5 transition">
            <i data-lucide="edit-3" class="w-4 h-4 text-purple-300"></i> Retificar Cadastro (TSE)
          </button>
        `;
      }

      if (judgeAuth.allowed) {
        html += `
          <button onclick="closeCandidacyDetailsModal(); openJudgmentModal('${c.id}');" class="px-4 py-2.5 rounded-xl bg-brand-gold text-slate-950 hover:bg-yellow-400 active:scale-98 font-extrabold text-xs flex items-center gap-1.5 shadow-glow-gold transition">
            <i data-lucide="gavel" class="w-4 h-4"></i> Julgar / Apreciar
          </button>
        `;
      } else {
        html += `
          <button onclick="closeCandidacyDetailsModal(); openJudgmentModal('${c.id}');" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition" title="${judgeAuth.reason}">
            <i data-lucide="scale" class="w-4 h-4 text-brand-electric"></i> Ver Processo (${compInfo.courtName})
          </button>
        `;
      }

      judgeActionsEl.innerHTML = html;
    } else {
      judgeActionsEl.innerHTML = '';
    }
  }

  modal.classList.remove('hidden');
  initIcons();
}

function closeCandidacyDetailsModal() {
  const modal = document.getElementById('candidacy-details-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  selectedCandForDetails = null;
}

window.viewCandidacyDetails = viewCandidacyDetails;
window.closeCandidacyDetailsModal = closeCandidacyDetailsModal;

// ========================================================
// CATÁLOGO DE PARTIDOS POLÍTICOS (43 LEGENDAS)
// ========================================================
function setPartyGroupFilter(group) {
  activePartyTab = group;
  document.querySelectorAll('.party-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-group') === group) {
      btn.className = "party-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-brand-blue text-white";
    } else {
      btn.className = "party-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition text-slate-300 hover:bg-white/5";
    }
  });
  renderPartiesCatalog();
}

function renderPartiesCatalog() {
  const grid = document.getElementById('parties-grid');
  if (!grid) return;

  const filtered = partiesList.filter(p => activePartyTab === 'ALL' || p.group === activePartyTab);

  grid.innerHTML = filtered.map(p => {
    const candCount = candidaciesList.filter(c => c.status === 'deferida' && String(c.partyId) === String(p.id)).length;
    const isSuspended = p.status === 'suspenso';
    const isFormacao = p.status === 'formacao';

    return `
      <div class="glass-panel p-5 rounded-3xl border border-brand-border hover:border-brand-electric/50 transition-all flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              ${p.logo ? `
                <div class="w-12 h-12 rounded-2xl bg-white/5 border border-brand-border p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="${p.logo}" alt="${p.acronym}" class="w-full h-full object-contain">
                </div>
              ` : ''}
              <span class="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-white text-base shadow-md shrink-0" style="background-color: ${p.color}">
                ${p.number}
              </span>
            </div>

            <div class="flex flex-col items-end gap-1">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                p.group === 'Direita' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                p.group === 'Centro' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }">
                ${p.group}
              </span>
              ${isSuspended ? `
                <span class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                  Suspenso
                </span>
              ` : isFormacao ? `
                <span class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Em Formação
                </span>
              ` : ''}
            </div>
          </div>

          <h4 class="font-bold text-lg text-white group-hover:text-brand-electric transition-colors">${p.acronym}</h4>
          <p class="text-xs text-slate-300 font-medium line-clamp-2 mt-0.5">${p.name}</p>

          ${p.motto ? `
            <p class="text-[11px] text-brand-gold/90 italic line-clamp-1 mt-2">"${p.motto}"</p>
          ` : ''}

          <div class="mt-3 space-y-1 text-[11px] text-slate-400">
            ${p.leader ? `
              <div class="flex items-center justify-between">
                <span>Presidente:</span>
                <strong class="text-slate-200 truncate max-w-[140px]">${p.leader}</strong>
              </div>
            ` : ''}
            ${p.foundation ? `
              <div class="flex items-center justify-between">
                <span>Fundação:</span>
                <strong class="text-slate-200">${p.foundation}</strong>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-brand-border/50 flex items-center justify-between text-xs">
          <div class="flex items-center gap-1.5 text-slate-400">
            <span>Candidatos:</span>
            <span class="font-bold text-brand-gold font-mono">${candCount}</span>
          </div>
          <div class="flex items-center gap-1.5">
            ${p.website ? `
              <a href="${p.website.startsWith('http') ? p.website : 'https://' + p.website}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition" title="Site Oficial">
                <i data-lucide="globe" class="w-3.5 h-3.5"></i>
              </a>
            ` : ''}
            ${currentUser && currentUser.role === 'tse' ? `
              <button onclick="openPartyModal('${p.id}')" class="px-2 py-1 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/40 text-brand-electric text-[11px] font-bold flex items-center gap-1 border border-brand-electric/30 transition" title="Editar">
                <i data-lucide="edit-3" class="w-3 h-3"></i>
                <span class="hidden sm:inline">Editar</span>
              </button>
              <button onclick="confirmDeleteParty('${p.id}')" class="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold flex items-center gap-1 border border-red-500/30 transition" title="Excluir">
                <i data-lucide="trash-2" class="w-3 h-3"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  initIcons();
}

// ========================================================
// BUSCA INSTANTÂNEA POR PROTOCOLO OU NOME
// ========================================================
function handleQuickSearch(e) {
  if (e.key === 'Enter') executeQuickSearch();
}

function executeQuickSearch() {
  const searchInput = document.getElementById('quick-search-input');
  const query = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
  const resultsContainer = document.getElementById('search-results-container');
  if (!resultsContainer) return;
  if (!query) {
    resultsContainer.innerHTML = '<p class="text-center text-xs text-slate-500">Digite um protocolo ou nome para buscar.</p>';
    return;
  }

  const matches = candidaciesList.filter(c => {
    if (!c) return false;
    const protocol = String(c.protocol || '').toLowerCase();
    const ballotName = String(c.ballotName || '').toLowerCase();
    const fullName = String(c.fullName || '').toLowerCase();
    const number = String(c.number !== undefined && c.number !== null ? c.number : '');
    return protocol.includes(query) || ballotName.includes(query) || fullName.includes(query) || number.includes(query);
  });

  if (matches.length === 0) {
    resultsContainer.innerHTML = `
      <div class="glass-panel p-8 rounded-3xl border border-brand-border text-center">
        <i data-lucide="alert-circle" class="w-10 h-10 text-slate-500 mx-auto mb-2"></i>
        <p class="font-bold text-white">Nenhum registro localizado</p>
        <p class="text-xs text-slate-400 mt-1">Verifique o código de protocolo ou número digitado.</p>
      </div>
    `;
    initIcons();
    return;
  }

  resultsContainer.innerHTML = matches.map(c => {
    const isPendente = c.status === 'pendente';
    const isDeferida = c.status === 'deferida';
    const isIndeferida = c.status === 'indeferida';

    return `
    <div class="glass-panel p-6 rounded-3xl border ${isPendente ? 'border-amber-500/60 bg-amber-950/20' : (isIndeferida ? 'border-red-500/60 bg-red-950/20' : 'border-brand-border/80')} flex flex-col md:flex-row items-start md:items-center gap-6">
      <img src="${c.photo}" alt="${c.ballotName}" class="w-24 h-28 rounded-2xl object-cover border border-brand-border bg-brand-deep shrink-0">
      <div class="flex-1 space-y-2 w-full">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-brand-gold bg-brand-navy px-2.5 py-1 rounded-lg border border-brand-border">${c.protocol}</span>
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isDeferida ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              isIndeferida ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
              'bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5'
            }">
              ${isPendente ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> ⏳ Em Análise (Não Homologado)' : (isDeferida ? '✅ Homologado (Deferido)' : '❌ Indeferido')}
            </span>
          </div>
          <span class="text-xs text-slate-400 font-mono">Cadastrado em: ${c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '--'}</span>
        </div>

        <div>
          <h4 class="text-2xl font-bold text-white">${c.ballotName}</h4>
          <p class="text-xs text-slate-300">${c.fullName || ''} • <strong class="text-brand-electric font-mono text-sm">${c.number}</strong> (${c.partyAcronym})</p>
          <p class="text-xs text-slate-400 mt-0.5">Cargo: <strong class="text-slate-200">${c.office}</strong> • Circunscrição: <strong class="text-slate-200">${c.cityId && c.cityId !== 'ALL' ? (getCityDisplayName(c.stateId, c.cityId) + ' - ' + getStateDisplayName(c.stateId)) : getStateDisplayName(c.stateId)}</strong></p>
        </div>

        ${isPendente ? `
          <div class="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 space-y-1">
            <div class="flex items-center gap-2 font-bold text-amber-300">
              <i data-lucide="clock" class="w-4 h-4 text-amber-400 shrink-0"></i>
              <span>CANDIDATURA NÃO HOMOLOGADA (AGUARDANDO DECISÃO DO TRE)</span>
            </div>
            <p class="text-[11px] text-slate-300">
              O pedido foi protocolado com sucesso e está sob exame da Justiça Eleitoral. O candidato <strong>NÃO está apto para concorrer nem consta como homologado</strong> até que o Tribunal Eleitoral competente aprecie os documentos e profira a decisão de deferimento.
            </p>
          </div>
        ` : (isDeferida ? `
          <div class="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 space-y-1">
            <div class="flex items-center gap-2 font-bold text-emerald-300">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400 shrink-0"></i>
              <span>CANDIDATURA HOMOLOGADA E DEFERIDA PELO TRIBUNAL</span>
            </div>
            <p class="text-[11px] text-slate-300">
              Registro deferido por <strong>${c.judgedBy || 'Tribunal Eleitoral'}</strong>${c.judgedAt ? ` em ${new Date(c.judgedAt).toLocaleDateString('pt-BR')}` : ''}. O candidato está oficialmente apto para a disputa das eleições.
            </p>
          </div>
        ` : `
          <div class="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-xs text-red-200 space-y-1">
            <div class="flex items-center gap-2 font-bold text-red-300">
              <i data-lucide="x-circle" class="w-4 h-4 text-red-400 shrink-0"></i>
              <span>CANDIDATURA INDEFERIDA PELA JUSTIÇA ELEITORAL</span>
            </div>
            <p class="text-[11px] text-slate-300">
              Motivo do indeferimento: <strong class="text-red-300">${c.rejectionReason || 'Não informado pelo Tribunal'}</strong>.
            </p>
          </div>
        `)}
      </div>
    </div>
    `;
  }).join('');
  initIcons();
}

// ========================================================
// AUTENTICAÇÃO E PAINEL ADMINISTRATIVO (TSE / TRE)
// ========================================================
function checkAuthSession() {
  const sessionStr = sessionStorage.getItem('brookasil_admin_session');
  if (sessionStr) {
    try {
      currentUser = JSON.parse(sessionStr);
      updateAuthUI();
      if (window.location.hash === '#admin') {
        navigateTo('admin');
      }
    } catch (e) {
      sessionStorage.removeItem('brookasil_admin_session');
      updateAuthUI();
    }
  } else {
    updateAuthUI();
  }
}

function updateAuthUI() {
  const container = document.getElementById('auth-buttons-container');
  if (!container) return;

  if (currentUser) {
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="navigateTo('admin')" class="px-3.5 py-2 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-electric/40 text-brand-electric text-xs font-bold flex items-center gap-2">
          <i data-lucide="shield-check" class="w-4 h-4"></i> Painel (${currentUser.role.toUpperCase()})
        </button>
        <button onclick="handleAdminLogout()" class="p-2 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition" title="Sair">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    setupAdminView();
  } else {
    container.innerHTML = `
      <button onclick="openLoginModal('tse')" class="px-4 py-2 rounded-xl bg-brand-deep hover:bg-brand-deep/80 border border-brand-border text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition">
        <i data-lucide="lock" class="w-3.5 h-3.5 text-brand-gold"></i> Painel TSE
      </button>
    `;
  }
  initIcons();
}

function openLoginModal(courtId = 'tse') {
  const modal = document.getElementById('login-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const courtSelect = document.getElementById('login-court-select');
  if (courtSelect) {
    courtSelect.value = courtId;
    onCourtSelectChange(courtId);
  }
  const passInput = document.getElementById('login-password');
  if (passInput) {
    passInput.value = '';
    setTimeout(() => passInput.focus(), 50);
  }
  initIcons();
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('hidden');
}

function onCourtSelectChange(courtId) {
  const usernameInput = document.getElementById('login-username');
  if (!usernameInput) return;
  if (courtId === 'manual') {
    usernameInput.value = '';
    usernameInput.placeholder = 'Digite o login institucional ou apelido (tse, master, tre...)';
    usernameInput.focus();
    return;
  }
  const court = activeCourtCredentials.find(c => c.id === courtId);
  if (court) {
    usernameInput.value = court.login || '';
  }
}

function normalizeCredString(str) {
  return String(str || '')
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Sincronização de credenciais de tribunais com o Firebase Realtime Database
function initCourtCredentialsListener() {
  // 1. Carrega do cache local criptografado
  try {
    const cached = localStorage.getItem('brookasil_court_credentials');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mergeActiveCourtCredentials(parsed);
      }
    }
  } catch (e) {}

  // 2. Ouve em tempo real as configurações salvas pelo TSE no nó settings/courtCredentials
  if (db) {
    db.ref('settings/courtCredentials').on('value', (snap) => {
      const data = snap.val();
      if (data) {
        let list = [];
        if (Array.isArray(data)) {
          list = data.filter(Boolean);
        } else if (typeof data === 'object') {
          list = Object.values(data);
        }
        if (list.length > 0) {
          mergeActiveCourtCredentials(list);
          try {
            localStorage.setItem('brookasil_court_credentials', JSON.stringify(activeCourtCredentials));
          } catch (e) {}
          if (isVaultUnlocked) {
            renderAdminSecurityView();
          }
        }
      }
    });
  }
}

function mergeActiveCourtCredentials(incomingList) {
  if (!Array.isArray(incomingList)) return;
  incomingList.forEach(incoming => {
    if (!incoming || !incoming.id) return;
    const idx = activeCourtCredentials.findIndex(c => c.id === incoming.id);
    if (idx !== -1) {
      activeCourtCredentials[idx] = {
        ...activeCourtCredentials[idx],
        ...incoming
      };
    } else {
      activeCourtCredentials.push(incoming);
    }
  });
}

function handleLoginSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const courtSelect = document.getElementById('login-court-select');
  const selectedCourtId = courtSelect ? courtSelect.value : '';
  const loginInput = (document.getElementById('login-username')?.value || '').trim();
  const passInput = (document.getElementById('login-password')?.value || '').trim();

  if (!passInput) {
    showToast('warning', 'Por favor, informe a Chave de Acesso / Senha.');
    return false;
  }

  const normLogin = normalizeCredString(loginInput);
  const normPass = normalizeCredString(passInput);

  let matched = null;

  const tseAcc = activeCourtCredentials.find(c => c.id === 'tse' || c.role === 'tse') || DEFAULT_COURT_CREDENTIALS[0];
  const realTsePass = tseAcc ? decryptSecret(tseAcc.encPass || tseAcc.pass) : 'ARTHUR@1971';
  const isMasterPassword = (passInput === realTsePass || normPass === normalizeCredString(realTsePass) || passInput === 'ARTHUR@1971' || normPass === 'arthur@1971');

  // 1. Se o usuário selecionou expressamente um Tribunal no seletor (dropdown):
  // Respeita estritamente o tribunal selecionado!
  if (selectedCourtId && selectedCourtId !== 'manual') {
    const candidate = activeCourtCredentials.find(c => c.id === selectedCourtId);
    if (candidate) {
      const realPass = decryptSecret(candidate.encPass || candidate.pass);
      const isCourtPass = (passInput === realPass || normPass === normalizeCredString(realPass));
      // A senha do próprio tribunal OU a senha mestra autorizam o acesso àquele tribunal específico
      if (isCourtPass || isMasterPassword) {
        matched = candidate;
      }
    }
  }

  // 2. Se não selecionou um tribunal no dropdown (modo manual ou seletor vazio), busca pelo login informado:
  if (!matched && loginInput) {
    matched = activeCourtCredentials.find(acc => {
      const accId = acc.id || '';
      const accLogin = acc.login || '';
      const isIdMatch = accId.toLowerCase() === normLogin;
      const isLoginExact = accLogin === loginInput;
      const isLoginNorm = normalizeCredString(accLogin) === normLogin;
      const isAliasMatch = acc.aliases && acc.aliases.some(al => 
        al === loginInput || normalizeCredString(al) === normLogin
      );

      if (!isIdMatch && !isLoginExact && !isLoginNorm && !isAliasMatch) return false;

      const realPass = decryptSecret(acc.encPass || acc.pass);
      const isPassExact = realPass === passInput;
      const isPassNorm = normalizeCredString(realPass) === normPass;

      return isPassExact || isPassNorm || isMasterPassword;
    });
  }

  // 3. Se ainda não casou, e informou a Senha Mestra sem login ou com login do TSE:
  if (!matched && isMasterPassword) {
    if (!loginInput || normLogin === 'tse' || normLogin === 'admin' || normLogin === 'master') {
      matched = tseAcc;
    }
  }

  // 4. Fallback: Se não preencheu o login mas a senha bate com algum tribunal
  if (!matched && !loginInput) {
    matched = activeCourtCredentials.find(acc => {
      const realPass = decryptSecret(acc.encPass || acc.pass);
      return realPass === passInput || normalizeCredString(realPass) === normPass;
    });
  }

  if (matched) {
    // Registra sessão administrativa sem expor a senha no objeto da sessão
    currentUser = {
      id: matched.id,
      name: matched.name,
      login: matched.login,
      role: matched.role,
      state: matched.state,
      city: matched.city,
      type: matched.type || matched.role
    };
    sessionStorage.setItem('brookasil_admin_session', JSON.stringify(currentUser));
    closeLoginModal();
    updateAuthUI();
    showToast('success', `Bem-vindo à Justiça Eleitoral: ${matched.name}!`);
    navigateTo('admin');
    return false;
  } else {
    showToast('error', 'Credenciais inválidas. Verifique o tribunal selecionado ou a senha informada.');
    return false;
  }
}

function handleAdminLogout() {
  currentUser = null;
  isVaultUnlocked = false;
  sessionStorage.removeItem('brookasil_admin_session');
  updateAuthUI();
  showToast('info', 'Sessão administrativa encerrada com segurança.');
  navigateTo('home');
}

function setupAdminView() {
  if (!currentUser) return;

  const nameEl = document.getElementById('admin-user-name');
  if (nameEl) nameEl.textContent = currentUser.name;
  const badgeEl = document.getElementById('admin-user-badge');
  if (badgeEl) badgeEl.textContent = currentUser.role.toUpperCase();

  const isTse = currentUser.role === 'tse' || currentUser.state === 'ALL';
  const isTreEstadual = currentUser.role === 'tre_estadual';
  const isTreMunicipal = currentUser.role === 'tre_municipal';

  let jurisText = '';
  if (isTse) {
    jurisText = 'Jurisdição Plena Nacional — Acesso a TODOS os candidatos do país';
  } else if (isTreEstadual) {
    jurisText = `Jurisdição Estadual — Candidaturas do Estado de ${getStateDisplayName(currentUser.state)}`;
  } else if (isTreMunicipal) {
    jurisText = `Jurisdição Municipal — Candidaturas de ${getCityDisplayName(currentUser.state, currentUser.city)} (${getStateDisplayName(currentUser.state)})`;
  } else {
    jurisText = `Jurisdição: ${currentUser.state || 'Nacional'}`;
  }

  const jurisEl = document.getElementById('admin-user-jurisdiction');
  if (jurisEl) jurisEl.textContent = jurisText;

  // Controle de permissões (Apenas TSE pode gerenciar eleições, partidos e segurança de credenciais)
  const elecBtn = document.getElementById('admin-tab-eleicoes-btn');
  const partBtn = document.getElementById('admin-tab-partidos-btn');
  const secBtn = document.getElementById('admin-tab-seguranca-btn');
  const partyFilter = document.getElementById('admin-filter-partido');
  const stateFilter = document.getElementById('admin-filter-estado');
  const cityFilter = document.getElementById('admin-filter-cidade');

  if (elecBtn && elecBtn.style) elecBtn.style.display = isTse ? 'inline-flex' : 'none';
  if (partBtn && partBtn.style) partBtn.style.display = isTse ? 'inline-flex' : 'none';
  if (secBtn && secBtn.style) secBtn.style.display = isTse ? 'inline-flex' : 'none';
  if (partyFilter && partyFilter.style) partyFilter.style.display = isTse ? 'block' : 'none';
  if (stateFilter && stateFilter.style) stateFilter.style.display = isTse ? 'block' : 'none';

  // Configuração inicial do filtro de cidades no Admin
  if (cityFilter) {
    if (isTse) {
      const currentState = stateFilter ? stateFilter.value : 'ALL';
      if (currentState !== 'ALL' && BROOKASIL_GEO[currentState]) {
        const geo = BROOKASIL_GEO[currentState];
        let optionsHtml = `<option value="ALL">Todas as Cidades (${geo.name})</option>`;
        if (geo.cities) {
          Object.entries(geo.cities).forEach(([cityKey, cityName]) => {
            optionsHtml += `<option value="${cityKey}">${cityName}</option>`;
          });
        }
        cityFilter.innerHTML = optionsHtml;
        cityFilter.classList.remove('hidden');
      } else {
        cityFilter.classList.add('hidden');
        cityFilter.innerHTML = '<option value="ALL">Todas as Cidades</option>';
        cityFilter.value = 'ALL';
      }
    } else if (isTreEstadual && currentUser.state && BROOKASIL_GEO[currentUser.state]) {
      const geo = BROOKASIL_GEO[currentUser.state];
      let optionsHtml = `<option value="ALL">Todas as Cidades (${geo.name})</option>`;
      if (geo.cities) {
        Object.entries(geo.cities).forEach(([cityKey, cityName]) => {
          optionsHtml += `<option value="${cityKey}">${cityName}</option>`;
        });
      }
      cityFilter.innerHTML = optionsHtml;
      cityFilter.classList.remove('hidden');
    } else {
      cityFilter.classList.add('hidden');
      cityFilter.innerHTML = '<option value="ALL">Todas as Cidades</option>';
      cityFilter.value = 'ALL';
    }
  }

  renderAdminCandidacies();
}

function onAdminStateFilterChange() {
  const stateSelect = document.getElementById('admin-filter-estado');
  const citySelect = document.getElementById('admin-filter-cidade');
  if (!stateSelect || !citySelect) {
    renderAdminCandidacies();
    return;
  }

  const selectedState = stateSelect.value;
  if (selectedState === 'ALL' || !BROOKASIL_GEO[selectedState]) {
    citySelect.classList.add('hidden');
    citySelect.innerHTML = '<option value="ALL">Todas as Cidades</option>';
    citySelect.value = 'ALL';
  } else {
    const geo = BROOKASIL_GEO[selectedState];
    let optionsHtml = `<option value="ALL">Todas as Cidades (${geo.name})</option>`;
    if (geo.cities) {
      Object.entries(geo.cities).forEach(([cityKey, cityName]) => {
        optionsHtml += `<option value="${cityKey}">${cityName}</option>`;
      });
    }
    citySelect.innerHTML = optionsHtml;
    citySelect.value = 'ALL';
    citySelect.classList.remove('hidden');
  }

  renderAdminCandidacies();
}

function switchAdminTab(tabId) {
  if (tabId === 'seguranca') {
    if (!currentUser || (currentUser.role !== 'tse' && currentUser.state !== 'ALL')) {
      showToast('error', 'Acesso negado: Apenas a Presidência do TSE pode gerenciar credenciais dos tribunais.');
      return;
    }
  }

  document.querySelectorAll('.admin-subview').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = "admin-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-brand-blue text-white whitespace-nowrap";
    } else {
      btn.className = "admin-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition text-slate-300 hover:bg-white/5 whitespace-nowrap";
    }
  });

  const sub = document.getElementById('admin-subview-' + tabId);
  if (sub) sub.classList.remove('hidden');

  if (tabId === 'estatisticas') updateAdminCharts();
  if (tabId === 'eleicoes') renderAdminElections();
  if (tabId === 'partidos') renderAdminParties();
  if (tabId === 'candidaturas') renderAdminCandidacies();
  if (tabId === 'seguranca') renderAdminSecurityView();
  initIcons();
}

// ========================================================
// GESTÃO DE SEGURANÇA E CREDENCIAIS DOS TRIBUNAIS (TSE EXCLUSIVO)
// ========================================================
let isVaultUnlocked = false;
let secCourtFilter = 'all';
let secSearchQuery = '';

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  if (btnEl) {
    btnEl.innerHTML = isPass ? '<i data-lucide="eye-off" class="w-4 h-4"></i>' : '<i data-lucide="eye" class="w-4 h-4"></i>';
    initIcons();
  }
}

function generateStrongPassword(courtId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const generated = `TRE#2026!${rand}`;
  const input = document.getElementById(`cred-pass-${courtId}`);
  if (input) {
    input.value = generated;
    input.type = 'text';
    const btn = document.getElementById(`btn-eye-${courtId}`);
    if (btn) btn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
    initIcons();
    showToast('info', 'Nova chave de acesso forte gerada! Clique em "Salvar" para confirmar.');
  }
}

function handleUnlockVault(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!currentUser || (currentUser.role !== 'tse' && currentUser.state !== 'ALL')) {
    showToast('error', 'Apenas a Presidência do TSE pode desbloquear o cofre de segurança.');
    return false;
  }
  const passInput = document.getElementById('vault-master-pass');
  if (!passInput) return false;
  const enteredPass = passInput.value.trim();
  const normEntered = normalizeCredString(enteredPass);

  // Busca a senha atual do TSE
  const tseAcc = activeCourtCredentials.find(c => c.id === 'tse' || c.role === 'tse') || DEFAULT_COURT_CREDENTIALS[0];
  const tsePass = tseAcc ? decryptSecret(tseAcc.encPass || tseAcc.pass) : 'ARTHUR@1971';
  const normTsePass = normalizeCredString(tsePass);

  if (enteredPass === tsePass || normEntered === normTsePass || enteredPass === 'ARTHUR@1971' || normEntered === 'arthur@1971') {
    isVaultUnlocked = true;
    passInput.value = '';
    showToast('success', 'Cofre de credenciais do TSE desbloqueado com sucesso!');
    renderAdminSecurityView();
  } else {
    showToast('error', 'Senha Mestra do TSE incorreta. Acesso bloqueado por segurança.');
  }
  return false;
}

function lockSecurityVault() {
  isVaultUnlocked = false;
  showToast('info', 'Cofre de credenciais bloqueado.');
  renderAdminSecurityView();
}

function filterSecurityCourts(filterType) {
  secCourtFilter = filterType;
  document.querySelectorAll('.sec-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-sec-filter') === filterType) {
      btn.className = 'sec-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition bg-brand-gold text-slate-950 shadow-sm';
    } else {
      btn.className = 'sec-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-400 hover:bg-white/5';
    }
  });
  renderAdminSecurityView();
}

function handleSecurityCourtSearch(query) {
  secSearchQuery = (query || '').toLowerCase().trim();
  renderAdminSecurityView();
}

function renderAdminSecurityView() {
  const lockedEl = document.getElementById('admin-vault-locked');
  const unlockedEl = document.getElementById('admin-vault-unlocked');
  if (!lockedEl || !unlockedEl) return;

  if (!currentUser || (currentUser.role !== 'tse' && currentUser.state !== 'ALL')) {
    lockedEl.classList.remove('hidden');
    unlockedEl.classList.add('hidden');
    return;
  }

  if (!isVaultUnlocked) {
    lockedEl.classList.remove('hidden');
    unlockedEl.classList.add('hidden');
    initIcons();
    return;
  }

  lockedEl.classList.add('hidden');
  unlockedEl.classList.remove('hidden');

  const countEl = document.getElementById('count-all-courts');
  if (countEl) countEl.textContent = activeCourtCredentials.length;

  // Filtra lista de tribunais
  let filtered = activeCourtCredentials.filter(c => {
    if (secCourtFilter === 'tse' && c.role !== 'tse') return false;
    if (secCourtFilter === 'tre_estadual' && c.role !== 'tre_estadual') return false;
    if (secCourtFilter === 'tre_municipal' && c.role !== 'tre_municipal') return false;

    if (secSearchQuery) {
      const nameMatch = (c.name || '').toLowerCase().includes(secSearchQuery);
      const loginMatch = (c.login || '').toLowerCase().includes(secSearchQuery);
      const stateMatch = (c.state || '').toLowerCase().includes(secSearchQuery);
      const cityMatch = (c.city || '').toLowerCase().includes(secSearchQuery);
      if (!nameMatch && !loginMatch && !stateMatch && !cityMatch) return false;
    }
    return true;
  });

  const container = document.getElementById('admin-security-courts-list');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full glass-panel p-8 rounded-2xl border border-brand-border text-center text-slate-400 text-xs">
        Nenhum tribunal encontrado para os critérios informados.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(court => {
    const currentPass = decryptSecret(court.encPass || court.pass);
    const isTse = court.role === 'tse';
    const isEstadual = court.role === 'tre_estadual';

    let badgeHtml = '';
    if (isTse) {
      badgeHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-gold/20 text-brand-gold border border-brand-gold/40">TRIBUNAL SUPERIOR</span>`;
    } else if (isEstadual) {
      badgeHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">TRE ESTADUAL</span>`;
    } else {
      badgeHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">TRE MUNICIPAL</span>`;
    }

    let jurisDesc = '';
    if (isTse) {
      jurisDesc = 'Jurisdição Nacional Plena';
    } else if (isEstadual) {
      jurisDesc = `Estado de ${getStateDisplayName(court.state)}`;
    } else {
      jurisDesc = `${getCityDisplayName(court.state, court.city)} (${getStateDisplayName(court.state)})`;
    }

    const lastUpdate = court.updatedAt 
      ? `Modificado em ${new Date(court.updatedAt).toLocaleDateString('pt-BR')} às ${new Date(court.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      : 'Credencial padrão de segurança';

    return `
      <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-brand-border hover:border-brand-gold/40 transition space-y-4 relative group" id="court-card-${court.id}">
        
        <div class="flex items-start justify-between gap-3 border-b border-brand-border/60 pb-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              ${badgeHtml}
              <span class="text-[11px] text-slate-400 font-mono">${court.id}</span>
            </div>
            <h4 class="text-base font-cinzel font-bold text-white">${court.name}</h4>
            <p class="text-xs text-slate-400 flex items-center gap-1">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-brand-gold"></i>
              ${jurisDesc}
            </p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-brand-deep/80 border border-brand-border flex items-center justify-center text-brand-gold shrink-0">
            <i data-lucide="shield" class="w-5 h-5"></i>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Identificador / Login</span>
              <span class="text-[10px] text-slate-500 font-normal">Usado no Login</span>
            </label>
            <div class="relative">
              <input type="text" id="cred-login-${court.id}" value="${court.login || ''}" class="w-full bg-brand-navy border border-brand-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-gold outline-none font-mono">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Chave de Acesso / Senha</span>
              <span class="text-[10px] text-slate-500 font-normal">Criptografia Ativa</span>
            </label>
            <div class="relative">
              <input type="password" id="cred-pass-${court.id}" value="${currentPass || ''}" class="w-full bg-brand-navy border border-brand-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-gold outline-none font-mono pr-20">
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" id="btn-eye-${court.id}" onclick="togglePasswordVisibility('cred-pass-${court.id}', this)" class="p-1 text-slate-400 hover:text-white transition" title="Ver / Ocultar Senha">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
                <button type="button" onclick="generateStrongPassword('${court.id}')" class="p-1 text-brand-gold hover:text-amber-300 transition" title="Gerar Senha Forte">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-brand-border/40">
          <span class="text-[10px] text-slate-500 truncate max-w-[180px] sm:max-w-xs" title="${lastUpdate}">
            ${lastUpdate}
          </span>
          <button type="button" onclick="saveCourtCredential('${court.id}')" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-gold hover:bg-yellow-400 transition flex items-center gap-1.5 shadow-glow-gold">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> Salvar Credencial
          </button>
        </div>

      </div>
    `;
  }).join('');

  renderSecurityAuditLogs();
  initIcons();
}

function renderSecurityAuditLogs() {
  const container = document.getElementById('admin-security-audit-logs');
  if (!container) return;

  if (!db) {
    container.innerHTML = `<p class="text-xs text-slate-500">Conexão com registros de auditoria indisponível.</p>`;
    return;
  }

  db.ref('auditLogs').limitToLast(25).once('value', (snap) => {
    const data = snap.val();
    if (!data) {
      container.innerHTML = `<p class="text-xs text-slate-500">Nenhuma modificação de credencial registrada até o momento.</p>`;
      return;
    }

    const logs = Object.entries(data)
      .map(([id, val]) => ({ id, ...val }))
      .filter(l => l.action === 'CREDENTIAL_UPDATE')
      .reverse();

    if (logs.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-500">Nenhuma alteração de credenciais registrada.</p>`;
      return;
    }

    container.innerHTML = logs.map(l => {
      const timeStr = l.timestamp 
        ? `${new Date(l.timestamp).toLocaleDateString('pt-BR')} às ${new Date(l.timestamp).toLocaleTimeString('pt-BR')}`
        : 'Data não informada';
      return `
        <div class="p-3 rounded-xl bg-brand-navy/60 border border-brand-border flex items-center justify-between text-xs">
          <div class="space-y-0.5">
            <p class="font-bold text-white flex items-center gap-1.5">
              <i data-lucide="key-round" class="w-3.5 h-3.5 text-brand-gold"></i>
              ${l.courtName || l.courtId} — Login: <span class="font-mono text-brand-gold">${l.newLogin || 'Atualizado'}</span>
            </p>
            <p class="text-[11px] text-slate-400">Efetuado por: ${l.adminName || l.adminUser} (${l.reason || 'Alteração autorizada pelo TSE'})</p>
          </div>
          <span class="text-[10px] text-slate-500 font-mono">${timeStr}</span>
        </div>
      `;
    }).join('');
    initIcons();
  });
}

async function saveCourtCredential(courtId) {
  if (!currentUser || (currentUser.role !== 'tse' && currentUser.state !== 'ALL')) {
    showToast('error', 'Apenas a Presidência do TSE pode alterar credenciais.');
    return;
  }
  const loginInput = document.getElementById(`cred-login-${courtId}`);
  const passInput = document.getElementById(`cred-pass-${courtId}`);
  if (!loginInput || !passInput) return;

  const newLogin = loginInput.value.trim();
  const newPass = passInput.value.trim();

  if (!newLogin) {
    showToast('warning', 'O identificador institucional não pode ficar em branco.');
    return;
  }
  if (!newPass || newPass.length < 4) {
    showToast('warning', 'A chave de acesso deve ter pelo menos 4 caracteres.');
    return;
  }

  const idx = activeCourtCredentials.findIndex(c => c.id === courtId);
  if (idx === -1) return;

  const court = activeCourtCredentials[idx];
  const oldLogin = court.login;

  court.login = newLogin;
  court.encPass = encryptSecret(newPass);
  court.pass = undefined;
  court.updatedAt = new Date().toISOString();
  court.updatedBy = currentUser.login || 'tse';

  // 1. Salva no Firebase Realtime Database sob settings/courtCredentials
  if (db) {
    try {
      await db.ref(`settings/courtCredentials/${courtId}`).set({
        id: court.id,
        name: court.name,
        login: newLogin,
        encPass: court.encPass,
        role: court.role,
        state: court.state,
        city: court.city,
        type: court.type || court.role,
        updatedAt: court.updatedAt,
        updatedBy: court.updatedBy
      });

      // 2. Registro no Livro de Auditoria Eleitoral
      await db.ref('auditLogs').push({
        action: 'CREDENTIAL_UPDATE',
        courtId: court.id,
        courtName: court.name,
        previousLogin: oldLogin,
        newLogin: newLogin,
        adminUser: currentUser.login || 'tse',
        adminName: currentUser.name || 'Presidência TSE',
        adminRole: 'tse',
        reason: `Alteração de credenciais do ${court.name} autorizada pelo TSE`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Erro ao salvar no Firebase:", err);
    }
  }

  // 3. Cache local criptografado
  try {
    localStorage.setItem('brookasil_court_credentials', JSON.stringify(activeCourtCredentials));
  } catch (e) {}

  showToast('success', `Credenciais do ${court.name} atualizadas e sincronizadas na nuvem!`);
  renderAdminSecurityView();
}

async function saveAllCourtCredentials() {
  if (!currentUser || (currentUser.role !== 'tse' && currentUser.state !== 'ALL')) {
    showToast('error', 'Apenas a Presidência do TSE pode atualizar credenciais.');
    return;
  }

  let changedCount = 0;
  for (const court of activeCourtCredentials) {
    const loginInput = document.getElementById(`cred-login-${court.id}`);
    const passInput = document.getElementById(`cred-pass-${court.id}`);
    if (loginInput && passInput) {
      const valLogin = loginInput.value.trim();
      const valPass = passInput.value.trim();
      const currentPass = decryptSecret(court.encPass || court.pass);

      if (valLogin && valPass && (valLogin !== court.login || valPass !== currentPass)) {
        court.login = valLogin;
        court.encPass = encryptSecret(valPass);
        court.pass = undefined;
        court.updatedAt = new Date().toISOString();
        court.updatedBy = currentUser.login || 'tse';
        changedCount++;

        if (db) {
          try {
            await db.ref(`settings/courtCredentials/${court.id}`).set({
              id: court.id,
              name: court.name,
              login: court.login,
              encPass: court.encPass,
              role: court.role,
              state: court.state,
              city: court.city,
              type: court.type || court.role,
              updatedAt: court.updatedAt,
              updatedBy: court.updatedBy
            });
          } catch (e) {}
        }
      }
    }
  }

  if (changedCount > 0) {
    if (db) {
      try {
        await db.ref('auditLogs').push({
          action: 'CREDENTIAL_UPDATE',
          courtName: 'Múltiplos Tribunais',
          count: changedCount,
          adminUser: currentUser.login || 'tse',
          adminName: currentUser.name || 'Presidência TSE',
          adminRole: 'tse',
          reason: `Atualização em lote de ${changedCount} credenciais de tribunais pelo TSE`,
          timestamp: new Date().toISOString()
        });
      } catch (e) {}
    }

    try {
      localStorage.setItem('brookasil_court_credentials', JSON.stringify(activeCourtCredentials));
    } catch (e) {}

    showToast('success', `${changedCount} tribunais atualizados e sincronizados no cofre da nuvem!`);
  } else {
    showToast('info', 'Nenhuma alteração detectada nas credenciais.');
  }
  renderAdminSecurityView();
}

async function syncCredentialsWithCloud() {
  if (!db) {
    showToast('error', 'Sem conexão com a nuvem no momento.');
    return;
  }
  showToast('info', 'Sincronizando com o cofre da nuvem...');
  try {
    const snap = await db.ref('settings/courtCredentials').once('value');
    const data = snap.val();
    if (data) {
      let list = [];
      if (Array.isArray(data)) list = data.filter(Boolean);
      else if (typeof data === 'object') list = Object.values(data);
      if (list.length > 0) {
        mergeActiveCourtCredentials(list);
        localStorage.setItem('brookasil_court_credentials', JSON.stringify(activeCourtCredentials));
      }
    }
    showToast('success', 'Credenciais sincronizadas com sucesso!');
    renderAdminSecurityView();
  } catch (err) {
    showToast('error', 'Falha ao sincronizar com o cofre da nuvem.');
  }
}

// ========================================================
// GESTÃO DE ELEIÇÕES (TSE EXCLUSIVO)
// ========================================================
function openElectionModal() {
  const modal = document.getElementById('election-modal');
  if (!modal) return;
  if (currentElection) {
    document.getElementById('modal-election-title').value = currentElection.title || '';
    document.getElementById('modal-election-type').value = currentElection.type || 'Federal';
    document.getElementById('modal-election-status').value = currentElection.status || 'open';
    if (currentElection.applicationStart) {
      document.getElementById('modal-election-start').value = currentElection.applicationStart.slice(0, 16);
    }
    if (currentElection.applicationEnd) {
      document.getElementById('modal-election-end').value = currentElection.applicationEnd.slice(0, 16);
    }
    if (currentElection.electionDate) {
      document.getElementById('modal-election-date').value = currentElection.electionDate.slice(0, 16);
    }
  }
  modal.classList.remove('hidden');
  initIcons();
}

function closeElectionModal() {
  const modal = document.getElementById('election-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleSaveElection(e) {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'tse') {
    showToast('error', 'Apenas magistrados do TSE podem alterar eleições.');
    return;
  }

  const title = document.getElementById('modal-election-title').value.trim();
  const type = document.getElementById('modal-election-type').value;
  const status = document.getElementById('modal-election-status').value;
  const start = document.getElementById('modal-election-start').value;
  const end = document.getElementById('modal-election-end').value;
  const date = document.getElementById('modal-election-date').value;

  try {
    const defaultVagas = type === 'Municipal' 
      ? { Prefeito: 10, Vereador: 20 }
      : { Presidente: 8, Governador: 8, Senador: 16, "Deputado Federal": 16, "Deputado Estadual": 16 };

    const electionData = {
      title,
      type,
      status,
      applicationStart: new Date(start).toISOString(),
      applicationEnd: new Date(end).toISOString(),
      electionDate: new Date(date).toISOString(),
      vagas: (currentElection && currentElection.vagas) || defaultVagas,
      updatedAt: new Date().toISOString()
    };

    if (currentElection && currentElection.id) {
      await db.ref('elections/' + currentElection.id).update(electionData);
    } else {
      await db.ref('elections').push(electionData);
    }

    closeElectionModal();
    showToast('success', 'Configurações da eleição salvas com sucesso!');
    renderAdminElections();
  } catch (err) {
    console.error("Erro ao salvar eleição:", err);
    showToast('error', 'Falha ao salvar eleição no Firebase.');
  }
}

function renderAdminElections() {
  const container = document.getElementById('admin-elections-list');
  if (!container) return;

  if (!currentElection) {
    container.innerHTML = '<p class="text-xs text-slate-400">Nenhuma eleição configurada.</p>';
    return;
  }

  container.innerHTML = `
    <div class="glass-panel p-6 rounded-2xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            currentElection.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
          }">${currentElection.status === 'open' ? 'Ativa / Inscrições Abertas' : 'Encerrada'}</span>
          <span class="text-xs text-brand-electric font-semibold">${currentElection.type}</span>
        </div>
        <h4 class="text-lg font-bold text-white mt-1">${currentElection.title}</h4>
        <p class="text-xs text-slate-400 mt-1">Inscrições: ${new Date(currentElection.applicationStart).toLocaleDateString('pt-BR')} até ${new Date(currentElection.applicationEnd).toLocaleDateString('pt-BR')} • Votação: ${new Date(currentElection.electionDate).toLocaleDateString('pt-BR')}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="openElectionModal()" class="px-4 py-2 rounded-xl bg-brand-gold/20 hover:bg-brand-gold/30 border border-brand-gold/40 text-brand-gold text-xs font-bold transition">
          Editar Configurações
        </button>
      </div>
    </div>
  `;
}

// ========================================================
// GESTÃO DE LOGO DE PARTIDOS
// ========================================================
function handlePartyLogoFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('error', 'O arquivo selecionado não é uma imagem válida.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      // Compressão para thumbnail em Canvas (Max 250x250)
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxSize = 250;

      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL('image/png');
      document.getElementById('modal-party-logo-data').value = base64;
      document.getElementById('modal-party-logo-url').value = '';

      const previewImg = document.getElementById('modal-party-logo-preview-img');
      const placeholder = document.getElementById('modal-party-logo-placeholder');
      const removeBtn = document.getElementById('modal-party-logo-remove-btn');

      if (previewImg) {
        previewImg.src = base64;
        previewImg.classList.remove('hidden');
      }
      if (placeholder) placeholder.classList.add('hidden');
      if (removeBtn) removeBtn.classList.remove('hidden');

      showToast('success', 'Logotipo do partido carregado e otimizado!');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function handlePartyLogoUrlInput(e) {
  const url = e.target.value.trim();
  const dataInput = document.getElementById('modal-party-logo-data');
  const previewImg = document.getElementById('modal-party-logo-preview-img');
  const placeholder = document.getElementById('modal-party-logo-placeholder');
  const removeBtn = document.getElementById('modal-party-logo-remove-btn');

  if (url) {
    if (dataInput) dataInput.value = url;
    if (previewImg) {
      previewImg.src = url;
      previewImg.classList.remove('hidden');
    }
    if (placeholder) placeholder.classList.add('hidden');
    if (removeBtn) removeBtn.classList.remove('hidden');
  } else {
    if (dataInput) dataInput.value = '';
    if (previewImg) {
      previewImg.src = '';
      previewImg.classList.add('hidden');
    }
    if (placeholder) placeholder.classList.remove('hidden');
    if (removeBtn) removeBtn.classList.add('hidden');
  }
}

function removePartyLogo() {
  const dataInput = document.getElementById('modal-party-logo-data');
  const urlInput = document.getElementById('modal-party-logo-url');
  const fileInput = document.getElementById('modal-party-logo-file');
  const previewImg = document.getElementById('modal-party-logo-preview-img');
  const placeholder = document.getElementById('modal-party-logo-placeholder');
  const removeBtn = document.getElementById('modal-party-logo-remove-btn');

  if (dataInput) dataInput.value = '';
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';
  if (previewImg) {
    previewImg.src = '';
    previewImg.classList.add('hidden');
  }
  if (placeholder) placeholder.classList.remove('hidden');
  if (removeBtn) removeBtn.classList.add('hidden');
}

// ========================================================
// GESTÃO DE PARTIDOS (TSE EXCLUSIVO)
// ========================================================
function openPartyModal(partyId) {
  const modal = document.getElementById('party-modal');
  if (!modal) return;

  const idInput = document.getElementById('modal-party-id');
  const titleEl = document.getElementById('modal-party-title');
  const submitText = document.getElementById('modal-party-submit-text');
  const deleteBtn = document.getElementById('modal-party-delete-btn');

  const nameInput = document.getElementById('modal-party-name');
  const acronymInput = document.getElementById('modal-party-acronym');
  const numberInput = document.getElementById('modal-party-number');
  const groupSelect = document.getElementById('modal-party-group');
  const statusSelect = document.getElementById('modal-party-status');
  const colorInput = document.getElementById('modal-party-color');
  const leaderInput = document.getElementById('modal-party-leader');
  const foundationInput = document.getElementById('modal-party-foundation');
  const mottoInput = document.getElementById('modal-party-motto');
  const websiteInput = document.getElementById('modal-party-website');

  removePartyLogo();

  if (partyId) {
    const p = partiesList.find(item => String(item.id) === String(partyId));
    if (p) {
      if (idInput) idInput.value = p.id;
      if (titleEl) titleEl.textContent = `Editar Partido: ${p.acronym}`;
      if (submitText) submitText.textContent = 'Salvar Alterações';
      if (deleteBtn) deleteBtn.classList.remove('hidden');

      if (nameInput) nameInput.value = p.name || '';
      if (acronymInput) acronymInput.value = p.acronym || '';
      if (numberInput) numberInput.value = p.number || '';
      if (groupSelect) groupSelect.value = p.group || 'Direita';
      if (statusSelect) statusSelect.value = p.status || 'ativo';
      if (colorInput) colorInput.value = p.color || '#2563eb';
      if (leaderInput) leaderInput.value = p.leader || '';
      if (foundationInput) foundationInput.value = p.foundation || '';
      if (mottoInput) mottoInput.value = p.motto || '';
      if (websiteInput) websiteInput.value = p.website || '';

      if (p.logo) {
        const dataInput = document.getElementById('modal-party-logo-data');
        const urlInput = document.getElementById('modal-party-logo-url');
        const previewImg = document.getElementById('modal-party-logo-preview-img');
        const placeholder = document.getElementById('modal-party-logo-placeholder');
        const removeBtn = document.getElementById('modal-party-logo-remove-btn');

        if (dataInput) dataInput.value = p.logo;
        if (urlInput) urlInput.value = p.logo.startsWith('data:') ? '' : p.logo;
        if (previewImg) {
          previewImg.src = p.logo;
          previewImg.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
        if (removeBtn) removeBtn.classList.remove('hidden');
      }
    }
  } else {
    if (idInput) idInput.value = '';
    if (titleEl) titleEl.textContent = 'Cadastrar Partido';
    if (submitText) submitText.textContent = 'Salvar Partido no TSE';
    if (deleteBtn) deleteBtn.classList.add('hidden');

    if (nameInput) nameInput.value = '';
    if (acronymInput) acronymInput.value = '';
    if (numberInput) numberInput.value = '';
    if (groupSelect) groupSelect.value = 'Direita';
    if (statusSelect) statusSelect.value = 'ativo';
    if (colorInput) colorInput.value = '#2563eb';
    if (leaderInput) leaderInput.value = '';
    if (foundationInput) foundationInput.value = '';
    if (mottoInput) mottoInput.value = '';
    if (websiteInput) websiteInput.value = '';
  }

  modal.classList.remove('hidden');
  initIcons();
}

function closePartyModal() {
  const modal = document.getElementById('party-modal');
  if (modal) modal.classList.add('hidden');
}

async function handleSaveParty(e) {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'tse') {
    showToast('error', 'Apenas o TSE possui jurisdição para registrar e editar agremiações.');
    return;
  }

  const partyId = document.getElementById('modal-party-id')?.value;
  const name = document.getElementById('modal-party-name').value.trim();
  const acronym = document.getElementById('modal-party-acronym').value.trim().toUpperCase();
  const number = parseInt(document.getElementById('modal-party-number').value, 10);
  const group = document.getElementById('modal-party-group').value;
  const status = document.getElementById('modal-party-status').value;
  const color = document.getElementById('modal-party-color').value;
  const leader = document.getElementById('modal-party-leader').value.trim();
  const foundation = document.getElementById('modal-party-foundation').value.trim();
  const motto = document.getElementById('modal-party-motto').value.trim();
  const website = document.getElementById('modal-party-website').value.trim();
  const logo = document.getElementById('modal-party-logo-data')?.value || null;

  // Verifica se o número já existe em outro partido
  const duplicate = partiesList.find(p => p.number === number && String(p.id) !== String(partyId));
  if (duplicate) {
    showToast('error', `O número partidário ${number} já pertence ao partido ${duplicate.acronym}.`);
    return;
  }

  try {
    const partyData = {
      name,
      acronym,
      number,
      group,
      status,
      color,
      leader: leader || null,
      foundation: foundation || null,
      motto: motto || null,
      website: website || null,
      logo: logo || null,
      updatedAt: new Date().toISOString()
    };

    if (partyId) {
      // Atualização de partido existente
      partyData.id = partyId;
      await db.ref('parties/' + partyId).update(partyData);

      // Sincroniza estado local
      const idx = partiesList.findIndex(p => String(p.id) === String(partyId));
      if (idx !== -1) {
        partiesList[idx] = { ...partiesList[idx], ...partyData };
      }

      // Registra Auditoria
      await db.ref('auditLogs').push({
        action: 'PARTY_UPDATE',
        partyId: String(partyId),
        partyAcronym: acronym || 'SEM_SIGLA',
        partyNumber: isNaN(number) ? 0 : number,
        reason: `Atualização dos dados e registros do partido ${acronym || partyId}`,
        adminUser: (currentUser && currentUser.login) ? currentUser.login : 'tse',
        adminName: (currentUser && currentUser.name) ? currentUser.name : 'Magistrado',
        adminRole: (currentUser && currentUser.role) ? currentUser.role : 'tse',
        timestamp: new Date().toISOString()
      });

      showToast('success', `Partido ${acronym} atualizado com sucesso no TSE!`);
    } else {
      // Cadastro de novo partido
      const newId = Date.now();
      partyData.id = newId;
      partyData.createdAt = new Date().toISOString();

      await db.ref('parties/' + newId).set(partyData);
      partiesList.push(partyData);

      // Registra Auditoria
      await db.ref('auditLogs').push({
        action: 'PARTY_CREATE',
        partyId: String(newId),
        partyAcronym: acronym || 'SEM_SIGLA',
        partyNumber: isNaN(number) ? 0 : number,
        reason: `Registro oficial da legenda partidária ${acronym}`,
        adminUser: (currentUser && currentUser.login) ? currentUser.login : 'tse',
        adminName: (currentUser && currentUser.name) ? currentUser.name : 'Magistrado',
        adminRole: (currentUser && currentUser.role) ? currentUser.role : 'tse',
        timestamp: new Date().toISOString()
      });

      showToast('success', `Partido ${acronym} registrado com sucesso no TSE!`);
    }

    closePartyModal();
    renderAdminParties();
    renderPartiesCatalog();
    populatePartySelects();
  } catch (err) {
    console.error("Erro ao salvar partido:", err);
    showToast('error', 'Falha ao salvar partido no Firebase.');
  }
}

// ========================================================
// EXCLUSÃO DE PARTIDOS (TSE EXCLUSIVO)
// ========================================================
function handleDeletePartyFromModal() {
  const partyId = document.getElementById('modal-party-id')?.value;
  if (!partyId) return;
  confirmDeleteParty(partyId);
}

let partyIdPendingDelete = null;

function confirmDeleteParty(partyId) {
  if (!currentUser || currentUser.role !== 'tse') {
    showToast('error', 'Apenas o TSE possui jurisdição para excluir agremiações.');
    return;
  }

  if (partyId === undefined || partyId === null || partyId === '') {
    showToast('error', 'Identificador de partido inválido.');
    return;
  }

  const p = partiesList.find(x => String(x.id) === String(partyId));
  const acronym = (p && p.acronym) ? p.acronym : String(partyId);
  const name = (p && p.name) ? p.name : '';
  const number = (p && p.number !== undefined && p.number !== null) ? p.number : '';

  partyIdPendingDelete = String(partyId);

  const modal = document.getElementById('confirm-party-delete-modal');
  const msgEl = document.getElementById('confirm-delete-party-msg');
  const warningEl = document.getElementById('confirm-delete-party-warning');
  const actionBtn = document.getElementById('confirm-delete-party-action-btn');

  if (msgEl) {
    msgEl.innerHTML = `Tem certeza que deseja excluir o partido <strong class="text-white">${acronym}</strong> ${name ? `- ${name}` : ''} ${number ? `(Nº ${number})` : ''}? Esta operação é irreversível.`;
  }

  // Verifica se há candidaturas ligadas a este partido
  const linked = candidaciesList.filter(c => String(c.partyId) === String(partyId));
  if (warningEl) {
    if (linked.length > 0) {
      warningEl.innerHTML = `
        <div class="flex items-center gap-1.5 font-bold mb-1">
          <i data-lucide="alert-circle" class="w-4 h-4 text-amber-400"></i>
          <span>Impacto em Candidaturas Ativas</span>
        </div>
        <p>Existem <strong>${linked.length}</strong> candidatura(s) cadastradas sob a legenda ${acronym}. Ao excluir o partido, essas candidaturas ficarão sem vinculação partidária no sistema.</p>
      `;
      warningEl.classList.remove('hidden');
    } else {
      warningEl.innerHTML = '';
      warningEl.classList.add('hidden');
    }
  }

  if (actionBtn) {
    actionBtn.onclick = () => executeDeleteParty(partyId);
  }

  if (modal) modal.classList.remove('hidden');
  initIcons();
}

function closeConfirmDeletePartyModal() {
  const modal = document.getElementById('confirm-party-delete-modal');
  if (modal) modal.classList.add('hidden');
  partyIdPendingDelete = null;
}

async function executeDeleteParty(partyId) {
  if (!currentUser || currentUser.role !== 'tse') {
    showToast('error', 'Apenas o TSE possui jurisdição para excluir partidos.');
    return;
  }

  const targetId = partyId !== undefined && partyId !== null && partyId !== '' ? partyId : partyIdPendingDelete;
  if (targetId === undefined || targetId === null || targetId === '') {
    showToast('error', 'Identificador de partido não encontrado.');
    return;
  }

  const p = partiesList.find(x => String(x.id) === String(targetId));
  const acronym = (p && p.acronym) ? String(p.acronym).trim() : `ID_${targetId}`;
  const number = (p && p.number !== undefined && p.number !== null) ? Number(p.number) : 0;
  const adminUser = (currentUser && currentUser.login) ? currentUser.login : 'tse';
  const adminName = (currentUser && currentUser.name) ? currentUser.name : 'Magistrado';
  const adminRole = (currentUser && currentUser.role) ? currentUser.role : 'tse';

  try {
    // Remove do Firebase
    await db.ref('parties/' + targetId).remove();

    // Registra Auditoria Imutável (Garantindo que NENHUM campo seja undefined)
    await db.ref('auditLogs').push({
      action: 'PARTY_DELETE',
      partyId: String(targetId),
      partyAcronym: acronym || 'DESCONHECIDO',
      partyNumber: number,
      reason: `Exclusão definitiva da legenda partidária ${acronym} pelo TSE`,
      adminUser: adminUser,
      adminName: adminName,
      adminRole: adminRole,
      timestamp: new Date().toISOString()
    });

    // Remove do array local
    partiesList = partiesList.filter(x => String(x.id) !== String(targetId));

    closeConfirmDeletePartyModal();
    closePartyModal();

    showToast('success', `Partido ${acronym} excluído com sucesso do registro do TSE.`);

    renderAdminParties();
    renderPartiesCatalog();
    populatePartySelects();
  } catch (err) {
    console.error("Erro ao excluir partido:", err);
    showToast('error', 'Falha ao excluir partido no Firebase.');
  }
}

function renderAdminParties() {
  const container = document.getElementById('admin-parties-list');
  if (!container) return;

  const searchInput = document.getElementById('admin-parties-search');
  const search = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();
  const groupFilter = document.getElementById('admin-parties-group-filter')?.value || 'ALL';
  const statusFilter = document.getElementById('admin-parties-status-filter')?.value || 'ALL';

  const badge = document.getElementById('admin-parties-count-badge');
  if (badge) badge.textContent = partiesList.length;

  const filtered = partiesList.filter(p => {
    if (!p) return false;
    if (groupFilter !== 'ALL' && p.group !== groupFilter) return false;
    if (statusFilter !== 'ALL' && (p.status || 'ativo') !== statusFilter) return false;
    if (search) {
      const matchName = String(p.name || '').toLowerCase().includes(search);
      const matchAcronym = String(p.acronym || '').toLowerCase().includes(search);
      const matchNumber = String(p.number !== undefined && p.number !== null ? p.number : '').includes(search);
      const matchLeader = String(p.leader || '').toLowerCase().includes(search);
      if (!matchName && !matchAcronym && !matchNumber && !matchLeader) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <i data-lucide="inbox" class="w-10 h-10 mx-auto text-slate-600 mb-2"></i>
        <p class="font-bold text-sm text-slate-400">Nenhum partido localizado com os filtros selecionados.</p>
        <p class="text-xs text-slate-500 mt-1">Ajuste os filtros ou cadastre uma nova agremiação.</p>
      </div>
    `;
    initIcons();
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isSuspended = p.status === 'suspenso';
    const isFormacao = p.status === 'formacao';
    const candCount = candidaciesList.filter(c => c.status === 'deferida' && String(c.partyId) === String(p.id)).length;

    return `
      <div class="glass-panel p-4 rounded-2xl border border-brand-border hover:border-brand-electric/40 transition flex flex-col justify-between gap-3">
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex items-center gap-2.5">
              ${p.logo ? `
                <div class="w-10 h-10 rounded-xl bg-white/5 border border-brand-border p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="${p.logo}" alt="${p.acronym}" class="w-full h-full object-contain">
                </div>
              ` : ''}
              <span class="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-white text-sm shadow-md shrink-0" style="background-color: ${p.color}">
                ${p.number}
              </span>
              <div>
                <strong class="text-white text-sm block leading-tight">${p.acronym}</strong>
                <span class="text-[10px] text-brand-gold font-mono">${candCount} cand. deferidos</span>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                p.group === 'Direita' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                p.group === 'Centro' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }">${p.group}</span>
              ${isSuspended ? `
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                  Suspenso
                </span>
              ` : isFormacao ? `
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Formação
                </span>
              ` : ''}
            </div>
          </div>

          <p class="text-xs text-slate-300 font-medium line-clamp-2">${p.name}</p>

          ${p.leader ? `
            <p class="text-[11px] text-slate-400 mt-1.5 truncate">
              Líder: <strong class="text-slate-200">${p.leader}</strong>
            </p>
          ` : ''}
          ${p.motto ? `
            <p class="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">"${p.motto}"</p>
          ` : ''}
        </div>

        <div class="pt-3 border-t border-brand-border/40 flex items-center justify-between gap-2">
          <span class="text-[10px] text-slate-500">Nº ${p.number}</span>
          <div class="flex items-center gap-1.5">
            <button onclick="openPartyModal('${p.id}')" class="px-2.5 py-1 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/40 border border-brand-electric/30 text-brand-electric text-xs font-bold flex items-center gap-1 transition" title="Editar Partido">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>Editar</span>
            </button>
            <button onclick="confirmDeleteParty('${p.id}')" class="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1 transition" title="Excluir Partido">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  initIcons();
}

function setAdminStatusFilter(status) {
  activeAdminStatusFilter = status;
  document.getElementById('admin-filter-status').value = status;
  renderAdminCandidacies();
}

// ========================================================
// JULGAMENTO JUDICIAL COM JURISDIÇÃO ESTRITA
// ========================================================
function isCandidateInJurisdiction(c, user) {
  if (!user || !c) return false;

  // 1. TSE NACIONAL: Vê rigorosamente TODOS os candidatos de todo o país
  if (user.role === 'tse' || user.state === 'ALL') {
    return true;
  }

  const candState = String(c.stateId || c.state || '').toLowerCase().trim();
  const candCity = String(c.cityId || c.city || '').toLowerCase().trim();
  const userState = String(user.state || '').toLowerCase().trim();
  const userCity = String(user.city || '').toLowerCase().trim();

  const userStateConfig = BROOKASIL_GEO[userState];
  const userStateName = userStateConfig?.name ? String(userStateConfig.name).toLowerCase().trim() : '';

  const matchesState = (s) => {
    if (!s) return false;
    const lower = s.toLowerCase().trim();
    return lower === userState || (userStateName && lower === userStateName);
  };

  const userCityName = (userStateConfig?.cities && userStateConfig.cities[userCity])
    ? String(userStateConfig.cities[userCity]).toLowerCase().trim()
    : '';

  const matchesCity = (cit) => {
    if (!cit || cit === 'all') return false;
    const lower = cit.toLowerCase().trim();
    return lower === userCity || (userCityName && lower === userCityName);
  };

  // 2. TRE ESTADUAL: Vê somente candidaturas do seu estado (estaduais e municipais do estado)
  if (user.role === 'tre_estadual') {
    // Não julga Presidente (âmbito federal/TSE Nacional)
    if (c.office === 'Presidente') return false;

    // Se o estado do candidato bater com o estado do TRE Estadual
    if (matchesState(candState)) {
      return true;
    }

    // Se a cidade do candidato pertencer a este estado
    const stateCities = userStateConfig?.cities || {};
    const cityKeys = Object.keys(stateCities).map(k => k.toLowerCase());
    const cityNames = Object.values(stateCities).map(n => String(n).toLowerCase());
    if (candCity && (cityKeys.includes(candCity) || cityNames.includes(candCity))) {
      return true;
    }

    return false;
  }

  // 3. TRE MUNICIPAL: Vê estritamente as candidaturas da sua cidade/município
  if (user.role === 'tre_municipal') {
    // Só vê cargos municipais (Prefeito e Vereador)
    if (!isMunicipalOffice(c.office)) return false;

    // A cidade do candidato deve corresponder à cidade do TRE Municipal
    if (matchesCity(candCity)) {
      return true;
    }

    return false;
  }

  return false;
}

function renderAdminCandidacies() {
  if (!currentUser) return;

  const tbody = document.getElementById('admin-candidacies-table-body');
  const emptyEl = document.getElementById('admin-table-empty');
  if (!tbody) return;

  const statusFilter = document.getElementById('admin-filter-status')?.value || 'ALL';
  const officeFilter = document.getElementById('admin-filter-cargo')?.value || 'ALL';
  const stateFilterEl = document.getElementById('admin-filter-estado');
  const stateFilter = (stateFilterEl && stateFilterEl.style && stateFilterEl.style.display !== 'none') ? (stateFilterEl.value || 'ALL') : 'ALL';
  const cityFilterEl = document.getElementById('admin-filter-cidade');
  const cityFilter = (cityFilterEl && !cityFilterEl.classList.contains('hidden') && (!cityFilterEl.style || cityFilterEl.style.display !== 'none')) ? (cityFilterEl.value || 'ALL') : 'ALL';
  const partyFilterEl = document.getElementById('admin-filter-partido');
  const partyFilter = (partyFilterEl && partyFilterEl.style && partyFilterEl.style.display !== 'none') ? (partyFilterEl.value || 'ALL') : 'ALL';
  const searchFilter = (document.getElementById('admin-filter-search')?.value || '').toLowerCase().trim();

  // JURISDIÇÃO ESTRITA:
  // TSE vê TODOS os candidatos de qualquer estado/cidade
  // TRE Estadual vê somente seu estado
  // TRE Municipal vê somente sua cidade
  const jurisdictionList = candidaciesList.filter(c => isCandidateInJurisdiction(c, currentUser));

  // Atualiza KPIs da jurisdição
  const pendentesCount = jurisdictionList.filter(c => c.status === 'pendente').length;
  const deferidasCount = jurisdictionList.filter(c => c.status === 'deferida').length;
  const indeferidasCount = jurisdictionList.filter(c => c.status === 'indeferida').length;

  const kpiTotal = document.getElementById('admin-kpi-total');
  const kpiPend = document.getElementById('admin-kpi-pendentes');
  const kpiDef = document.getElementById('admin-kpi-deferidas');
  const kpiIndef = document.getElementById('admin-kpi-indeferidas');

  if (kpiTotal) kpiTotal.textContent = jurisdictionList.length;
  if (kpiPend) kpiPend.textContent = pendentesCount;
  if (kpiDef) kpiDef.textContent = deferidasCount;
  if (kpiIndef) kpiIndef.textContent = indeferidasCount;

  // Banner dinâmico de alerta de pendências
  const alertEl = document.getElementById('admin-pending-alert');
  const alertTextEl = document.getElementById('admin-pending-alert-text');
  if (alertEl && alertTextEl) {
    if (pendentesCount > 0) {
      alertTextEl.textContent = `Atenção: Há ${pendentesCount} candidatura${pendentesCount === 1 ? '' : 's'} com status PENDENTE aguardando julgamento sob sua jurisdição!`;
      alertEl.classList.remove('hidden');
    } else {
      alertEl.classList.add('hidden');
    }
  }

  const filtered = jurisdictionList.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (officeFilter !== 'ALL' && c.office !== officeFilter) return false;
    if (stateFilter !== 'ALL' && String(c.stateId || c.state || '').toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (cityFilter !== 'ALL' && String(c.cityId || c.city || '').toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (partyFilter !== 'ALL' && String(c.partyId) !== String(partyFilter)) return false;

    if (searchFilter) {
      const bName = String(c.ballotName || '').toLowerCase();
      const fName = String(c.fullName || '').toLowerCase();
      const num = String(c.number !== undefined && c.number !== null ? c.number : '');
      const pAcronym = String(c.partyAcronym || '').toLowerCase();
      const prot = String(c.protocol || '').toLowerCase();
      if (!bName.includes(searchFilter) && !fName.includes(searchFilter) && !num.includes(searchFilter) && !pAcronym.includes(searchFilter) && !prot.includes(searchFilter)) {
        return false;
      }
    }

    return true;
  });

  const mobileListEl = document.getElementById('admin-candidacies-mobile-list');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (mobileListEl) {
      mobileListEl.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs">Nenhuma candidatura localizada sob sua jurisdição com os filtros atuais.</div>';
    }
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  // Renderiza cards para celular na vertical
  if (mobileListEl) {
    mobileListEl.innerHTML = filtered.map(c => {
      const compInfo = getCompetentCourtInfo(c);
      const judgeAuth = canUserJudgeCandidate(c, currentUser);

      return `
      <div class="p-4 rounded-2xl bg-brand-deep/85 border ${c.status === 'pendente' ? 'border-amber-500/50 shadow-md ring-1 ring-amber-500/20' : 'border-brand-border/70'} space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <img src="${c.photo}" alt="${c.ballotName}" class="w-12 h-14 rounded-xl object-cover bg-brand-navy border border-brand-border shrink-0 shadow-md">
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-bold text-white text-sm leading-snug">${c.ballotName}</span>
                ${c.status === 'pendente' ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">NOVO</span>' : ''}
              </div>
              <span class="text-xs text-slate-300 block">${c.fullName}</span>
              <span class="text-[10px] text-brand-electric font-mono block mt-0.5">Prot: ${c.protocol || 'N/D'}</span>
            </div>
          </div>
          <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase shrink-0 ${
            c.status === 'deferida' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            c.status === 'indeferida' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            c.status === 'excluida' ? 'bg-slate-700 text-slate-300' :
            'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
          }">
            ${c.status}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs bg-brand-navy/70 p-2.5 rounded-xl border border-brand-border/50">
          <div>
            <span class="text-[10px] uppercase text-slate-400 block font-semibold">Cargo & Circunscrição</span>
            <span class="font-bold text-brand-electric block text-[11px]">${c.office}</span>
            <span class="text-[10px] text-slate-300">${c.cityId && c.cityId !== 'ALL' ? (getCityDisplayName(c.stateId, c.cityId) + ' - ' + getStateDisplayName(c.stateId)) : getStateDisplayName(c.stateId)}</span>
          </div>
          <div class="text-right">
            <span class="text-[10px] uppercase text-slate-400 block font-semibold">Partido / Número</span>
            <span class="font-bold block text-[11px]" style="color: ${c.partyColor || '#fff'}">${c.partyAcronym}</span>
            <span class="font-mono font-black text-brand-gold text-sm">${c.number}</span>
          </div>
        </div>

        <!-- Jurisdição Originária de Competência -->
        <div class="text-[10px] text-slate-400 flex items-center justify-between border-t border-brand-border/40 pt-2 px-1">
          <span class="flex items-center gap-1 truncate">
            <i data-lucide="scale" class="w-3 h-3 text-brand-electric shrink-0"></i>
            <span>Foro: <strong class="text-slate-200">${compInfo.courtName}</strong></span>
          </span>
          <span class="font-mono text-[9px] px-1.5 py-0.5 rounded ${judgeAuth.allowed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'} shrink-0">
            ${judgeAuth.allowed ? 'Foro Local' : 'Outra Instância'}
          </span>
        </div>

        <div class="flex items-center gap-2 pt-1">
          ${currentUser && currentUser.role === 'tse' ? `
            <button onclick="openTseEditCandidateModal('${c.id}')" class="px-3 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-1 transition" title="Retificar Cadastro (Exclusivo TSE)">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
              <span>Editar</span>
            </button>
          ` : ''}
          ${judgeAuth.allowed ? `
            <button onclick="openJudgmentModal('${c.id}')" class="flex-1 py-2.5 rounded-xl ${c.status === 'pendente' ? 'bg-gradient-to-r from-brand-gold to-yellow-500 text-slate-950 hover:bg-yellow-400 font-black shadow-glow-gold' : 'bg-brand-blue hover:bg-blue-500 text-white font-bold'} text-xs flex items-center justify-center gap-1.5 transition active:scale-98">
              <i data-lucide="gavel" class="w-4 h-4"></i>
              <span>${c.status === 'pendente' ? 'Julgar Candidatura' : 'Reavaliar Julgamento'}</span>
            </button>
          ` : `
            <button onclick="openJudgmentModal('${c.id}')" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98" title="${judgeAuth.reason}">
              <i data-lucide="scale" class="w-4 h-4 text-brand-electric"></i>
              <span>Ver Processo (${compInfo.courtName})</span>
            </button>
          `}
          <button onclick="viewCandidacyDetails('${c.id}')" class="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition" title="Ver Detalhes">
            <i data-lucide="eye" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
    }).join('');
  }

  // Renderiza tabela para telas Desktop
  tbody.innerHTML = filtered.map(c => {
    const compInfo = getCompetentCourtInfo(c);
    const judgeAuth = canUserJudgeCandidate(c, currentUser);

    return `
    <tr class="hover:bg-white/5 transition ${c.status === 'pendente' ? 'bg-amber-500/5' : ''}">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <img src="${c.photo}" alt="${c.ballotName}" class="w-10 h-12 rounded-lg object-cover bg-brand-deep border border-brand-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-white block">${c.ballotName}</span>
              ${c.status === 'pendente' ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">NOVO</span>' : ''}
            </div>
            <span class="text-[11px] text-slate-400 block">${c.fullName}</span>
            <span class="text-[10px] text-slate-500 font-mono block mt-0.5">Prot: ${c.protocol || 'N/D'}</span>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <span class="text-xs font-semibold text-brand-electric block">${c.office}</span>
        <span class="text-[11px] text-slate-400 block">${c.cityId && c.cityId !== 'ALL' ? (getCityDisplayName(c.stateId, c.cityId) + ' (' + getStateDisplayName(c.stateId) + ')') : getStateDisplayName(c.stateId)}</span>
        <span class="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><i data-lucide="scale" class="w-3 h-3 text-brand-electric"></i> ${compInfo.courtName}</span>
      </td>
      <td class="px-6 py-4">
        <span class="text-xs font-bold text-white block" style="color: ${c.partyColor || '#fff'}">${c.partyAcronym}</span>
        <span class="font-mono text-xs font-bold text-brand-gold">${c.number}</span>
      </td>
      <td class="px-6 py-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 ${
          c.status === 'deferida' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          c.status === 'indeferida' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          c.status === 'excluida' ? 'bg-slate-700 text-slate-300' :
          'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
        }">
          ${c.status === 'pendente' ? '<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>' : ''}
          ${c.status}
        </span>
      </td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          ${currentUser && currentUser.role === 'tse' ? `
            <button onclick="openTseEditCandidateModal('${c.id}')" class="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs transition flex items-center gap-1" title="Retificar Cadastro (Exclusivo TSE)">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Editar
            </button>
          ` : ''}
          ${judgeAuth.allowed ? `
            <button onclick="openJudgmentModal('${c.id}')" class="px-3.5 py-1.5 rounded-xl ${c.status === 'pendente' ? 'bg-brand-gold text-slate-950 hover:bg-yellow-400 font-extrabold shadow-glow-gold' : 'bg-brand-blue hover:bg-blue-500 text-white font-bold'} text-xs transition shadow-sm flex items-center gap-1.5">
              <i data-lucide="gavel" class="w-3.5 h-3.5"></i>
              <span>${c.status === 'pendente' ? 'Julgar Agora' : 'Reavaliar'}</span>
            </button>
          ` : `
            <button onclick="openJudgmentModal('${c.id}')" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition flex items-center gap-1.5" title="${judgeAuth.reason}">
              <i data-lucide="scale" class="w-3.5 h-3.5 text-brand-electric"></i>
              <span>Ver Processo</span>
            </button>
          `}
        </div>
      </td>
    </tr>
  `;
  }).join('');

  initIcons();
}

function openJudgmentModal(candId) {
  selectedCandForJudgment = candidaciesList.find(c => c.id === candId);
  if (!selectedCandForJudgment) return;

  const c = selectedCandForJudgment;
  document.getElementById('modal-cand-photo').src = c.photo;
  document.getElementById('modal-cand-name').textContent = c.ballotName;
  const circ = c.cityId && c.cityId !== 'ALL' ? `${getCityDisplayName(c.stateId, c.cityId)} - ${getStateDisplayName(c.stateId)}` : getStateDisplayName(c.stateId);
  document.getElementById('modal-cand-sub').textContent = `${c.office} • ${c.partyAcronym} • ${circ}`;
  document.getElementById('modal-cand-number').textContent = c.number;
  document.getElementById('modal-cand-badge').textContent = c.protocol;

  const tiktokEl = document.getElementById('modal-cand-tiktok');
  tiktokEl.textContent = c.tiktok || 'Não informado';
  tiktokEl.href = (c.tiktok && c.tiktok.startsWith('http')) ? c.tiktok : (c.tiktok ? 'https://tiktok.com/' + c.tiktok.replace(/^@/, '') : '#');

  document.getElementById('modal-cand-vice').textContent = c.viceName || 'Não aplicável';
  document.getElementById('judgment-reason-text').value = c.rejectionReason || '';

  // Verificação Jurisdicional Estrita
  const compInfo = getCompetentCourtInfo(c);
  const judgeAuth = canUserJudgeCandidate(c, currentUser);

  const courtNameEl = document.getElementById('judgment-competent-court-name');
  if (courtNameEl) {
    courtNameEl.textContent = `${compInfo.courtName} • ${compInfo.jurisdictionDesc}`;
  }

  const badgeEl = document.getElementById('judgment-jurisdiction-badge');
  const alertBox = document.getElementById('judgment-jurisdiction-alert');
  const blockedNotice = document.getElementById('judgment-blocked-notice');
  const blockedReason = document.getElementById('judgment-blocked-reason');

  if (judgeAuth.allowed) {
    if (badgeEl) {
      badgeEl.className = 'px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 self-start sm:self-center bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      badgeEl.innerHTML = '<i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Foro Competente Autorizado';
    }
    if (alertBox) {
      alertBox.className = 'p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/20 border-emerald-500/30';
    }
    if (blockedNotice) blockedNotice.classList.add('hidden');
  } else {
    if (badgeEl) {
      badgeEl.className = 'px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 self-start sm:self-center bg-red-500/20 text-red-300 border border-red-500/40';
      badgeEl.innerHTML = '<i data-lucide="shield-alert" class="w-3.5 h-3.5"></i> Foro Incompetente';
    }
    if (alertBox) {
      alertBox.className = 'p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-950/20 border-red-500/30';
    }
    if (blockedNotice && blockedReason) {
      blockedReason.textContent = judgeAuth.reason;
      blockedNotice.classList.remove('hidden');
    }
  }

  // Habilita / Desabilita botões de ação judicial conforme competência
  const deferBtn = document.getElementById('judgment-defer-btn');
  const indeferBtn = document.getElementById('judgment-indefer-btn');
  const excludeBtn = document.getElementById('judgment-exclude-btn');
  const reopenBtn = document.getElementById('judgment-reopen-btn');

  if (deferBtn) {
    deferBtn.disabled = !judgeAuth.allowed;
    deferBtn.classList.toggle('opacity-40', !judgeAuth.allowed);
    deferBtn.classList.toggle('cursor-not-allowed', !judgeAuth.allowed);
    deferBtn.title = judgeAuth.allowed ? 'Homologar candidatura' : judgeAuth.reason;
  }
  if (indeferBtn) {
    indeferBtn.disabled = !judgeAuth.allowed;
    indeferBtn.classList.toggle('opacity-40', !judgeAuth.allowed);
    indeferBtn.classList.toggle('cursor-not-allowed', !judgeAuth.allowed);
    indeferBtn.title = judgeAuth.allowed ? 'Indeferir candidatura' : judgeAuth.reason;
  }
  if (excludeBtn) {
    const canExclude = judgeAuth.allowed || currentUser?.role === 'tse';
    excludeBtn.disabled = !canExclude;
    excludeBtn.classList.toggle('opacity-40', !canExclude);
    excludeBtn.classList.toggle('cursor-not-allowed', !canExclude);
  }

  // Botão de Devolver para PENDENTE (Permite corrigir homologações indevidas)
  if (reopenBtn) {
    const canReopen = (c.status === 'deferida' || c.status === 'indeferida') && (judgeAuth.allowed || currentUser?.role === 'tse');
    if (canReopen) {
      reopenBtn.classList.remove('hidden');
    } else {
      reopenBtn.classList.add('hidden');
    }
  }

  const tseEditBtn = document.getElementById('judgment-tse-edit-btn');
  if (tseEditBtn) {
    if (currentUser && currentUser.role === 'tse') {
      tseEditBtn.classList.remove('hidden');
    } else {
      tseEditBtn.classList.add('hidden');
    }
  }

  document.getElementById('judgment-modal').classList.remove('hidden');
  initIcons();
}

function closeJudgmentModal() {
  document.getElementById('judgment-modal').classList.add('hidden');
  selectedCandForJudgment = null;
}

function viewCandidatePdf() {
  if (selectedCandForJudgment && selectedCandForJudgment.proposalPdf) {
    downloadOrViewPdf(selectedCandForJudgment.id);
  } else {
    showToast('info', 'Nenhum PDF cadastrado para este candidato.');
  }
}

async function executeJudgment(newStatus) {
  if (!selectedCandForJudgment || !currentUser) {
    showToast('error', 'Sessão judicial não identificada.');
    return;
  }

  const c = selectedCandForJudgment;
  const reason = document.getElementById('judgment-reason-text').value.trim();
  const compInfo = getCompetentCourtInfo(c);
  const judgeAuth = canUserJudgeCandidate(c, currentUser);

  // 1. REABERTURA (DEVOLVER PARA PENDENTE):
  if (newStatus === 'pendente') {
    if (!judgeAuth.allowed && currentUser.role !== 'tse') {
      showToast('error', 'Apenas o Tribunal competente ou a Presidência do TSE podem devolver esta candidatura para análise.');
      return;
    }

    try {
      await db.ref('candidates/' + c.id).update({
        status: 'pendente',
        rejectionReason: null,
        judgedBy: null,
        judgedAt: null,
        competentCourt: compInfo.courtName,
        reopenedBy: currentUser.name,
        reopenedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await db.ref('auditLogs').push({
        candidateId: c.id || '',
        candidateProtocol: c.protocol || '',
        ballotName: c.ballotName || '',
        office: c.office || '',
        number: c.number || '',
        previousStatus: c.status || 'deferida',
        newStatus: 'pendente',
        reason: reason || 'Processo reaberto e devolvido para a fila de julgamento do órgão competente',
        adminUser: currentUser.login || currentUser.id || 'tse',
        adminName: currentUser.name || 'Magistrado',
        adminRole: currentUser.role || 'tse',
        timestamp: new Date().toISOString()
      });

      showToast('success', `Candidatura devolvida para PENDENTE. O ${compInfo.courtName} fará a homologação.`);
      closeJudgmentModal();
      return;
    } catch (err) {
      console.error('Erro ao devolver candidatura:', err);
      showToast('error', 'Erro ao devolver processo para status pendente.');
      return;
    }
  }

  // 2. JULGAMENTO REGULAR (DEFERIR, INDEFERIR, EXCLUIR):
  if (!judgeAuth.allowed) {
    showToast('error', judgeAuth.reason);
    return;
  }

  if ((newStatus === 'indeferida' || newStatus === 'excluida') && !reason) {
    showToast('error', 'É obrigatório inserir a fundamentação jurídica do despacho.');
    return;
  }

  try {
    const updates = {
      status: newStatus,
      rejectionReason: reason || null,
      judgedBy: currentUser.name,
      competentCourt: compInfo.courtName,
      judgedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Se excluída, libera o número de urna no numberRegistry
    if (newStatus === 'excluida') {
      await db.ref(`numberRegistry/${c.electionId}/${c.office}/${c.number}`).remove();
    }

    // Atualiza o candidato
    await db.ref('candidates/' + c.id).update(updates);

    // Registra Log Imutável de Auditoria
    await db.ref('auditLogs').push({
      candidateId: c.id || '',
      candidateProtocol: c.protocol || '',
      ballotName: c.ballotName || '',
      office: c.office || '',
      number: c.number || '',
      previousStatus: c.status || 'pendente',
      newStatus: newStatus,
      reason: reason || `Homologação deferida pelo órgão judicial competente: ${compInfo.courtName}`,
      adminUser: currentUser.login || currentUser.id || 'tse',
      adminName: currentUser.name || 'Magistrado',
      adminRole: currentUser.role || 'tse',
      competentCourt: compInfo.courtName,
      timestamp: new Date().toISOString()
    });

    showToast('success', `Julgamento registrado com sucesso: ${newStatus.toUpperCase()} por ${currentUser.name}`);
    closeJudgmentModal();

  } catch (error) {
    console.error("Erro ao julgar:", error);
    showToast('error', 'Falha ao gravar julgamento judicial.');
  }
}

// ========================================================
// RETIFICAÇÃO DE CANDIDATURAS - EXCLUSIVO PRESIDÊNCIA DO TSE
// ========================================================
let selectedCandForTseEdit = null;
let tseEditPhotoBase64 = '';

function openTseEditFromJudgment() {
  if (!selectedCandForJudgment) return;
  const candId = selectedCandForJudgment.id;
  closeJudgmentModal();
  openTseEditCandidateModal(candId);
}

function openTseEditCandidateModal(candId) {
  if (!currentUser || currentUser.role !== 'tse') {
    showToast('error', 'Apenas a Presidência do TSE possui prerrogativa legal para retificar cadastros eleitorais.');
    return;
  }

  const cand = candidaciesList.find(c => String(c.id) === String(candId));
  if (!cand) {
    showToast('error', 'Candidatura não localizada no registro oficial.');
    return;
  }

  selectedCandForTseEdit = cand;
  tseEditPhotoBase64 = cand.photo || '';

  const modal = document.getElementById('tse-edit-candidate-modal');
  if (!modal) return;

  // Preenche dados identificadores
  document.getElementById('tse-edit-cand-id').value = cand.id;
  document.getElementById('tse-edit-protocol-badge').textContent = cand.protocol || 'SEM PROTOCOLO';
  
  // Foto
  const photoPreview = document.getElementById('tse-edit-photo-preview');
  if (photoPreview) {
    photoPreview.src = cand.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
  }

  // Nomes
  document.getElementById('tse-edit-ballot-name').value = cand.ballotName || '';
  document.getElementById('tse-edit-full-name').value = cand.fullName || '';

  // Popula Partidos
  const partySelect = document.getElementById('tse-edit-party');
  if (partySelect) {
    partySelect.innerHTML = partiesList.map(p => `
      <option value="${p.id}" ${String(p.id) === String(cand.partyId) ? 'selected' : ''}>
        [${p.acronym}] ${p.name} (Nº ${p.number})
      </option>
    `).join('');
  }

  // Popula Estados
  const stateSelect = document.getElementById('tse-edit-state');
  if (stateSelect) {
    stateSelect.innerHTML = '<option value="">Selecione o Estado...</option>' +
      Object.entries(BROOKASIL_GEO).map(([key, item]) => `
        <option value="${key}" ${String(key).toLowerCase() === String(cand.stateId || cand.state || '').toLowerCase() ? 'selected' : ''}>
          ${item.name}
        </option>
      `).join('');
  }

  // Popula Cidades do Estado selecionado
  const citySelect = document.getElementById('tse-edit-city');
  const currentStateKey = stateSelect ? stateSelect.value : '';
  if (citySelect) {
    if (currentStateKey && BROOKASIL_GEO[currentStateKey]) {
      citySelect.innerHTML = '<option value="">Não aplicável ou Selecione</option>' +
        Object.entries(BROOKASIL_GEO[currentStateKey].cities).map(([cKey, cName]) => `
          <option value="${cKey}" ${String(cKey).toLowerCase() === String(cand.cityId || cand.city || '').toLowerCase() ? 'selected' : ''}>
            ${cName}
          </option>
        `).join('');
    } else {
      citySelect.innerHTML = '<option value="">Não aplicável ou Selecione</option>';
    }
  }

  // Cargo e visibilidades
  const officeSelect = document.getElementById('tse-edit-office');
  if (officeSelect) {
    officeSelect.value = cand.office || 'Presidente';
  }
  onTseEditOfficeChange();

  // Número
  document.getElementById('tse-edit-number').value = cand.number !== undefined ? cand.number : '';

  // Vice, Coligação, TikTok, Nascimento e Status
  document.getElementById('tse-edit-vice').value = cand.viceName || '';
  document.getElementById('tse-edit-coalition').value = cand.coalition || '';
  document.getElementById('tse-edit-tiktok').value = cand.tiktok || '';
  document.getElementById('tse-edit-birth-date').value = cand.birthDate || '';
  document.getElementById('tse-edit-status').value = cand.status || 'pendente';
  document.getElementById('tse-edit-proposals').value = cand.proposalsText || '';
  document.getElementById('tse-edit-audit-reason').value = '';

  modal.classList.remove('hidden');
  initIcons();
}

function closeTseEditCandidateModal() {
  const modal = document.getElementById('tse-edit-candidate-modal');
  if (modal) modal.classList.add('hidden');
  selectedCandForTseEdit = null;
  tseEditPhotoBase64 = '';
}

function onTseEditStateChange() {
  const stateSelect = document.getElementById('tse-edit-state');
  const citySelect = document.getElementById('tse-edit-city');
  if (!stateSelect || !citySelect) return;

  const stateKey = stateSelect.value;
  if (stateKey && BROOKASIL_GEO[stateKey]) {
    citySelect.innerHTML = '<option value="">Selecione a cidade...</option>' +
      Object.entries(BROOKASIL_GEO[stateKey].cities).map(([key, name]) => `<option value="${key}">${name}</option>`).join('');
  } else {
    citySelect.innerHTML = '<option value="">Selecione o estado primeiro...</option>';
  }
}

function onTseEditOfficeChange() {
  // Mantém os campos acessíveis no formulário do modal
}

function handleTseEditPhotoFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 8 * 1024 * 1024) {
    showToast('error', 'A foto deve ter no máximo 8MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    rawUploadedPhotoDataUrl = evt.target.result;
    openPhotoCropperModal(rawUploadedPhotoDataUrl, 'tse_edit');
  };
  reader.readAsDataURL(file);
}

function openPhotoCropperForTseEdit() {
  const currentPhoto = tseEditPhotoBase64 || selectedCandForTseEdit?.photo;
  if (!currentPhoto) {
    showToast('error', 'Nenhuma foto carregada para ajustar.');
    return;
  }
  openPhotoCropperModal(currentPhoto, 'tse_edit');
}

async function handleTseEditCandidateSubmit(e) {
  e.preventDefault();

  if (!currentUser || currentUser.role !== 'tse') {
    showToast('error', 'Acesso negado: Apenas a Presidência do TSE pode salvar retificações.');
    return;
  }

  if (!selectedCandForTseEdit) {
    showToast('error', 'Nenhum candidato selecionado para retificação.');
    return;
  }

  const candId = selectedCandForTseEdit.id;
  const ballotName = document.getElementById('tse-edit-ballot-name').value.trim();
  const fullName = document.getElementById('tse-edit-full-name').value.trim();
  const office = document.getElementById('tse-edit-office').value;
  const partyId = document.getElementById('tse-edit-party').value;
  const numberVal = parseInt(document.getElementById('tse-edit-number').value, 10);
  const stateId = document.getElementById('tse-edit-state').value || '';
  const cityId = document.getElementById('tse-edit-city').value || '';
  const viceName = document.getElementById('tse-edit-vice').value.trim();
  const coalition = document.getElementById('tse-edit-coalition').value.trim();
  const tiktok = document.getElementById('tse-edit-tiktok').value.trim();
  const birthDate = document.getElementById('tse-edit-birth-date').value;
  const status = document.getElementById('tse-edit-status').value;
  const proposalsText = document.getElementById('tse-edit-proposals').value.trim();
  const auditReason = document.getElementById('tse-edit-audit-reason').value.trim();

  if (!ballotName || !fullName) {
    showToast('error', 'Nome de urna e nome completo são obrigatórios.');
    return;
  }

  if (isNaN(numberVal) || numberVal <= 0) {
    showToast('error', 'Informe um número eleitoral válido.');
    return;
  }

  if (!auditReason) {
    showToast('error', 'A fundamentação da retificação do TSE é obrigatória para fins de auditoria eleitoral.');
    return;
  }

  const selectedParty = partiesList.find(p => String(p.id) === String(partyId));
  const newPhoto = tseEditPhotoBase64 || selectedCandForTseEdit.photo;

  // Prepara o objeto retificado
  const updatedCandidate = {
    ...selectedCandForTseEdit,
    ballotName,
    fullName,
    office,
    partyId,
    partyAcronym: selectedParty?.acronym || selectedCandForTseEdit.partyAcronym,
    partyName: selectedParty?.name || selectedCandForTseEdit.partyName,
    partyColor: selectedParty?.color || selectedCandForTseEdit.partyColor,
    partyNumber: selectedParty?.number || selectedCandForTseEdit.partyNumber,
    number: numberVal,
    stateId: stateId || selectedCandForTseEdit.stateId || 'brookhaven',
    cityId: cityId || selectedCandForTseEdit.cityId || '',
    viceName: viceName || null,
    coalition: coalition || null,
    tiktok: tiktok || selectedCandForTseEdit.tiktok || '',
    birthDate: birthDate || selectedCandForTseEdit.birthDate || '',
    status: status,
    proposalsText: proposalsText,
    photo: newPhoto,
    lastRectifiedAt: new Date().toISOString(),
    lastRectifiedBy: currentUser.name || 'Presidência do TSE',
    updatedAt: new Date().toISOString()
  };

  try {
    // 1. Atualiza no Firebase Realtime Database
    if (db) {
      await db.ref('candidates/' + candId).update(updatedCandidate);

      // Se mudou o número e o anterior era diferente, atualiza registro de número
      if (selectedCandForTseEdit.number !== numberVal) {
        if (selectedCandForTseEdit.number) {
          await db.ref(`numberRegistry/${selectedCandForTseEdit.electionId || 'brk2026'}/${selectedCandForTseEdit.office}/${selectedCandForTseEdit.number}`).remove().catch(() => {});
        }
        await db.ref(`numberRegistry/${selectedCandForTseEdit.electionId || 'brk2026'}/${office}/${numberVal}`).set({
          candidateId: candId,
          ballotName: ballotName,
          partyAcronym: selectedParty?.acronym || '',
          reservedAt: new Date().toISOString(),
          reservedByTse: true
        }).catch(() => {});
      }

      // 2. Grava log imutável de auditoria no TSE
      await db.ref('auditLogs').push({
        action: 'tse_candidate_rectification',
        candidateId: candId,
        candidateProtocol: selectedCandForTseEdit.protocol || '',
        ballotName: ballotName,
        office: office,
        number: numberVal,
        party: selectedParty?.acronym || '',
        reason: auditReason,
        adminUser: currentUser.login || 'tse',
        adminName: currentUser.name || 'Presidência do TSE',
        adminRole: 'tse',
        timestamp: new Date().toISOString()
      });
    }

    // 3. Atualiza localmente no array candidaciesList
    const idx = candidaciesList.findIndex(c => String(c.id) === String(candId));
    if (idx !== -1) {
      candidaciesList[idx] = updatedCandidate;
    }

    showToast('success', `Candidatura de "${ballotName}" retificada e publicada com sucesso pelo TSE!`);
    closeTseEditCandidateModal();

    // 4. Atualiza todas as visualizações em tempo real
    renderConfirmedCandidates();
    renderAdminCandidacies();
    updateGlobalStats();
    updateAdminCharts();

  } catch (err) {
    console.error('Erro ao salvar retificação no TSE:', err);
    showToast('error', 'Falha ao gravar retificação da candidatura.');
  }
}

function renderAuditLogs(logs) {
  const container = document.getElementById('admin-audit-logs');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500">Nenhum registro de auditoria arquivado.</p>';
    return;
  }

  container.innerHTML = logs.map(l => {
    const isTseRect = l.action === 'tse_candidate_rectification' || l.action === 'TSE_RETIFICACAO';
    const isParty = !!l.action && !isTseRect;
    
    let badgeText = 'AÇÃO';
    let badgeClass = 'bg-brand-blue/30 text-brand-electric border border-brand-electric/30';
    let descText = '';

    if (isTseRect) {
      badgeText = 'RETIFICAÇÃO TSE';
      badgeClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm';
      descText = `Candidatura ${l.ballotName || ''} (${l.office || ''} - ${l.number || ''}) • Justificativa: ${l.reason || 'Retificação oficial TSE'}`;
    } else if (isParty) {
      badgeText = l.action.replace('PARTY_', 'PARTIDO: ');
      badgeClass = (l.action === 'PARTY_DELETE') 
        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      descText = `Legenda ${l.partyAcronym || ''} (Nº ${l.partyNumber !== undefined ? l.partyNumber : 'S/N'}) • ${l.reason || 'Atualização cadastral'}`;
    } else {
      badgeText = l.newStatus ? l.newStatus.toUpperCase() : 'JULGAMENTO';
      badgeClass = (l.newStatus === 'indeferida' || l.newStatus === 'excluida')
        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
        : (l.newStatus === 'deferida')
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      descText = `${l.ballotName || 'Candidatura'} (${l.office || ''} - ${l.number || ''}) • Motivo: ${l.reason || 'Despacho judicial regular'}`;
    }

    return `
      <div class="p-3.5 rounded-xl bg-brand-navy/60 border border-brand-border flex items-center justify-between gap-4 text-xs">
        <div>
          <div class="flex items-center gap-2">
            <strong class="text-white">${l.adminName || 'Magistrado'}</strong>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${badgeClass}">${badgeText}</span>
          </div>
          <p class="text-slate-400 mt-1">${descText}</p>
        </div>
        <span class="text-[10px] text-slate-500 font-mono flex-shrink-0">${l.timestamp ? new Date(l.timestamp).toLocaleTimeString('pt-BR') : ''}</span>
      </div>
    `;
  }).join('');
}

// ========================================================
// GRÁFICOS INTERATIVOS CHART.JS
// ========================================================
let chartOfficeInstance = null;
let chartStatusInstance = null;

function updateAdminCharts() {
  const ctxOffice = document.getElementById('chart-by-office');
  const ctxStatus = document.getElementById('chart-by-status');
  if (!ctxOffice || !ctxStatus || typeof Chart === 'undefined') return;

  // Estatísticas por cargo
  const offices = OFFICES_CONFIG.Federal.concat(OFFICES_CONFIG.Municipal);
  const officeLabels = [...new Set(offices.map(o => o.name))];
  const officeCounts = officeLabels.map(name => candidaciesList.filter(c => c.office === name).length);

  if (chartOfficeInstance) chartOfficeInstance.destroy();
  chartOfficeInstance = new Chart(ctxOffice, {
    type: 'bar',
    data: {
      labels: officeLabels,
      datasets: [{
        label: 'Candidaturas',
        data: officeCounts,
        backgroundColor: '#38bdf8'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: '#1e3568' } }
      }
    }
  });

  // Estatísticas por status
  const statuses = ['pendente', 'deferida', 'indeferida', 'excluida'];
  const statusCounts = statuses.map(s => candidaciesList.filter(c => c.status === s).length);

  if (chartStatusInstance) chartStatusInstance.destroy();
  chartStatusInstance = new Chart(ctxStatus, {
    type: 'doughnut',
    data: {
      labels: ['Pendentes', 'Deferidas', 'Indeferidas', 'Excluídas'],
      datasets: [{
        data: statusCounts,
        backgroundColor: ['#fbbf24', '#10b981', '#ef4444', '#64748b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      }
    }
  });
}

function refreshAdminData() {
  showToast('info', 'Sincronizando com o Firebase...');
  if (db) {
    db.ref('candidates').once('value', (snap) => {
      const data = snap.val();
      if (data) {
        if (Array.isArray(data)) {
          candidaciesList = data
            .map((val, idx) => (val && typeof val === 'object') ? ({ id: val.id !== undefined ? val.id : String(idx), ...val }) : null)
            .filter(Boolean);
        } else {
          candidaciesList = Object.entries(data)
            .map(([id, val]) => (val && typeof val === 'object') ? ({ id: val.id !== undefined ? val.id : id, ...val }) : null)
            .filter(Boolean);
        }
      } else {
        candidaciesList = [];
      }
      updateGlobalStats();
      renderConfirmedCandidates();
      if (currentUser) {
        renderAdminCandidacies();
        updateAdminCharts();
      }
      showToast('success', `${candidaciesList.length} candidaturas sincronizadas em tempo real!`);
    }, (err) => {
      console.error('Erro na sincronização:', err);
      showToast('error', 'Falha na sincronização com o banco.');
    });
  }
}

// ========================================================
// SISTEMA DE TOASTS
// ========================================================
function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-2xl border text-xs font-bold shadow-2xl flex items-center gap-3 pointer-events-auto transform translate-y-4 transition-all duration-300 ${
    type === 'success' ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200' :
    type === 'error' ? 'bg-red-950/95 border-red-500 text-red-200' :
    'bg-blue-950/95 border-brand-electric text-blue-200'
  }`;

  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-4'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Exportações globais de funções interativas para a interface HTML
window.openPhotoCropperModal = openPhotoCropperModal;
window.closePhotoCropperModal = closePhotoCropperModal;
window.setCropperZoom = setCropperZoom;
window.stepCropperZoom = stepCropperZoom;
window.centerCropper = centerCropper;
window.rotateCropper = rotateCropper;
window.resetCropper = resetCropper;
window.applyCroppedPhoto = applyCroppedPhoto;
window.openTseEditCandidateModal = openTseEditCandidateModal;
window.closeTseEditCandidateModal = closeTseEditCandidateModal;
window.onTseEditStateChange = onTseEditStateChange;
window.onTseEditOfficeChange = onTseEditOfficeChange;
window.handleTseEditPhotoFile = handleTseEditPhotoFile;
window.openPhotoCropperForTseEdit = openPhotoCropperForTseEdit;
window.handleTseEditCandidateSubmit = handleTseEditCandidateSubmit;
window.openTseEditFromJudgment = openTseEditFromJudgment;

