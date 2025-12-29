import { Settings, X, Keyboard, Minus, Plus } from 'lucide-react';

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
    };
    setHotkeys: (hotkeys: any) => void;
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
    setHotkeys
}: SettingsModalProps) => {
    if (!settingsOpen) return null;

    const handleHotkeyChange = (action: string, key: string) => {
        setHotkeys((prev: any) => ({
            ...prev,
            [action]: key.toLowerCase()
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-amber-600/50 rounded-xl w-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-amber-600/30 flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold text-amber-500 flex items-center gap-2 tracking-wide">
                        <Settings className="text-amber-600" size={20} />
                        CONFIGURACIÓN
                    </h2>
                    <button 
                        onClick={() => setSettingsOpen(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Visual Section */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="h-px flex-1 bg-slate-800"></span>
                            Visual
                            <span className="h-px flex-1 bg-slate-800"></span>
                        </h3>
                        
                        <div className="space-y-4">
                            <ScaleControl 
                                label="Menú Contextual (Previsualización)" 
                                value={Math.round(previewScale * 100)} 
                                onMinus={() => setPreviewScale((s: number) => Math.max(0.5, s - 0.1))}
                                onPlus={() => setPreviewScale((s: number) => Math.min(3, s + 0.1))}
                                unit="%"
                            />
                            <ScaleControl 
                                label="Zoom de Carta (Hover)" 
                                value={Math.round(hoverScale)} 
                                onMinus={() => setHoverScale((s: number) => Math.max(200, s - 20))}
                                onPlus={() => setHoverScale((s: number) => Math.min(600, s + 20))}
                                unit="px"
                            />
                            <ScaleControl 
                                label="Escala de UI" 
                                value={Math.round(uiScale * 100)} 
                                onMinus={() => setUiScale((s: number) => Math.max(0.5, s - 0.1))}
                                onPlus={() => setUiScale((s: number) => Math.min(2, s + 0.1))}
                                unit="%"
                            />
                        </div>
                    </div>

                    {/* Hotkeys Section */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="h-px flex-1 bg-slate-800"></span>
                            Atajos de Teclado
                            <span className="h-px flex-1 bg-slate-800"></span>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <HotkeyInput 
                                label="Robar Carta" 
                                value={hotkeys.draw} 
                                onChange={(val) => handleHotkeyChange('draw', val)} 
                            />
                            <HotkeyInput 
                                label="Ver Biblioteca" 
                                value={hotkeys.viewLibrary} 
                                onChange={(val) => handleHotkeyChange('viewLibrary', val)} 
                            />
                            <HotkeyInput 
                                label="Enderezar Todo" 
                                value={hotkeys.untapAll} 
                                onChange={(val) => handleHotkeyChange('untapAll', val)} 
                            />
                            <HotkeyInput 
                                label="Crear Token" 
                                value={hotkeys.createToken} 
                                onChange={(val) => handleHotkeyChange('createToken', val)} 
                            />
                            <HotkeyInput 
                                label="Tap/Untap" 
                                value={hotkeys.tapUntap} 
                                onChange={(val) => handleHotkeyChange('tapUntap', val)} 
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 italic text-center">
                            Haz clic en un recuadro y presiona una tecla para cambiarla.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                    <button 
                        onClick={() => setSettingsOpen(false)} 
                        className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 py-2.5 rounded-lg font-serif font-bold transition-all shadow-lg active:scale-[0.98]"
                    >
                        GUARDAR Y CERRAR
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
}

const ScaleControl = ({ label, value, onMinus, onPlus, unit }: ScaleControlProps) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-400">{label}</label>
        <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
            <button onClick={onMinus} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
                <Minus size={14} />
            </button>
            <span className="flex-1 text-center font-mono text-sm text-amber-500/90 font-bold">{value}{unit}</span>
            <button onClick={onPlus} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors">
                <Plus size={14} />
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
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
        <div className="relative">
            <input 
                type="text"
                value={value === ' ' ? 'ESPACIO' : (value || '').toUpperCase()}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-center font-mono font-bold text-indigo-400 focus:outline-none focus:border-indigo-500 transition-colors cursor-default"
                onKeyDown={(e) => {
                    e.preventDefault();
                    if (e.key === ' ') {
                        onChange(' ');
                    } else if (e.key.length === 1) {
                        onChange(e.key);
                    }
                }}
            />
            <Keyboard size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
        </div>
    </div>
);

