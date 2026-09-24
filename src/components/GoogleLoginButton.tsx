import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  width?: number;
}

export const GoogleLoginButton = ({
  onSuccess,
  onError,
  text = 'signin_with',
  width = 320,
}: GoogleLoginButtonProps) => {
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

    // Inicializar Google Identity Services cuando el script esté disponible
    const initGoogle = () => {
      if (window.google?.accounts?.id && buttonDiv.current) {
        window.google.accounts.id.initialize({
          client_id: '77559589649-sdqlidg23f0jqlu2mhsn5nikc65b6dkg.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        // Limpiar contenido previo para evitar botones duplicados
        buttonDiv.current.innerHTML = '';

        // Renderizar el botón nativo de Google adaptado a tema oscuro
        window.google.accounts.id.renderButton(buttonDiv.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: text,
          shape: 'pill',
          width: width,
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
  }, [text, width, onSuccess, onError]);

  return <div ref={buttonDiv} className="flex justify-center my-2 min-h-[44px]" />;
};
