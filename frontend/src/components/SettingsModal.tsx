interface SettingsModalProps {
    settingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
    cardScale: number;
    setCardScale: any;
    previewScale: number;
    setPreviewScale: any;
    hoverScale: number;
    setHoverScale: any;
    uiScale: number;
    setUiScale: any;
}

export const SettingsModal = ({
    settingsOpen,
    setSettingsOpen,
    cardScale,
    setCardScale,
    previewScale,
    setPreviewScale,
    hoverScale,
    setHoverScale,
    uiScale,
    setUiScale
}: SettingsModalProps) => {
    if (!settingsOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-800 p-6 rounded-lg w-80 shadow-2xl border border-gray-600">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">⚙️ Configuración</h2>
                
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Tamaño de Cartas (Mesa)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCardScale((s: number) => Math.max(0.5, s - 0.1))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">-</button>
                        <span className="flex-1 text-center font-mono">{Math.round(cardScale * 100)}%</span>
                        <button onClick={() => setCardScale((s: number) => Math.min(2, s + 0.1))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">+</button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-1">Tamaño al Leer (Menú)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPreviewScale((s: number) => Math.max(0.5, s - 0.1))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">-</button>
                        <span className="flex-1 text-center font-mono">{Math.round(previewScale * 100)}%</span>
                        <button onClick={() => setPreviewScale((s: number) => Math.min(3, s + 0.1))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">+</button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-1">Zoom al Pasar Mouse (px)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setHoverScale((s: number) => Math.max(200, s - 20))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">-</button>
                        <span className="flex-1 text-center font-mono">{Math.round(hoverScale)}px</span>
                        <button onClick={() => setHoverScale((s: number) => Math.min(600, s + 20))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">+</button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-1">Escala de Botones (UI)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setUiScale((s: number) => Math.max(0.5, s - 0.1))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">-</button>
                        <span className="flex-1 text-center font-mono">{Math.round(uiScale * 100)}%</span>
                        <button onClick={() => setUiScale((s: number) => Math.min(2, s + 0.1))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">+</button>
                    </div>
                </div>

                <button onClick={() => setSettingsOpen(false)} className="w-full bg-blue-600 py-2 rounded hover:bg-blue-500 font-bold">
                    Cerrar
                </button>
            </div>
        </div>
    );
};
