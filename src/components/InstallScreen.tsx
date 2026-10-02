import React, { useState, useEffect } from 'react';
import { VeltronLogo } from './VeltronLogo';
import { Share, ArrowDown, PlusSquare, Check, MoreVertical, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallScreen: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Detección precisa de iOS (iPhone, iPad, iPod y iPadOS)
  const isIOS = typeof window !== 'undefined' && (
    /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0C0B] text-white relative font-sans select-none overflow-hidden flex flex-col justify-between selection:bg-[#8E8C3A]/30">
      {/* Orbes de luz ambiental sutiles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#8E8C3A]/15 rounded-full blur-[140px] animate-orb-1" />
        <div className="absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-[#B5B04E]/10 rounded-full blur-[120px] animate-orb-3" />
      </div>

      {/* Contenedor central sobrio y ultra espacioso */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between px-6 pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] relative z-10">
        
        {/* 1. Header: Logo y Título */}
        <header className="flex flex-col items-center text-center">
          <VeltronLogo size="md" animated={false} className="mb-4" />
          
          <h1 className="font-bebas text-3xl sm:text-4xl tracking-wide uppercase text-white leading-none">
            Instala la App
          </h1>
        </header>

        {/* 2. Tarjeta con detección automática de plataforma */}
        <main className="my-auto py-6">
          <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#B5B04E] font-barlow block pb-3 border-b border-zinc-800/60">
              {isIOS ? 'Instrucciones para iPhone (Safari)' : 'Instalación para Android'}
            </span>

            {isIOS ? (
              /* Pasos iOS (Safari) */
              <div className="space-y-5">
                <div className="flex items-center gap-4 py-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] w-6 shrink-0 text-center select-none">
                    01
                  </span>
                  <p className="text-sm font-barlow text-zinc-300 flex-1 leading-relaxed">
                    Toca el botón <span className="text-white font-semibold">Compartir</span> en la barra inferior de Safari
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-zinc-800/90 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner">
                    <Share className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] w-6 shrink-0 text-center select-none">
                    02
                  </span>
                  <p className="text-sm font-barlow text-zinc-300 flex-1 leading-relaxed">
                    Desliza hacia abajo en el menú de opciones
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-zinc-800/90 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] w-6 shrink-0 text-center select-none">
                    03
                  </span>
                  <p className="text-sm font-barlow text-zinc-300 flex-1 leading-relaxed">
                    Selecciona <span className="text-white font-semibold">"Agregar a Inicio"</span>
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-zinc-800/90 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] w-6 shrink-0 text-center select-none">
                    04
                  </span>
                  <p className="text-sm font-barlow text-zinc-300 flex-1 leading-relaxed">
                    Toca <span className="text-white font-semibold">"Agregar"</span> en la esquina superior derecha
                  </p>
                  <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-zinc-800/90 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              /* Flujo Android con botón de 1 toque + respaldo universal */
              <div className="space-y-5">
                {/* Botón de instalación nativa directa si el navegador lo soporta */}
                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-6 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-wider uppercase rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(142,140,58,0.25)] cursor-pointer leading-none font-bold"
                  >
                    <Download className="w-5 h-5" />
                    <span>Instalar en 1 Toque</span>
                  </button>
                )}

                {deferredPrompt && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-px bg-zinc-800/80 flex-1" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-barlow font-semibold">
                      O sigue estos pasos
                    </span>
                    <div className="h-px bg-zinc-800/80 flex-1" />
                  </div>
                )}

                {/* Pasos universales manuales (compatibles con Chrome, Samsung Internet, Brave, etc.) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 py-1">
                    <span className="font-mono text-sm font-bold text-[#B5B04E] w-6 shrink-0 text-center select-none">
                      01
                    </span>
                    <p className="text-sm font-barlow text-zinc-300 flex-1 leading-relaxed">
                      Toca el <span className="text-white font-semibold">menú de opciones ( ⋮  o  ☰ )</span> de tu navegador
                    </p>
                    <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-zinc-800/90 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner">
                      <MoreVertical className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-1">
                    <span className="font-mono text-sm font-bold text-[#B5B04E] w-6 shrink-0 text-center select-none">
                      02
                    </span>
                    <p className="text-sm font-barlow text-zinc-300 flex-1 leading-relaxed">
                      Selecciona <span className="text-white font-semibold">"Instalar aplicación"</span> o <span className="text-white font-semibold">"Agregar a inicio"</span>
                    </p>
                    <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-zinc-800/90 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner">
                      <Download className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-1">
                    <span className="font-mono text-sm font-bold text-[#B5B04E] w-6 shrink-0 text-center select-none">
                      03
                    </span>
                    <p className="text-sm font-barlow text-zinc-300 flex-1 leading-relaxed">
                      Confirma pulsando <span className="text-white font-semibold">"Instalar"</span> en el aviso emergente
                    </p>
                    <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-zinc-800/90 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* 3. Footer sobrio de marca */}
        <footer className="text-center pt-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-barlow">
            FUERZA • HIPERTROFIA • FUNCIONAL
          </p>
        </footer>

      </div>
    </div>
  );
};
