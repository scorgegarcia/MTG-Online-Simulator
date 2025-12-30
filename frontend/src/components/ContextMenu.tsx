import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCardData } from '../hooks/useCardData';
import { ZONE_LABELS } from '../utils/gameUtils';
import { CardCounters } from './CardCounters';

const MiniCardPreview = ({ obj, uiScale, variant }: { obj: any; uiScale: number; variant: 'amber' | 'green' }) => {
    const { img: imgUrlFromHook } = useCardData(obj?.scryfall_id ?? null);
    const imgUrl = obj?.scryfall_id ? imgUrlFromHook : (obj?.image_url || '');
    const isFacedown = obj?.face_state === 'FACEDOWN';
    const finalImgUrl = isFacedown
        ? (obj?.back_image_url || 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg')
        : imgUrl;

    const w = Math.max(48, Math.round(54 * uiScale));
    const h = Math.round(w * (3.5 / 2.5));
    const frameClassName = variant === 'green'
        ? "rounded-md overflow-hidden border border-emerald-400/40 bg-black/30 relative"
        : "rounded-md overflow-hidden border border-amber-400/40 bg-black/30 relative";
    const frameShadow = variant === 'green'
        ? '0 0 16px rgba(34,197,94,0.25)'
        : '0 0 16px rgba(245,158,11,0.25)';

    return (
        <div
            className={frameClassName}
            style={{
                width: `${w}px`,
                height: `${h}px`,
                boxShadow: frameShadow
            }}
        >
            {finalImgUrl ? (
                <img src={finalImgUrl} className="w-full h-full object-cover" draggable={false} />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">Sin imagen</div>
            )}
            <CardCounters counters={obj?.counters} size="small" />
        </div>
    );
};

interface ContextMenuProps {
    menuOpen: {id: string, x: number, y: number} | null;
    setMenuOpen: (menu: any) => void;
    gameState: any;
    mySeat: number;
    previewScale: number;
    uiScale: number;
    sendAction: (type: string, payload: any, options?: { closeMenu?: boolean }) => void;
    startEquipSelection: (equipmentId: string) => void;
    startEnchantSelection: (enchantmentId: string) => void;
}

export const ContextMenu = ({
    menuOpen,
    setMenuOpen,
    gameState,
    mySeat,
    previewScale,
    uiScale,
    sendAction,
    startEquipSelection,
    startEnchantSelection
}: ContextMenuProps) => {
    const obj = menuOpen ? gameState.objects[menuOpen.id] : null;
    const { img: imgUrlFromHook, type: typeLineFromHook } = useCardData(obj?.scryfall_id ?? null);
    const imgUrl = obj?.scryfall_id ? imgUrlFromHook : (obj?.image_url || '');
    
    const isMine = !!obj && obj.controller_seat === mySeat;

    const typeLineOverride = obj?.type_line ?? '';
    const typeLine = useMemo(() => {
        return String(typeLineOverride || typeLineFromHook || '');
    }, [typeLineOverride, typeLineFromHook]);
    const isEquipment = typeLine.toLowerCase().includes('equipment');
    const isEnchantment = typeLine.toLowerCase().includes('enchantment');
    const isAttached = !!obj?.attached_to;
    const objId = obj?.id;
    const attachedToMe = useMemo(() => {
        if (!objId) return [];
        return Object.values(gameState.objects || {}).filter((o: any) => o?.attached_to === objId);
    }, [gameState, objId]);
    const getTypeLineForObj = (o: any) => {
        const direct = String(o?.type_line || '');
        if (direct) return direct;
        const sid = o?.scryfall_id;
        if (!sid) return '';
        const cached = localStorage.getItem(`card_data_v3_${sid}`);
        if (!cached) return '';
        try {
            return String(JSON.parse(cached)?.type || '');
        } catch {
            return '';
        }
    };
    const attachedEquipments = useMemo(() => {
        return attachedToMe.filter((o: any) => getTypeLineForObj(o).toLowerCase().includes('equipment'));
    }, [attachedToMe]);
    const attachedEnchantments = useMemo(() => {
        return attachedToMe.filter((o: any) => getTypeLineForObj(o).toLowerCase().includes('enchantment'));
    }, [attachedToMe]);
    const attachedHost = obj?.attached_to ? gameState.objects?.[obj.attached_to] : null;

    const goldActionClass = "w-full text-left rounded-lg bg-black/35 hover:bg-black/45 border border-amber-400/70 hover:border-amber-300 transition-colors text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.25)] hover:shadow-[0_0_26px_rgba(245,158,11,0.45)]";
    const greenActionClass = "w-full text-left rounded-lg bg-black/35 hover:bg-black/45 border border-emerald-400/70 hover:border-emerald-300 transition-colors text-emerald-100 shadow-[0_0_18px_rgba(34,197,94,0.25)] hover:shadow-[0_0_26px_rgba(34,197,94,0.45)]";

    const isFacedown = obj?.face_state === 'FACEDOWN';
    const finalImgUrl = isFacedown
        ? (obj?.back_image_url || 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg')
        : imgUrl;

    const rawPreviewHeight = 168 * previewScale;
    const rawPreviewWidth = 120 * previewScale;
    const maxPreviewHeight = Math.min(rawPreviewHeight, Math.max(160, window.innerHeight - 20 - Math.max(44, 44 * uiScale)));
    const previewHeight = maxPreviewHeight;
    const previewWidth = (rawPreviewWidth / rawPreviewHeight) * previewHeight;

    const menuRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 10, y: 10 });
    const [avgColor, setAvgColor] = useState<{ r: number; g: number; b: number } | null>(null);

    const estimatedSize = useMemo(() => {
        const rightColWidth = Math.max(200, 220 * uiScale);
        const padding = 12;
        const gap = 12;
        const headerHeight = Math.max(24, 24 * uiScale);
        const estimatedHeight = headerHeight + padding * 2 + Math.max(previewHeight, isMine ? 320 * uiScale : 44 * uiScale);
        const estimatedWidth = padding * 2 + previewWidth + gap + rightColWidth;
        return { width: estimatedWidth, height: estimatedHeight };
    }, [isMine, previewHeight, previewWidth, uiScale]);

    useEffect(() => {
        if (!menuOpen) return;
        const clampToViewport = (x: number, y: number, w: number, h: number) => {
            const padding = 10;
            const maxX = Math.max(padding, window.innerWidth - w - padding);
            const maxY = Math.max(padding, window.innerHeight - h - padding);
            return {
                x: Math.min(Math.max(padding, x), maxX),
                y: Math.min(Math.max(padding, y), maxY),
            };
        };

        const next = clampToViewport(menuOpen.x, menuOpen.y, estimatedSize.width, estimatedSize.height);
        setPosition(next);
    }, [menuOpen, estimatedSize.height, estimatedSize.width]);

    useLayoutEffect(() => {
        if (!menuOpen) return;
        const el = menuRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const padding = 10;
        const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
        const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
        const nextX = Math.min(Math.max(padding, position.x), maxX);
        const nextY = Math.min(Math.max(padding, position.y), maxY);

        if (nextX !== position.x || nextY !== position.y) {
            setPosition({ x: nextX, y: nextY });
        }
    }, [finalImgUrl, isMine, menuOpen, position.x, position.y, previewHeight, previewWidth, uiScale]);

    useEffect(() => {
        const handleResize = () => {
            const el = menuRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const padding = 10;
            const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
            const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
            setPosition((prev) => ({
                x: Math.min(Math.max(padding, prev.x), maxX),
                y: Math.min(Math.max(padding, prev.y), maxY),
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!finalImgUrl) {
            setAvgColor(null);
            return;
        }

        let cancelled = false;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        
        // Use a proxy or ensure CORS headers are set on the image source
        // Since we can't easily change the server, we might be hitting CORS issues with direct canvas access
        // For the card back (static.wikia...), it might not have CORS headers
        // For scryfall images, they usually do.
        
        img.src = finalImgUrl;
        
        img.onload = () => {
            if (cancelled) return;
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                const w = 24;
                const h = 24;
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                const data = ctx.getImageData(0, 0, w, h).data;
                let r = 0;
                let g = 0;
                let b = 0;
                let count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const a = data[i + 3];
                    if (a < 16) continue;
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count += 1;
                }
                if (!count) return;
                const avg = { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
                setAvgColor(avg);
            } catch (e) {
                console.warn("Failed to get average color (likely CORS)", e);
                setAvgColor(null);
            }
        };
        img.onerror = () => {
            if (cancelled) return;
            setAvgColor(null);
        };

        return () => {
            cancelled = true;
        };
    }, [finalImgUrl]);

    const palette = useMemo(() => {
        const fallback = { r: 30, g: 41, b: 59 };
        const c = avgColor ?? fallback;
        const background = `rgba(${c.r}, ${c.g}, ${c.b}, 0.55)`;
        const background2 = `rgba(${c.r}, ${c.g}, ${c.b}, 0.25)`;
        const border = `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`;
        const halo = `rgba(${Math.min(255, c.r + 30)}, ${Math.min(255, c.g + 30)}, ${Math.min(255, c.b + 30)}, 0.55)`;
        return { c, background, background2, border, halo };
    }, [avgColor]);

    const fontSizeStyle = { fontSize: `${0.875 * uiScale}rem` };
    const metaFontSizeStyle = { fontSize: `${0.75 * uiScale}rem` };
    const buttonStyle = { padding: `${0.55 * uiScale}rem ${0.85 * uiScale}rem`, fontSize: `${0.85 * uiScale}rem` };
    const inputStyle = { padding: `${0.55 * uiScale}rem ${0.65 * uiScale}rem`, fontSize: `${0.85 * uiScale}rem` };

    const [customPowerDelta, setCustomPowerDelta] = useState<number>(0);
    const [customToughnessDelta, setCustomToughnessDelta] = useState<number>(0);

    useEffect(() => {
        if (!menuOpen || !obj) return;
        const counters = obj.counters ?? {};
        const p1p1 = typeof counters.P1P1 === 'number' ? counters.P1P1 : 0;
        const powerStored = typeof counters.POWER === 'number' ? counters.POWER : 0;
        const toughnessStored = typeof counters.TOUGHNESS === 'number' ? counters.TOUGHNESS : 0;
        setCustomPowerDelta(p1p1 + powerStored);
        setCustomToughnessDelta(p1p1 + toughnessStored);
    }, [menuOpen, obj]);

    if (!menuOpen || !obj) return null;

    return (
        <>
          <div className="fixed inset-0 z-[990]" onClick={() => setMenuOpen(null)} />
          <div 
              ref={menuRef}
              className="fixed z-[1000] rounded-xl shadow-2xl overflow-hidden flex flex-col"
              style={{
                  top: position.y,
                  left: position.x,
                  maxWidth: 'calc(100vw - 20px)',
                  maxHeight: 'calc(100vh - 20px)',
                  background: `radial-gradient(120% 140% at 20% 0%, ${palette.background} 0%, rgba(0,0,0,0.78) 55%, ${palette.background2} 100%)`,
                  border: `1px solid ${palette.border}`,
                  backdropFilter: 'blur(100px)',
              }}
          >
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                  <div className="text-white/60 font-mono" style={metaFontSizeStyle}>{obj.id.slice(0,8)}</div>
                  <button
                      className="text-white/70 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
                      style={metaFontSizeStyle}
                      onClick={() => setMenuOpen(null)}
                  >
                      ✕
                  </button>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                <div className="flex items-stretch gap-3 p-3">
                  <div className="shrink-0" style={{ width: `${previewWidth}px`, height: `${previewHeight}px` }}>
                      {finalImgUrl ? (
                          <div
                              className="w-full h-full rounded-lg overflow-hidden border border-white/15 relative"
                              style={{
                                  boxShadow: `0 0 ${28 * uiScale}px ${palette.halo}, 0 0 ${70 * uiScale}px rgba(0,0,0,0.5)`,
                              }}
                          >
                              <img src={finalImgUrl} className="w-full h-full object-cover" draggable={false} />
                              <CardCounters counters={obj?.counters} size="normal" className="scale-150 origin-top-right mt-1 mr-1" />
                          </div>
                      ) : (
                          <div className="w-full h-full rounded-lg border border-white/15 bg-black/40 flex items-center justify-center text-white/60" style={fontSizeStyle}>
                              {(isFacedown && !isMine) ? '???' : 'Sin imagen'}
                          </div>
                      )}
                  </div>

                  <div
                      className="flex flex-col gap-2 min-w-[220px]"
                      style={{
                          width: `${Math.max(220, 240 * uiScale)}px`,
                          maxHeight: `${previewHeight}px`,
                      }}
                  >
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
                          {isMine ? (
                              <>
                                  <div className="flex gap-2">
                                      <button
                                          className="flex-1 text-left rounded-lg bg-black/35 hover:bg-black/45 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('TAP', { objectId: obj.id })}
                                      >
                                          {obj.tapped ? '⬆️ Untap' : '⤵️ Tap'}
                                      </button>
                                      <button
                                          className="flex-1 text-left rounded-lg bg-black/35 hover:bg-black/45 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('TOGGLE_FACE', { objectId: obj.id })}
                                      >
                                          🔄 Fold
                                      </button>
                                  </div>

                                  {!isEquipment && attachedEquipments.length > 0 && (
                                      <div className="rounded-lg border border-amber-400/30 bg-black/25 p-2">
                                          <div className="text-amber-200/80 font-semibold mb-2" style={fontSizeStyle}>Equipos</div>
                                          <div className="flex flex-wrap gap-2">
                                              {attachedEquipments.map((e: any) => (
                                                  <MiniCardPreview key={e.id} obj={e} uiScale={uiScale} variant="amber" />
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {!isEquipment && attachedEnchantments.length > 0 && (
                                      <div className="rounded-lg border border-emerald-400/30 bg-black/25 p-2">
                                          <div className="text-emerald-200/80 font-semibold mb-2" style={fontSizeStyle}>Encantamientos</div>
                                          <div className="flex flex-wrap gap-2">
                                              {attachedEnchantments.map((e: any) => (
                                                  <MiniCardPreview key={e.id} obj={e} uiScale={uiScale} variant="green" />
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {isEquipment && attachedHost && (
                                      <div className="rounded-lg border border-amber-400/30 bg-black/25 p-2">
                                          <div className="text-amber-200/80 font-semibold mb-2" style={fontSizeStyle}>Equipado a</div>
                                          <MiniCardPreview obj={attachedHost} uiScale={uiScale} variant="amber" />
                                      </div>
                                  )}

                                  {isEnchantment && attachedHost && (
                                      <div className="rounded-lg border border-emerald-400/30 bg-black/25 p-2">
                                          <div className="text-emerald-200/80 font-semibold mb-2" style={fontSizeStyle}>Encantado a</div>
                                          <MiniCardPreview obj={attachedHost} uiScale={uiScale} variant="green" />
                                      </div>
                                  )}

                                  {isEquipment && obj.zone === 'BATTLEFIELD' && (
                                      <button
                                          className={goldActionClass}
                                          style={buttonStyle}
                                          onClick={() => {
                                              if (isAttached) {
                                                  sendAction('EQUIP_DETACH', { equipmentId: obj.id });
                                                  return;
                                              }
                                              startEquipSelection(obj.id);
                                          }}
                                      >
                                          {isAttached ? 'Desequipar' : 'Equipar'}
                                      </button>
                                  )}

                                  {isEnchantment && obj.zone === 'BATTLEFIELD' && (
                                      <button
                                          className={greenActionClass}
                                          style={buttonStyle}
                                          onClick={() => {
                                              if (isAttached) {
                                                  sendAction('ENCHANT_DETACH', { enchantmentId: obj.id });
                                                  return;
                                              }
                                              startEnchantSelection(obj.id);
                                          }}
                                      >
                                          {isAttached ? 'Desencantar' : 'Encantar'}
                                      </button>
                                  )}

                                  <div className="text-white/60 font-semibold mt-1" style={fontSizeStyle}>Mover a</div>
                                  {['HAND', 'BATTLEFIELD', 'GRAVEYARD'].map(zone => {
                                      if (obj.zone === zone) return null; // Don't show current zone
                                      return (
                                          <button
                                              key={zone}
                                              className="w-full text-left rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                              style={buttonStyle}
                                              onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: zone, toOwner: mySeat })}
                                          >
                                              {ZONE_LABELS[zone]}
                                          </button>
                                      );
                                  })}
                                  
                                  {obj.zone !== 'EXILE' && (
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 text-left rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                            style={buttonStyle}
                                            onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'EXILE', toOwner: mySeat })}
                                        >
                                            {ZONE_LABELS['EXILE']}
                                        </button>
                                        <button
                                            className="flex-1 text-left rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                            style={buttonStyle}
                                            onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'EXILE', toOwner: mySeat, faceState: 'FACEDOWN' })}
                                        >
                                            Exilio 🙈
                                        </button>
                                    </div>
                                  )}

                                  {obj.zone !== 'LIBRARY' && (
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 text-left rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                            style={buttonStyle}
                                            onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'LIBRARY', toOwner: mySeat, position: 'top' })}
                                        >
                                            📚⬆️ Mazo (Arriba)
                                        </button>
                                        <button
                                            className="flex-1 text-left rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                            style={buttonStyle}
                                            onClick={() => sendAction('MOVE', { objectId: obj.id, fromZone: obj.zone, toZone: 'LIBRARY', toOwner: mySeat, position: 'bottom' })}
                                        >
                                            📚⬇️ Mazo (Abajo)
                                        </button>
                                    </div>
                                  )}

                                  <div className="text-white/60 font-semibold mt-1" style={fontSizeStyle}>Contadores</div>
                                  <div className="flex gap-2">
                                      <button
                                          className="flex-1 text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'P1P1', delta: 1 }, { closeMenu: false })}
                                      >
                                          +1/+1
                                      </button>
                                      <button
                                          className="flex-1 text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'P1P1', delta: -1 }, { closeMenu: false })}
                                      >
                                          -1/-1
                                      </button>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                      <button
                                          className="text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'POWER', delta: -1 }, { closeMenu: false })}
                                      >
                                          <span className="block">-1</span>
                                          <span className="block">⚔️</span>
                                      </button>
                                      <button
                                          className="text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'POWER', delta: 1 }, { closeMenu: false })}
                                      >
                                          <span className="block">+1</span>
                                          <span className="block">⚔️</span>
                                      </button>
                                      <button
                                          className="text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'TOUGHNESS', delta: -1 }, { closeMenu: false })}
                                      >
                                          <span className="block">-1</span>
                                          <span className="block">🛡️</span>
                                      </button>
                                      <button
                                          className="text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => sendAction('COUNTERS', { objectId: obj.id, type: 'TOUGHNESS', delta: 1 }, { closeMenu: false })}
                                      >
                                          <span className="block">+1</span>
                                          <span className="block">🛡️</span>
                                      </button>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                      <input
                                          className="w-full text-center rounded-lg bg-black/25 border border-white/10 text-white outline-none"
                                          style={inputStyle}
                                          type="number"
                                          step={1}
                                          value={customPowerDelta}
                                          onChange={(e) => setCustomPowerDelta(Number(e.target.value) || 0)}
                                      />
                                      <button
                                          className="text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => {
                                              const counters = obj.counters ?? {};
                                              const p1p1 = typeof counters.P1P1 === 'number' ? counters.P1P1 : 0;
                                              const currentPowerStored = typeof counters.POWER === 'number' ? counters.POWER : 0;
                                              const targetPowerStored = customPowerDelta - p1p1;
                                              const delta = targetPowerStored - currentPowerStored;
                                              if (delta === 0) return;
                                              sendAction('COUNTERS', { objectId: obj.id, type: 'POWER', delta }, { closeMenu: false });
                                          }}
                                      >
                                          ⚔️
                                      </button>
                                      <input
                                          className="w-full text-center rounded-lg bg-black/25 border border-white/10 text-white outline-none"
                                          style={inputStyle}
                                          type="number"
                                          step={1}
                                          value={customToughnessDelta}
                                          onChange={(e) => setCustomToughnessDelta(Number(e.target.value) || 0)}
                                      />
                                      <button
                                          className="text-center rounded-lg bg-black/25 hover:bg-black/35 border border-white/10 hover:border-white/15 transition-colors text-white"
                                          style={buttonStyle}
                                          onClick={() => {
                                              const counters = obj.counters ?? {};
                                              const p1p1 = typeof counters.P1P1 === 'number' ? counters.P1P1 : 0;
                                              const currentToughnessStored = typeof counters.TOUGHNESS === 'number' ? counters.TOUGHNESS : 0;
                                              const targetToughnessStored = customToughnessDelta - p1p1;
                                              const delta = targetToughnessStored - currentToughnessStored;
                                              if (delta === 0) return;
                                              sendAction('COUNTERS', { objectId: obj.id, type: 'TOUGHNESS', delta }, { closeMenu: false });
                                          }}
                                      >
                                          🛡️
                                      </button>
                                  </div>
                              </>
                          ) : (
                              <div className="text-amber-300 text-center border border-white/10 bg-black/30 rounded-lg px-3 py-2" style={fontSizeStyle}>
                                  Solo lectura (enemigo)
                              </div>
                          )}
                      </div>
                  </div>
                </div>
              </div>
          </div>
        </>
    );
};
