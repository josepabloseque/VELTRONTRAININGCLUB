import React, { useState, useEffect } from 'react';
import { VeltronLogo } from '../components/VeltronLogo';
import { AuthDialog } from '../components/AuthDialog';
import { InstallScreen } from '../components/InstallScreen';

export const Welcome: React.FC = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const detectStandalone = () => {
    if (typeof window === 'undefined') return false;

    // 1. iOS Safari WebClip standalone property
    const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isIosStandalone) return true;

    // 2. Android Chrome / Standard PWA media queries
    const isMediaStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches;
    if (isMediaStandalone) return true;

    // 3. Android WebAPK / TWA referrer
    if (document.referrer && (document.referrer.startsWith('android-app://') || document.referrer.includes('android-app://'))) {
      return true;
    }

    // 4. Parámetro en URL inyectado por el manifest start_url ('/?mode=standalone')
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.get('mode') === 'standalone' ||
      searchParams.get('pwa') === '1' ||
      searchParams.get('source') === 'pwa' ||
      window.location.search.includes('standalone')
    ) {
      return true;
    }

    // 5. Persistencia durante la sesión
    if (sessionStorage.getItem('veltron_is_standalone') === 'true') {
      return true;
    }

    return false;
  };

  const [isStandalone, setIsStandalone] = useState(detectStandalone);

  useEffect(() => {
    const checkMode = () => {
      const standalone = detectStandalone();
      if (standalone) {
        sessionStorage.setItem('veltron_is_standalone', 'true');
      }
      setIsStandalone(standalone);
    };

    checkMode();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkMode);
    return () => mediaQuery.removeEventListener('change', checkMode);
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  // Si se abre en navegador web normal -> Mostrar exclusivamente la pantalla de instalación
  if (!isStandalone) {
    return <InstallScreen />;
  }

  // Si se abre desde la PWA instalada en la pantalla de inicio -> Pantalla de bienvenida con Login / Registro
  return (
    <div className="w-full min-h-screen bg-[#0A0C0B] text-white relative font-sans select-none overflow-hidden flex flex-col justify-between">
      {/* Gradientes fluidos en movimiento continuo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#8E8C3A]/20 rounded-full blur-[130px] animate-orb-1" />
        <div className="absolute top-1/4 -right-10 w-[380px] h-[380px] bg-[#E09F3E]/15 rounded-full blur-[110px] animate-orb-2" />
        <div className="absolute -bottom-10 -left-10 w-[420px] h-[420px] bg-[#B5B04E]/15 rounded-full blur-[120px] animate-orb-3" />
      </div>

      {/* Contenedor central mobile-first */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between px-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] relative z-10">
        <div className="pt-4" />

        <main className="my-auto flex flex-col items-center justify-center text-center px-4">
          <VeltronLogo size="lg" animated className="cursor-pointer active:scale-95 transition-transform" />
        </main>

        <footer className="pt-2 pb-4 space-y-3 w-full">
          <button
            onClick={() => openAuth('login')}
            className="w-full py-3.5 px-6 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-[0.06em] rounded-xl flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(142,140,58,0.25)] leading-none cursor-pointer"
          >
            <span>INICIAR SESIÓN</span>
          </button>

          <button
            onClick={() => openAuth('signup')}
            className="w-full py-3.5 px-6 bg-[#121514] hover:bg-zinc-900 border border-zinc-800 hover:border-[#8E8C3A]/50 text-zinc-100 hover:text-white font-bebas text-lg tracking-[0.06em] rounded-xl flex items-center justify-center transition-all active:scale-[0.98] leading-none cursor-pointer"
          >
            <span>REGISTRARSE</span>
          </button>

          <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest pt-2 font-semibold font-barlow">
            FUERZA • HIPERTROFIA • FUNCIONAL
          </p>
        </footer>
      </div>

      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
