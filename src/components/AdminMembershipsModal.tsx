import React, { useState, useEffect } from 'react';
import { X, Search, ShieldCheck, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AdminMembershipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMembershipUpdated: () => void;
}

interface MemberRecord {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  planName: string;
  status: 'active' | 'inactive' | 'expired';
  expiresAt: string | null;
}

export const AdminMembershipsModal: React.FC<AdminMembershipsModalProps> = ({
  isOpen,
  onClose,
  onMembershipUpdated,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Pase Atleta Mensual');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lista sincronizada de atletas (100% dinámico)
  const [athletes, setAthletes] = useState<MemberRecord[]>([]);

  // Cargar estado de membresías desde Supabase
  const fetchMemberships = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_athletes_directory');

      if (!error && data) {
        const mapped: MemberRecord[] = data.map((m: any) => ({
          userId: m.user_id,
          fullName: m.full_name,
          email: m.email,
          phone: m.phone,
          planName: m.plan_name,
          status: m.status,
          expiresAt: m.expires_at,
        }));
        setAthletes(mapped);
      }
    } catch (err) {
      console.error('Error fetching memberships from get_athletes_directory RPC:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemberships();
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivate = async (athlete: MemberRecord, days: number = 30) => {
    setUpdatingId(athlete.userId);
    setErrorMsg(null);
    setSuccessMsg(null);

    const startsAt = new Date().toISOString();
    const expiresAtDate = new Date();
    expiresAtDate.setDate(expiresAtDate.getDate() + days);
    const expiresAt = expiresAtDate.toISOString();

    try {
      // Upsert membership in Supabase
      const { error } = await supabase
        .from('memberships')
        .upsert(
          {
            user_id: athlete.userId,
            plan_name: selectedPlan,
            status: 'active',
            starts_at: startsAt,
            expires_at: expiresAt,
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error activating membership:', error);
        setErrorMsg('No se pudo activar la membresía. Por favor, intenta de nuevo.');
      } else {
        setSuccessMsg(`¡Membresía activada con éxito para ${athlete.fullName}!`);
        // Actualizar estado local
        setAthletes((prev) =>
          prev.map((a) =>
            a.userId === athlete.userId
              ? {
                  ...a,
                  planName: selectedPlan,
                  status: 'active',
                  expiresAt: expiresAt,
                }
              : a
          )
        );
        onMembershipUpdated();
      }
    } catch (err: unknown) {
      console.error('Error in handleActivate:', err);
      setErrorMsg('No se pudo actualizar la membresía en este momento.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAthletes = athletes.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#8E8C3A]/15 border border-[#8E8C3A]/40 flex items-center justify-center text-[#B5B04E]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5B04E] font-barlow">
              Administración
            </span>
            <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
              Gestión de Membresías
            </h2>
          </div>
        </div>

        {/* Notificaciones */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-200 text-xs font-barlow">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-center gap-2 text-red-200 text-xs font-barlow">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selector de Plan a Asignar */}
        <div className="mb-4">
          <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
            Plan a Asignar
          </label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none font-barlow"
          >
            <option value="Pase Mensual">Pase Mensual (30 Días)</option>
            <option value="Pase Trimestral High Performance">Pase Trimestral High Performance (90 Días)</option>
            <option value="Pase Anual Ilimitado">Pase Anual Ilimitado (365 Días)</option>
            <option value="Pase Especial 10 Sesiones">Pase Especial 10 Sesiones</option>
          </select>
        </div>

        {/* Buscador de Usuario */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario por nombre, correo o teléfono..."
            className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-white focus:outline-none font-barlow"
          />
        </div>

        {/* Listado de Atletas */}
        <div className="space-y-3">
          {filteredAthletes.map((athlete) => {
            const isAct = athlete.status === 'active';
            const isUpd = updatingId === athlete.userId;

            return (
              <div
                key={athlete.userId}
                className="bg-[#0A0C0B] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white font-barlow">{athlete.fullName}</h3>
                    <p className="text-xs text-zinc-400 font-barlow">{athlete.email}</p>
                    {athlete.phone && (
                      <p className="text-[11px] text-zinc-500 font-mono">Tel: {athlete.phone}</p>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                      isAct
                        ? 'bg-[#3A3A1A] border border-[#8E8C3A]/50 text-[#B5B04E]'
                        : 'bg-amber-950/60 border border-amber-800/60 text-amber-400'
                    }`}
                  >
                    {isAct ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-400 font-barlow">
                    {isAct && athlete.expiresAt ? (
                      <span>Vence: <strong className="text-zinc-200">{new Date(athlete.expiresAt).toLocaleDateString()}</strong></span>
                    ) : (
                      <span className="text-amber-400/80">Sin vigencia activa</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleActivate(athlete, 30)}
                    disabled={isUpd}
                    className="py-1.5 px-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-sm tracking-wider rounded-lg transition-all flex items-center gap-1 leading-none shadow-[0_0_10px_rgba(142,140,58,0.2)] disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isUpd ? 'Guardando...' : isAct ? 'Renovar 30 Días' : 'Activar Membresía'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
