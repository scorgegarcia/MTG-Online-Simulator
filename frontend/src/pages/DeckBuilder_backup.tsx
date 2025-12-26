import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
  const [hoveredCard, setHoveredCard] = useState<any>(null);

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

  const removeCard = async (scryfall_id: string, board?: 'main' | 'side') => {
      const qs = board ? `?board=${board}` : '';
      await axios.delete(`${API_BASE_URL}/decks/${id}/cards/${scryfall_id}${qs}`);
      const res = await axios.get(`${API_BASE_URL}/decks/${id}`);
      setDeck(res.data);
  };

  const mainboard = deck.cards?.filter((c: any) => c.board === 'main') || [];
  const sideboard = deck.cards?.filter((c: any) => c.board === 'side') || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col md:flex-row gap-4">
      {/* Left: Search */}
      <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded flex flex-col h-[90vh]">
        <Link to="/" className="text-gray-400 mb-2">← Back</Link>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input 
                className="flex-1 bg-gray-700 p-2 rounded" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search card..." 
            />
            <button className="bg-blue-600 px-4 rounded">Go</button>
        </form>
        
        <div className="flex-1 overflow-y-auto space-y-2">
            {loading && <p>Loading...</p>}
            
            {/* Main Search Results */}
            {searchResults.map(card => (
                <div key={card.id} className="bg-gray-700 p-2 rounded flex flex-col gap-2">
                    <div className="flex gap-2">
                        <img src={card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small} className="w-12 h-16 object-cover bg-black" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{card.name}</p>
                            <p className="text-xs text-gray-400">{card.set_name} ({card.set.toUpperCase()})</p>
                            <p className="text-xs text-gray-400">{card.type_line}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => addCard(card, 'main')} className="bg-green-700 px-2 text-xs rounded">+M</button>
                            <button onClick={() => addCard(card, 'side')} className="bg-purple-700 px-2 text-xs rounded">+S</button>
                        </div>
                    </div>
                    <button 
                        onClick={() => fetchVersions(card)}
                        className="text-xs text-blue-300 hover:text-blue-200 text-left"
                    >
                        {viewingVersionsFor === card.id ? 'Hide Versions' : 'Show Versions / Prints'}
                    </button>

                    {/* Versions List */}
                    {viewingVersionsFor === card.id && (
                        <div className="pl-4 mt-2 space-y-2 border-l-2 border-gray-600">
                            {versions.map(v => (
                                <div key={v.id} className="flex gap-2 bg-gray-600 p-1 rounded">
                                    <img src={v.image_uris?.small || v.card_faces?.[0]?.image_uris?.small} className="w-8 h-12 object-cover" />
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-xs truncate">{v.set_name}</p>
                                        <p className="text-[10px] text-gray-300">#{v.collector_number}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <button onClick={() => addCard(v, 'main')} className="bg-green-600 px-1 text-[10px] rounded">+M</button>
                                        <button onClick={() => addCard(v, 'side')} className="bg-purple-600 px-1 text-[10px] rounded">+S</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Right: Deck */}
      <div className="w-full md:w-2/3 bg-gray-800 p-4 rounded flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-4">
            <input 
                className="bg-transparent text-2xl font-bold border-b border-gray-600 focus:outline-none w-1/2" 
                value={deck.name} 
                onChange={e => setDeck({...deck, name: e.target.value})}
            />
            {isNew ? (
                <button onClick={createDeck} className="bg-blue-600 px-6 py-2 rounded font-bold">Create Deck</button>
            ) : (
                <button onClick={saveDeck} className="bg-green-600 px-6 py-2 rounded font-bold">Save Name</button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold border-b border-gray-600 mb-2">Mainboard ({mainboard.reduce((a:number,c:any)=>a+c.qty,0)})</h3>
                    {mainboard.map((c: any) => (
                        <div 
                            key={c.id} 
                            className="flex justify-between items-center py-1 hover:bg-gray-700 px-2 rounded cursor-pointer"
                            onMouseEnter={() => setHoveredCard(c)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="truncate">{c.qty}x {c.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => addCard({id: c.scryfall_id}, 'main')} className="text-green-400">+</button>
                                <button onClick={() => removeCard(c.scryfall_id, 'main')} className="text-red-400">-</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <h3 className="font-bold border-b border-gray-600 mb-2">Sideboard ({sideboard.reduce((a:number,c:any)=>a+c.qty,0)})</h3>
                    {sideboard.map((c: any) => (
                        <div 
                            key={c.id} 
                            className="flex justify-between items-center py-1 hover:bg-gray-700 px-2 rounded cursor-pointer"
                            onMouseEnter={() => setHoveredCard(c)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="truncate">{c.qty}x {c.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => addCard({id: c.scryfall_id}, 'side')} className="text-green-400">+</button>
                                <button onClick={() => removeCard(c.scryfall_id, 'side')} className="text-red-400">-</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Fixed Bottom Preview Area */}
        <div className="h-64 border-t border-gray-600 pt-4 flex items-center justify-center bg-gray-900 rounded shrink-0">
            {hoveredCard ? (
                <div className="flex gap-6 items-center h-full p-2">
                    {typeof hoveredCard.image_url_small === 'string' ? (
                        <img 
                            src={hoveredCard.image_url_small.replace('small', 'normal')} 
                            className="h-full rounded object-contain" 
                            alt={hoveredCard.name} 
                        />
                    ) : (
                        <div className="h-full w-48 bg-gray-800 flex items-center justify-center rounded">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                    <div className="flex flex-col justify-center">
                        <p className="font-bold text-xl">{hoveredCard.name}</p>
                        <p className="text-gray-400">{hoveredCard.type_line}</p>
                        {hoveredCard.mana_cost && <p className="text-gray-300 font-mono mt-1">{hoveredCard.mana_cost}</p>}
                        <p className="text-xs text-gray-500 mt-2">Set: {hoveredCard.set_name?.toUpperCase()}</p>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 italic text-lg">Hover over a card to see preview</p>
            )}
        </div>
      </div>
    </div>
  );
}
