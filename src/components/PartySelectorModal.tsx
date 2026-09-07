import React, { useState, useMemo } from 'react';
import { Search, X, Check, Shield, AlertCircle } from 'lucide-react';
import { Party, PoliticalGroup } from '../types';

interface PartySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  selectedPartyId: number | null;
  onSelectParty: (party: Party) => void;
}

export const PartySelectorModal: React.FC<PartySelectorModalProps> = ({
  isOpen,
  onClose,
  parties,
  selectedPartyId,
  onSelectParty
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<PoliticalGroup | 'TODOS'>('TODOS');

  // Filter only active parties for candidate registration
  const filteredParties = useMemo(() => {
    return parties
      .filter((p) => p.active)
      .filter((p) => {
        if (selectedGroup !== 'TODOS' && p.group !== selectedGroup) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.acronym.toLowerCase().includes(q) ||
          String(p.number).includes(q)
        );
      });
  }, [parties, selectedGroup, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      id="party-selector-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="party-selector-modal-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Selecione o Partido Político
              </h3>
              <p className="text-xs text-slate-500">
                Lista oficial homologada pelo Tribunal Superior Eleitoral ({filteredParties.length} disponíveis)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por sigla (ex: PL, PT, MDB) ou número..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900"
            />
          </div>

          {/* Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['TODOS', 'Direita', 'Centro', 'Esquerda'] as const).map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedGroup === group
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {group === 'TODOS' ? 'Todos os Espectros' : `Partidos de ${group}`}
              </button>
            ))}
          </div>
        </div>

        {/* Party List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 space-y-1">
          {filteredParties.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhum partido encontrado para os filtros informados.</p>
            </div>
          ) : (
            filteredParties.map((party) => {
              const isSelected = selectedPartyId === party.id;
              return (
                <button
                  key={party.id}
                  type="button"
                  onClick={() => {
                    onSelectParty(party);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Number Badge */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: party.color }}
                    >
                      {party.number}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
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
                      <p className="text-xs text-slate-500 truncate mt-0.5 max-w-sm">
                        {party.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{party.number}
                    </span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-blue-900 text-amber-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Selecione para vincular a candidatura ao número e legenda oficial.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
