import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { CardDraft } from './types';
import PersonalizedCard from '../PersonalizedCard';

const DEFAULT_BACK_URL = 'https://upload.wikimedia.org/wikipedia/en/a/aa/Magic_the_gathering-card_back.jpg';

type CardPreviewProps = {
  card: CardDraft;
  showBack: boolean;
  onToggleFace: () => void;
  variant?: 'constructed' | 'imageOnly';
};

export default function CardPreview({ card, showBack, onToggleFace, variant = 'constructed' }: CardPreviewProps) {
  const [frontErrored, setFrontErrored] = useState(false);
  const [backErrored, setBackErrored] = useState(false);

  const backUrl = card.backUrl.trim().length > 0 ? card.backUrl.trim() : DEFAULT_BACK_URL;

  const faceUrl = showBack ? backUrl : card.artUrl.trim();
  const faceErrored = showBack ? backErrored : frontErrored;
  const setFaceErrored = showBack ? setBackErrored : setFrontErrored;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Preview en tiempo real</div>
        <button
          type="button"
          onClick={onToggleFace}
          className="flex items-center gap-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/40 rounded px-3 py-1.5 transition-all"
        >
          <RotateCcw size={14} />
          <span className="font-serif">{showBack ? 'Ver Frente' : 'Ver Reverso'}</span>
        </button>
      </div>

      <div className="mx-auto w-[320px] h-[448px] relative">
        {variant === 'imageOnly' ? (
          <div className="absolute inset-0 rounded-[16px] overflow-hidden border border-slate-700 shadow-[0_0_35px_rgba(245,158,11,0.08)] bg-slate-950">
            {faceUrl && !faceErrored ? (
              <img
                src={faceUrl}
                alt={showBack ? 'Card back' : 'Card front'}
                className="w-full h-full object-contain bg-black"
                onError={() => setFaceErrored(true)}
              />
            ) : (
              <div className="w-full h-full grid place-items-center bg-slate-900 text-slate-500 font-serif italic">
                {showBack ? 'Reverso no disponible' : 'Imagen no disponible'}
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
          </div>
        ) : (
          <>
            <PersonalizedCard card={card} showBack={showBack} />
          </>
        )}

        <div className="absolute -inset-2 bg-gradient-to-b from-amber-500/10 via-fuchsia-500/5 to-transparent rounded-[20px] blur-xl opacity-70 pointer-events-none" />
      </div>
    </div>
  );
}
