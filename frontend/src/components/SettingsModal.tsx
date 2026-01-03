import { X, Keyboard, Minus, Plus, Sparkles, Wand2, Palette, Zap, Eye, Layers } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface SettingsModalProps {
    settingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
    previewScale: number;
    setPreviewScale: any;
    hoverScale: number;
    setHoverScale: any;
    uiScale: number;
    setUiScale: any;
    hotkeys: {
        draw: string;
        viewLibrary: string;
        untapAll: string;
        createToken: string;
        tapUntap: string;
        arrowToggle: string;
        thinking: string;
        passTurn: string;
    };
    setHotkeys: (hotkeys: any) => void;
    showOriginalPlaymats: boolean;
    setShowOriginalPlaymats: (show: boolean) => void;
}

export const SettingsModal = ({
    settingsOpen,
    setSettingsOpen,
    previewScale,
    setPreviewScale,
    hoverScale,
    setHoverScale,
    uiScale,
    setUiScale,
    hotkeys,
    setHotkeys,
    showOriginalPlaymats,
    setShowOriginalPlaymats
}: SettingsModalProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const particlesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (settingsOpen) {
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
        }
    }, [settingsOpen]);

    if (!settingsOpen) return null;

    const handleHotkeyChange = (action: string, key: string) => {
        setHotkeys((prev: any) => ({
            ...prev,
            [action]: key.toLowerCase()
        }));
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Background Particles Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" ref={particlesRef}>
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-1 h-1 bg-amber-500 rounded-full blur-[1px] animate-magic-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                            opacity: 0.4 + Math.random() * 0.6
                        }}
                    />
                ))}
            </div>

            <div className={`relative bg-slate-950/90 border border-amber-500/30 rounded-2xl w-[500px] shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0 rotate-0' : 'scale-90 translate-y-12 rotate-1'}`}>
                {/* Magic Glow Border Effect */}
                <div className="absolute inset-0 border border-amber-500/20 rounded-2xl pointer-events-none animate-pulse" />
                
                {/* Header */}
                <div className="relative bg-gradient-to-b from-amber-900/20 to-transparent p-6 border-b border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 animate-bounce-subtle">
                            <Wand2 className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-amber-500 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase">
                                El Grimorio de Opciones
                            </h2>
                            <p className="text-[10px] text-amber-600/60 font-serif tracking-[0.2em] uppercase">Ajustes del Plano</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSettingsOpen(false)}
                        className="p-2 text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10 rounded-full transition-all duration-300"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-10">
                    {/* Visual Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-xs font-bold text-amber-600/50 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                            <Sparkles size={14} />
                            Visuales
                            <div className="h-px flex-1 bg-gradient-to-r from-amber-900/50 to-transparent"></div>
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-6 bg-amber-900/5 p-4 rounded-xl border border-amber-500/5">
                            <ScaleControl 
                                label="Previsualización del Menú" 
                                value={Math.round(previewScale * 100)} 
                                onMinus={() => setPreviewScale((s: number) => Math.max(0.5, s - 0.1))}
                                onPlus={() => setPreviewScale((s: number) => Math.min(3, s + 0.1))}
                                unit="%"
                                icon={<Zap size={14} className="text-amber-600/60" />}
                            />
                            <ScaleControl 
                                label="Zoom de Carta (Hover)" 
                                value={Math.round(hoverScale)} 
                                onMinus={() => setHoverScale((s: number) => Math.max(200, s - 20))}
                                onPlus={() => setHoverScale((s: number) => Math.min(600, s + 20))}
                                unit="px"
                                icon={<Eye size={14} className="text-amber-600/60" />}
                            />
                            <ScaleControl 
                                label="Escala de Interfaz" 
                                value={Math.round(uiScale * 100)} 
                                onMinus={() => setUiScale((s: number) => Math.max(0.5, s - 0.1))}
                                onPlus={() => setUiScale((s: number) => Math.min(2, s + 0.1))}
                                unit="%"
                                icon={<Layers size={14} className="text-amber-600/60" />}
                            />
                        </div>
                    </section>

                    {/* Game Options Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-xs font-bold text-amber-600/50 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                            <Palette size={14} />
                            Estética del Campo
                            <div className="h-px flex-1 bg-gradient-to-r from-amber-900/50 to-transparent"></div>
                        </h3>
                        
                        <div className="bg-amber-900/5 p-4 rounded-xl border border-amber-500/5">
                            <div className="flex items-center justify-between p-2 hover:bg-amber-500/5 rounded-lg transition-colors group">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-slate-300 group-hover:text-amber-400 transition-colors">Colores Originales de Playmats</span>
                                    <span className="text-[10px] text-slate-500">Elimina los filtros azul/rojo de los tapetes</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={showOriginalPlaymats}
                                        onChange={(e) => setShowOriginalPlaymats(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600 peer-checked:after:bg-white peer-checked:after:shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Hotkeys Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-xs font-bold text-amber-600/50 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                            <Keyboard size={14} />
                            Atajos Arcanos
                            <div className="h-px flex-1 bg-gradient-to-r from-amber-900/50 to-transparent"></div>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3 bg-amber-900/5 p-4 rounded-xl border border-amber-500/5">
                            <HotkeyInput label="Robar" value={hotkeys.draw} onChange={(val) => handleHotkeyChange('draw', val)} />
                            <HotkeyInput label="Biblioteca" value={hotkeys.viewLibrary} onChange={(val) => handleHotkeyChange('viewLibrary', val)} />
                            <HotkeyInput label="Enderezar" value={hotkeys.untapAll} onChange={(val) => handleHotkeyChange('untapAll', val)} />
                            <HotkeyInput label="Token" value={hotkeys.createToken} onChange={(val) => handleHotkeyChange('createToken', val)} />
                            <HotkeyInput label="Tap/Untap" value={hotkeys.tapUntap} onChange={(val) => handleHotkeyChange('tapUntap', val)} />
                            <HotkeyInput label="Flechas" value={hotkeys.arrowToggle} onChange={(val) => handleHotkeyChange('arrowToggle', val)} />
                            <HotkeyInput label="Pensar" value={hotkeys.thinking} onChange={(val) => handleHotkeyChange('thinking', val)} />
                            <HotkeyInput label="Pasar" value={hotkeys.passTurn} onChange={(val) => handleHotkeyChange('passTurn', val)} />
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gradient-to-t from-amber-900/20 to-transparent border-t border-amber-500/20">
                    <button 
                        onClick={() => setSettingsOpen(false)} 
                        className="w-full relative group overflow-hidden bg-amber-600 hover:bg-amber-500 text-slate-950 py-3 rounded-xl font-serif font-black text-lg transition-all shadow-[0_4px_20px_rgba(217,119,6,0.3)] active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        SELLAR CAMBIOS
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ScaleControlProps {
    label: string;
    value: number;
    onMinus: () => void;
    onPlus: () => void;
    unit: string;
    icon?: React.ReactNode;
}

const ScaleControl = ({ label, value, onMinus, onPlus, unit, icon }: ScaleControlProps) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1">
            {icon}
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        </div>
        <div className="flex items-center gap-3 bg-slate-950/80 p-1.5 rounded-xl border border-amber-500/10 shadow-inner group/scale">
            <button 
                onClick={onMinus} 
                className="p-2 hover:bg-amber-500/10 rounded-lg text-slate-500 hover:text-amber-500 transition-all active:scale-90"
            >
                <Minus size={16} />
            </button>
            <div className="flex-1 flex items-baseline justify-center gap-0.5">
                <span className="font-mono text-lg text-amber-500 font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">{value}</span>
                <span className="text-[10px] text-amber-700 font-bold uppercase">{unit}</span>
            </div>
            <button 
                onClick={onPlus} 
                className="p-2 hover:bg-amber-500/10 rounded-lg text-slate-500 hover:text-amber-500 transition-all active:scale-90"
            >
                <Plus size={16} />
            </button>
        </div>
    </div>
);

interface HotkeyInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
}

const HotkeyInput = ({ label, value, onChange }: HotkeyInputProps) => (
    <div className="flex flex-col gap-1.5 group/hotkey">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 group-hover/hotkey:text-amber-600/70 transition-colors">{label}</label>
        <div className="relative">
            <input 
                type="text"
                value={value === ' ' ? 'ESPACIO' : (value || '').toUpperCase()}
                readOnly
                className="w-full bg-slate-950/80 border border-amber-500/10 rounded-lg py-2.5 px-3 text-center font-mono font-black text-amber-500/90 focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer hover:bg-amber-500/5 hover:border-amber-500/30 text-sm shadow-inner"
                onKeyDown={(e) => {
                    e.preventDefault();
                    if (e.key === ' ') {
                        onChange(' ');
                    } else if (e.key.length === 1) {
                        onChange(e.key);
                    }
                }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-amber-500/20 rounded-full animate-pulse" />
        </div>
    </div>
);
