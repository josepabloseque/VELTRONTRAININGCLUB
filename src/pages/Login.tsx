import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { VeltronLogo } from '../components/VeltronLogo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials' 
          ? 'Credenciales incorrectas. Verifica tu email y contraseña.' 
          : error.message);
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Error al intentar iniciar sesión');
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
          Acceso Usuario
        </span>
      </header>

      {/* Login Card & Form - Solid, crisp & razor sharp */}
      <main className="my-auto py-6">
        <div className="text-center mb-6">
          <VeltronLogo size="md" />
        </div>

        <div className="bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 shadow-xl relative">
          <div className="mb-5">
            <h2 className="text-lg font-black uppercase text-white font-athletic tracking-wide">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-zinc-300 mt-1">
              Ingresa tus credenciales para acceder a tus reservas y membresía.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-start gap-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1.5">
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
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 px-4 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 font-athletic"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando acceso...</span>
                </>
              ) : (
                <span>Entrar al Club</span>
              )}
            </button>
          </form>
        </div>
      </main>

        {/* Footer info */}
        <footer className="text-center py-2 space-y-2">
          <p className="text-xs text-zinc-300">
            ¿No tienes cuenta aún?{' '}
            <Link to="/register" className="text-[#B5B04E] hover:underline font-bold">
              Regístrate aquí
            </Link>
          </p>
          <p className="text-[11px] text-zinc-500 font-medium">
            ¿Problemas para acceder? Contacta a recepción de Veltron.
          </p>
        </footer>
      </div>
    </div>
  );
};
