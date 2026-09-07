import React from 'react';
import { Shield, Lock, UserCheck, LayoutDashboard } from 'lucide-react';
import { TseLogo } from './TseLogo';
import { User as AuthUser } from '../types';

interface NavbarProps {
  currentView: 'home' | 'candidacy' | 'admin';
  currentUser: AuthUser | null;
  onNavigateHome: () => void;
  onOpenCandidacy: () => void;
  onOpenAdminAuth: () => void;
  onReturnToAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentUser,
  onNavigateHome,
  onOpenCandidacy,
  onOpenAdminAuth,
  onReturnToAdmin
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          id="navbar-brand-logo"
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <TseLogo size="md" />
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 font-sans">
              República de Brookasil
            </span>
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors leading-tight">
              Tribunal Superior Eleitoral
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Sistema de Candidaturas
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <button
              id="btn-nav-return-admin"
              type="button"
              onClick={onReturnToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 shadow-xs transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Painel Administrativo ({currentUser.role})</span>
              <span className="sm:hidden">Painel</span>
            </button>
          ) : (
            <>
              {currentView !== 'candidacy' && (
                <button
                  id="btn-nav-candidatar"
                  type="button"
                  onClick={onOpenCandidacy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 shadow-xs transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Candidatar-se</span>
                </button>
              )}

              <button
                id="btn-nav-admin-login"
                type="button"
                onClick={onOpenAdminAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Painel Administrativo</span>
                <span className="sm:hidden">Painel</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
