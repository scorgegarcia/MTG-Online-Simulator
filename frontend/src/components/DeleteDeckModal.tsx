import React, { useEffect } from 'react';
import { Trash2, X, Flame, AlertOctagon, Skull } from 'lucide-react';
import MagicParticles from './cardBuilder/MagicParticles';
import { useGameSound } from '../hooks/useGameSound';

interface DeleteDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deckName: string;
}

export const DeleteDeckModal: React.FC<DeleteDeckModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  deckName,
}) => {
  const { playUiSound } = useGameSound();

  useEffect(() => {
    if (isOpen) {
      playUiSound('ALERT_DANGER');
    }
  }, [isOpen, playUiSound]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      {/* Backdrop with extreme danger feel */}
      <div 
        className="absolute inset-0 bg-red-950/40 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      
      {/* Modal Container with Fire/Danger styles */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border-2 border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.4)] animate-in zoom-in-95 fade-in duration-300 bg-slate-950">
        
        {/* Extreme Fire/Lava Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 via-orange-950/20 to-slate-950" />
          
          {/* Flame animations */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-600/30 to-transparent blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-[60px] animate-bounce" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/20 rounded-full blur-[60px] animate-bounce delay-700" />
          
          <MagicParticles count={60} className="opacity-60 text-orange-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-10">
          {/* Close Button */}
          <button 
            className="absolute top-8 right-8 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full text-red-400 hover:text-white transition-all transform hover:rotate-90 active:scale-90" 
            onClick={onClose}
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center space-y-8">
            {/* Imposing Icon Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-full blur-[40px] opacity-40 animate-pulse" />
              <div className="relative p-6 bg-gradient-to-br from-red-600 to-orange-600 rounded-full text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] transform hover:scale-110 transition-transform duration-500">
                <Skull size={48} className="animate-wiggle" />
              </div>
              <div className="absolute -top-2 -right-2 bg-slate-950 p-1 rounded-full border border-red-500">
                <AlertOctagon size={20} className="text-red-500 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-serif font-black text-white tracking-tighter uppercase italic">
                ¡SENTENCIA DE FUEGO!
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto" />
              <p className="text-red-200/80 text-lg font-medium max-w-sm mx-auto leading-tight">
                Estás a punto de incinerar el grimorio <br/>
                <span className="text-amber-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">"{deckName}"</span> <br/>
                y todas sus artes prohibidas.
              </p>
            </div>

            {/* Warning Box */}
            <div className="w-full bg-red-950/30 border-2 border-red-500/30 rounded-3xl p-6 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center justify-center gap-3 mb-2 text-red-500 font-black uppercase tracking-[0.2em] text-xs">
                 <Flame size={16} className="animate-bounce" />
                 <span>ADVERTENCIA CRÍTICA</span>
                 <Flame size={16} className="animate-bounce delay-100" />
               </div>
               <p className="text-sm text-red-100/70 font-serif italic">
                 "Una vez las llamas consuman este mazo, no quedará ni ceniza de él. Esta acción es definitiva e irreversible."
               </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-4 pt-4">
              <button
                onClick={onConfirm}
                className="w-full py-5 bg-gradient-to-r from-red-600 via-orange-600 to-red-700 hover:from-red-500 hover:via-orange-500 hover:to-red-600 text-white font-black text-lg rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.4)] transition-all transform hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                <Trash2 size={24} />
                INCINERAR GRIMORIO
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded-2xl transition-all border border-slate-700 hover:border-slate-500"
              >
                PERDONAR LA VIDA
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
