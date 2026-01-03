import React from 'react';
import { X, Calendar, User as UserIcon, Shield, Zap } from 'lucide-react';
import MagicParticles from './cardBuilder/MagicParticles';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: {
        username: string;
        avatar_url?: string | null;
        id?: string;
        seat?: number;
    } | null;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, player }) => {
    if (!isOpen || !player) return null;

    // Format joined date - similar to Profile.tsx (hardcoded for now as per instructions/current state)
    // In a real app, this would come from player.created_at
    const joinedDate = "Dec 2025"; 

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-square overflow-hidden rounded-3xl border-2 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] animate-in zoom-in-95 fade-in duration-500 group">
                
                {/* Background with Creative Colors & Particles */}
                <div className="absolute inset-0 z-0">
                    {/* Base Background */}
                    <div className="absolute inset-0 bg-slate-950" />
                    
                    {/* Profile Image as blurred dynamic background */}
                    {player.avatar_url && (
                        <div 
                            className="absolute inset-[-20px] bg-cover bg-center blur-[60px] opacity-50 animate-pulse"
                            style={{ backgroundImage: `url(${player.avatar_url})`, animationDuration: '8s' }}
                        />
                    )}

                    {/* Overlays for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-transparent to-slate-950/80" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.1),transparent_70%)]" />
                    
                    {/* Moving Particles */}
                    <MagicParticles count={50} className="opacity-40" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col p-8">
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2.5 bg-black/20 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-all transform hover:rotate-90 active:scale-90 z-30 backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>

                    {/* Header/Badges */}
                    <div className="flex justify-start items-start mb-8">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/70 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                            <Shield size={12} />
                            <span>Planeswalker</span>
                        </div>
                    </div>

                    {/* Profile Image - Prominent */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                        <div className="relative group/avatar">
                            {/* Avatar Glow Ring - Dynamic Color based on background (simulated by blur) */}
                            <div className="absolute inset-[-12px] bg-white/10 rounded-full blur-xl opacity-50 group-hover/avatar:opacity-80 transition-opacity" />
                            <div className="absolute inset-[-2px] bg-slate-950 rounded-full z-0" />
                            
                            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-white/20 z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                                {player.avatar_url ? (
                                    <img 
                                        src={player.avatar_url} 
                                        alt={player.username} 
                                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover/avatar:scale-110" 
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700">
                                        <UserIcon size={80} />
                                    </div>
                                )}
                            </div>

                            {/* Floating decorative element */}
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white/80 backdrop-blur-md animate-bounce shadow-lg z-20" style={{ animationDuration: '4s' }}>
                                <Zap size={24} />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="text-center space-y-4">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                    {player.username}
                                </h2>
                                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-4" />
                            </div>

                            <div className="flex items-center justify-center">
                                <div className="flex items-center gap-2 text-white/60 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                                    <Calendar size={16} className="text-white/40" />
                                    <span className="text-xs font-medium uppercase tracking-widest">Joined {joinedDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional CSS for animations */}
                <style>{`
                    @keyframes profile-fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes profile-zoom-in {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    .animate-in.fade-in {
                        animation: profile-fade-in 0.3s ease-out forwards;
                    }
                    .animate-in.zoom-in-95 {
                        animation: profile-zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};
