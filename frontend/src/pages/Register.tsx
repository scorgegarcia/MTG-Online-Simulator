import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  Scroll, 
  Feather, 
  Shield, 
  Lock, 
  Mail, 
  Gem, 
  User 
} from 'lucide-react';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // Estado visual para animación de carga
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { email, username, password });
      navigate('/login');
    } catch (err) {
      setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center font-sans selection:bg-emerald-500/30">
      
      {/* --- Fondo Ambiental --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        {/* Orbes de luz ajustados a tonos verdes/azules para registro */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
      </div>

      {/* --- Contenedor Principal --- */}
      <div className="relative z-10 w-full max-w-md p-4">
        
        {/* Borde Brillante Exterior (Tono Esmeralda para Creación) */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800 rounded-xl blur-[2px] opacity-60"></div>
        
        <div className="relative bg-slate-900 border-2 border-emerald-600/40 rounded-lg shadow-2xl overflow-hidden">
          
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>

          {/* Decoraciones de esquinas */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-emerald-500/30 rounded-br-lg"></div>

          <div className="relative p-8 px-10">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4 text-emerald-500">
                <Gem size={48} strokeWidth={1.5} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-emerald-100 tracking-wider drop-shadow-lg">
                MAGIC SANDBOX
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-serif italic">Join the Covenant</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Box */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-200 text-sm p-3 rounded flex items-center gap-2 animate-pulse">
                  <Shield size={16} className="text-red-500 min-w-[16px]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="group">
                <label className="block text-emerald-500/80 text-xs font-bold uppercase tracking-widest mb-1 ml-1 font-serif">True Address (Email)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    className="w-full bg-slate-950/50 text-slate-200 pl-10 pr-4 py-3 rounded border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder-slate-600 font-serif"
                    type="email"
                    placeholder="apprentice@guild.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="group">
                <label className="block text-emerald-500/80 text-xs font-bold uppercase tracking-widest mb-1 ml-1 font-serif">Mage Title (Username)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    className="w-full bg-slate-950/50 text-slate-200 pl-10 pr-4 py-3 rounded border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder-slate-600 font-serif"
                    type="text"
                    placeholder="Merlin the Wise"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-emerald-500/80 text-xs font-bold uppercase tracking-widest mb-1 ml-1 font-serif">Protective Rune (Password)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    className="w-full bg-slate-950/50 text-slate-200 pl-10 pr-4 py-3 rounded border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder-slate-600 font-serif"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                disabled={isLoading}
                className="w-full group relative px-4 py-3 bg-emerald-950 overflow-hidden rounded shadow-lg border border-emerald-800 hover:border-emerald-400 transition-all active:scale-[0.98] mt-2"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-900 to-teal-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                
                <span className="relative flex items-center justify-center gap-2 text-emerald-100 font-serif font-bold tracking-widest group-hover:text-white">
                  {isLoading ? (
                    <>
                      <Sparkles className="animate-spin h-5 w-5" /> Inscribing...
                    </>
                  ) : (
                    <>
                      <Feather className="h-5 w-5" /> INSCRIBE NAME
                    </>
                  )}
                </span>
              </button>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                <div className="pt-2">
                  <Link to="/login" className="text-slate-400 text-sm hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 group">
                    <Scroll size={14} />
                    <span className="group-hover:underline decoration-emerald-500/50 underline-offset-4">Return to Gate (Login)</span>
                  </Link>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}