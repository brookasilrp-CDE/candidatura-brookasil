import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Shield,
  MapPin,
  Award,
  Hash,
  FileText,
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Candidacy, CandidacyStatus, User as AuthUser } from '../types';

interface CandidacyDetailModalProps {
  candidacy: Candidacy | null;
  currentUser: AuthUser;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: CandidacyStatus, rejectionReason?: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const CandidacyDetailModal: React.FC<CandidacyDetailModalProps> = ({
  candidacy,
  currentUser,
  onClose,
  onUpdateStatus,
  showToast
}) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!candidacy) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onUpdateStatus(candidacy.id, 'DEFERIDA');
      showToast('success', 'Candidatura Deferida', `A candidatura de ${candidacy.ballot_name} foi homologada.`);
      onClose();
    } catch (err: any) {
      showToast('error', 'Erro ao Deferir', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('error', 'Motivo Obrigatório', 'Você deve informar o fundamento legal ou motivo do indeferimento.');
      return;
    }

    setIsProcessing(true);
    try {
      await onUpdateStatus(candidacy.id, 'INDEFERIDA', rejectionReason.trim());
      showToast('success', 'Candidatura Indeferida', `A candidatura de ${candidacy.ballot_name} foi indeferida.`);
      setIsRejecting(false);
      onClose();
    } catch (err: any) {
      showToast('error', 'Erro ao Indeferir', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const statusBadge = {
    PENDENTE: {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
      label: 'PENDENTE DE JULGAMENTO'
    },
    DEFERIDA: {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      label: 'DEFERIDA (APROVADA)'
    },
    INDEFERIDA: {
      bg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
      label: 'INDEFERIDA (RECUSADA)'
    }
  }[candidacy.status];

  return (
    <div
      id="candidacy-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="candidacy-detail-modal-card"
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {candidacy.protocol}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                  {statusBadge.icon}
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Processo Eleitoral de Registro • Jurisdição {candidacy.state}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rejection Alert if INDEFERIDA */}
          {candidacy.status === 'INDEFERIDA' && candidacy.rejection_reason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Motivo Oficial do Indeferimento:</span>
              </div>
              <p className="leading-relaxed pl-5 font-medium">{candidacy.rejection_reason}</p>
            </div>
          )}

          {/* Candidate Profile Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-24 h-28 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 shadow-xs flex items-center justify-center">
              {candidacy.photo ? (
                <img
                  src={candidacy.photo}
                  alt={candidacy.ballot_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {candidacy.ballot_name}
                </h3>
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 shadow-2xs">
                  Nº {candidacy.number}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Nome Civil: <span className="font-semibold text-slate-900">{candidacy.full_name}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100/70 text-blue-950 font-bold">
                  <Award className="w-3.5 h-3.5 text-blue-900" />
                  {candidacy.position}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  {candidacy.state}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold shadow-2xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: candidacy.party.color }}
                  />
                  {candidacy.party.acronym} (#{candidacy.party.number})
                </span>
              </div>
            </div>
          </div>

          {/* Details Tabs / Content */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-900" />
                <span>Biografia do Candidato</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {candidacy.biography}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Propostas de Mandato</span>
              </h4>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {candidacy.proposals}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Protocolado em: {new Date(candidacy.created_at).toLocaleString('pt-BR')}</span>
              </div>
              {candidacy.reviewed_by && (
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-900" />
                  <span>Julgado por: <strong>{candidacy.reviewed_by}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Input Section */}
          {isRejecting && (
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Justificativa de Indeferimento (Obrigatório)
                </span>
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Cancelar
                </button>
              </div>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Informe detalhadamente os motivos do indeferimento (ex: ausência de certidão de quitação eleitoral, inelegibilidade)..."
                className="w-full p-2.5 rounded-xl border border-rose-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirmar Indeferimento
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-700 text-xs transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>

          <div className="flex items-center gap-2">
            {!isRejecting && (
              <>
                <button
                  id="btn-action-reject"
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsRejecting(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Indeferir</span>
                </button>

                <button
                  id="btn-action-approve"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  )}
                  <span>Deferir Candidatura</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
