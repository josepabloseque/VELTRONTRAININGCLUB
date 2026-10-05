import React, { useState, useEffect } from 'react';
import { VeltronLogo } from './VeltronLogo';
import { Download } from 'lucide-react';

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
    } else {
      const step1 = document.getElementById('android-step-1');
      if (step1) {
        step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0C0B] text-white relative font-sans select-none overflow-x-hidden overflow-y-auto flex flex-col justify-between selection:bg-[#8E8C3A]/30">
      {/* Orbes de luz ambiental sutiles fijos de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#8E8C3A]/15 rounded-full blur-[140px] animate-orb-1" />
        <div className="absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-[#B5B04E]/10 rounded-full blur-[120px] animate-orb-3" />
      </div>

      {/* Contenedor central sobrio y ultra espacioso */}
      <div className="w-full max-w-xl mx-auto min-h-screen flex flex-col justify-between px-3.5 sm:px-6 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] relative z-10 space-y-6">
        
        {/* 1. Header: Logo */}
        <header className="flex flex-col items-center text-center pt-2 pb-6 sm:pb-8">
          <VeltronLogo size="md" animated={false} />
        </header>

        {/* 2. Contenido con detección automática de plataforma */}
        <main className="my-auto w-full py-2">
          {isIOS ? (
            /* Flujo Vertical con Capturas para iPhone (Safari) */
            <div className="w-full pt-4 sm:pt-6 space-y-9">
              {/* Encabezado descriptivo Safari iOS */}
              <div className="text-left px-1 space-y-2.5 pb-2">
                <h2 className="font-bebas text-xl sm:text-2xl tracking-wide uppercase text-white leading-tight">
                  Proceso de instalación en <span className="text-[#B5B04E]">iOS</span>
                </h2>
                <p className="text-sm sm:text-base font-barlow text-zinc-300 leading-relaxed">
                  En iOS, la app solo se puede instalar abriendo este enlace en <strong className="text-zinc-100 font-medium">Safari</strong>. Sigue los pasos a continuación para agregarla a tu pantalla de inicio:
                </p>
              </div>

              {/* Paso 01 */}
              <div className="space-y-3.5 w-full">
                <div className="flex items-center gap-3 px-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] bg-[#121514] border border-zinc-700/70 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                    01
                  </span>
                  <p className="text-sm sm:text-base font-barlow text-zinc-200 font-medium leading-snug flex-1">
                    Toca el botón <span className="text-[#B5B04E] font-bold">Compartir</span> en la barra inferior de Safari
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <img
                    src="/install/ios/step-1-share.png"
                    alt="Paso 1: Toca Compartir"
                    loading="lazy"
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              {/* Paso 02 */}
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 px-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] bg-[#121514] border border-zinc-700/70 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                    02
                  </span>
                  <p className="text-sm sm:text-base font-barlow text-zinc-200 font-medium leading-snug flex-1">
                    Desliza hacia abajo y selecciona <span className="text-[#B5B04E] font-bold">"Agregar a Inicio"</span>
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <img
                    src="/install/ios/step-2-add.png"
                    alt="Paso 2: Agregar a Inicio"
                    loading="lazy"
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              {/* Paso 03 */}
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 px-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] bg-[#121514] border border-zinc-700/70 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                    03
                  </span>
                  <p className="text-sm sm:text-base font-barlow text-zinc-200 font-medium leading-snug flex-1">
                    Toca <span className="text-[#B5B04E] font-bold">"Agregar"</span> en la esquina superior derecha
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <img
                    src="/install/ios/step-3-confirm.png"
                    alt="Paso 3: Toca Agregar"
                    loading="lazy"
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Flujo Vertical con Capturas para Android */
            <div className="w-full pt-4 sm:pt-6 space-y-9">
              {/* Encabezado descriptivo Android */}
              <div className="text-left px-1 space-y-2.5 pb-2">
                <h2 className="font-bebas text-xl sm:text-2xl tracking-wide uppercase text-white leading-tight">
                  Proceso de instalación en <span className="text-[#B5B04E]">Android</span>
                </h2>
                <p className="text-sm sm:text-base font-barlow text-zinc-300 leading-relaxed">
                  Hay dos formas de instalar la app: pulsando el botón de instalación rápida a continuación o siguiendo los 3 pasos desde el menú de tu navegador:
                </p>
              </div>

              {/* Opción 1: Botón de instalación nativa rápida */}
              <div className="space-y-4 px-1 pt-1 pb-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-4 bg-[#121514] hover:bg-[#181c1a] border border-[#8E8C3A]/40 hover:border-[#B5B04E]/80 text-zinc-200 font-barlow font-semibold text-sm sm:text-base tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 text-[#B5B04E]" />
                  <span>Instalación rápida</span>
                </button>

                <div className="flex items-center gap-3 pt-2">
                  <div className="h-px bg-zinc-800/80 flex-1" />
                  <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-mono">
                    O sigue estos 3 pasos
                  </span>
                  <div className="h-px bg-zinc-800/80 flex-1" />
                </div>
              </div>

              {/* Paso 01 */}
              <div id="android-step-1" className="space-y-3.5 w-full">
                <div className="flex items-center gap-3 px-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] bg-[#121514] border border-zinc-700/70 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                    01
                  </span>
                  <p className="text-sm sm:text-base font-barlow text-zinc-200 font-medium leading-snug flex-1">
                    Toca el <span className="text-[#B5B04E] font-bold">menú de opciones</span> en la esquina superior derecha
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <img
                    src="/install/android/step-2-select.png"
                    alt="Paso 1: Menú de opciones"
                    loading="lazy"
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              {/* Paso 02 */}
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 px-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] bg-[#121514] border border-zinc-700/70 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                    02
                  </span>
                  <p className="text-sm sm:text-base font-barlow text-zinc-200 font-medium leading-snug flex-1">
                    Selecciona <span className="text-[#B5B04E] font-bold">"Instalar y crear acceso directo"</span>
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <img
                    src="/install/android/step-1-menu.png"
                    alt="Paso 2: Instalar y crear acceso directo"
                    loading="lazy"
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              {/* Paso 03 */}
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 px-1">
                  <span className="font-mono text-sm font-bold text-[#B5B04E] bg-[#121514] border border-zinc-700/70 px-2.5 py-1 rounded-lg shrink-0 shadow-sm">
                    03
                  </span>
                  <p className="text-sm sm:text-base font-barlow text-zinc-200 font-medium leading-snug flex-1">
                    Confirma pulsando <span className="text-[#B5B04E] font-bold">"Instalar"</span> en la ventana emergente
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <img
                    src="/install/android/step-3-confirm.png"
                    alt="Paso 3: Confirmar Instalación"
                    loading="lazy"
                    className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de cierre */}
          <div className="text-center pt-10 pb-4 px-4">
            <p className="text-sm sm:text-base font-barlow text-zinc-300 leading-relaxed max-w-sm mx-auto">
              <span className="text-white font-medium">¿Ya la agregaste a tu inicio?</span>{' '}
              Abre el icono de <span className="text-[#B5B04E] font-semibold">Veltron</span> desde tu pantalla principal.
            </p>
          </div>
        </main>

        {/* 3. Footer sobrio de marca */}
        <footer className="text-center pt-2 pb-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-barlow">
            FUERZA • HIPERTROFIA • FUNCIONAL
          </p>
        </footer>

      </div>
    </div>
  );
};
