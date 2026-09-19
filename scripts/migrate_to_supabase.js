import fs from 'fs';
import https from 'https';

const SUPABASE_URL = 'https://jghdyksktkcuupazbhao.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaGR5a3NrdGtjdXVwYXpiaGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDk5ODIsImV4cCI6MjEwNTQyNTk4Mn0.gCyTUeKnKCBaxngF7xmML5cjKLzEZvW_dFANVclqb8Q';

export async function migrateCandidates(apiKey = ANON_KEY) {
  const dbData = JSON.parse(fs.readFileSync('data/database.json', 'utf8'));
  const candidates = dbData.candidacies || [];

  console.log(`Iniciando migração de ${candidates.length} candidatos para o Supabase...`);

  let successCount = 0;
  let failCount = 0;

  for (const c of candidates) {
    const payload = {
      id: String(c.id),
      protocol: c.protocol || `CAND-${Date.now()}`,
      fullname: c.fullName || c.full_name || c.ballotName || 'Candidato',
      ballotname: c.ballotName || c.ballot_name || c.fullName || 'Candidato',
      number: String(c.number || '10'),
      office: c.office || c.position || 'Prefeito',
      partyid: c.partyId || c.party_id || 'p01',
      partyacronym: c.partyAcronym || c.party_acronym || 'PNTB',
      partyname: c.partyName || c.party_name || '',
      partynumber: Number(c.partyNumber || c.party_number || 10),
      state: c.state || c.stateId || 'Brookhaven',
      city: c.city || c.cityId || 'Cidade Eleitoral',
      status: String(c.status || 'deferida').toLowerCase(),
      photo: c.photo || '',
      proposalpdf: c.proposalPdf || c.proposalpdf || '',
      tiktok: c.tiktok || '',
      vicename: c.viceName || c.vice_name || ''
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/candidates`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        successCount++;
        console.log(`[OK] ${payload.ballotname} (${payload.office}) migrado com sucesso.`);
      } else {
        const errText = await res.text();
        failCount++;
        console.error(`[ERRO] ${payload.ballotname}: HTTP ${res.status} - ${errText}`);
      }
    } catch (err) {
      failCount++;
      console.error(`[FALHA] ${payload.ballotname}:`, err.message);
    }
  }

  console.log(`\nResultado da migração: ${successCount} salvos, ${failCount} falhas.`);
  return { successCount, failCount };
}

// Executa se chamado diretamente
if (process.argv[1]?.endsWith('migrate_to_supabase.js')) {
  const customKey = process.argv[2] || ANON_KEY;
  migrateCandidates(customKey);
}
