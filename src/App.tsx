import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { CandidacyForm } from './components/CandidacyForm';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CandidacySuccessModal } from './components/CandidacySuccessModal';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { User as AuthUser, PositionConfig, BrookasilState, Party, Candidacy } from './types';
import { POSITIONS_CONFIG, BROOKASIL_STATES, INITIAL_PARTIES } from './data/partiesData';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'candidacy' | 'admin'>('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  // Public Configuration
  const [positions, setPositions] = useState<PositionConfig[]>(POSITIONS_CONFIG);
  const [states, setStates] = useState<BrookasilState[]>(BROOKASIL_STATES);
  const [parties, setParties] = useState<Party[]>(INITIAL_PARTIES);

  // Success Modal
  const [submittedCandidacy, setSubmittedCandidacy] = useState<Candidacy | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial public configuration
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/public/config');
      if (res.ok) {
        const data = await res.json();
        if (data.positions) setPositions(data.positions);
        if (data.states) setStates(data.states);
        if (data.parties) setParties(data.parties);
      }
    } catch (err) {
      console.error('Error loading config:', err);
    }
  };

  // Rehydrate auth from localStorage
  useEffect(() => {
    fetchConfig();

    const storedToken = localStorage.getItem('brookasil_auth_token');
    const storedUser = localStorage.getItem('brookasil_auth_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthToken(storedToken);
        setCurrentUser(parsedUser);

        // Verify with backend
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
          .then((res) => {
            if (!res.ok) {
              handleLogout();
            }
          })
          .catch(() => {
            // Keep local state if transient network
          });
      } catch (e) {
        handleLogout();
      }
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (err) {
        // ignore
      }
    }
    localStorage.removeItem('brookasil_auth_token');
    localStorage.removeItem('brookasil_auth_user');
    setCurrentUser(null);
    setAuthToken('');
    setCurrentView('home');
    showToast('info', 'Sessão Encerrada', 'Você saiu do painel administrativo.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Render Public View or Admin Dashboard */}
      {currentView === 'admin' && currentUser ? (
        <AdminDashboard
          currentUser={currentUser}
          authToken={authToken}
          positions={positions}
          states={states}
          parties={parties}
          onLogout={handleLogout}
          showToast={showToast}
          onRefreshParties={fetchConfig}
        />
      ) : (
        <>
          {/* Public Navbar */}
          <Navbar
            currentView={currentView}
            currentUser={currentUser}
            onNavigateHome={() => setCurrentView('home')}
            onOpenCandidacy={() => setCurrentView('candidacy')}
            onOpenAdminAuth={() => setIsLoginModalOpen(true)}
            onReturnToAdmin={() => setCurrentView('admin')}
          />

          <main className="flex-1">
            {currentView === 'home' && (
              <HomeScreen
                onOpenCandidacy={() => setCurrentView('candidacy')}
                onOpenAdminAuth={() => setIsLoginModalOpen(true)}
              />
            )}

            {currentView === 'candidacy' && (
              <CandidacyForm
                positions={positions}
                states={states}
                parties={parties}
                onBack={() => setCurrentView('home')}
                onSuccess={(cand) => {
                  setSubmittedCandidacy(cand);
                  setCurrentView('home');
                }}
                showToast={showToast}
              />
            )}
          </main>

          {/* Institutional Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">Tribunal Superior Eleitoral de Brookasil</span>
                <span>• Gestão Eleitoral 2026</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <span>Transparência e Legalidade</span>
                <span>•</span>
                <span>Segurança de Dados</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        showToast={showToast}
      />

      {/* Candidacy Registration Success Certificate Modal */}
      {submittedCandidacy && (
        <CandidacySuccessModal
          candidacy={submittedCandidacy}
          onClose={() => setSubmittedCandidacy(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
