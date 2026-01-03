import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, X, AlertTriangle, Scroll, Sparkles } from 'lucide-react';
import MagicParticles from './cardBuilder/MagicParticles';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

interface DeckUsage {
  id: string;
  name: string;
}

interface DeleteCustomCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cardId: string;
  cardName: string;
}

export const DeleteCustomCardModal: React.FC<DeleteCustomCardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cardId,
  cardName,
}) => {
  const [usageData, setUsageData] = useState<{ cardName: string; decks: DeckUsage[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && cardId) {
      setLoading(true);
      axios.get(`${API_BASE_URL}/custom-cards/${cardId}/usage`)
        .then(res => {
          setUsageData(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, cardId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 fade-in duration-500 bg-slate-950">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950" />
          <MagicParticles count={30} className="opacity-40" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8">
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform hover:rotate-90 active:scale-90" 
            onClick={onClose}
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative p-5 bg-red-500/10 border border-red-500/20 rounded-full text-red-500">
                <Trash2 size={40} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
                ¿Desvanecer Carta?
              </h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Estás a punto de borrar <span className="text-amber-400 font-bold">"{cardName}"</span> de tu colección de forma permanente.
              </p>
            </div>

            {/* Usage Info */}
            <div className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center py-4 space-y-2">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Consultando Grimoires...</span>
                </div>
              ) : usageData && usageData.decks.length > 0 ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
                    <AlertTriangle size={14} />
                    <span>Advertencia de Desvanecimiento</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Esta carta se desvanecerá automáticamente de los siguientes decks:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {usageData.decks.map(deck => (
                      <div key={deck.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-xs font-serif">
                        <Scroll size={12} className="text-amber-500/60" />
                        {deck.name}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-4 space-y-2">
                  <Sparkles size={20} className="text-emerald-500/60" />
                  <p className="text-sm text-emerald-400 font-medium">
                    Esta carta no se está usando en ningún deck actualmente.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-3 pt-4">
              <button
                onClick={onConfirm}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Confirmar Desvanecimiento
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium rounded-xl transition-all border border-slate-800"
              >
                Mantener en mi Colección
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
