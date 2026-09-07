import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Flag,
  Settings,
  LogOut,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Award,
  Hash,
  Menu,
  X,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Building2,
  Lock,
  ChevronRight
} from 'lucide-react';
import {
  User as AuthUser,
  Candidacy,
  Party,
  PositionConfig,
  BrookasilState,
  CandidacyStatus,
  AdminStats
} from '../types';
import { TseLogo } from './TseLogo';
import { CandidacyDetailModal } from './CandidacyDetailModal';
import { PartyManagement } from './PartyManagement';

interface AdminDashboardProps {
  currentUser: AuthUser;
  authToken: string;
  positions: PositionConfig[];
  states: BrookasilState[];
  parties: Party[];
  onLogout: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onRefreshParties: () => Promise<void>;
}

type TabType = 'dashboard' | 'candidaturas' | 'partidos' | 'configuracoes';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  authToken,
  positions,
  states,
  parties,
  onLogout,
  showToast,
  onRefreshParties
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Candidacies state
  const [candidacies, setCandidacies] = useState<Candidacy[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>(
    currentUser.role === 'TRE' ? (currentUser.state as string) : 'ALL'
  );
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Detail Modal
  const [selectedCandidacy, setSelectedCandidacy] = useState<Candidacy | null>(null);

  // Fetch candidacies and stats with backend authentication
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Candidacies
      const queryParams = new URLSearchParams();
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
      if (selectedStatus !== 'ALL') queryParams.set('status', selectedStatus);
      if (selectedPosition !== 'ALL') queryParams.set('position', selectedPosition);
      if (selectedPartyId !== 'ALL') queryParams.set('party_id', selectedPartyId);

      // Enforce TRE state: even if frontend sent something else, backend strictly overrides it
      if (currentUser.role === 'TRE') {
        queryParams.set('state', currentUser.state);
      } else if (selectedState !== 'ALL') {
        queryParams.set('state', selectedState);
      }

      const resCand = await fetch(`/api/admin/candidacies?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!resCand.ok) {
        if (resCand.status === 401) {
          onLogout();
          return;
        }
        throw new Error('Falha ao carregar candidaturas.');
      }
      const dataCand = await resCand.json();
      setCandidacies(dataCand.candidacies || []);

      // 2. Fetch Stats
      const resStats = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setStats(dataStats.stats);
      }
    } catch (err: any) {
      showToast('error', 'Erro ao Atualizar', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedState, selectedPosition, selectedPartyId, selectedStatus, searchQuery]);

  // Handle status update (Deferir / Indeferir)
  const handleUpdateStatus = async (id: string, newStatus: CandidacyStatus, rejectionReason?: string) => {
    const res = await fetch(`/api/admin/candidacies/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        status: newStatus,
        rejection_reason: rejectionReason
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao atualizar status.');
    }

    // Update in local state
    setCandidacies((prev) =>
      prev.map((c) => (c.id === id ? data.candidacy : c))
    );
    if (selectedCandidacy && selectedCandidacy.id === id) {
      setSelectedCandidacy(data.candidacy);
    }
    // Refresh stats
    fetchData();
  };

  // Handle Party Toggle (TSE only)
  const handleToggleParty = async (partyId: number) => {
    const res = await fetch(`/api/admin/parties/${partyId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Falha ao alterar status do partido.');
    }
    await onRefreshParties();
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'candidaturas' as const, label: 'Candidaturas', icon: <Users className="w-4 h-4" /> },
    {
      id: 'partidos' as const,
      label: currentUser.role === 'TSE' ? 'Partidos' : 'Partidos (Nacional)',
      icon: <Flag className="w-4 h-4" />,
      badge: currentUser.role === 'TSE' ? 'Gestão' : 'Consulta'
    },
    { id: 'configuracoes' as const, label: 'Configurações', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Institutional Topbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <TseLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white">
                  Justiça Eleitoral de Brookasil
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    currentUser.role === 'TSE'
                      ? 'bg-amber-400 text-slate-950 font-sans'
                      : 'bg-blue-800 text-blue-100'
                  }`}
                >
                  {currentUser.role === 'TSE' ? 'TSE NACIONAL' : `TRE ${currentUser.state}`}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                {currentUser.name}
              </span>
            </div>
          </div>

          {/* User Profile and Logout */}
          <div className="flex items-center gap-3">
            <button
              id="btn-refresh-data"
              onClick={fetchData}
              title="Atualizar Dados"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-200 block leading-tight">
                {currentUser.username}
              </span>
              <span className="text-[10px] text-amber-400 font-medium">
                {currentUser.role === 'TSE' ? 'Jurisdição Nacional' : `Jurisdição: ${currentUser.state}`}
              </span>
            </div>

            <button
              id="btn-logout-admin"
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Jurisdiction Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Nível de Acesso</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {currentUser.role === 'TSE' ? (
                <>
                  <strong className="text-blue-900 font-bold">Acesso Nacional Pleno</strong>: Competência para auditar, deferir e indeferir registros em todos os 4 estados de Brookasil e gerenciar partidos.
                </>
              ) : (
                <>
                  <strong className="text-blue-900 font-bold">Acesso Regional {currentUser.state}</strong>: Acesso estrito por segurança às candidaturas de sua circunscrição eleitoral.
                </>
              )}
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm p-4 flex flex-col">
            <div className="bg-white rounded-2xl p-4 space-y-2 max-w-sm w-full mx-auto shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Navegação do Sistema
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                    activeTab === item.id
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && <span className="text-[10px] opacity-75">{item.badge}</span>}
                </button>
              ))}

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 p-3 rounded-xl text-xs font-bold uppercase text-rose-700 bg-rose-50 hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Total de Processos
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-2">
                    {stats?.total ?? candidacies.length}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {currentUser.role === 'TSE' ? 'Candidaturas em Brookasil' : `Candidaturas em ${currentUser.state}`}
                  </span>
                </div>

                {/* Pendentes */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Aguardando Julgamento
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-amber-600 mt-2">
                    {stats?.pending ?? candidacies.filter((c) => c.status === 'PENDENTE').length}
                  </div>
                  <span className="text-[11px] text-amber-700/80 mt-1 block">
                    Status PENDENTE
                  </span>
                </div>

                {/* Deferidas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Deferidas
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                    {stats?.approved ?? candidacies.filter((c) => c.status === 'DEFERIDA').length}
                  </div>
                  <span className="text-[11px] text-emerald-700/80 mt-1 block">
                    Aprovadas para a urna
                  </span>
                </div>

                {/* Indeferidas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Indeferidas
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-rose-600 mt-2">
                    {stats?.rejected ?? candidacies.filter((c) => c.status === 'INDEFERIDA').length}
                  </div>
                  <span className="text-[11px] text-rose-700/80 mt-1 block">
                    Recusadas com justificativa
                  </span>
                </div>
              </div>

              {/* State & Position Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* State Distribution */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    Distribuição por Circunscrição Estadual
                  </h3>
                  <div className="space-y-3">
                    {states.map((st) => {
                      const count = stats?.byState[st] || candidacies.filter((c) => c.state === st).length;
                      const totalCount = stats?.total || (candidacies.length || 1);
                      const percent = Math.round((count / (totalCount || 1)) * 100);
                      const isCurrentTre = currentUser.role === 'TRE' && currentUser.state === st;

                      return (
                        <div key={st} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {st}
                              {isCurrentTre && (
                                <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-bold">
                                  Sua Jurisdição
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-slate-500 font-bold">
                              {count} {count === 1 ? 'registro' : 'registros'} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-900 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Process Action List */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Julgamentos Pendentes Prioritários
                    </h3>
                    <div className="space-y-2">
                      {candidacies.filter((c) => c.status === 'PENDENTE').slice(0, 4).map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedCandidacy(cand)}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                              {cand.photo ? (
                                <img src={cand.photo} alt={cand.ballot_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                  {cand.ballot_name[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block leading-tight">
                                {cand.ballot_name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {cand.position} • {cand.state} • {cand.party.acronym}
                              </span>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs text-blue-900 font-bold hover:underline">
                            <span>Julgar</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      ))}

                      {candidacies.filter((c) => c.status === 'PENDENTE').length === 0 && (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                          <span>Não há processos pendentes de análise no momento!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('candidaturas')}
                    className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Ver Todas as Candidaturas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATURAS MANAGEMENT (CORE REQUIREMENT) */}
          {activeTab === 'candidaturas' && (
            <div className="space-y-5">
              {/* Header and Filter Toolbar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-900" />
                      Processos de Candidatura
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentUser.role === 'TSE'
                        ? 'Visualização de todas as candidaturas de Brookasil'
                        : `Visualização restrita à circunscrição do TRE ${currentUser.state}`}
                    </p>
                  </div>

                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                    {candidacies.length} {candidacies.length === 1 ? 'registro encontrado' : 'registros encontrados'}
                  </span>
                </div>

                {/* Filter Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
                  {/* Search */}
                  <div className="lg:col-span-4 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar por nome, urna, protocolo ou número..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                    />
                  </div>

                  {/* State Filter (Disabled / locked for TRE) */}
                  <div className="lg:col-span-2">
                    <select
                      value={selectedState}
                      disabled={currentUser.role === 'TRE'}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white ${
                        currentUser.role === 'TRE' ? 'opacity-80 bg-slate-100 cursor-not-allowed font-medium' : ''
                      }`}
                    >
                      {currentUser.role === 'TSE' ? (
                        <>
                          <option value="ALL">Todos os Estados</option>
                          {states.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value={currentUser.state}>{currentUser.state}</option>
                      )}
                    </select>
                  </div>

                  {/* Position Filter */}
                  <div className="lg:col-span-2">
                    <select
                      value={selectedPosition}
                      onChange={(e) => setSelectedPosition(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white"
                    >
                      <option value="ALL">Todos os Cargos</option>
                      {positions.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Party Filter */}
                  <div className="lg:col-span-2">
                    <select
                      value={selectedPartyId}
                      onChange={(e) => setSelectedPartyId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white"
                    >
                      <option value="ALL">Todos os Partidos</option>
                      {parties.map((pty) => (
                        <option key={pty.id} value={pty.id}>
                          {pty.acronym} (#{pty.number})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="lg:col-span-2">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 bg-white font-semibold"
                    >
                      <option value="ALL">Todos os Status</option>
                      <option value="PENDENTE">PENDENTE</option>
                      <option value="DEFERIDA">DEFERIDA</option>
                      <option value="INDEFERIDA">INDEFERIDA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Candidacies List (Table on desktop, Cards on mobile) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                {isLoading ? (
                  <div className="py-16 text-center text-slate-500">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-900 mb-2" />
                    <p className="text-sm font-semibold">Carregando processos eleitorais...</p>
                  </div>
                ) : candidacies.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <AlertCircle className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">Nenhuma candidatura localizada.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tente alterar os filtros de busca ou aguarde novas inscrições.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                          <tr>
                            <th className="py-3 px-4">Candidato / Urna</th>
                            <th className="py-3 px-4">Cargo</th>
                            <th className="py-3 px-4">Estado</th>
                            <th className="py-3 px-4">Partido</th>
                            <th className="py-3 px-4">Número</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {candidacies.map((cand) => {
                            const statusColor = {
                              PENDENTE: 'bg-amber-100 text-amber-800 border-amber-200',
                              DEFERIDA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                              INDEFERIDA: 'bg-rose-100 text-rose-800 border-rose-200'
                            }[cand.status];

                            return (
                              <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                                      {cand.photo ? (
                                        <img src={cand.photo} alt={cand.ballot_name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                          {cand.ballot_name[0]}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                                        {cand.ballot_name}
                                      </span>
                                      <span className="text-[11px] text-slate-500 truncate max-w-[200px] block">
                                        {cand.full_name}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        {cand.protocol}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  {cand.position}
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                    {cand.state}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold">
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: cand.party.color }}
                                    />
                                    {cand.party.acronym}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 font-mono font-black text-amber-700 text-sm">
                                  {cand.number}
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                                    {cand.status === 'PENDENTE' && <Clock className="w-3 h-3 text-amber-600" />}
                                    {cand.status === 'DEFERIDA' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                    {cand.status === 'INDEFERIDA' && <XCircle className="w-3 h-3 text-rose-600" />}
                                    {cand.status}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    id={`btn-open-cand-${cand.id}`}
                                    type="button"
                                    onClick={() => setSelectedCandidacy(cand)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Julgar / Ver</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {candidacies.map((cand) => (
                        <div key={cand.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                                {cand.photo ? (
                                  <img src={cand.photo} alt={cand.ballot_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                                    {cand.ballot_name[0]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 text-sm block">
                                  {cand.ballot_name}
                                </span>
                                <span className="text-xs text-slate-500 block">
                                  {cand.full_name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {cand.protocol}
                                </span>
                              </div>
                            </div>

                            <span className="font-mono font-black text-base text-amber-600">
                              {cand.number}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                              {cand.position}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {cand.state}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800">
                              {cand.party.acronym}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cand.status === 'DEFERIDA'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cand.status === 'INDEFERIDA'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {cand.status}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedCandidacy(cand)}
                            className="w-full py-2 rounded-xl bg-blue-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Abrir Julgamento</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PARTIDOS (TSE HAS FULL TOGGLE, TRE HAS READ-ONLY VIEW) */}
          {activeTab === 'partidos' && (
            <PartyManagement
              parties={parties}
              userRole={currentUser.role}
              onToggleParty={handleToggleParty}
              showToast={showToast}
            />
          )}

          {/* TAB 4: CONFIGURAÇÕES E AUDITORIA */}
          {activeTab === 'configuracoes' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-900" />
                  Configurações e Jurisdição Eleitoral
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Parâmetros de segurança e credenciamento de oficiais
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400 block">Sessão Autenticada</span>
                  <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 font-mono">Usuário: {currentUser.username}</p>
                  <p className="text-xs text-slate-500">
                    Função: <strong className="text-blue-900">{currentUser.role}</strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    Jurisdição: <strong className="text-amber-600">{currentUser.state}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400 block">Segurança e Backend</span>
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Validação Restrita no Servidor (API)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Todas as rotas de busca, aprovação e indeferimento filtram os dados diretamente no backend com base no token do usuário.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Sistema Eleitoral do RP de Brookasil • Versão 2026.1
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Encerrar Sessão Segura
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Candidacy Detail / Review Modal */}
      <CandidacyDetailModal
        candidacy={selectedCandidacy}
        currentUser={currentUser}
        onClose={() => setSelectedCandidacy(null)}
        onUpdateStatus={handleUpdateStatus}
        showToast={showToast}
      />
    </div>
  );
};
