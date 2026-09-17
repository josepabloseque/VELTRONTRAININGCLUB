import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, User, Phone, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { VeltronLogo } from '../components/VeltronLogo';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);

    try {
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
        // If email confirmation is required, Supabase returns session: null
        if (!data.session) {
          setRegistrationSuccess(true);
        } else {
          // Logged in immediately, redirect to gatekeeper/dashboard
          navigate('/');
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Error al procesar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0C0B] text-white relative font-sans select-none overflow-hidden flex flex-col justify-between">
      {/* Contenedor central */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-6 relative z-10">
        {/* Header with back button */}
        <header className="pt-2 flex items-center justify-between">
          <button
            onClick={() => navigate('/welcome')}
            className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>

        <span className="text-[10px] uppercase font-black tracking-widest text-[#B5B04E] bg-[#3A3A1A] px-2.5 py-1 rounded-full border border-[#8E8C3A]/40">
          Nuevo Usuario
        </span>
      </header>

      {/* Main Form Area */}
      <main className="my-auto py-4">
        <div className="text-center mb-5">
          <VeltronLogo size="md" />
        </div>

        {registrationSuccess ? (
          <div className="bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-[#1A1F1B] border border-emerald-500/50 flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black uppercase text-white font-athletic tracking-wide">
              ¡Cuenta Creada!
            </h3>
            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              Hemos registrado tus datos correctamente. Si Supabase requiere confirmación, revisa tu bandeja de entrada en <span className="text-white font-medium">{email}</span>.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full mt-5 py-3.5 px-4 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all font-athletic"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <div className="bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 shadow-xl relative">
            <div className="mb-4">
              <h2 className="text-lg font-black uppercase text-white font-athletic tracking-wide">
                Registro de Usuario
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                Crea tu cuenta para comenzar a reservar y entrenar en Veltron.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-start gap-2.5 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+506 8888 8888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@veltron.club"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-9 pr-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1">
                    Confirmar
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-9 pr-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3.5 px-4 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 font-athletic"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <span>Registrarme en Veltron</span>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

        {/* Footer with link to Login */}
        <footer className="text-center py-2">
          <p className="text-xs text-zinc-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#B5B04E] hover:underline font-bold">
              Inicia sesión
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};
