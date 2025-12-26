import { useCardData } from '../hooks/useCardData';
import { ZONE_LABELS } from '../utils/gameUtils';

interface ContextMenuProps {
    menuOpen: {id: string, x: number, y: number} | null;
    setMenuOpen: (menu: any) => void;
    gameState: any;
    mySeat: number;
    previewScale: number;
    uiScale: number;
    sendAction: (type: string, payload: any) => void;
}

export const ContextMenu = ({
    menuOpen,
    setMenuOpen,
    gameState,
    mySeat,
    previewScale,
    uiScale,
    sendAction
}: ContextMenuProps) => {
    const obj = menuOpen ? gameState.objects[menuOpen.id] : null;
    const { img: imgUrl } = useCardData(obj?.scryfall_id ?? null);

    if (!menuOpen) return null;
    if (!obj) return null;
    
    const isMine = obj.controller_seat === mySeat;

    const baseMenuWidth = Math.max(224, 140 * previewScale + 32); 
    const menuWidth = baseMenuWidth * Math.max(1, uiScale * 0.8);
    
    const estimatedHeight = (300 + (imgUrl ? 168 * previewScale : 0)) * uiScale;
    
    const safeX = Math.min(menuOpen.x, window.innerWidth - menuWidth - 10);
    const safeY = Math.min(menuOpen.y, window.innerHeight - estimatedHeight - 10);
    
    const finalY = Math.max(10, safeY);
    const finalX = Math.max(10, safeX);
    
    const fontSizeStyle = { fontSize: `${0.875 * uiScale}rem` };
    const buttonPadding = { padding: `${0.5 * uiScale}rem ${1 * uiScale}rem` };

    return (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
          <div 
              className="fixed z-50 bg-gray-800 border border-gray-600 rounded shadow-xl py-2 flex flex-col items-center"
              style={{ top: finalY, left: finalX, width: menuWidth }}
          >
              <div className="px-3 py-1 border-b border-gray-700 text-xs text-gray-400 font-mono w-full text-center mb-1" style={{ fontSize: `${0.75 * uiScale}rem` }}>{obj.id.slice(0,8)}</div>
              
              {imgUrl && (
                  <div className="my-2 transition-all" style={{ width: `${120 * previewScale}px`, height: `${168 * previewScale}px` }}>
                      <img src={imgUrl} className="w-full h-full object-contain rounded" />
                  </div>
              )}
              
              {isMine ? (
                  <>
                      <button 
                          className="w-[90%] text-left hover:bg-gray-700 border-gray-5 bg-gray-900 rounded-lg m-2" 
                          style={{ ...fontSizeStyle, ...buttonPadding }}
                          onClick={() => sendAction('TAP', { objectId: obj.id })}
                      >
                          {obj.tapped ? 'Untap' : 'Tap'}
                      </button>
                      
                      <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-700 mt-2" style={fontSizeStyle}>Mover a...</div>
                      <div className="grid grid-cols-2 gap-1 px-2 w-full">
                          {['HAND', 'BATTLEFIELD', 'GRAVEYARD', 'EXILE'].map(zone => (
                              <button key={zone} className="bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center gap-1 font-bold" 
                                  style={{ ...fontSizeStyle, padding: `${0.5 * uiScale}rem` }}
                                  onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: zone, toOwner: mySeat })} 
                              >
                                  {ZONE_LABELS[zone].split(' ')[0]} {ZONE_LABELS[zone].split(' ').slice(1).join(' ').substr(0,4)}
                              </button>
                          ))}
                          <button className="bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center gap-1 font-bold"
                              style={{ ...fontSizeStyle, padding: `${0.5 * uiScale}rem` }}
                              onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'LIBRARY', toOwner: mySeat, position: 'top' })}
                          >
                              📚 Bibloteca (Top)
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center gap-1 font-bold"
                              style={{ ...fontSizeStyle, padding: `${0.5 * uiScale}rem` }}
                              onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'LIBRARY', toOwner: mySeat, position: 'bottom' })}
                          >
                              📚 Biblioteca (Bot)
                          </button>
                      </div>

                      <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-700 mt-2" style={fontSizeStyle}>Contadores</div>
                      <div className="flex justify-around px-2 w-full mb-1">
                          <button className="bg-gray-700 rounded hover:bg-gray-600" style={{ ...fontSizeStyle, padding: `${0.25 * uiScale}rem ${0.75 * uiScale}rem` }} onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'P1P1', delta: 1 })}>+1/+1</button>
                          <button className="bg-gray-700 rounded hover:bg-gray-600" style={{ ...fontSizeStyle, padding: `${0.25 * uiScale}rem ${0.75 * uiScale}rem` }} onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'P1P1', delta: -1 })}>-1/-1</button>
                      </div>
                  </>
              ) : (
                  <div className="px-4 py-2 text-yellow-500 text-center border-t border-gray-700 mt-2" style={{ fontSize: `${0.75 * uiScale}rem` }}>
                      Solo lectura (Enemigo)
                  </div>
              )}
          </div>
        </>
    );
};
