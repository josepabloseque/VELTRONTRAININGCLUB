import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setErrorMsg(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Error al restablecer la contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0B] text-white flex items-center justify-center p-4 sm:p-6 selection:bg-[#8E8C3A]/30">
      {/* Contenedor Central / Tarjeta Principal */}
      <main className="max-w-md w-full">
        <div className="bg-[#121514] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-xs text-zinc-300 font-barlow leading-relaxed max-w-xs mx-auto">
                Tu contraseña se ha restablecido correctamente. Ya puedes acceder al club con tus nuevas credenciales.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3.5 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-wider uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(142,140,58,0.25)] active:scale-[0.98] leading-none"
                >
                  Entrar al Club
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-5 text-center">
                <h2 className="font-bebas text-2xl sm:text-3xl tracking-wide uppercase text-white leading-none">
                  Nueva Contraseña
                </h2>
                <p className="text-xs text-zinc-400 mt-2 font-barlow leading-relaxed">
                  Ingresa tu nueva clave de acceso para asegurar tu cuenta.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-start gap-2.5 text-red-200 text-xs font-barlow">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3.5 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 leading-none shadow-[0_0_20px_rgba(142,140,58,0.25)]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Guardar Nueva Contraseña</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
