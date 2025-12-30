import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileText, X } from 'lucide-react';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportDeckModal: React.FC<ImportDeckModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'arena' | 'flat'>('flat');
  const [showNameModal, setShowNameModal] = useState(false);
  const [importName, setImportName] = useState('');
  const [parsedCards, setParsedCards] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  const parseImportText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let currentSection = '';
    let deckName = 'Imported Deck';
    const cards: any[] = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith('about')) {
        currentSection = 'about';
        continue;
      }
      if (line.toLowerCase().startsWith('commander')) {
        currentSection = 'commander';
        continue;
      }
      if (line.toLowerCase().startsWith('deck')) {
        currentSection = 'main';
        continue;
      }
      if (line.toLowerCase().startsWith('sideboard')) {
        currentSection = 'side';
        continue;
      }

      if (currentSection === 'about') {
        if (line.toLowerCase().startsWith('name ')) {
          deckName = line.substring(5).trim();
        }
      } else if (['commander', 'main', 'side'].includes(currentSection)) {
        const match = line.match(/^(\d+)\s+(.+)$/);
        if (match) {
          cards.push({
            qty: parseInt(match[1]),
            name: match[2].trim(),
            board: currentSection
          });
        }
      }
    }
    return { name: deckName, cards };
  };

  const parseFlatImportText = (text: string) => {
    const normalized = text.replace(/\r\n/g, '\n');
    const blocks = normalized.split(/\n\s*\n/).filter(b => b.trim());
    
    let mainCards: any[] = [];
    let commanderCards: any[] = [];
    let sideCards: any[] = [];
    
    const parseLines = (lines: string[], board: string) => {
         return lines.map(l => l.trim()).filter(l => l).map(line => {
            const match = line.match(/^(\d+)\s+(.+)$/);
            if (match) {
                return {
                    qty: parseInt(match[1]),
                    name: match[2].trim(),
                    board
                };
            }
            return null;
        }).filter(c => c);
    };

    blocks.forEach((block, index) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) return;

        const firstLineLower = lines[0].toLowerCase();

        if (firstLineLower.startsWith('sideboard')) {
             const contentLines = lines.filter(l => !l.toLowerCase().startsWith('sideboard'));
             sideCards = [...sideCards, ...parseLines(contentLines, 'side')];
        } 
        else if (index === blocks.length - 1 && blocks.length > 1) {
            commanderCards = [...commanderCards, ...parseLines(lines, 'commander')];
        } 
        else {
            mainCards = [...mainCards, ...parseLines(lines, 'main')];
        }
    });

    return { name: '', cards: [...mainCards, ...sideCards, ...commanderCards] };
  };

  const handleProcessImport = () => {
      let result;
      if (importMode === 'arena') {
          result = parseImportText(importText);
      } else {
          result = parseFlatImportText(importText);
      }
      
      const { name, cards } = result;
      setImportName(name);
      setParsedCards(cards);
      setShowNameModal(true);
  };

  const handleConfirmImport = async () => {
      if (!importName) return;
      setImporting(true);
      try {
          const res = await axios.post(`${API_BASE_URL}/decks/import`, {
              name: importName,
              cards: parsedCards
          });
          navigate(`/decks/${res.data.id}`);
          setShowNameModal(false);
          setImportText('');
          setParsedCards([]);
          onClose();
      } catch (e) {
          alert('Error importing deck');
      } finally {
          setImporting(false);
      }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* --- Import Modal --- */}
      {!showNameModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl">
              <h3 className="font-serif text-xl font-bold text-slate-200 flex items-center gap-2">
                <FileText className="text-amber-500"/> Import Deck
              </h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <div className="flex gap-4 mb-4 border-b border-slate-800">
                <button 
                  onClick={() => setImportMode('arena')}
                  className={`pb-2 px-1 text-sm font-bold transition-colors border-b-2 ${importMode === 'arena' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Arena Format
                </button>
                <button 
                  onClick={() => setImportMode('flat')}
                  className={`pb-2 px-1 text-sm font-bold transition-colors border-b-2 ${importMode === 'flat' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Flat Text (Commander at end)
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-2">
                {importMode === 'arena' 
                  ? "Paste your deck list below. Supported format: MTG Arena (About/Deck/Sideboard sections)." 
                  : "Paste your deck list below. Format: 'Qty Name'. Separate the last block with a blank line for Commander."}
              </p>
              <textarea 
                className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-amber-500/50 resize-none custom-scrollbar"
                placeholder={importMode === 'arena' 
                  ? `About\nName My Awesome Deck\n\nCommander\n1 Omo, Queen of Vesuva\n\nDeck\n1 Sol Ring\n...`
                  : `1 Urban Evolution\n1 Uro, Titan of Nature's Wrath\n...\n1 Yavimaya, Cradle of Growth\n\n1 Omo, Queen of Vesuva`
                }
                value={importText}
                onChange={e => setImportText(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-xl flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-bold">Cancel</button>
              <button onClick={handleProcessImport} className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-colors">
                Process Import
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- Name Confirmation Modal --- */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-xl">
              <h3 className="font-serif text-xl font-bold text-slate-200">Name your Deck</h3>
              <button onClick={() => setShowNameModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
                <label className="block text-sm text-slate-400 mb-2">Deck Name</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  value={importName}
                  onChange={e => setImportName(e.target.value)}
                  autoFocus
                />
                <div className="mt-4 p-3 bg-slate-950/50 rounded border border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Summary</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                        <span>Cards found:</span> <span className="text-right font-mono">{parsedCards.reduce((a,c)=>a+c.qty,0)}</span>
                        <span>Unique:</span> <span className="text-right font-mono">{parsedCards.length}</span>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-xl flex justify-end gap-3">
              <button onClick={() => setShowNameModal(false)} className="px-4 py-2 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-bold">Cancel</button>
              <button 
                onClick={handleConfirmImport} 
                disabled={importing}
                className="px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Save & Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportDeckModal;
