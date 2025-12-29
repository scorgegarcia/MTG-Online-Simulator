import { useCallback, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Scroll, Sword, Shield, Lock, Mail, Gem, Volume2, VolumeX } from 'lucide-react';
import naslocApproved from '../assets/img/nasloc_approved_200x200.png';
import naslocMotd from '../assets/img/nasloc_motd.jpg';

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || '/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [entered, setEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [naslocImgError, setNaslocImgError] = useState(false);
  const [isNaslocMotdOpen, setIsNaslocMotdOpen] = useState(false);
  const bgPlayerRef = useRef<HTMLIFrameElement | null>(null);
  
  // Estado visual adicional para la interfaz mágica
  const [isLoading, setIsLoading] = useState(false);

  const youtubeVideoId = 'HzExBlzHUMs';
  const youtubeEmbedSrc = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=0&disablekb=1&fs=0&loop=1&playlist=${youtubeVideoId}&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&mute=0`;

  const setYoutubeMuted = useCallback((muted: boolean) => {
    const iframe = bgPlayerRef.current;
    if (!iframe?.contentWindow) return;

    const func = muted ? 'mute' : 'unMute';
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*'
    );
  }, []);

  const toggleMuted = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      setYoutubeMuted(next);
      return next;
    });
  }, [setYoutubeMuted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulación de tiempo de espera para apreciar la animación de carga mágica
      await new Promise(resolve => setTimeout(resolve, 1500));

      // --- TU LÓGICA ORIGINAL ---
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      login(res.data.accessToken, res.data.user);
      navigate('/');
      // --------------------------

    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center font-sans selection:bg-amber-500/30">
      {entered && (
        <iframe
          className="absolute w-px h-px opacity-0 pointer-events-none"
          src={youtubeEmbedSrc}
          title="background-music"
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          ref={bgPlayerRef}
          onLoad={() => setYoutubeMuted(isMuted)}
        />
      )}

      {entered && (
        <button
          onClick={toggleMuted}
          className="fixed top-4 right-4 z-40 p-2.5 bg-slate-900/70 border border-slate-700 rounded-full text-slate-200 hover:text-amber-200 hover:border-amber-500/50 hover:bg-slate-900 transition-colors shadow-lg backdrop-blur"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}

      {isNaslocMotdOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setIsNaslocMotdOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] bg-slate-950 border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-amber-200 hover:border-amber-500/50 hover:bg-slate-900 transition-colors"
              onClick={() => setIsNaslocMotdOpen(false)}
            >
              Cerrar
            </button>
            <img src={naslocMotd} alt="Nasloc MOTD" className="block w-full h-auto max-h-[90vh] object-contain" />
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-opacity duration-700 ${entered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-95"></div>
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[110px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-600/10 rounded-full blur-[90px]"></div>

        <div className="relative z-10 text-center px-6">
          <div className="flex justify-center mb-6 text-amber-500">
            <Gem size={56} strokeWidth={1.5} className="drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 tracking-wider drop-shadow-lg mb-6">
            MAGIC SANDBOX
          </h1>
          <button
            onClick={() => {
              setEntered(true);
            }}
            className="group relative px-14 py-6 bg-indigo-950 overflow-hidden rounded-xl shadow-2xl border-2 border-indigo-800 hover:border-amber-400 transition-all active:scale-[0.98] duration-300"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out"></div>
            <span className="relative flex items-center justify-center gap-3 text-indigo-100 font-serif font-extrabold tracking-[0.35em] text-xl md:text-2xl group-hover:text-amber-100 transition-colors">
              ENTER
            </span>
          </button>
        </div>
      </div>
      
      {/* --- Fondo Ambiental (Nebulosa y Partículas) --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-90"></div>
        {/* Patrón de polvo estelar */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        {/* Luces Mágicas */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px]"></div>
      </div>

      {/* --- Contenedor Principal (El Grimorio/Carta) --- */}
      <div className="relative z-10 w-full max-w-md p-4">
        
        {/* Aura Brillante Exterior */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 rounded-xl blur-[2px] opacity-70"></div>
        
        <div className="relative">
          {!naslocImgError && (
            <button
              type="button"
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 z-40 w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] md:w-[200px] md:h-[200px]"
              onClick={() => setIsNaslocMotdOpen(true)}
              aria-label="Abrir Nasloc MOTD"
            >
              <img
                src={naslocApproved}
                alt="Nasloc Approved"
                className="w-full h-full object-contain"
                onError={() => setNaslocImgError(true)}
              />
            </button>
          )}

          <div className="relative bg-slate-900 border-2 border-amber-600/50 rounded-lg shadow-2xl overflow-hidden">
            {/* Textura de cuero oscuro */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>

            {/* Decoraciones de esquinas (Estilo Libro de Hechizos) */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg"></div>

            <div className="relative p-8 px-10">
            {/* Cabecera Mística */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4 text-amber-500">
                <Gem size={48} strokeWidth={1.5} className="drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              </div>
              <h1 className="text-4xl font-serif font-bold text-amber-100 tracking-wider drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-b from-amber-100 to-amber-600">
                MAGIC SANDBOX
              </h1>
              <p className="text-slate-400 text-sm mt-2 font-serif italic">Enter the gathering realm.</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Mensaje de Error Estilizado */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-200 text-sm p-3 rounded flex items-center gap-2 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                  <Shield size={16} className="text-red-500 min-w-[16px]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Input Email */}
              <div className="group">
                <label className="block text-amber-500/80 text-xs font-bold uppercase tracking-widest mb-1 ml-1 font-serif">
                  Archive Identity (Email)
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors duration-300" />
                  </div>
                  <input
                    className="w-full bg-slate-950/80 text-slate-200 pl-10 pr-4 py-3 rounded border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-300 placeholder-slate-600 font-serif shadow-inner"
                    type="email"
                    placeholder="mage@guild.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="group">
                <label className="block text-amber-500/80 text-xs font-bold uppercase tracking-widest mb-1 ml-1 font-serif">
                  Secret Rune (Password)
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-amber-400 transition-colors duration-300" />
                  </div>
                  <input
                    className="w-full bg-slate-950/80 text-slate-200 pl-10 pr-4 py-3 rounded border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-300 placeholder-slate-600 font-serif shadow-inner"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Botón de Acción Épica */}
              <button 
                disabled={isLoading}
                className="w-full group relative px-4 py-3 bg-indigo-950 overflow-hidden rounded shadow-lg border border-indigo-800 hover:border-amber-400 transition-all active:scale-[0.98] duration-300"
              >
                {/* Brillo de fondo al hacer hover */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Línea de poder inferior */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out"></div>
                
                <span className="relative flex items-center justify-center gap-2 text-indigo-200 font-serif font-bold tracking-[0.2em] group-hover:text-amber-100 transition-colors">
                  {isLoading ? (
                    <>
                      <Sparkles className="animate-spin h-5 w-5 text-amber-400" /> 
                      <span className="animate-pulse">CASTING SPELL...</span>
                    </>
                  ) : (
                    <>
                      <Sword className="h-5 w-5 rotate-90" /> OPEN GATE
                    </>
                  )}
                </span>
              </button>

              {/* Enlaces del Pie */}
              <div className="mt-8 text-center space-y-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
                <div className="pt-1">
                  <Link to="/register" className="text-slate-400 text-sm hover:text-amber-400 transition-colors flex items-center justify-center gap-2 group">
                    <Scroll size={14} className="group-hover:text-amber-400 transition-colors" />
                    <span className="group-hover:underline decoration-amber-500/50 underline-offset-4 decoration-1 font-serif tracking-wide">
                      Inscribe new account
                    </span>
                  </Link>
                </div>
              </div>

            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
