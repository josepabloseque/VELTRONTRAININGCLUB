import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIosDevice);

    // Listen for Chrome/Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setDeferredPrompt(null);
      setTimeout(() => setInstalledSuccessfully(false), 4000);
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
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccessfully(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  // If already in standalone mode or user dismissed, don't show the prompt
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      {/* Banner / Card de Instalación Rápida - Crisp solid container */}
      <div className="w-full bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-4 shadow-xl relative">
        <div className="flex items-start justify-between gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A1F1B] border border-[#8E8C3A]/50 flex items-center justify-center shrink-0 text-[#B5B04E]">
            <Smartphone className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#B5B04E] bg-[#3A3A1A] border border-[#8E8C3A]/40 px-1.5 py-0.5 rounded">
                PWA Veltron
              </span>
              <span className="text-[11px] text-zinc-300 font-semibold">Experiencia nativa</span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1">Instala la App en tu móvil</h4>
            <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
              Accede a tus reservas y entrenamientos en 1 toque, a pantalla completa.
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Instalar App
            </button>
          )}

          {isIOS && !deferredPrompt && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Cómo Instalar en iPhone
            </button>
          )}

          {!deferredPrompt && !isIOS && (
            <button
              onClick={() => alert('Para instalar en tu navegador, haz clic en el icono de instalación en la barra de direcciones.')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Instalar en Navegador
            </button>
          )}
        </div>
      </div>

      {/* Modal Guía iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-11 h-11 rounded-xl bg-[#1A1F1B] border border-[#8E8C3A]/50 flex items-center justify-center mb-4 text-[#B5B04E]">
              <Smartphone className="w-5 h-5" />
            </div>

            <h3 className="text-base font-black uppercase tracking-wider">
              Instalar en <span className="text-[#8E8C3A]">iPhone / iPad</span>
            </h3>
            <p className="text-xs text-zinc-300 mt-1 mb-4">
              Sigue estos 2 sencillos pasos en Safari para agregar Veltron a tu pantalla de inicio:
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 bg-black border border-zinc-800 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[#B5B04E] shrink-0 font-black text-xs">
                  1
                </div>
                <div className="text-xs">
                  <p className="text-zinc-100 font-bold">Toca el botón Compartir</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5 flex items-center gap-1">
                    En la barra inferior de Safari busca el icono <Share className="w-3.5 h-3.5 inline text-[#8E8C3A]" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-black border border-zinc-800 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[#B5B04E] shrink-0 font-black text-xs">
                  2
                </div>
                <div className="text-xs">
                  <p className="text-zinc-100 font-bold">"Agregar a Inicio"</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Baja en las opciones y presiona <PlusSquare className="w-3.5 h-3.5 inline text-[#8E8C3A]" /> Agregar a pantalla de inicio.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full mt-5 py-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Notificación de Instalación Exitosa */}
      {installedSuccessfully && (
        <div className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-50 bg-[#121514] border border-emerald-500 p-4 rounded-xl flex items-center gap-3 shadow-2xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white">¡App Veltron instalada!</p>
            <p className="text-zinc-300">Ya puedes abrirla desde tu pantalla de inicio.</p>
          </div>
        </div>
      )}
    </>
  );
};
