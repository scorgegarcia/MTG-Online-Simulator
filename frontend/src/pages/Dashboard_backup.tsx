import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [gameCode, setGameCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/decks`).then(res => setDecks(res.data));
  }, []);

  const createGame = async () => {
    try {
        const res = await axios.post(`${API_BASE_URL}/games`);
        navigate(`/game/${res.data.id}`);
    } catch(e) { alert('Error creating game'); }
  };

  const joinGame = async () => {
    try {
        const res = await axios.post(`${API_BASE_URL}/games/join`, { code: gameCode });
        navigate(`/game/${res.data.gameId}`);
    } catch(e) { alert('Error joining game'); }
  };

  const deleteDeck = async (id: string) => {
      if(!confirm('Delete deck?')) return;
      await axios.delete(`${API_BASE_URL}/decks/${id}`);
      setDecks(decks.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Game Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Play</h2>
            <button onClick={createGame} className="w-full bg-blue-600 py-3 rounded mb-4 font-bold text-lg">
              Host New Game
            </button>
            <div className="flex gap-2">
              <input 
                value={gameCode}
                onChange={e => setGameCode(e.target.value.toUpperCase())}
                placeholder="GAME CODE"
                className="flex-1 bg-gray-700 p-2 rounded uppercase text-center font-mono"
              />
              <button onClick={joinGame} className="bg-green-600 px-6 rounded font-bold">Join</button>
            </div>
          </div>

          {/* Decks Section */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Decks</h2>
              <Link to="/decks/new" className="bg-purple-600 px-3 py-1 rounded text-sm">+ New Deck</Link>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {decks.map(deck => (
                <div key={deck.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <Link to={`/decks/${deck.id}`} className="hover:text-blue-300 font-medium truncate flex-1">
                    {deck.name}
                  </Link>
                  <button onClick={() => deleteDeck(deck.id)} className="text-red-400 hover:text-red-300 ml-2">x</button>
                </div>
              ))}
              {decks.length === 0 && <p className="text-gray-500">No decks yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
