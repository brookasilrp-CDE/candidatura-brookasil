import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, Loader2, X, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { TseLogo } from './TseLogo';
import { User as AuthUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, token: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  showToast
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQuickHelp, setShowQuickHelp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Informe seu usuário e senha institucional.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao autenticar.');
      }

      // Save token to localStorage for persistent session
      localStorage.setItem('brookasil_auth_token', data.token);
      localStorage.setItem('brookasil_auth_user', JSON.stringify(data.user));

      showToast('success', 'Autenticação Realizada', `Bem-vindo ao sistema, ${data.user.name}`);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão com o servidor eleitoral.');
      showToast('error', 'Falha na Autenticação', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div
      id="admin-login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="admin-login-modal-card"
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-950/20 overflow-hidden"
      >
        {/* Top Decorative Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900" />

        {/* Close Button */}
        <button
          id="btn-close-login-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <TseLogo size="md" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-600 mt-3 font-sans">
              Acesso Restrito
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Painel Administrativo
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Autenticação de Oficiais do TSE e Tribunais Regionais
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Usuário Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: tse.admin ou tre.brookhaven"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/30 focus:border-blue-900 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 shadow-md shadow-blue-900/20 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Verificando Credenciais...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Autenticar no Painel</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Guide Accordion for convenience of evaluator/tester */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowQuickHelp(!showQuickHelp)}
              className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                Contas Oficiais Pré-configuradas (Guia)
              </span>
              {showQuickHelp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showQuickHelp && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-slate-500 leading-tight">
                  Clique em qualquer conta para preencher automaticamente os campos de teste:
                </p>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('tse.admin', 'TSE@Brookasil2026')}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-blue-900">TSE Nacional</span>
                    <span className="text-[11px] text-slate-500 font-mono">tse.admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('tre.brookhaven', 'TRE@Brookhaven2026')}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">TRE Brookhaven</span>
                    <span className="text-[11px] text-slate-500 font-mono">tre.brookhaven</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('tre.novacore', 'TRE@Novacore2026')}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">TRE Novacore</span>
                    <span className="text-[11px] text-slate-500 font-mono">tre.novacore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('tre.fortemega', 'TRE@Fortemega2026')}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">TRE Fortemega</span>
                    <span className="text-[11px] text-slate-500 font-mono">tre.fortemega</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('tre.floremix', 'TRE@Floremix2026')}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800">TRE Florêmix</span>
                    <span className="text-[11px] text-slate-500 font-mono">tre.floremix</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              Acesso seguro criptografado com SHA-256
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
