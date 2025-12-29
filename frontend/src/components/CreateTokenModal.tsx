import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TokenPreset {
    id: string;
    name: string;
    color: string;
    power: string;
    toughness: string;
    type: 'Creature' | 'Land' | 'Non-creature';
    description?: string;
}

interface CreateTokenModalProps {
        isOpen: boolean;
        onClose: () => void;
        onCreate: (token: { name: string, color: string, description?: string, power?: string, toughness?: string, type: string, imageUrl: string }, quantity: number) => void;
    }

const COLORS = [
    { name: 'Rojo', value: '#ef4444', text: 'white' },
    { name: 'Crema', value: '#fef3c7', text: 'black' },
    { name: 'Verde', value: '#22c55e', text: 'white' },
    { name: 'Azul', value: '#3b82f6', text: 'white' },
    { name: 'Negro', value: '#171717', text: 'white' },
    { name: 'Gris', value: '#6b7280', text: 'white' },
    { name: 'Morado', value: '#a855f7', text: 'white' },
    { name: 'Cafe', value: '#78350f', text: 'white' },
];

const TYPES = ['Creature', 'Land', 'Non-creature'];

export const CreateTokenModal: React.FC<CreateTokenModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [presets, setPresets] = useState<TokenPreset[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(COLORS[0].value);
    const [power, setPower] = useState('1');
    const [toughness, setToughness] = useState('1');
    const [type, setType] = useState('Creature');
    const [quantity, setQuantity] = useState('1');

    useEffect(() => {
        const saved = localStorage.getItem('token_presets');
        if (saved) {
            try {
                setPresets(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load token presets', e);
            }
        }
    }, []);

    const savePreset = (token: TokenPreset) => {
        const newPresets = [token, ...presets.filter(p => p.name !== token.name)].slice(0, 20);
        setPresets(newPresets);
        localStorage.setItem('token_presets', JSON.stringify(newPresets));
    };

    const deletePreset = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPresets = presets.filter(p => p.id !== id);
        setPresets(newPresets);
        localStorage.setItem('token_presets', JSON.stringify(newPresets));
    };

    const loadPreset = (preset: TokenPreset) => {
        setName(preset.name);
        setDescription(preset.description || '');
        setColor(preset.color);
        setPower(preset.power);
        setToughness(preset.toughness);
        setType(preset.type);
    };

    const parseClampedInt = (value: string, fallback: number, min: number, max: number) => {
        const parsed = Number.parseInt(value, 10);
        const normalized = Number.isFinite(parsed) ? parsed : fallback;
        return Math.max(min, Math.min(max, normalized));
    };

    const base64EncodeUtf8 = (input: string) => {
        const bytes = new TextEncoder().encode(input);
        let binary = '';
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }
        return btoa(binary);
    };

    const escapeXml = (value: string) =>
        value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&apos;');

    const wrapTextLines = (value: string, maxChars: number, maxLines: number) => {
        const text = value.replace(/\s+/g, ' ').trim();
        if (!text) return [];

        const words = text.split(' ');
        const lines: string[] = [];
        let current = '';

        const pushCurrent = () => {
            if (current.trim()) lines.push(current.trim());
            current = '';
        };

        for (const word of words) {
            const candidate = current ? `${current} ${word}` : word;
            if (candidate.length <= maxChars) {
                current = candidate;
                continue;
            }

            if (!current) {
                lines.push(word.slice(0, Math.max(1, maxChars - 1)) + '…');
                if (lines.length >= maxLines) break;
                continue;
            }

            pushCurrent();
            current = word;

            if (lines.length >= maxLines) break;
        }

        if (lines.length < maxLines) pushCurrent();

        if (lines.length > maxLines) return lines.slice(0, maxLines);

        if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
            lines[maxLines - 1] = lines[maxLines - 1].slice(0, Math.max(1, maxChars - 1)) + '…';
        }

        return lines.slice(0, maxLines);
    };

    const buildTokenSvg = (params: {
        name: string;
        description: string;
        color: string;
        type: string;
        power: string;
        toughness: string;
        textColor: string;
    }) => {
        const cardColor = params.color;
        const nameText = escapeXml((params.name || 'Token').slice(0, 28));
        const typeText = escapeXml(params.type);
        const ptText = params.type === 'Creature' ? `${params.power}/${params.toughness}` : '';
        const ink = params.textColor;
        const frame = params.textColor === 'black' ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)';
        const descMaxChars = params.type === 'Creature' ? 26 : 34;
        const descMaxLines = params.type === 'Creature' ? 3 : 4;
        const descLines = wrapTextLines(params.description, descMaxChars, descMaxLines).map(escapeXml);
        const descTspans = descLines
            .map((line, idx) => `<tspan x="34" dy="${idx === 0 ? 0 : 14}">${line}</tspan>`)
            .join('');

        return `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${cardColor}" stop-opacity="1" />
      <stop offset="1" stop-color="#0b1020" stop-opacity="0.55" />
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.22)" />
      <stop offset="0.55" stop-color="rgba(255,255,255,0)" />
      <stop offset="1" stop-color="rgba(0,0,0,0.15)" />
    </linearGradient>
    <clipPath id="round">
      <rect x="10" y="10" width="280" height="400" rx="18" ry="18" />
    </clipPath>
  </defs>

  <rect x="8" y="8" width="284" height="404" rx="20" ry="20" fill="rgba(0,0,0,0.55)" />
  <rect x="10" y="10" width="280" height="400" rx="18" ry="18" fill="url(#bg)" stroke="${frame}" stroke-width="2" />

  <g clip-path="url(#round)">
    <rect x="10" y="10" width="280" height="400" fill="url(#sheen)" />

    <rect x="22" y="24" width="256" height="44" rx="10" ry="10" fill="rgba(0,0,0,0.38)" stroke="${frame}" stroke-width="1.2" />
    <text x="34" y="54" font-family="serif" font-weight="700" font-size="20" fill="${ink}">${nameText}</text>

    <rect x="22" y="78" width="256" height="214" rx="14" ry="14" fill="rgba(0,0,0,0.20)" stroke="${frame}" stroke-width="1.2" />
    <path d="M22 234 C 70 208, 110 276, 150 236 C 190 198, 230 270, 278 226 L278 292 L22 292 Z" fill="rgba(0,0,0,0.12)" />

    <rect x="22" y="300" width="256" height="98" rx="12" ry="12" fill="rgba(0,0,0,0.34)" stroke="${frame}" stroke-width="1.2" />
    <text x="34" y="326" font-family="sans-serif" font-weight="700" font-size="14" fill="${ink}">${typeText}</text>
    ${descTspans ? `<text x="34" y="348" font-family="sans-serif" font-weight="500" font-size="12" fill="${ink}">${descTspans}</text>` : ''}
    ${ptText ? `<rect x="214" y="362" width="64" height="30" rx="10" ry="10" fill="rgba(0,0,0,0.42)" stroke="${frame}" stroke-width="1.0" />
    <text x="246" y="383" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="18" fill="${ink}">${escapeXml(ptText)}</text>` : ''}
  </g>
</svg>
        `;
    };

    const handleCreate = () => {
        if (!name.trim()) return;

        const textColor = COLORS.find(c => c.value === color)?.text || 'white';
        const svg = buildTokenSvg({ name, description, color, type, power, toughness, textColor });
        const imageUrl = `data:image/svg+xml;base64,${base64EncodeUtf8(svg)}`;

        const newToken = {
            id: Date.now().toString(),
            name,
            description,
            color,
            power: type === 'Creature' ? power : '',
            toughness: type === 'Creature' ? toughness : '',
            type: type as any
        };

        savePreset(newToken);
        
        let gameType = 'Token';
        if (type === 'Creature') gameType = 'Creature - Token';
        if (type === 'Land') gameType = 'Land - Token';
        if (type === 'Non-creature') gameType = 'Artifact - Token';

        const count = parseClampedInt(quantity, 1, 1, 20);
        onCreate({
            name,
            color,
            description,
            power: type === 'Creature' ? power : undefined,
            toughness: type === 'Creature' ? toughness : undefined,
            type: gameType,
            imageUrl
        }, count);
        onClose();
    };

    if (!isOpen) return null;

    const previewTextColor = COLORS.find(c => c.value === color)?.text || 'white';
    const previewSvg = buildTokenSvg({ name, description, color, type, power, toughness, textColor: previewTextColor });
    const previewUrl = `data:image/svg+xml;base64,${base64EncodeUtf8(previewSvg)}`;
    const quantityValue = parseClampedInt(quantity, 1, 1, 20);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gradient-to-b from-slate-950 via-slate-900 to-black border border-amber-700/30 rounded-xl p-6 w-[900px] max-w-[95vw] shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-xl font-bold text-amber-100 tracking-wide">Forjar Token</h2>
                        <div className="text-xs uppercase tracking-widest text-slate-400">Magic Style</div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {presets.length > 0 && (
                            <div className="mb-6 pb-5 border-b border-slate-700/60">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs uppercase tracking-widest text-slate-400">Usados Recientemente</div>
                                    <div className="text-[11px] text-slate-500">{presets.length}/20</div>
                                </div>

                                <div className="bg-slate-950/50 border border-amber-700/20 rounded-lg p-3">
                                    <div className="max-h-32 overflow-y-auto flex flex-wrap gap-2 pr-1">
                                        {presets.map(p => (
                                            <div
                                                key={p.id}
                                                className="group flex items-center gap-2 bg-slate-900/60 border border-slate-700/60 rounded-full pl-2 pr-1 py-1 text-xs"
                                            >
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 text-slate-200 hover:text-amber-200 transition-colors"
                                                    onClick={() => loadPreset(p)}
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: p.color }} />
                                                    <span className="font-semibold">{p.name}</span>
                                                    <span className="text-slate-400">({p.type})</span>
                                                </button>
                                                <button
                                                    onClick={(e) => deletePreset(p.id, e)}
                                                    className="w-6 h-6 grid place-items-center rounded-full text-red-500 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                    aria-label={`Eliminar preset ${p.name}`}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-950/40 border border-slate-700/70 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
                                    placeholder="Ej: Goblin, Treasure, Soldier"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Descripción</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-slate-950/40 border border-slate-700/70 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none resize-none"
                                    placeholder="Ej: ‘When this creature dies, create a Treasure token.’"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Tipo</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                        className="w-full bg-slate-950/40 border border-slate-700/70 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                                    >
                                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Cantidad</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(String(Math.max(1, quantityValue - 1)))}
                                            className="w-10 h-10 rounded-lg bg-slate-900/60 border border-slate-700/70 text-slate-200 hover:text-amber-200 hover:border-amber-700/50 transition-colors"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                            className="w-full bg-slate-950/40 border border-slate-700/70 rounded-lg px-3 py-2 text-white outline-none text-center focus:border-amber-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(String(Math.min(20, quantityValue + 1)))}
                                            className="w-10 h-10 rounded-lg bg-slate-900/60 border border-slate-700/70 text-slate-200 hover:text-amber-200 hover:border-amber-700/50 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="mt-1 text-[11px] text-slate-500">1–20</div>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleCreate}
                                        disabled={!name.trim()}
                                        className="w-full h-10 bg-gradient-to-r from-amber-700/80 to-yellow-500/70 hover:from-amber-600/90 hover:to-yellow-400/80 disabled:opacity-50 disabled:hover:from-amber-700/80 disabled:hover:to-yellow-500/70 text-black font-extrabold rounded-lg transition-colors border border-amber-200/20"
                                    >
                                        {quantityValue === 1 ? 'Crear Token' : `Crear ${quantityValue} Tokens`}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            className={`w-9 h-9 rounded-full border transition-transform hover:scale-110 ${
                                                color === c.value ? 'border-amber-200/80 scale-110 ring-2 ring-amber-500/30' : 'border-slate-600/70'
                                            }`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                            onClick={() => setColor(c.value)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {type === 'Creature' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Power</label>
                                        <input
                                            type="number"
                                            value={power}
                                            onChange={e => setPower(e.target.value)}
                                            className="w-full bg-slate-950/40 border border-slate-700/70 rounded-lg px-3 py-2 text-white outline-none text-center focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Toughness</label>
                                        <input
                                            type="number"
                                            value={toughness}
                                            onChange={e => setToughness(e.target.value)}
                                            className="w-full bg-slate-950/40 border border-slate-700/70 rounded-lg px-3 py-2 text-white outline-none text-center focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-full bg-slate-950/40 border border-amber-700/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs uppercase tracking-widest text-slate-400">Previsualización</div>
                                <div className="text-[11px] text-slate-500">Token</div>
                            </div>
                            <div className="flex justify-center">
                                <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700/50 bg-black/20">
                                    <img src={previewUrl} alt="Token preview" className="block w-[260px] h-auto" draggable={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
