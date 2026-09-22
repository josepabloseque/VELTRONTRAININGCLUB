import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TermsModal } from './TermsModal';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const id = useId();

  // Reset state when opening or mode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSignupSuccess(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setPassword('');
  }, [initialMode, isOpen]);

  const toggleMode = () => {
    setErrorMsg(null);
    setSignupSuccess(false);
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrorMsg(
            error.message === 'Invalid login credentials'
              ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
              : error.message
          );
        } else {
          onClose();
          navigate('/');
        }
      } else {
        // Sign up
        if (password.length < 6) {
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          setSubmitting(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          if (!data.session) {
            setSignupSuccess(true);
          } else {
            onClose();
            navigate('/');
          }
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Error al conectar con Google');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark Backdrop Overlay (blur isolated from modal content so it never blurs text) */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Container - crisp vector rendering without transform scaling */}
      <div 
        className="relative z-10 w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 sm:p-7 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
        role="dialog"
        aria-modal="true"
        style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dialog Header */}
        <div className="mb-5 text-center">
          <h2 className="font-bebas text-2xl sm:text-3xl tracking-wide uppercase text-white leading-none">
            {mode === 'signup' ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
        </div>

        {/* Success message on signup */}
        {signupSuccess ? (
          <div className="text-center py-5 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#1A1F1B] border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-white">¡Registro Exitoso!</h3>
            <p className="text-xs text-zinc-300 font-barlow leading-relaxed">
              Hemos registrado tu cuenta. Revisa tu correo <span className="text-white font-semibold">{email}</span> si requiere confirmación.
            </p>
            <button
              onClick={() => {
                setSignupSuccess(false);
                setMode('login');
              }}
              className="w-full py-3.5 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(142,140,58,0.25)]"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-start gap-2 text-red-200 text-xs font-barlow">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label 
                  htmlFor={`${id}-name`}
                  className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow"
                >
                  Nombre Completo
                </label>
                <input
                  id={`${id}-name`}
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal"
                />
              </div>
            )}

            <div>
              <label 
                htmlFor={`${id}-email`}
                className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow"
              >
                Correo Electrónico
              </label>
              <input
                id={`${id}-email`}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label 
                  htmlFor={`${id}-phone`}
                  className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow"
                >
                  Número Telefónico
                </label>
                <input
                  id={`${id}-phone`}
                  type="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal"
                />
              </div>
            )}

            <div>
              <label 
                htmlFor={`${id}-password`}
                className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id={`${id}-password`}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(142,140,58,0.25)] active:scale-[0.98] disabled:opacity-50 leading-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{mode === 'signup' ? 'Crear Cuenta' : 'Entrar al Club'}</span>
              )}
            </button>
          </form>
        )}

        {/* Switch mode footer */}
        <div className="mt-5 text-center text-sm text-zinc-300 font-barlow">
          {mode === 'signup' ? (
            <>
              ¿Ya tienes una cuenta?{' '}
              <button 
                type="button" 
                onClick={toggleMode} 
                className="text-[#B5B04E] hover:underline font-semibold"
              >
                Inicia sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes una cuenta aún?{' '}
              <button 
                type="button" 
                onClick={toggleMode} 
                className="text-[#B5B04E] hover:underline font-semibold"
              >
                Regístrate aquí
              </button>
            </>
          )}
        </div>

        {/* Google OAuth Option */}
        {mode === 'signup' && (
          <div className="mt-5">
            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-zinc-400 text-xs uppercase font-medium tracking-wider">o</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 bg-[#1A1F1B] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-3 transition-all font-barlow"
            >
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
              <span>Continuar con Google</span>
            </button>

            <p className="text-xs text-zinc-400 text-center mt-3 font-barlow leading-relaxed">
              Al registrarte aceptas los{' '}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="underline text-zinc-300 hover:text-white transition-colors"
              >
                Términos y Condiciones
              </button>{' '}
              de Veltron Training Club.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Términos y Condiciones */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
};
