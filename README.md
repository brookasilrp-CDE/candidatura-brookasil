# 🗳️ CANDIDATURAS | BROOKASIL RP 🇬🇦
### Sistema Oficial de Registro e Consulta de Candidaturas da Justiça Eleitoral de Brookasil

Sistema web completo, interativo, responsivo e moderno integrado ao **Supabase (PostgreSQL)** para gerenciamento de eleições, registro de candidaturas, julgamento de processos eleitorais (TSE e TREs) e consulta pública de candidatos confirmados.

---

## 🏛️ Visão Geral & Tecnologias
- **Frontend**: HTML5, CSS3, Tailwind CSS, JavaScript Vanilla (ES6+ modular).
- **Banco de Dados**: Supabase (PostgreSQL via REST API).
- **Servidor / Backend**: Express & Vite (Node.js).
- **Gráficos & Animações**: Chart.js, Lucide Icons, Canvas Confetti, Microinterações CSS e símbolo heráldico exclusivo: **Flor de 8 Pétalas de Brookasil**.

---

## 🚀 Publicação no GitHub Pages
1. Crie ou acesse seu repositório no GitHub.
2. Faça o upload dos arquivos `index.html`, `database.rules.json` e `README.md` na branch principal (`main` ou `master`).
3. No GitHub, vá em **Settings** > **Pages**.
4. Em **Build and deployment** > **Source**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`.
6. Clique em **Save**. Em instantes seu sistema estará no ar na URL do GitHub Pages!

---

## 🗄️ Estrutura da Tabela no Supabase (`candidates`)
```text
id            (text, primary key)
protocol      (text, unique)
fullname      (text)
ballotname    (text)
number        (text)
office        (text)
partyid       (text)
partyacronym  (text)
partyname     (text)
partynumber   (int4)
state         (text)
city          (text)
status        (text: 'deferida', 'pendente', 'indeferida', etc.)
photo         (text)
proposalpdf   (text)
tiktok        (text)
vicename      (text)
created_at    (timestamptz)
```

---

## 🔐 Credenciais Administrativas de Acesso

> ⚠️ *Nota de RP*: Estas credenciais são propositalmente definidas no código para a simulação do universo fictício do Brookasil RP.

| Tribunal | Login | Senha | Função / Jurisdição |
| :--- | :--- | :--- | :--- |
| **TSE Nacional** | `TSE_Brookasil@2026` | `ARTHUR@1971` | Nacional Pleno (Todos os Estados e Cidades) |
| **TRE Brookhaven** | `TRE_Brookhaven@2026` | `TRE@BROOKHAVEN` | Estadual (Brookhaven) |
| **TRE Florêmix** | `TRE_Florêmix@2026` | `TRE@FLORÊMIX` | Estadual (Florêmix) |
| **TRE Fortemega** | `TRE_Fortemega@2026` | `TRE@FORTEMEGA` | Estadual (Fortemega) |
| **TRE Novacore** | `TRE_Novacore@2026` | `TRE@NOVACORE` | Estadual (Novacore) |
| **TRE Cidade Eleitoral** | `TRE_CidadeEleitoral@2026` | `TRE.cidadeeleitoral` | Municipal (Brookhaven - Cidade Eleitoral) |
| **TRE Braviland** | `TRE_Braviland@2026` | `TRE.braviland` | Municipal (Brookhaven - Braviland) |
| **TRE Florápolis** | `TRE_Florápolis@2026` | `TRE.florapolis` | Municipal (Florêmix - Florápolis) |
| **TRE Riomarina** | `TRE_Riomarina@2026` | `TRE.riomarina` | Municipal (Florêmix - Riomarina) |
| **TRE Porto Rubi** | `TRE_PortoRubi@2026` | `TRE.portorubi` | Municipal (Fortemega - Porto Rubi) |
| **TRE Fortelume** | `TRE_Fortelume@2026` | `TRE.fortelume` | Municipal (Fortemega - Fortelume) |
| **TRE Nápolis** | `TRE_Nápolis@2026` | `TRE.napolis` | Municipal (Novacore - Nápolis) |
| **TRE Catarinía** | `TRE_Catarinía@2026` | `TRE.catarinia` | Municipal (Novacore - Catarinía) |

---

## ⚖️ Regras Eleitorais de Brookasil
1. **Unicidade de Eleição**: Apenas UMA eleição pode estar aberta por vez (Federal OU Municipal).
2. **Número de Urna Obrigatório**:
   - **Majoritários** (*Presidente, Governador, Prefeito*): Exatamente os 2 dígitos do partido.
   - **Senador**: 3 dígitos (2 do partido + 1 do candidato).
   - **Deputado Federal**: 4 dígitos (2 do partido + 2 do candidato).
   - **Deputado Estadual / Vereador**: 5 dígitos (2 do partido + 3 do candidato).
   - O prefixo partidário é travado e não pode ser apagado.
3. **Mídia e Propostas**:
   - Foto obrigatória com compressão e conversão local no navegador em Base64 (otimizada diretamente no banco).
   - Perfil TikTok obrigatório (@usuario ou link direto).
   - Plano de governo em PDF obrigatório para Presidente, Governador e Prefeito.
4. **Julgamento Jurisdicional**:
   - Status: `Pendente` ➔ `Em Análise` ➔ `Deferida` ou `Indeferida` ou `Excluída`.
   - Somente candidaturas com status **Deferida** são exibidas na consulta pública.
   - Exclusão de candidatura libera imediatamente o número de urna no `numberRegistry` para reaproveitamento.

---
*Sistema fictício integrante do Brookasil RP. Todos os direitos reservados à República de Brookasil.*
