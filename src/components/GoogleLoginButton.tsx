import React, { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
  text?: string;
}

let isGoogleInitialized = false;

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continuar con Google',
}) => {
  const buttonDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Callback para manejar la respuesta con el id_token de Google
    const handleCredentialResponse = async (response: any) => {
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) throw error;

        if (data?.session && onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        console.error('Error al autenticar con Google y Supabase:', err);
        if (onError) {
          onError(err.message || 'Error al iniciar sesión con Google.');
        }
      }
    };

    // Inicializar Google Identity Services una sola vez y renderizar el botón
    const initGoogle = () => {
      if (window.google?.accounts?.id && buttonDiv.current) {
        if (!isGoogleInitialized) {
          window.google.accounts.id.initialize({
            client_id: '77559589649-sdqlidg23f0jqlu2mhsn5nikc65b6dkg.apps.googleusercontent.com',
            callback: handleCredentialResponse,
          });
          isGoogleInitialized = true;
        }

        buttonDiv.current.innerHTML = '';

        // Renderizar el botón nativo de Google (cubriendo el área)
        window.google.accounts.id.renderButton(buttonDiv.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 380,
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onSuccess, onError]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl group">
      {/* Botón visual con la estética exacta de Veltron */}
      <div className="w-full py-3 px-4 bg-[#1A1F1B] group-hover:bg-zinc-800 border border-zinc-800 group-hover:border-zinc-700 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-3 transition-all font-barlow select-none shadow-sm">
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
        <span>{text}</span>
      </div>

      {/* Capa invisible interactiva de Google GIS para ejecutar signInWithIdToken */}
      <div
        ref={buttonDiv}
        className="absolute inset-0 opacity-[0.0001] cursor-pointer flex items-center justify-center overflow-hidden scale-125 origin-center"
        style={{ zIndex: 10 }}
      />
    </div>
  );
};
