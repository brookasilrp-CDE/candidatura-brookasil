import React from 'react';
import { UserCheck, Shield, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { TseLogo } from './TseLogo';

interface HomeScreenProps {
  onOpenCandidacy: () => void;
  onOpenAdminAuth: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCandidacy,
  onOpenAdminAuth
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
      {/* Background Decorative Guilloche / Seal Patterns */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-amber-500/10 [mask-image:radial-gradient(circle,white,transparent_75%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-blue-900/15 [mask-image:radial-gradient(circle,white,transparent_75%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-slate-300/30" />
      </div>

      <div className="max-w-3xl w-full mx-auto text-center flex flex-col items-center">
        {/* Heraldic Badge / Header Pill */}
        <div
          id="institutional-seal-pill"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/5 border border-slate-900/10 text-slate-700 text-xs font-semibold tracking-wider uppercase mb-8 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          República Federativa de Brookasil • Justiça Eleitoral
        </div>

        {/* Big Official Logo of TSE Brookasil */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl -z-10 transform scale-125" />
          <TseLogo size="xl" />
        </div>

        {/* Official Headings */}
        <h1
          id="home-tse-title"
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3"
        >
          Tribunal Superior Eleitoral de Brookasil
        </h1>

        <p
          id="home-tse-subtitle"
          className="text-lg sm:text-xl font-medium text-amber-700/90 tracking-wide mb-10 max-w-xl mx-auto"
        >
          Sistema de Candidaturas
        </p>

        {/* Central Information Card */}
        <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-lg shadow-slate-200/50 mb-10 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                Registro Oficial de Registro de Candidaturas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Eleições Gerais e Municipais de Brookasil • Ano Legislativo 2026
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Período de Inscrição Aberto
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed pt-5">
            Bem-vindo ao portal oficial do <strong className="text-slate-900">TSE Brookasil</strong>. Cidadãos aptos a concorrer a cargos públicos eletivos nos âmbitos Federal, Estadual e Municipal podem submeter o pedido formal de registro de candidatura através deste sistema.
          </p>
        </div>

        {/* Required Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full max-w-md mx-auto">
          {/* Main Action: CANDIDATAR-SE */}
          <button
            id="btn-candidatar-se"
            onClick={onOpenCandidacy}
            className="group relative flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold tracking-wide uppercase text-white bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 shadow-md shadow-blue-900/25 hover:shadow-lg hover:shadow-blue-900/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <UserCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Candidatar-se</span>
            <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Action: PAINEL ADMINISTRATIVO */}
          <button
            id="btn-painel-administrativo"
            onClick={onOpenAdminAuth}
            className="group flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-semibold tracking-wide uppercase text-slate-800 bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-slate-600 group-hover:text-blue-900 transition-colors" />
            <span>Painel Administrativo</span>
          </button>
        </div>

        {/* Security & Authenticity Footnote */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            Validação Criptográfica de Protocolos
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-400 hidden sm:inline" />
          <span>Jurisdição Nacional do TSE e Tribunais Regionais (TREs)</span>
          <span className="w-1 h-1 rounded-full bg-slate-400 hidden sm:inline" />
          <span>Brookasil RP 2026</span>
        </div>
      </div>
    </div>
  );
};
