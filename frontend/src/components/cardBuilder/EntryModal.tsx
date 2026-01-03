import { Sparkles, Wand2, X, Youtube } from 'lucide-react';
import MagicParticles from './MagicParticles';

type EntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: 'editor' | 'urls') => void;
};

export default function EntryModal({ isOpen, onClose, onSelect }: EntryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-[0_0_70px_rgba(245,158,11,0.12)] overflow-hidden animate-in fade-in zoom-in duration-200">
        <MagicParticles count={40} className="opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />

        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles size={18} />
                <span className="text-xs font-bold tracking-[0.25em] uppercase">Spellforge Invocation</span>
              </div>
              <div className="mt-2 text-3xl font-serif font-bold text-slate-100 leading-tight">
                ¿Cómo quieres forjar tu carta?
              </div>
              <div className="mt-2 text-slate-300/90 font-serif">
                Elige un ritual: creación total en el editor o creación rápida con URLs.
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-amber-300 transition-colors p-2 rounded-lg hover:bg-slate-800/60"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <button
              type="button"
              onClick={() => onSelect('editor')}
              className="group relative overflow-hidden rounded-xl border border-fuchsia-500/30 bg-gradient-to-b from-fuchsia-950/40 to-slate-950 p-5 text-left transition-all hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(217,70,239,0.12)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-fuchsia-500/20 via-transparent to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-fuchsia-200 font-serif font-bold text-lg">
                  <Wand2 size={18} />
                  <span>Editor Completo</span>
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  Nombre, coste de maná configurable, arte, tipo, reglas, y poder/resistencia.
                </div>
              </div>
            </button>

            <div className="relative group/url">
              <button
                type="button"
                onClick={() => onSelect('urls')}
                className="w-full group relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-950 p-5 text-left transition-all hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(99,102,241,0.12)]"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-indigo-200 font-serif font-bold text-lg">
                    <Sparkles size={18} />
                    <span>Desde URLs</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    Proporciona imágenes (frente y reverso opcional), nombre y tipo de carta.
                  </div>
                </div>
              </button>

              <div className="absolute left-0 right-0 -bottom-10 flex justify-center">
                <a
                  href="https://www.youtube.com/watch?v=HmtAUtLakPw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-white border border-red-500/30 rounded-full transition-all duration-300 text-[10px] uppercase tracking-widest font-bold backdrop-blur-sm group/btn shadow-lg shadow-black/20"
                >
                  <Youtube size={12} className="group-hover/btn:scale-110 transition-transform" />
                  <span>Tutorial URL</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-5 text-xs text-slate-400 font-serif">
            Si no incluyes reverso, se usará el reverso estándar de Magic.
          </div>
        </div>
      </div>
    </div>
  );
}

