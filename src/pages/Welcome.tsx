import React, { useState } from 'react';
import { VeltronLogo } from '../components/VeltronLogo';
import { AuthDialog } from '../components/AuthDialog';

export const Welcome: React.FC = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0C0B] text-white relative font-sans select-none overflow-hidden flex flex-col justify-between">
      {/* Gradientes fluidos en movimiento continuo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Orbe 1: Tactical Olive Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#8E8C3A]/20 rounded-full blur-[130px] animate-orb-1" />
        
        {/* Orbe 2: Golden Sunset Warmth */}
        <div className="absolute top-1/4 -right-10 w-[380px] h-[380px] bg-[#E09F3E]/15 rounded-full blur-[110px] animate-orb-2" />
        
        {/* Orbe 3: Bright Olive Dynamic Pulse */}
        <div className="absolute -bottom-10 -left-10 w-[420px] h-[420px] bg-[#B5B04E]/15 rounded-full blur-[120px] animate-orb-3" />
      </div>

      {/* Contenedor de contenido central mobile-first con soporte safe-area */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between px-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] relative z-10">
        {/* Top spacing */}
        <div className="pt-4" />

        {/* Main Protagonist: Centered Veltron Logo */}
        <main className="my-auto flex flex-col items-center justify-center text-center px-4">
          <VeltronLogo size="lg" animated className="cursor-pointer active:scale-95 transition-transform" />
        </main>

        {/* Action Buttons (CTAs) */}
        <footer className="pt-2 pb-4 space-y-3 w-full">
          {/* Iniciar Sesión */}
          <button
            onClick={() => openAuth('login')}
            className="w-full py-3.5 px-6 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-[0.06em] rounded-xl flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(142,140,58,0.25)] leading-none"
          >
            <span>INICIAR SESIÓN</span>
          </button>

          {/* Registrarse */}
          <button
            onClick={() => openAuth('signup')}
            className="w-full py-3.5 px-6 bg-[#121514] hover:bg-zinc-900 border border-zinc-800 hover:border-[#8E8C3A]/50 text-zinc-100 hover:text-white font-bebas text-lg tracking-[0.06em] rounded-xl flex items-center justify-center transition-all active:scale-[0.98] leading-none"
          >
            <span>REGISTRARSE</span>
          </button>

          {/* Footer info */}
          <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest pt-2 font-semibold font-barlow">
            Veltron Training Club • PWA Standalone Ready
          </p>
        </footer>
      </div>

      {/* Auth Dialog Modal */}
      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
