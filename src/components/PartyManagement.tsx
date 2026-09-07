import React, { useState, useMemo } from 'react';
import { Search, Shield, Check, X, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { Party, PoliticalGroup, UserRole } from '../types';

interface PartyManagementProps {
  parties: Party[];
  userRole: UserRole;
  onToggleParty: (partyId: number) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PartyManagement: React.FC<PartyManagementProps> = ({
  parties,
  userRole,
  onToggleParty,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<PoliticalGroup | 'TODOS'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      if (selectedGroup !== 'TODOS' && p.group !== selectedGroup) return false;
      if (statusFilter === 'ATIVO' && !p.active) return false;
      if (statusFilter === 'INATIVO' && p.active) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.acronym.toLowerCase().includes(q) ||
        String(p.number).includes(q)
      );
    });
  }, [parties, selectedGroup, statusFilter, searchTerm]);

  const handleToggle = async (party: Party) => {
    if (userRole !== 'TSE') {
      showToast(
        'error',
        'Acesso Negado',
        'Apenas o Tribunal Superior Eleitoral (TSE) possui competência para ativar ou desativar partidos políticos.'
      );
      return;
    }

    setTogglingId(party.id);
    try {
      await onToggleParty(party.id);
      showToast(
        'success',
        `Partido ${party.acronym} Atualizado`,
        `O partido agora está ${!party.active ? 'ATIVADO' : 'DESATIVADO'} para novas candidaturas.`
      );
    } catch (err: any) {
      showToast('error', 'Falha ao Atualizar', err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const totalActive = parties.filter((p) => p.active).length;
  const totalInactive = parties.filter((p) => !p.active).length;

  return (
    <div className="space-y-6">
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Registro Nacional de Partidos Políticos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total homologado: {parties.length} agremiações partidárias cadastradas no Tribunal Superior Eleitoral
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {totalActive} Ativos
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200">
            {totalInactive} Inativos
          </span>
        </div>
      </div>

      {userRole !== 'TSE' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Atenção: Oficiais de Tribunais Regionais (TRE) possuem visualização em modo somente-leitura deste módulo nacional. A alteração de status partidário é prerrogativa exclusiva do TSE Nacional.
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por sigla (PL, PT, UNIÃO...) ou número oficial..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            />
          </div>

          {/* Group Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            >
              <option value="TODOS">Todos os Espectros</option>
              <option value="Direita">Direita (18)</option>
              <option value="Centro">Centro (10)</option>
              <option value="Esquerda">Esquerda (14)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Somente Ativos</option>
              <option value="INATIVO">Somente Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Parties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParties.map((party) => {
          const isToggling = togglingId === party.id;
          return (
            <div
              key={party.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                party.active
                  ? 'bg-white border-slate-200 shadow-2xs hover:shadow-xs'
                  : 'bg-slate-50/80 border-dashed border-slate-300 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0"
                      style={{ backgroundColor: party.color }}
                    >
                      {party.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-base">
                          {party.acronym}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            party.group === 'Direita'
                              ? 'bg-blue-100 text-blue-800'
                              : party.group === 'Centro'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {party.group}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                        Legenda Nº {party.number}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      party.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {party.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 font-medium">
                  {party.name}
                </p>
              </div>

              {/* Action Toggle (Only for TSE) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {party.active ? 'Habilitado para eleição' : 'Bloqueado para registro'}
                </span>

                {userRole === 'TSE' ? (
                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggle(party)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      party.active
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                  >
                    {isToggling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : party.active ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Desativar</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Ativar</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Gestão TSE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
