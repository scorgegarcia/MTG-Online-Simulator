import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TokenPreset {
    id: string;
    name: string;
    color: string;
    power: string;
    toughness: string;
    type: 'Creature' | 'Land' | 'Non-creature';
}

interface CreateTokenModalProps {
        isOpen: boolean;
        onClose: () => void;
        onCreate: (token: { name: string, color: string, power?: string, toughness?: string, type: string, imageUrl: string }) => void;
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
    const [color, setColor] = useState(COLORS[0].value);
    const [power, setPower] = useState('1');
    const [toughness, setToughness] = useState('1');
    const [type, setType] = useState('Creature');

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
        setColor(preset.color);
        setPower(preset.power);
        setToughness(preset.toughness);
        setType(preset.type);
    };

    const handleCreate = () => {
        if (!name.trim()) return;

        const textColor = COLORS.find(c => c.value === color)?.text || 'white';
        // Simple SVG placeholder
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="250" height="350" viewBox="0 0 250 350">
            <rect width="250" height="350" fill="${color}" stroke="#333" stroke-width="4"/>
            <rect x="10" y="10" width="230" height="330" fill="none" stroke="#rgba(0,0,0,0.2)" stroke-width="2"/>
            <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-weight="bold" font-size="28" fill="${textColor}">${name}</text>
            <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="${textColor}">${type}</text>
            ${type === 'Creature' ? `<text x="85%" y="92%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="${textColor}" stroke="black" stroke-width="0.5">${power}/${toughness}</text>` : ''}
        </svg>
        `;
        const imageUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

        const newToken = {
            id: Date.now().toString(),
            name,
            color,
            power: type === 'Creature' ? power : '',
            toughness: type === 'Creature' ? toughness : '',
            type: type as any
        };

        savePreset(newToken);
        
        // Map UI type to game type string
        let gameType = 'Token';
        if (type === 'Creature') gameType = 'Creature - Token';
        if (type === 'Land') gameType = 'Land - Token';
        if (type === 'Non-creature') gameType = 'Artifact - Token'; // Generic non-creature

        onCreate({
            name,
            color,
            power: type === 'Creature' ? power : undefined,
            toughness: type === 'Creature' ? toughness : undefined,
            type: gameType,
            imageUrl
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-[400px] shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Create Token</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Presets */}
                {presets.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-xs text-slate-400 mb-1">Previously Used</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white appearance-none"
                                onChange={(e) => {
                                    const preset = presets.find(p => p.id === e.target.value);
                                    if (preset) loadPreset(preset);
                                    e.target.value = ""; // Reset select
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>Select a previous token...</option>
                                {presets.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.type})
                                    </option>
                                ))}
                            </select>
                            {/* We can't easily put delete buttons inside select options. 
                                Instead, let's make a custom dropdown or just a list if requested. 
                                The user asked for a dropdown. 
                                Standard select doesn't support delete buttons per item.
                                I'll implement a custom dropdown or a list below.
                                Given constraints, I'll add a list of recent tokens below the select or replace the select with a custom UI.
                                Let's try a custom list approach for "Previously Used" to allow deletion.
                            */}
                        </div>
                         <div className="mt-2 max-h-32 overflow-y-auto flex flex-wrap gap-2">
                            {presets.map(p => (
                                <div key={p.id} className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs">
                                    <span 
                                        className="cursor-pointer hover:text-blue-400 text-slate-300"
                                        onClick={() => loadPreset(p)}
                                    >
                                        {p.name}
                                    </span>
                                    <button 
                                        onClick={(e) => deletePreset(p.id, e)}
                                        className="text-red-500 hover:text-red-400 ml-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Name */}
                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1">Token Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                        placeholder="e.g. Goblin, Treasure"
                    />
                </div>

                {/* Colors */}
                <div className="mb-4">
                    <label className="block text-xs text-slate-400 mb-2">Color</label>
                    <div className="flex gap-2 flex-wrap">
                        {COLORS.map(c => (
                            <button
                                key={c.name}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                                onClick={() => setColor(c.value)}
                            />
                        ))}
                    </div>
                </div>

                {/* Type & Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Type / Zone</label>
                        <select 
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white outline-none"
                        >
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {type === 'Creature' && (
                        <div className="flex gap-2">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Power</label>
                                <input 
                                    type="number" 
                                    value={power}
                                    onChange={e => setPower(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-2 text-white outline-none text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Toughness</label>
                                <input 
                                    type="number" 
                                    value={toughness}
                                    onChange={e => setToughness(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-2 text-white outline-none text-center"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleCreate}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition-colors"
                >
                    Create Token
                </button>
            </div>
        </div>
    );
};
