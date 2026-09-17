#!/usr/bin/env node
/**
 * SCRIPT DE DIAGNÓSTICO E VERIFICAÇÃO DO FIREBASE REALTIME DATABASE
 * Candidaturas | Brookasil RP 🇬🇦
 * 
 * Execução: node test_firebase.js
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para saída no terminal
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlue: "\x1b[44m"
};

// 1. Extração da configuração oficial do app.js
let firebaseConfig = {
  databaseURL: "https://candidatura-cde-2-default-rtdb.firebaseio.com",
  projectId: "candidatura-cde-2"
};

try {
  const appJsPath = path.join(__dirname, 'app.js');
  if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const match = appJsContent.match(/const\s+firebaseConfig\s*=\s*({[\s\S]*?});/);
    if (match) {
      const parsedConfig = new Function(`return ${match[1]}`)();
      if (parsedConfig && parsedConfig.databaseURL) {
        firebaseConfig = parsedConfig;
      }
    }
  }
} catch (e) {
  // Mantém fallback padrão
}

const DATABASE_URL = firebaseConfig.databaseURL.replace(/\/$/, '');

// Função auxiliar HTTP
export function httpRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Brookasil-TSE-Diagnostic/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsedData = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsedData, raw: body });
        } catch (err) {
          resolve({ status: res.statusCode, data: null, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout ao conectar ao Firebase (10 segundos)"));
    });

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

export async function runDiagnostic() {
  console.log(`\n${c.bgBlue}${c.white}${c.bright}  DIAGNÓSTICO DE INTEGRAÇÃO FIREBASE | TRIBUNAL SUPERIOR ELEITORAL BROOKASIL  ${c.reset}\n`);
  console.log(`${c.cyan}URL do Banco:${c.reset} ${c.bright}${DATABASE_URL}${c.reset}`);
  console.log(`${c.cyan}Projeto ID:${c.reset}   ${c.bright}${firebaseConfig.projectId || 'candidatura-cde-2'}${c.reset}`);
  console.log(`${c.cyan}Horário do Teste:${c.reset} ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (UTC: ${new Date().toISOString()})\n`);

  let allPassed = true;

  // ETAPA 1: Teste de Conexão e Leitura/Escrita de Nó de Teste
  process.stdout.write(`${c.bright}[1/4] Testando conexão com o Firebase RTDB...${c.reset} `);
  const testPayload = {
    diagnosticRunAt: new Date().toISOString(),
    status: "online",
    system: "TSE Brookasil 2026",
    testMessage: "Conexão de diagnóstico ativa com sucesso"
  };

  try {
    // Escreve nó de teste
    const writeRes = await httpRequest(`${DATABASE_URL}/_connection_test.json`, 'PUT', testPayload);
    if (writeRes.status !== 200) {
      throw new Error(`Falha na gravação do nó de teste. Status HTTP: ${writeRes.status}`);
    }

    // Lê nó de teste de volta
    const readRes = await httpRequest(`${DATABASE_URL}/_connection_test.json`, 'GET');
    if (readRes.status !== 200 || !readRes.data || readRes.data.status !== "online") {
      throw new Error(`Falha na leitura do nó de teste. Status HTTP: ${readRes.status}`);
    }

    console.log(`${c.green}${c.bright}OK! Conexão bem sucedida.${c.reset}`);
    console.log(`   ${c.cyan}↳ Nó de teste gravado e lido:${c.reset} /_connection_test -> "${readRes.data.testMessage}"`);
  } catch (err) {
    allPassed = false;
    console.log(`${c.red}${c.bright}FALHA!${c.reset}`);
    console.error(`   ${c.red}Erro de conexão:${c.reset}`, err.message);
  }

  // ETAPA 2: Verificação do Nó de Candidatos ('candidates')
  console.log(`\n${c.bright}[2/4] Verificando integridade das candidaturas ('candidates')...${c.reset}`);
  let candidates = null;
  try {
    const candRes = await httpRequest(`${DATABASE_URL}/candidates.json`, 'GET');
    if (candRes.status !== 200 || !candRes.data) {
      throw new Error(`Não foi possível carregar o nó /candidates (Status ${candRes.status})`);
    }

    candidates = candRes.data;
    const candEntries = Object.entries(candidates);
    const totalCount = candEntries.length;

    console.log(`   ${c.green}✓${c.reset} Candidatos carregados: ${c.bright}${totalCount}${c.reset} registros encontrados no Firebase.`);

    // Contagem de status
    const statusCounts = { deferida: 0, indeferida: 0, pendente: 0, cancelada: 0, outros: 0 };
    const officeCounts = {};
    const partyCounts = {};

    candEntries.forEach(([id, cand]) => {
      const st = (cand.status || 'pendente').toLowerCase();
      if (statusCounts[st] !== undefined) statusCounts[st]++;
      else statusCounts.outros++;

      const off = cand.office || 'Não informado';
      officeCounts[off] = (officeCounts[off] || 0) + 1;

      const pAcro = cand.partyAcronym || cand.partyName || 'Sem Partido';
      partyCounts[pAcro] = (partyCounts[pAcro] || 0) + 1;
    });

    console.log(`   ${c.cyan}↳ Status:${c.reset} ${c.green}${statusCounts.deferida} Deferidas${c.reset} | ${c.yellow}${statusCounts.pendente} Pendentes${c.reset} | ${c.red}${statusCounts.indeferida} Indeferidas${c.reset}`);
    
    // Comparação com o arquivo de referência local (old_candidates.json) se existir
    const localCandsPath = path.join(__dirname, 'data', 'old_candidates.json');
    if (fs.existsSync(localCandsPath)) {
      const localCands = JSON.parse(fs.readFileSync(localCandsPath, 'utf8'));
      const localCount = Object.keys(localCands).length;
      
      let missingInFirebase = [];
      let extraInFirebase = [];

      for (const k of Object.keys(localCands)) {
        if (!candidates[k]) missingInFirebase.push(localCands[k].ballotName || k);
      }
      for (const k of Object.keys(candidates)) {
        if (!localCands[k]) extraInFirebase.push(candidates[k].ballotName || k);
      }

      if (missingInFirebase.length === 0 && extraInFirebase.length === 0 && totalCount === localCount) {
        console.log(`   ${c.green}${c.bright}✓ PARIDADE PERFEITA (100%):${c.reset} Todos os ${totalCount} candidatos do arquivo original conferem exatamente com o Firebase!`);
      } else {
        allPassed = false;
        if (missingInFirebase.length > 0) {
          console.log(`   ${c.red}✗ Faltando no Firebase (${missingInFirebase.length}):${c.reset} ${missingInFirebase.slice(0, 5).join(', ')}...`);
        }
        if (extraInFirebase.length > 0) {
          console.log(`   ${c.yellow}✗ Extras no Firebase (${extraInFirebase.length}):${c.reset} ${extraInFirebase.slice(0, 5).join(', ')}...`);
        }
      }
    }

    // Listagem resumida de cargos
    console.log(`   ${c.cyan}↳ Distribuição por Cargo:${c.reset}`);
    Object.entries(officeCounts).sort((a, b) => b[1] - a[1]).forEach(([cargo, qtd]) => {
      console.log(`      • ${cargo.padEnd(22)}: ${c.bright}${qtd}${c.reset}`);
    });

  } catch (err) {
    allPassed = false;
    console.log(`   ${c.red}✗ Erro ao verificar candidatos:${c.reset} ${err.message}`);
  }

  // ETAPA 3: Verificação do Nó de Partidos ('parties')
  console.log(`\n${c.bright}[3/4] Verificando legendas partidárias ('parties')...${c.reset}`);
  try {
    const partiesRes = await httpRequest(`${DATABASE_URL}/parties.json`, 'GET');
    if (partiesRes.status !== 200 || !partiesRes.data) {
      throw new Error(`Não foi possível carregar o nó /parties (Status ${partiesRes.status})`);
    }

    const parties = partiesRes.data;
    const partiesList = Array.isArray(parties) ? parties.filter(Boolean) : Object.values(parties);
    const partiesCount = partiesList.length;

    console.log(`   ${c.green}✓${c.reset} Partidos carregados: ${c.bright}${partiesCount}${c.reset} legendas registradas.`);

    const spectrumCounts = { Direita: 0, Centro: 0, Esquerda: 0, Outros: 0 };
    partiesList.forEach(p => {
      const g = p.group || p.spectrum || 'Outros';
      const norm = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
      if (spectrumCounts[norm] !== undefined) spectrumCounts[norm]++;
      else spectrumCounts.Outros++;
    });

    console.log(`   ${c.cyan}↳ Espectros:${c.reset} Direita: ${c.blue}${spectrumCounts.Direita}${c.reset} | Centro: ${c.yellow}${spectrumCounts.Centro}${c.reset} | Esquerda: ${c.red}${spectrumCounts.Esquerda}${c.reset}`);

    if (partiesCount === 44) {
      console.log(`   ${c.green}${c.bright}✓ TOTAL CORRETO:${c.reset} 44 legendas partidárias oficiais sincronizadas.`);
    } else {
      console.log(`   ${c.yellow}⚠ Atenção: Esperado 44 legendas, encontrado ${partiesCount}.${c.reset}`);
    }
  } catch (err) {
    allPassed = false;
    console.log(`   ${c.red}✗ Erro ao verificar partidos:${c.reset} ${err.message}`);
  }

  // ETAPA 4: Verificação de Eleições e Configurações
  console.log(`\n${c.bright}[4/4] Verificando Eleições e Configurações do Sistema...${c.reset}`);
  try {
    const elecRes = await httpRequest(`${DATABASE_URL}/elections.json`, 'GET');
    const settRes = await httpRequest(`${DATABASE_URL}/settings.json`, 'GET');

    const totalElections = elecRes.data ? Object.keys(elecRes.data).length : 0;
    const settingsOnline = !!settRes.data;

    console.log(`   ${c.green}✓${c.reset} Eleições ativas: ${c.bright}${totalElections}${c.reset}`);
    console.log(`   ${c.green}✓${c.reset} Parâmetros de eleição (/settings): ${settingsOnline ? `${c.green}OK${c.reset}` : `${c.yellow}Vazio${c.reset}`}`);
  } catch (err) {
    console.log(`   ${c.yellow}⚠ Eleições/Settings:${c.reset} ${err.message}`);
  }

  // Resumo Final
  console.log(`\n${c.bright}========================================================================${c.reset}`);
  if (allPassed) {
    console.log(`${c.green}${c.bright}  ✅ DIAGNÓSTICO CONCLUÍDO COM SUCESSO!${c.reset}`);
    console.log(`${c.white}  A nova configuração do Firebase está 100% operacional e todos os candidatos estão disponíveis.${c.reset}`);
  } else {
    console.log(`${c.yellow}${c.bright}  ⚠ DIAGNÓSTICO CONCLUÍDO COM PONTOS DE ATENÇÃO.${c.reset}`);
    console.log(`${c.white}  Revise as mensagens acima para detalhes sobre discrepâncias encontradas.${c.reset}`);
  }
  console.log(`${c.bright}========================================================================${c.reset}\n`);

  return allPassed;
}

// Execução direta
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDiagnostic().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error("Erro fatal no diagnóstico:", err);
    process.exit(1);
  });
}
