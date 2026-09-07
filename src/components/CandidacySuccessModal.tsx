import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Printer, ArrowLeft, Shield, Clock, MapPin, Hash, User } from 'lucide-react';
import { Candidacy } from '../types';
import { TseLogo } from './TseLogo';

interface CandidacySuccessModalProps {
  candidacy: Candidacy;
  onClose: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const CandidacySuccessModal: React.FC<CandidacySuccessModalProps> = ({
  candidacy,
  onClose,
  showToast
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyProtocol = () => {
    navigator.clipboard.writeText(candidacy.protocol);
    setCopied(true);
    showToast('success', 'Protocolo Copiado!', candidacy.protocol);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(candidacy.created_at).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div
      id="candidacy-success-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="candidacy-success-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl border-2 border-amber-500/30 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200"
      >
        {/* Certificate Border Header */}
        <div className="h-3 w-full bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900" />

        <div className="p-6 sm:p-8">
          {/* Official Badge & Success Header */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
              Pedido de Registro Homologado
            </span>

            <h2
              id="candidacy-success-title"
              className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
            >
              CADASTRO REALIZADO COM SUCESSO
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
              Sua solicitação de candidatura foi protocolada junto à Justiça Eleitoral de Brookasil.
            </p>
          </div>

          {/* Highlighted Protocol Box */}
          <div className="my-6 p-4 sm:p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-slate-900/20">
            <div className="text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block mb-0.5">
                Número de Protocolo Oficial
              </span>
              <span
                id="candidacy-protocol-number"
                className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white select-all"
              >
                {candidacy.protocol}
              </span>
            </div>

            <button
              id="btn-copy-protocol"
              type="button"
              onClick={handleCopyProtocol}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Protocolo</span>
                </>
              )}
            </button>
          </div>

          {/* Candidacy Official Receipt Data Sheet */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-blue-900" />
                <span>Dados Oficiais do Registro</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3" />
                Status: {candidacy.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Nome Completo</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">{candidacy.full_name}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Nome de Urna</span>
                <span className="text-blue-950 font-bold text-sm block mt-0.5">{candidacy.ballot_name}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Cargo Pleiteado</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">{candidacy.position}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Estado / Jurisdição</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {candidacy.state}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Partido Político</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: candidacy.party.color }}
                  />
                  <span className="text-slate-900 font-bold text-sm">
                    {candidacy.party.acronym} — {candidacy.party.name} (#{candidacy.party.number})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Número Eleitoral</span>
                <span className="text-amber-700 font-black font-mono text-base block mt-0.5">
                  {candidacy.number}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Data e Hora de Envio:</span>
              <span className="font-medium text-slate-700 font-mono">{formattedDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <button
              id="btn-success-close"
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-700 text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>

            <button
              id="btn-print-receipt"
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir Comprovante</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
