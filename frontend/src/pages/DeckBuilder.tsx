import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  ArrowLeft, 
  Save, 
  Layers, 
  Eye, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Scroll as ScrollIcon,
  Sword,
  Shield,
  Crown,
  FileText,
} from 'lucide-react';
import ImportDeckModal from '../components/ImportDeckModal';
import CustomCardsModal from '../components/CustomCardsModal';
import PersonalizedCard from '../components/PersonalizedCard';
import type { CardDraft, ManaSymbol } from '../components/cardBuilder/types';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export default function DeckBuilder() {
  console.log('Rendering DeckBuilder'); // Debug log
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [deck, setDeck] = useState<any>({ name: 'New Deck', format: 'standard', cards: [] });
  console.log('Deck state:', deck); // Debug log

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]); // Store versions of a card
  const [viewingVersionsFor, setViewingVersionsFor] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCustomCardsModal, setShowCustomCardsModal] = useState(false);
  const [customCardById, setCustomCardById] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isNew && id) {
      axios.get(`${API_BASE_URL}/decks/${id}`)
        .then(res => setDeck(res.data))
        .catch(() => navigate('/dashboard'));
    }
  }, [id, isNew, navigate]);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setVersions([]);
      setViewingVersionsFor(null);
      try {
          const res = await axios.get(`${API_BASE_URL}/decks/scryfall/search?q=${encodeURIComponent(search)}`);
          setSearchResults(res.data.data || []);
      } finally {
          setLoading(false);
      }
  };

  const fetchVersions = async (card: any) => {
      if (viewingVersionsFor === card.id) {
          setViewingVersionsFor(null);
          return;
      }
      setLoading(true);
      try {
          // Use prints_search_uri if available, or search by oracle_id
          let url = card.prints_search_uri;
          if (!url && card.oracle_id) {
             url = `https://api.scryfall.com/cards/search?order=released&q=oracleid:${card.oracle_id}&unique=prints`;
          }
          
          if (url) {
              const res = await axios.get(url);
              setVersions(res.data.data || []);
              setViewingVersionsFor(card.id);
          }
      } catch(e) {
          alert('Error fetching versions');
      } finally {
          setLoading(false);
      }
  };

  const createDeck = async () => {
      const res = await axios.post(`${API_BASE_URL}/decks`, { name: deck.name, format: deck.format });
      navigate(`/decks/${res.data.id}`);
  };

  const saveDeck = async () => {
      if(isNew) return createDeck();
      await axios.put(`${API_BASE_URL}/decks/${id}`, { name: deck.name, format: deck.format });
  };

  const addCard = async (card: any, board = 'main') => {
      if(isNew) {
          alert('Save deck first');
          return;
      }
      // Use the specific card ID (scryfall_id) which represents the specific print
      await axios.post(`${API_BASE_URL}/decks/${id}/cards`, {
          scryfall_id: card.id, 
          qty: 1,
          board
      });
      // Refresh
      const res = await axios.get(`${API_BASE_URL}/decks/${id}`);
      setDeck(res.data);
  };

  const addCustomCard = async (customCard: any, board = 'main') => {
      if(isNew) {
          alert('Save deck first');
          return;
      }
      await axios.post(`${API_BASE_URL}/decks/${id}/cards`, {
          custom_card_id: customCard.id,
          qty: 1,
          board
      });
      // Refresh
      const res = await axios.get(`${API_BASE_URL}/decks/${id}`);
      setDeck(res.data);
  };

  const getDeckCardKey = (deckCard: any) => {
      return deckCard?.is_custom ? deckCard?.custom_card_id : deckCard?.scryfall_id;
  };

  const incrementDeckCard = async (deckCard: any) => {
      if (isNew) {
          alert('Save deck first');
          return;
      }
      const cardKey = getDeckCardKey(deckCard);
      if (!cardKey) return;

      await axios.post(`${API_BASE_URL}/decks/${id}/cards`, {
          ...(deckCard?.is_custom ? { custom_card_id: cardKey } : { scryfall_id: cardKey }),
          qty: 1,
          board: deckCard.board
      });

      const res = await axios.get(`${API_BASE_URL}/decks/${id}`);
      setDeck(res.data);
  };

  const removeCard = async (cardKey: string, board?: 'main' | 'side' | 'commander') => {
      const qs = board ? `?board=${board}` : '';
      await axios.delete(`${API_BASE_URL}/decks/${id}/cards/${cardKey}${qs}`);
      const res = await axios.get(`${API_BASE_URL}/decks/${id}`);
      setDeck(res.data);
  };

  const updateBackImageUrl = async (deckCardId: string, backImageUrl: string) => {
      if (isNew) return;
      const normalized = backImageUrl.trim();
      const res = await axios.patch(`${API_BASE_URL}/decks/${id}/cards/${deckCardId}`, {
          back_image_url: normalized.length > 0 ? normalized : null
      });
      setDeck((prev: any) => {
          const nextCards = (prev.cards || []).map((c: any) => (c.id === deckCardId ? res.data : c));
          return { ...prev, cards: nextCards };
      });
  };

  const mainboard = deck.cards?.filter((c: any) => c.board === 'main') || [];
  const sideboard = deck.cards?.filter((c: any) => c.board === 'side') || [];
  const commander = deck.cards?.filter((c: any) => c.board === 'commander') || [];
  const hoveredCard = hoveredCardId ? deck.cards?.find((c: any) => c.id === hoveredCardId) : null;
  const selectedCard = selectedCardId ? deck.cards?.find((c: any) => c.id === selectedCardId) : null;
  const activeCard = hoveredCard || selectedCard;

  const activeCustomCardId = activeCard?.is_custom ? activeCard?.custom_card_id : null;
  const activeCustomCard = activeCustomCardId ? customCardById[activeCustomCardId] : null;

  useEffect(() => {
    if (!activeCustomCardId) return;
    if (customCardById[activeCustomCardId]) return;
    axios
      .get(`${API_BASE_URL}/custom-cards/${activeCustomCardId}`)
      .then((res) => {
        setCustomCardById((prev) => ({ ...prev, [activeCustomCardId]: res.data }));
      })
      .catch(() => {});
  }, [activeCustomCardId, customCardById]);

  const activeCustomDraft = useMemo((): CardDraft | null => {
    if (!activeCustomCard) return null;
    if (activeCustomCard.source !== 'EDITOR') return null;
    return {
      name: String(activeCustomCard.name || activeCard?.name || ''),
      kind: (activeCustomCard.kind || 'Non-creature') as any,
      typeLine: String(activeCustomCard.type_line || ''),
      rulesText: String(activeCustomCard.rules_text || ''),
      power: activeCustomCard.power ? String(activeCustomCard.power) : '',
      toughness: activeCustomCard.toughness ? String(activeCustomCard.toughness) : '',
      manaCost: {
        generic: Number.isFinite(Number(activeCustomCard.mana_cost_generic)) ? Number(activeCustomCard.mana_cost_generic) : 0,
        symbols: (Array.isArray(activeCustomCard.mana_cost_symbols) ? activeCustomCard.mana_cost_symbols : []) as ManaSymbol[],
      },
      artUrl: String(activeCustomCard.art_url || ''),
      backUrl: String(activeCard?.back_image_url || activeCustomCard.back_image_url || ''),
    } satisfies CardDraft;
  }, [activeCard?.back_image_url, activeCard?.name, activeCustomCard]);

  // Helper component for card buttons (purely visual wrapper)
  const ActionButton = ({ onClick, color, label }: any) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`px-2 py-1 text-[10px] font-bold rounded border uppercase tracking-wider transition-all
        ${color === 'green' 
          ? 'bg-emerald-950 border-emerald-700 text-emerald-400 hover:bg-emerald-900 hover:border-emerald-500' 
          : color === 'purple'
          ? 'bg-indigo-950 border-indigo-700 text-indigo-400 hover:bg-indigo-900 hover:border-indigo-500'
          : 'bg-amber-950 border-amber-700 text-amber-400 hover:bg-amber-900 hover:border-amber-500'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30 flex flex-col md:flex-row relative overflow-hidden">
      
      {/* --- Fondo Ambiental --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
      </div>

      {/* --- Left Column: The Archive (Search) --- */}
      <div className="w-full md:w-1/3 bg-slate-900/80 border-r border-amber-500/20 flex flex-col h-[60vh] md:h-screen relative z-10 backdrop-blur-sm">
        
        {/* Header Search Area */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/95 shadow-lg z-20">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-400 mb-4 transition-colors font-serif text-sm">
            <ArrowLeft size={16} /> Return to Sanctuary
          </Link>
          
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input 
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-serif placeholder-slate-600 shadow-inner" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search the archives..." 
            />
            <button className="absolute right-2 top-2 bg-indigo-900/50 hover:bg-indigo-600 text-indigo-200 px-3 py-1 rounded text-xs font-bold border border-indigo-800 hover:border-indigo-400 transition-all">
              CAST
            </button>
          </form>
        </div>
        
        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-10 text-amber-500/50 animate-pulse gap-2">
              <Sparkles size={16} className="animate-spin" /> Divining results...
            </div>
          )}
          
          {searchResults.map(card => (
            <div key={card.id} className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-lg p-3 transition-all group shadow-sm hover:shadow-md">
              <div className="flex gap-3">
                {/* Card Image Thumbnail */}
                <div className="relative shrink-0">
                  <img 
                    src={card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small} 
                    className="w-12 h-16 object-cover rounded border border-slate-700 shadow-lg bg-slate-900" 
                    alt={card.name}
                  />
                  <div className="absolute inset-0 rounded ring-1 ring-inset ring-white/10"></div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-sm text-slate-200 truncate font-serif group-hover:text-amber-200 transition-colors">{card.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="bg-slate-900 px-1.5 rounded text-[10px] border border-slate-800 text-slate-400 uppercase">{card.set}</span>
                      <span className="truncate">{card.type_line}</span>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-2">
                     <ActionButton onClick={() => addCard(card, 'main')} color="green" label="+ Main" />
                     <ActionButton onClick={() => addCard(card, 'side')} color="purple" label="+ Side" />
                     <ActionButton onClick={() => addCard(card, 'commander')} color="amber" label="+ Cmd" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => fetchVersions(card)}
                className="w-full mt-3 flex items-center justify-between text-[10px] bg-slate-900/50 hover:bg-slate-900 p-1.5 rounded border border-transparent hover:border-slate-700 text-slate-400 hover:text-amber-400 transition-all uppercase tracking-wider"
              >
                <span>{viewingVersionsFor === card.id ? 'Hide Prints' : 'Show Prints / Versions'}</span>
                {viewingVersionsFor === card.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {/* Versions List */}
              {viewingVersionsFor === card.id && (
                <div className="mt-2 pl-3 border-l-2 border-slate-800/50 ml-1 grid grid-cols-2 gap-2">
                  {versions.map(v => (
                    <div key={v.id} className="bg-slate-900/80 p-2 rounded border border-slate-800 hover:border-slate-600 transition-colors group">
                      <div className="relative">
                        <img
                          src={v.image_uris?.normal || v.image_uris?.small || v.card_faces?.[0]?.image_uris?.normal || v.card_faces?.[0]?.image_uris?.small}
                          className="w-full aspect-[63/88] object-cover rounded opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/80 border border-slate-700 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded">
                          #{v.collector_number}
                        </div>
                        <div className="absolute inset-x-2 bottom-2 bg-slate-950/80 border border-slate-700 text-slate-200 text-[10px] font-serif px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {v.set_name}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        <button onClick={() => addCard(v, 'main')} className="w-full px-1.5 py-1 bg-emerald-950/50 hover:bg-emerald-900 text-emerald-500 text-[10px] rounded border border-emerald-900/50 hover:border-emerald-500 transition-colors">+M</button>
                        <button onClick={() => addCard(v, 'side')} className="w-full px-1.5 py-1 bg-indigo-950/50 hover:bg-indigo-900 text-indigo-500 text-[10px] rounded border border-indigo-900/50 hover:border-indigo-500 transition-colors">+S</button>
                        <button onClick={() => addCard(v, 'commander')} className="w-full px-1.5 py-1 bg-amber-950/50 hover:bg-amber-900 text-amber-500 text-[10px] rounded border border-amber-900/50 hover:border-amber-500 transition-colors">+C</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- Right Column: The Grimoire (Deck) --- */}
      <div className="w-full md:w-2/3 flex flex-col h-[40vh] md:h-screen relative z-10">
        
        {/* Deck Header */}
        <div className="p-6 pb-2">
          <div className="flex justify-between items-end border-b border-amber-500/20 pb-4 mb-2">
            <div className="flex-1 mr-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-amber-500/60 font-bold mb-1">Grimoire Title</label>
              <input 
                className="w-full bg-transparent text-3xl font-serif font-bold text-amber-100 placeholder-slate-700 focus:outline-none focus:border-b border-amber-500/50 transition-colors" 
                value={deck.name} 
                onChange={e => setDeck({...deck, name: e.target.value})}
                placeholder="Untitled Spellbook"
              />
            </div>
            {isNew ? (
              <div className="flex gap-3">
                <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-700/50 hover:border-indigo-500 text-indigo-100 px-4 py-2 rounded font-bold transition-all shadow-lg shadow-indigo-900/20">
                    <FileText size={18} /> <span className="font-serif">Import</span>
                </button>
                <button
                  onClick={() => setShowCustomCardsModal(true)}
                  className="flex items-center gap-2 bg-fuchsia-900/60 hover:bg-fuchsia-800 border border-fuchsia-700/40 hover:border-amber-500/40 text-fuchsia-100 px-4 py-2 rounded font-bold transition-all shadow-lg shadow-fuchsia-900/20"
                >
                  <Sparkles size={18} /> <span className="font-serif">Mis cartas</span>
                </button>
                <button onClick={createDeck} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 px-6 py-2 rounded shadow-lg shadow-amber-900/20 font-bold transition-all hover:scale-105 active:scale-95">
                    <ScrollIcon size={18} /> <span className="font-serif">Create</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomCardsModal(true)}
                  className="flex items-center gap-2 bg-fuchsia-900/60 hover:bg-fuchsia-800 border border-fuchsia-700/40 hover:border-amber-500/40 text-fuchsia-100 px-4 py-2 rounded font-bold transition-all shadow-lg shadow-fuchsia-900/20"
                >
                  <Sparkles size={18} /> <span className="font-serif">Mis cartas</span>
                </button>
                <button
                  onClick={saveDeck}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-500 text-slate-200 px-6 py-2 rounded font-bold transition-all"
                >
                  <Save size={18} /> <span className="font-serif">Save</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Deck Lists Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar pb-64">
          
          {/* Commander Section */}
          <div className="mb-6 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
             <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                <h3 className="flex items-center gap-2 font-serif font-bold text-slate-200 text-lg">
                  <Crown size={16} className="text-amber-500" /> Command Zone
                </h3>
                <span className="bg-amber-950 text-amber-400 text-xs px-2 py-1 rounded-full border border-amber-900 font-mono">
                  {commander.reduce((a:number,c:any)=>a+c.qty,0)} cards
                </span>
             </div>
             <div className="space-y-1">
                {commander.map((c: any) => (
                  <div 
                    key={c.id} 
                    className={`group flex justify-between items-center py-2 px-3 rounded hover:bg-slate-800/80 border cursor-pointer transition-all ${selectedCardId === c.id ? 'border-amber-500/60 bg-slate-800/60' : 'border-transparent hover:border-amber-500/20'}`}
                    onMouseEnter={() => setHoveredCardId(c.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => setSelectedCardId(c.id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="font-mono text-amber-500 font-bold text-sm w-6 text-right">{c.qty}</span>
                      <span className="truncate text-slate-300 font-medium group-hover:text-amber-100 transition-colors">{c.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => {e.stopPropagation(); incrementDeckCard(c)}} className="p-1 hover:bg-amber-900/50 rounded text-amber-400"><Plus size={14}/></button>
                      <button onClick={(e) => {e.stopPropagation(); const key = getDeckCardKey(c); if (!key) return; removeCard(key, 'commander')}} className="p-1 hover:bg-red-900/50 rounded text-red-400"><Minus size={14}/></button>
                    </div>
                  </div>
                ))}
                {commander.length === 0 && <p className="text-slate-600 text-sm italic text-center py-4">Choose your Commander</p>}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Mainboard Column */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                <h3 className="flex items-center gap-2 font-serif font-bold text-slate-200 text-lg">
                  <Sword size={16} className="text-emerald-500" /> Mainboard
                </h3>
                <span className="bg-emerald-950 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-900 font-mono">
                  {mainboard.reduce((a:number,c:any)=>a+c.qty,0)} cards
                </span>
              </div>
              
              <div className="space-y-1">
                {mainboard.map((c: any) => (
                  <div 
                    key={c.id} 
                    className={`group flex justify-between items-center py-2 px-3 rounded hover:bg-slate-800/80 border cursor-pointer transition-all ${selectedCardId === c.id ? 'border-emerald-500/60 bg-slate-800/60' : 'border-transparent hover:border-emerald-500/20'}`}
                    onMouseEnter={() => setHoveredCardId(c.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => setSelectedCardId(c.id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="font-mono text-emerald-500 font-bold text-sm w-6 text-right">{c.qty}</span>
                      <span className="truncate text-slate-300 font-medium group-hover:text-emerald-100 transition-colors">{c.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => {e.stopPropagation(); incrementDeckCard(c)}} className="p-1 hover:bg-emerald-900/50 rounded text-emerald-400"><Plus size={14}/></button>
                      <button onClick={(e) => {e.stopPropagation(); const key = getDeckCardKey(c); if (!key) return; removeCard(key, 'main')}} className="p-1 hover:bg-red-900/50 rounded text-red-400"><Minus size={14}/></button>
                    </div>
                  </div>
                ))}
                {mainboard.length === 0 && <p className="text-slate-600 text-sm italic text-center py-10">No spells inscribed yet.</p>}
              </div>
            </div>

            {/* Sideboard Column */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                <h3 className="flex items-center gap-2 font-serif font-bold text-slate-200 text-lg">
                  <Shield size={16} className="text-indigo-500" /> Sideboard
                </h3>
                <span className="bg-indigo-950 text-indigo-400 text-xs px-2 py-1 rounded-full border border-indigo-900 font-mono">
                  {sideboard.reduce((a:number,c:any)=>a+c.qty,0)} cards
                </span>
              </div>

              <div className="space-y-1">
                {sideboard.map((c: any) => (
                  <div 
                    key={c.id} 
                    className={`group flex justify-between items-center py-2 px-3 rounded hover:bg-slate-800/80 border cursor-pointer transition-all ${selectedCardId === c.id ? 'border-indigo-500/60 bg-slate-800/60' : 'border-transparent hover:border-indigo-500/20'}`}
                    onMouseEnter={() => setHoveredCardId(c.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => setSelectedCardId(c.id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="font-mono text-indigo-500 font-bold text-sm w-6 text-right">{c.qty}</span>
                      <span className="truncate text-slate-300 font-medium group-hover:text-indigo-100 transition-colors">{c.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => {e.stopPropagation(); incrementDeckCard(c)}} className="p-1 hover:bg-indigo-900/50 rounded text-indigo-400"><Plus size={14}/></button>
                      <button onClick={(e) => {e.stopPropagation(); const key = getDeckCardKey(c); if (!key) return; removeCard(key, 'side')}} className="p-1 hover:bg-red-900/50 rounded text-red-400"><Minus size={14}/></button>
                    </div>
                  </div>
                ))}
                 {sideboard.length === 0 && <p className="text-slate-600 text-sm italic text-center py-10">Empty reserves.</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Fixed Bottom Preview Area (The Scrying Orb) */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-slate-950/95 border-t border-amber-500/30 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-30 flex flex-col md:flex-row items-center justify-center p-4 gap-8">
           {/* Decorative Background Glow */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
           
           {activeCard ? (
                <div className="flex gap-8 items-center h-full max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="relative h-full py-2 shrink-0">
                      {/* Magical Glow behind card */}
                      <div className="absolute inset-2 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                      
                      {activeCard.is_custom ? (
                        activeCustomDraft ? (
                          <div className="relative h-full py-1 z-10 transform hover:scale-105 transition-transform duration-300">
                            <PersonalizedCard card={activeCustomDraft} className="h-full w-auto aspect-[2.5/3.5] shadow-2xl" />
                          </div>
                        ) : activeCustomCard?.source === 'URLS' && typeof activeCustomCard.front_image_url === 'string' ? (
                          <img
                            src={activeCustomCard.front_image_url}
                            className="relative h-full rounded-xl border border-slate-700 shadow-2xl object-contain z-10 transform hover:scale-105 transition-transform duration-300"
                            alt={activeCard.name}
                          />
                        ) : typeof activeCard.image_url_small === 'string' ? (
                          <img
                            src={activeCard.image_url_small.replace('small', 'normal')}
                            className="relative h-full rounded-xl border border-slate-700 shadow-2xl object-contain z-10 transform hover:scale-105 transition-transform duration-300"
                            alt={activeCard.name}
                          />
                        ) : (
                          <div className="relative h-full w-[170px] bg-slate-900 border border-slate-700 flex flex-col items-center justify-center rounded-xl z-10">
                            <Layers size={32} className="text-slate-700 mb-2" />
                            <span className="text-slate-500 text-xs font-serif">No Image Manifested</span>
                          </div>
                        )
                      ) : typeof activeCard.image_url_small === 'string' ? (
                          <img 
                              src={activeCard.image_url_small.replace('small', 'normal')} 
                              className="relative h-full rounded-xl border border-slate-700 shadow-2xl object-contain z-10 transform hover:scale-105 transition-transform duration-300" 
                              alt={activeCard.name} 
                          />
                      ) : (
                          <div className="relative h-full w-[170px] bg-slate-900 border border-slate-700 flex flex-col items-center justify-center rounded-xl z-10">
                              <Layers size={32} className="text-slate-700 mb-2" />
                              <span className="text-slate-500 text-xs font-serif">No Image Manifested</span>
                          </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-center h-full py-4 overflow-y-auto">
                        <div className="mb-2">
                           <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-500">{activeCard.name}</h2>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-indigo-300 font-medium">{activeCard.type_line}</span>
                              {activeCard.mana_cost && (
                                <span className="bg-slate-900 px-2 py-0.5 rounded text-xs font-mono text-slate-300 border border-slate-700">{activeCard.mana_cost}</span>
                              )}
                           </div>
                        </div>
                        
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-800 text-sm text-slate-300 leading-relaxed font-serif mb-2">
                           <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                             Imagen de reverso (opcional)
                           </div>
                           <input
                             className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
                             placeholder="Pega aquí una URL de imagen..."
                             value={selectedCard?.id === activeCard.id ? (selectedCard.back_image_url || '') : (activeCard.back_image_url || '')}
                             onChange={(e) => {
                               if (!selectedCard || selectedCard.id !== activeCard.id) return;
                               const nextUrl = e.target.value;
                               setDeck((prev: any) => {
                                   const nextCards = (prev.cards || []).map((c: any) => (c.id === selectedCard.id ? { ...c, back_image_url: nextUrl } : c));
                                   return { ...prev, cards: nextCards };
                               });
                             }}
                             onBlur={() => {
                               if (!selectedCard || selectedCard.id !== activeCard.id) return;
                               updateBackImageUrl(selectedCard.id, selectedCard.back_image_url || '');
                             }}
                             disabled={!selectedCard || selectedCard.id !== activeCard.id}
                           />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto">
                           <span className="flex items-center gap-1"><Layers size={12}/> Set: <span className="text-slate-300">{activeCard.set_name?.toUpperCase()}</span></span>
                           <span className="flex items-center gap-1">Artist: <span className="text-slate-300">Unknown</span></span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 gap-3 opacity-50">
                   <Eye size={48} strokeWidth={1} />
                   <p className="font-serif italic text-lg tracking-wide">Hover over a spell to reveal its secrets...</p>
                </div>
            )}
        </div>
      </div>
      <ImportDeckModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onImported={(newDeck: any) => {
          setDeck(newDeck);
          navigate(`/decks/${newDeck.id}`);
        }}
      />
      <CustomCardsModal 
        isOpen={showCustomCardsModal} 
        onClose={() => setShowCustomCardsModal(false)} 
        onAddCard={addCustomCard}
      />
    </div>
  );
}
