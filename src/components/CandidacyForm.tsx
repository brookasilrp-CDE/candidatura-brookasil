import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  User,
  Shield,
  MapPin,
  Award,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle,
  Camera,
  Search,
  Sparkles,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Party, PositionConfig, BrookasilState, PositionName, Candidacy } from '../types';
import { PartySelectorModal } from './PartySelectorModal';
import { TseLogo } from './TseLogo';

interface CandidacyFormProps {
  positions: PositionConfig[];
  states: BrookasilState[];
  parties: Party[];
  onBack: () => void;
  onSuccess: (candidacy: Candidacy) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const CandidacyForm: React.FC<CandidacyFormProps> = ({
  positions,
  states,
  parties,
  onBack,
  onSuccess,
  showToast
}) => {
  const [fullName, setFullName] = useState('');
  const [ballotName, setBallotName] = useState('');
  const [photo, setPhoto] = useState('');
  const [selectedState, setSelectedState] = useState<BrookasilState>('Brookhaven');
  const [selectedPosition, setSelectedPosition] = useState<PositionName>('Governador');
  const [selectedParty, setSelectedParty] = useState<Party | null>(() => {
    // Default to first active party
    return parties.find((p) => p.active) || null;
  });
  const [electoralNumber, setElectoralNumber] = useState('22');
  const [biography, setBiography] = useState('');
  const [proposals, setProposals] = useState('');

  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current position configuration
  const currentPositionConfig = useMemo(() => {
    return positions.find((p) => p.name === selectedPosition) || positions[0];
  }, [positions, selectedPosition]);

  // Handle position change and auto-adjust or suggest number
  const handlePositionChange = (posName: PositionName) => {
    setSelectedPosition(posName);
    const cfg = positions.find((p) => p.name === posName);
    if (!cfg) return;

    // Auto-adjust default electoral number based on party if selected
    if (selectedParty) {
      const partyNumStr = String(selectedParty.number);
      if (cfg.digits === 2) {
        setElectoralNumber(partyNumStr.padStart(2, '0'));
      } else if (cfg.digits === 3) {
        setElectoralNumber(`${partyNumStr}1`);
      } else if (cfg.digits === 4) {
        setElectoralNumber(`${partyNumStr}01`);
      } else if (cfg.digits === 5) {
        setElectoralNumber(`${partyNumStr}001`);
      }
    }
  };

  // Handle party change and suggest number prefix
  const handleSelectParty = (party: Party) => {
    setSelectedParty(party);
    const partyNumStr = String(party.number);
    if (currentPositionConfig) {
      if (currentPositionConfig.digits === 2) {
        setElectoralNumber(partyNumStr.padStart(2, '0'));
      } else if (currentPositionConfig.digits === 3) {
        setElectoralNumber(`${partyNumStr}1`);
      } else if (currentPositionConfig.digits === 4) {
        setElectoralNumber(`${partyNumStr}01`);
      } else if (currentPositionConfig.digits === 5) {
        setElectoralNumber(`${partyNumStr}001`);
      }
    }
  };

  // Photo file upload handler with base64 conversion
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Arquivo Inválido', 'Selecione uma imagem válida (JPG ou PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Arquivo Muito Grande', 'A foto deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string);
        showToast('success', 'Foto Carregada', 'A imagem do candidato foi anexada.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset sample photo generator for convenience
  const handleUseSamplePhoto = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    ];
    const chosen = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
    setPhoto(chosen);
    showToast('info', 'Foto Ilustrativa Selecionada', 'Foto oficial de identificação atribuída.');
  };

  // Live validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      newErrors.fullName = 'Informe o nome completo civil do candidato (mínimo 3 caracteres).';
    }

    if (!ballotName.trim() || ballotName.trim().length < 2) {
      newErrors.ballotName = 'Informe o nome que constará na urna eletrônica (mínimo 2 caracteres).';
    }

    if (!selectedParty) {
      newErrors.party = 'Selecione um partido político ativo da lista oficial.';
    }

    const cleanNum = electoralNumber.trim();
    if (!/^\d+$/.test(cleanNum)) {
      newErrors.number = 'O número deve conter exclusivamente dígitos.';
    } else if (cleanNum.length !== currentPositionConfig.digits) {
      newErrors.number = `O cargo de ${currentPositionConfig.name} requer exatamente ${currentPositionConfig.digits} dígitos (você digitou ${cleanNum.length}).`;
    }

    if (!biography.trim() || biography.trim().length < 10) {
      newErrors.biography = 'Preencha uma breve biografia ou trajetória pública (mínimo 10 caracteres).';
    }

    if (!proposals.trim() || proposals.trim().length < 15) {
      newErrors.proposals = 'Apresente as principais diretrizes ou propostas de campanha (mínimo 15 caracteres).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Campos Pendentes', 'Por favor, revise os dados sinalizados no formulário.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        ballot_name: ballotName.trim(),
        photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        state: selectedState,
        position: selectedPosition,
        party_id: selectedParty!.id,
        number: electoralNumber.trim(),
        biography: biography.trim(),
        proposals: proposals.trim()
      };

      const res = await fetch('/api/candidacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao submeter candidatura.');
      }

      showToast('success', 'Cadastro Concluído', `Protocolo: ${data.candidacy.protocol}`);
      onSuccess(data.candidacy);
    } catch (err: any) {
      showToast('error', 'Erro no Envio', err.message || 'Falha ao registrar candidatura.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8">
      {/* Top Breadcrumb & Return button */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <button
          id="btn-back-home"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Portal</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Shield className="w-4 h-4 text-amber-500" />
          <span>Formulário Oficial de Registro de Candidatura 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Registro Formal de Candidatura
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Preencha todos os dados exigidos pela Resolução Eleitoral de Brookasil.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Personal & Ballot Identification */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>1. Identificação do Candidato</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-full-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome Completo Civil *
                  </label>
                  <input
                    id="field-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ex: João Carlos da Silva"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-blue-900/20 focus:border-blue-900'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="field-ballot-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome de Urna *
                  </label>
                  <input
                    id="field-ballot-name"
                    type="text"
                    value={ballotName}
                    onChange={(e) => setBallotName(e.target.value)}
                    placeholder="ex: João da Saúde, Dr. Carlos"
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      errors.ballotName
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-blue-900/20 focus:border-blue-900'
                    }`}
                  />
                  {errors.ballotName && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.ballotName}</p>
                  )}
                </div>
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Foto Oficial para a Urna Eletrônica
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
                  <div className="relative w-24 h-28 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center shadow-inner">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Foto do candidato"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Fotografia nítida, de frente, estilo documento eleitoral com fundo neutro.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Carregar Arquivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUseSamplePhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Foto Demonstrativa</span>
                      </button>

                      {photo && (
                        <button
                          type="button"
                          onClick={() => setPhoto('')}
                          className="text-xs text-rose-600 hover:underline ml-1"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Electoral Jurisdiction, Office and Party */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>2. Jurisdição, Cargo e Partido Político</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Estado */}
                <div>
                  <label htmlFor="field-state" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estado / Circunscrição *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="field-state"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value as BrookasilState)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 bg-white"
                    >
                      {states.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <label htmlFor="field-position" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cargo Pleiteado *
                  </label>
                  <select
                    id="field-position"
                    value={selectedPosition}
                    onChange={(e) => handlePositionChange(e.target.value as PositionName)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 bg-white"
                  >
                    {positions.map((pos) => (
                      <option key={pos.name} value={pos.name}>
                        {pos.name} ({pos.digits} dígitos — {pos.scope})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {currentPositionConfig.description}
                  </p>
                </div>
              </div>

              {/* Partido Selection (Strict: chosen from list, no manual typing) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Partido Político Homologado *
                </label>
                <div
                  id="selected-party-card"
                  onClick={() => setIsPartyModalOpen(true)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedParty
                      ? 'border-blue-900/40 bg-blue-50/40 hover:bg-blue-50/70'
                      : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {selectedParty ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-xs"
                        style={{ backgroundColor: selectedParty.color }}
                      >
                        {selectedParty.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {selectedParty.acronym}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                            {selectedParty.group}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate max-w-sm">
                          {selectedParty.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 font-medium">
                      Clique para escolher o partido homologado...
                    </span>
                  )}

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-blue-900 hover:bg-blue-50 shadow-2xs">
                    <Search className="w-3.5 h-3.5" />
                    <span>{selectedParty ? 'Trocar Partido' : 'Selecionar'}</span>
                  </div>
                </div>
                {errors.party && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.party}</p>}
              </div>

              {/* Electoral Number with Automatic Digit Validation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="field-electoral-number" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Número Eleitoral do Candidato *
                  </label>
                  <span
                    id="number-digit-counter"
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      electoralNumber.trim().length === currentPositionConfig.digits
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {electoralNumber.trim().length} de {currentPositionConfig.digits} dígitos exigidos
                  </span>
                </div>

                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="field-electoral-number"
                    type="text"
                    maxLength={currentPositionConfig.digits}
                    value={electoralNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setElectoralNumber(val);
                    }}
                    placeholder={`Exatamente ${currentPositionConfig.digits} dígitos (ex: ${selectedParty?.number || '22'}...)`}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 ${
                      errors.number
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : electoralNumber.trim().length === currentPositionConfig.digits
                        ? 'border-emerald-500 focus:ring-emerald-200 bg-emerald-50/10'
                        : 'border-slate-200 focus:ring-blue-900/20 focus:border-blue-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    Cargo: <strong>{currentPositionConfig.name}</strong> • Regra: {currentPositionConfig.digits} dígitos
                  </span>
                  {selectedParty && (
                    <span>
                      Prefixo partidário: <strong>{selectedParty.number}</strong>
                    </span>
                  )}
                </div>
                {errors.number && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.number}</p>}
              </div>
            </div>

            {/* 3. Biography and Proposals */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>3. Biografia e Propostas Políticas</span>
              </h2>

              <div>
                <label htmlFor="field-biography" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Biografia do Candidato *
                </label>
                <textarea
                  id="field-biography"
                  rows={3}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Resumo das qualificações civis, histórico político ou comunitário..."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    errors.biography
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-blue-900/20 focus:border-blue-900'
                  }`}
                />
                {errors.biography && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.biography}</p>
                )}
              </div>

              <div>
                <label htmlFor="field-proposals" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Propostas Principais de Mandato *
                </label>
                <textarea
                  id="field-proposals"
                  rows={4}
                  value={proposals}
                  onChange={(e) => setProposals(e.target.value)}
                  placeholder="Descreva as principais bandeiras, projetos de lei ou compromissos com o eleitorado..."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    errors.proposals
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-blue-900/20 focus:border-blue-900'
                  }`}
                />
                {errors.proposals && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.proposals}</p>
                )}
              </div>
            </div>

            {/* Submission Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Ao enviar, seu protocolo será gerado com status <strong>PENDENTE</strong>.
              </span>

              <button
                id="btn-submit-candidacy"
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 hover:from-blue-800 hover:to-slate-800 shadow-md shadow-blue-900/25 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Processando Registro...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Submeter Candidatura</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Electronic Ballot Simulation (Urna Eletrônica Preview Card) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <TseLogo size="sm" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Espelho de Urna
                  </h3>
                  <span className="text-[10px] text-slate-400">Simulação em tempo real</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                TSE-BRK
              </span>
            </div>

            {/* Candidate Card on Voting Machine */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-4">
              <div className="text-center pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Cargo
                </span>
                <span className="text-sm font-extrabold text-white">
                  {selectedPosition} — {selectedState}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Candidato"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Número
                  </div>
                  <div className="text-2xl font-black font-mono tracking-widest text-amber-400">
                    {electoralNumber || '—'}
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Nome
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {ballotName || 'Nome do Candidato'}
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                    Partido
                  </div>
                  <div className="text-xs font-bold text-slate-300 truncate">
                    {selectedParty?.acronym || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Rule Checklist for Position Digits */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Dígitos para {currentPositionConfig.name}:</span>
                <span className="font-mono font-bold text-amber-400">
                  {currentPositionConfig.digits} dígitos
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Status da Inscrição:</span>
                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  PENDENTE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Party Selection Modal */}
      <PartySelectorModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        parties={parties}
        selectedPartyId={selectedParty?.id || null}
        onSelectParty={handleSelectParty}
      />
    </div>
  );
};
