import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TermsModal } from './TermsModal';
import { DateInput } from './ui/DateInput';
import { GoogleLoginButton } from './GoogleLoginButton';

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
  const [mode, setMode] = useState<'signup' | 'login' | 'forgot_password'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const id = useId();

  // Reset state when opening or mode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSignupSuccess(false);
    setRecoverySent(false);
    setFullName('');
    setPhone('');
    setBirthDate('');
    setEmail('');
    setPassword('');
  }, [initialMode, isOpen]);

  const toggleMode = () => {
    setErrorMsg(null);
    setSignupSuccess(false);
    setRecoverySent(false);
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setRecoverySent(true);
        }
      } else if (mode === 'login') {
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
              birth_date: birthDate,
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

        {/* Dialog Header (solo visible si no hay mensaje de éxito/enviado) */}
        {!signupSuccess && !recoverySent && (
          <div className="mb-5 text-center">
            <h2 className="font-bebas text-2xl sm:text-3xl tracking-wide uppercase text-white leading-none">
              {mode === 'signup' 
                ? 'Crear Cuenta' 
                : mode === 'forgot_password' 
                ? 'Recuperar Contraseña' 
                : 'Iniciar Sesión'}
            </h2>
            {mode === 'forgot_password' && (
              <p className="text-xs text-zinc-300 mt-2 font-barlow leading-relaxed px-2">
                Ingresa tu correo registrado y te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>
            )}
          </div>
        )}

        {/* Success message on signup */}
        {signupSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#1A1F1B] border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-white">¡Registro Exitoso!</h3>
            <p className="text-xs text-zinc-300 font-barlow leading-relaxed max-w-xs mx-auto">
              Hemos registrado tu cuenta. Revisa tu correo <span className="text-white font-semibold">{email}</span> si requiere confirmación.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSignupSuccess(false);
                  setMode('login');
                }}
                className="py-2.5 px-6 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-base tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 leading-none"
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        ) : recoverySent ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#1A1F1B] border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-white">¡Enlace Enviado!</h3>
            <p className="text-xs text-zinc-300 font-barlow leading-relaxed max-w-xs mx-auto">
              Hemos enviado las instrucciones a <span className="text-white font-semibold">{email}</span>. Revisa tu bandeja de entrada o la carpeta de spam.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setRecoverySent(false);
                  setMode('login');
                }}
                className="py-2.5 px-6 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-base tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 leading-none"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
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
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label 
                    htmlFor={`${id}-phone`}
                    className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow truncate"
                  >
                    Teléfono
                  </label>
                  <input
                    id={`${id}-phone`}
                    type="tel"
                    inputMode="tel"
                    required
                    placeholder="8888-8888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal"
                  />
                </div>

                <div>
                  <label 
                    htmlFor={`${id}-birthdate`}
                    className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow truncate"
                  >
                    Nacimiento
                  </label>
                  <DateInput
                    id={`${id}-birthdate`}
                    required
                    value={birthDate}
                    onChange={(iso) => setBirthDate(iso)}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot_password' && (
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
                {mode === 'login' && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setMode('forgot_password');
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition-colors hover:underline font-barlow font-normal"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-base sm:text-lg tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(142,140,58,0.25)] active:scale-[0.98] disabled:opacity-50 leading-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>
                  {mode === 'signup' 
                    ? 'Crear Cuenta' 
                    : mode === 'forgot_password' 
                    ? 'Enviar Enlace de Recuperación' 
                    : 'Entrar al Club'}
                </span>
              )}
            </button>
          </form>
        )}

        {/* Switch mode footer (solo para login o registro) */}
        {!signupSuccess && !recoverySent && mode !== 'forgot_password' && (
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
        )}

        {/* Google OAuth Option (Google Identity Services) */}
        {!signupSuccess && !recoverySent && mode !== 'forgot_password' && (
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest font-barlow">o</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <GoogleLoginButton
              text={mode === 'signup' ? 'signup_with' : 'signin_with'}
              width={340}
              onSuccess={() => {
                onClose();
                navigate('/');
              }}
              onError={(err) => setErrorMsg(err)}
            />

            {mode === 'signup' && (
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
            )}
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
