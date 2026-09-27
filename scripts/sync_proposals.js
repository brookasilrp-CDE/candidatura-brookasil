import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jghdyksktkcuupazbhao.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGR5a3NrdGtjdXVwYXpiaGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDk5ODIsImV4cCI6MjEwNTQyNTk4Mn0.gCyTUeKnKCBaxngF7xmML5cjKLzEZvW_dFANVclqb8Q';

export function sanitizeWinAnsi(str) {
  if (!str) return '';
  return String(str).replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ');
}

export async function generateCandidateProposalPdf(cand) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // Standard A4
  const { width, height } = page.getSize();
  
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);
  
  // Header Navy Banner
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width: width,
    height: 90,
    color: rgb(0.04, 0.11, 0.28)
  });

  // Top gold accent line
  page.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: rgb(0.96, 0.77, 0.19)
  });

  page.drawText(sanitizeWinAnsi("JUSTIÇA ELEITORAL DE BROOKASIL"), {
    x: 40,
    y: height - 35,
    size: 13,
    font: fontBold,
    color: rgb(0.96, 0.77, 0.19)
  });

  page.drawText(sanitizeWinAnsi("TRIBUNAL REGIONAL ELEITORAL • SISTEMA DIVULGACANDCONTAS"), {
    x: 40,
    y: height - 52,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.85, 0.95)
  });

  page.drawText(sanitizeWinAnsi("REGISTRO OFICIAL DE PLANO DE GOVERNO E DIRETRIZES PROGRAMÁTICAS"), {
    x: 40,
    y: height - 74,
    size: 10,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  // Candidate Box
  page.drawRectangle({
    x: 35,
    y: height - 210,
    width: width - 70,
    height: 105,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.85, 0.92),
    borderWidth: 1
  });

  page.drawText(sanitizeWinAnsi(`PROTOCOLO: ${cand.protocol || "CAND-2026-OFICIAL"}`), {
    x: 48,
    y: height - 125,
    size: 9,
    font: fontBold,
    color: rgb(0.15, 0.25, 0.5)
  });

  const bName = String(cand.ballotName || cand.ballotname || cand.fullName || "CANDIDATO").toUpperCase();
  page.drawText(sanitizeWinAnsi(`CANDIDATO(A): ${bName}`), {
    x: 48,
    y: height - 146,
    size: 13,
    font: fontBold,
    color: rgb(0.04, 0.11, 0.28)
  });

  const fName = String(cand.fullName || cand.fullname || bName);
  page.drawText(sanitizeWinAnsi(`NOME COMPLETO: ${fName}`), {
    x: 48,
    y: height - 163,
    size: 10,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  const partyInfo = `${cand.partyAcronym || cand.partyacronym || ""} (${cand.number || ""}) - ${cand.partyName || cand.partyname || ""}`;
  page.drawText(sanitizeWinAnsi(`PARTIDO E NÚMERO: ${partyInfo}`), {
    x: 48,
    y: height - 180,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.4, 0.2)
  });

  const locationInfo = `CARGO: ${cand.office || "Vereador"}  |  MUNICÍPIO/UF: ${cand.city || cand.cityId || "Brookhaven"} - ${cand.state || cand.stateId || "Brookhaven"}`;
  page.drawText(sanitizeWinAnsi(locationInfo), {
    x: 48,
    y: height - 198,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.45)
  });

  // Section Header
  page.drawText(sanitizeWinAnsi("SÍNTESE DAS PROPOSTAS E COMPROMISSOS COM A POPULAÇÃO"), {
    x: 38,
    y: height - 240,
    size: 11,
    font: fontBold,
    color: rgb(0.04, 0.11, 0.28)
  });

  page.drawLine({
    start: { x: 38, y: height - 246 },
    end: { x: width - 38, y: height - 246 },
    thickness: 1.5,
    color: rgb(0.96, 0.77, 0.19)
  });

  // Proposals Text
  const rawText = cand.proposalsText || cand.proposals || "Propostas registradas na Justiça Eleitoral.";
  const cleanBody = sanitizeWinAnsi(rawText);
  const lines = cleanBody.split("\n");
  let curY = height - 270;

  for (const line of lines) {
    if (!line.trim()) {
      curY -= 10;
      continue;
    }
    const words = line.split(" ");
    let curLine = "";
    for (const w of words) {
      if ((curLine + " " + w).length > 75) {
        page.drawText(curLine, { x: 42, y: curY, size: 9.5, font: fontRegular, color: rgb(0.15, 0.18, 0.25) });
        curY -= 15;
        curLine = w;
        if (curY < 80) break;
      } else {
        curLine = curLine ? curLine + " " + w : w;
      }
    }
    if (curLine && curY >= 80) {
      page.drawText(curLine, { x: 42, y: curY, size: 9.5, font: fontRegular, color: rgb(0.15, 0.18, 0.25) });
      curY -= 17;
    }
    if (curY < 80) break;
  }

  // Footer Certificate Box
  page.drawRectangle({
    x: 35,
    y: 30,
    width: width - 70,
    height: 45,
    color: rgb(0.95, 0.96, 0.98),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1
  });

  page.drawText(sanitizeWinAnsi("CERTIFICAÇÃO DIGITAL DA JUSTIÇA ELEITORAL"), {
    x: 48,
    y: 60,
    size: 8,
    font: fontBold,
    color: rgb(0.2, 0.3, 0.5)
  });

  const authHash = "TSE-BRK-" + Buffer.from((cand.protocol || cand.id || "CAND") + "2026").toString("hex").slice(0, 24).toUpperCase();
  page.drawText(sanitizeWinAnsi(`Documento oficial autuado sob o protocolo ${cand.protocol || cand.id} • Autenticação: ${authHash}`), {
    x: 48,
    y: 46,
    size: 7.5,
    font: fontItalic,
    color: rgb(0.4, 0.45, 0.55)
  });

  page.drawText(sanitizeWinAnsi(`Gerado em conformidade com as Resoluções do TSE de Brookasil - Sistema Oficial DivulgaCand`), {
    x: 48,
    y: 36,
    size: 7,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.65)
  });

  const pdfBytes = await doc.save();
  return "data:application/pdf;base64," + Buffer.from(pdfBytes).toString("base64");
}

export async function syncAllProposals() {
  console.log('[Sync Proposals] Iniciando sincronização completa de propostas...');
  const key = SUPABASE_ANON_KEY;
  const url = `${SUPABASE_URL}/rest/v1/candidates`;

  // 1. Fetch Supabase candidates
  const res = await fetch(`${url}?select=id,protocol,fullname,ballotname,number,office,partyid,partyacronym,partyname,partynumber,state,city,status,proposalpdf,tiktok,vicename`, {
    headers: { apikey: key, Authorization: "Bearer " + key }
  });
  if (!res.ok) {
    console.error('[Sync Proposals] Erro ao buscar dados do Supabase:', res.status, res.statusText);
    return;
  }
  const sbRows = await res.json();
  console.log(`[Sync Proposals] ${sbRows.length} registros no Supabase`);

  // 2. Load local db & seed
  const dbPath = path.join(process.cwd(), 'data', 'database.json');
  const seedPath = path.join(process.cwd(), 'public', 'seed_database.json');
  const seedMinPath = path.join(process.cwd(), 'public', 'seed_min.json');

  const localDb = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf8')) : { candidacies: [] };
  const localCands = localDb.candidacies || [];
  const seedData = fs.existsSync(seedPath) ? JSON.parse(fs.readFileSync(seedPath, 'utf8')) : { candidates: {} };
  const seedCands = seedData.candidates || {};

  const proposalMap = new Map();
  const pdfMap = new Map();

  for (const c of localCands) {
    if (c.id) {
      if (c.proposalsText) proposalMap.set(String(c.id), c.proposalsText);
      if (c.proposalPdf) pdfMap.set(String(c.id), c.proposalPdf);
    }
    if (c.ballotName) {
      if (c.proposalsText) proposalMap.set(c.ballotName.toUpperCase(), c.proposalsText);
      if (c.proposalPdf) pdfMap.set(c.ballotName.toUpperCase(), c.proposalPdf);
    }
  }

  for (const [id, c] of Object.entries(seedCands)) {
    if (c.proposalsText) {
      proposalMap.set(String(id), c.proposalsText);
      if (c.ballotName) proposalMap.set(c.ballotName.toUpperCase(), c.proposalsText);
    }
    if (c.proposalPdf) {
      pdfMap.set(String(id), c.proposalPdf);
      if (c.ballotName) pdfMap.set(c.ballotName.toUpperCase(), c.proposalPdf);
    }
  }

  let updatedCount = 0;
  for (const r of sbRows) {
    if (String(r.id).startsWith("__SYSTEM_")) continue;
    
    let currentPdf = r.proposalpdf || "";
    if (!currentPdf || currentPdf.length < 50) {
      // 1. Tenta recuperar PDF existente do seed
      let existingPdf = pdfMap.get(String(r.id)) || (r.ballotname && pdfMap.get(r.ballotname.toUpperCase()));
      if (existingPdf && existingPdf.length > 50) {
        console.log(`[Sync Proposals] Usando PDF existente para ${r.ballotname} (${r.id})`);
        currentPdf = existingPdf;
      } else {
        // 2. Gera novo PDF oficial com base no texto de proposta
        let propText = proposalMap.get(String(r.id)) || (r.ballotname && proposalMap.get(r.ballotname.toUpperCase()));
        if (!propText && r.ballotname === "TICO") {
          propText = "1. Fortalecimento da educação pública com creches e escolas em tempo integral em Brookhaven.\n2. Apoio aos jovens e qualificação profissional voltada à economia digital e empreendedorismo local.\n3. Melhorias na infraestrutura urbana, saneamento e postos de saúde da família com atendimento humanizado.";
        }
        if (!propText) {
          propText = `1. Compromisso com a transparência pública e a representação democrática da população de ${r.city || "Brookhaven"}.\n2. Prioridade absoluta na saúde pública básica e valorização dos profissionais.\n3. Projetos de modernização e inclusão digital comunitária.`;
        }

        console.log(`[Sync Proposals] Gerando PDF oficial para ${r.ballotname} (${r.id})...`);
        currentPdf = await generateCandidateProposalPdf({
          ...r,
          proposalsText: propText
        });
      }

      // Atualiza no Supabase
      const patchRes = await fetch(`${url}?id=eq.${encodeURIComponent(r.id)}`, {
        method: "PATCH",
        headers: {
          apikey: key,
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ proposalpdf: currentPdf })
      });

      if (patchRes.ok) {
        updatedCount++;
        r.proposalpdf = currentPdf;
        console.log(`[Sync Proposals] Sucesso ao atualizar ${r.ballotname} no Supabase!`);
      } else {
        console.warn(`[Sync Proposals] Falha ao atualizar ${r.ballotname}:`, patchRes.status);
      }
    }
  }

  console.log(`[Sync Proposals] Concluído! Total atualizados no Supabase: ${updatedCount}`);

  // 3. Atualiza local database e seed files para refletirem exatamente todos os candidatos e propostas
  const mergedCands = sbRows.filter(r => !String(r.id).startsWith("__SYSTEM_")).map(r => {
    const propText = proposalMap.get(String(r.id)) || (r.ballotname && proposalMap.get(r.ballotname.toUpperCase())) || (r.ballotname === "TICO" ? "1. Fortalecimento da educação pública com creches e escolas em tempo integral em Brookhaven.\n2. Apoio aos jovens e qualificação profissional voltada à economia digital e empreendedorismo local.\n3. Melhorias na infraestrutura urbana, saneamento e postos de saúde da família com atendimento humanizado." : "Propostas em análise e regularização perante a Justiça Eleitoral.");
    return {
      id: String(r.id),
      protocol: r.protocol,
      fullName: r.fullname,
      ballotName: r.ballotname,
      number: String(r.number),
      office: r.office,
      partyId: r.partyid,
      partyAcronym: r.partyacronym,
      partyName: r.partyname,
      partyNumber: Number(r.partynumber || 0),
      state: r.state,
      stateId: r.state,
      city: r.city,
      cityId: r.city,
      status: r.status,
      photo: r.photo,
      tiktok: r.tiktok,
      viceName: r.vicename,
      proposalsText: propText,
      hasProposalPdf: true,
      proposalPdf: r.proposalpdf || null
    };
  });

  localDb.candidacies = mergedCands;
  fs.writeFileSync(dbPath, JSON.stringify(localDb, null, 2), 'utf8');

  // Also update seed_min.json
  if (fs.existsSync(seedMinPath)) {
    const minData = JSON.parse(fs.readFileSync(seedMinPath, 'utf8'));
    if (!minData.candidates) minData.candidates = {};
    for (const c of mergedCands) {
      if (!minData.candidates[c.id]) {
        minData.candidates[c.id] = {
          ...c,
          createdAt: new Date().toISOString()
        };
      } else {
        minData.candidates[c.id].proposalsText = c.proposalsText;
        minData.candidates[c.id].hasProposalPdf = true;
      }
    }
    fs.writeFileSync(seedMinPath, JSON.stringify(minData), 'utf8');
  }

  console.log(`[Sync Proposals] Banco de dados local sincronizado com ${mergedCands.length} candidaturas.`);
}

if (process.argv[1] && process.argv[1].endsWith('sync_proposals.js')) {
  syncAllProposals().catch(err => console.error('[Sync Error]', err));
}
