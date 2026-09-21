import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, AlertCircle, RefreshCw, UserCheck, Phone, Mail, ChevronRight, ChevronDown, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getLocalDateString } from '../lib/dateUtils';
import { fetchAthletesDirectory } from '../services/athletes.service';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <title>WhatsApp</title>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface MemberRecord {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  planName: string;
  status: 'active' | 'inactive' | 'expired';
  expiresAt: string | null;
}

interface AdminAccessViewProps {
  onMembershipUpdated?: () => void;
}

// Caché en memoria para evitar el flash de estado al alternar pestañas
let memoryAthletesCache: MemberRecord[] = [];

const PAGE_SIZE = 12;

const formatToDateInput = (isoOrDateStr: string | null): string => {
  if (!isoOrDateStr) return '';
  const d = new Date(isoOrDateStr);
  if (isNaN(d.getTime())) return '';
  return getLocalDateString(d);
};

const getDefaultEndDate = (startDateStr: string): string => {
  if (!startDateStr) return '';
  const [y, m, d] = startDateStr.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  start.setMonth(start.getMonth() + 1);
  return getLocalDateString(start);
};

export const AdminAccessView: React.FC<AdminAccessViewProps> = ({ onMembershipUpdated }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedAthlete, setSelectedAthlete] = useState<MemberRecord | null>(null);
  const [startDate, setStartDate] = useState<string>(getLocalDateString());
  const [endDate, setEndDate] = useState<string>(() => getDefaultEndDate(getLocalDateString()));
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Inicializa con el estado cacheado en memoria (100% dinámico)
  const [athletes, setAthletes] = useState<MemberRecord[]>(memoryAthletesCache);

  const fetchMemberships = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAthletesDirectory();
      const mapped: MemberRecord[] = data.map((m) => ({
        userId: m.user_id,
        fullName: m.full_name || m.email?.split('@')[0] || 'Atleta',
        email: m.email || '',
        phone: m.phone || 'No registrado',
        planName: m.plan_name || 'Sin plan asignado',
        status: m.status === 'active' ? 'active' : 'inactive',
        expiresAt: m.expires_at || null,
      }));
      setAthletes(mapped);
      memoryAthletesCache = mapped;

      // Actualizar el seleccionado si está abierto
      if (selectedAthlete) {
        const fresh = mapped.find((m) => m.userId === selectedAthlete.userId);
        if (fresh) {
          setSelectedAthlete(fresh);
        }
      }
    } catch (err: any) {
      console.error('Error fetching athletes in AdminAccessView:', err);
      setErrorMsg(err.message || 'Error al obtener la lista de atletas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleSaveMembership = async (athlete: MemberRecord) => {
    if (!startDate || !endDate) {
      setErrorMsg('Por favor define las fechas de inicio y vencimiento.');
      return;
    }

    setUpdatingId(athlete.userId);
    setErrorMsg(null);
    setSuccessMsg(null);

    const planToAssign = athlete.planName && athlete.planName !== 'Sin plan asignado' ? athlete.planName : 'Pase Mensual';
    const startsAt = new Date(`${startDate}T00:00:00`).toISOString();
    const expiresAt = new Date(`${endDate}T23:59:59`).toISOString();

    try {
      const { error } = await supabase
        .from('memberships')
        .upsert(
          {
            user_id: athlete.userId,
            plan_name: planToAssign,
            status: 'active',
            starts_at: startsAt,
            expires_at: expiresAt,
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        throw error;
      }

      const updatedAthlete: MemberRecord = {
        ...athlete,
        status: 'active',
        planName: planToAssign,
        expiresAt,
      };

      setAthletes((prev) => {
        const updated = prev.map((a) => (a.userId === athlete.userId ? updatedAthlete : a));
        memoryAthletesCache = updated;
        return updated;
      });

      setSelectedAthlete(updatedAthlete);
      setSuccessMsg(`Membresía guardada hasta el ${new Date(`${endDate}T12:00:00`).toLocaleDateString()} para ${athlete.fullName}.`);
      if (onMembershipUpdated) onMembershipUpdated();
    } catch (err: any) {
      console.error('Error updating membership in Supabase:', err);
      setErrorMsg('No se pudo actualizar la membresía. Por favor, intenta de nuevo.');
    } finally {
      setUpdatingId(null);
    }
  };



  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, filterStatus]);

  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);

    if (!matchesSearch) return false;
    const isExp = a.expiresAt ? new Date(a.expiresAt).getTime() <= Date.now() : true;
    const isAct = a.status === 'active' && !isExp;
    if (filterStatus === 'active') return isAct;
    if (filterStatus === 'inactive') return !isAct;
    return true;
  });

  const displayedAthletes = filteredAthletes.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAthletes.length;

  return (
    <section className="space-y-4">
      {/* Encabezado de la sección */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
            Control de Membresías
          </h2>
          <p className="text-xs text-zinc-400 font-barlow mt-1">
            Gestión de membresías y estados
          </p>
        </div>

        <button
          onClick={fetchMemberships}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors -mt-1"
          title="Recargar datos"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B5B04E]' : ''}`} />
        </button>
      </div>

      {/* Alertas de Feedback */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-barlow">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-300 font-barlow">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="w-full bg-[#121514] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8E8C3A] transition-colors font-barlow"
          />
        </div>

        {/* Filtro Rápido */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'active', label: 'Activos' },
            { id: 'inactive', label: 'Vencidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`py-1 px-3 rounded-lg text-xs font-barlow font-medium border transition-all ${
                filterStatus === tab.id
                  ? 'bg-zinc-800 border-zinc-700 text-white font-bold'
                  : 'bg-[#0A0C0B] border-zinc-900 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directorio de Usuarios: Cards limpias y mínimas */}
      <div className="space-y-2.5">
        {filteredAthletes.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-barlow bg-[#121514] rounded-2xl border border-zinc-800/80">
            No se encontraron usuarios registrados con ese criterio.
          </div>
        ) : (
          displayedAthletes.map((athlete) => {
            const isExpired = athlete.expiresAt ? new Date(athlete.expiresAt).getTime() <= Date.now() : true;
            const isMemberActive = athlete.status === 'active' && !isExpired;

            return (
              <div
                key={athlete.userId}
                onClick={() => {
                  setSelectedAthlete(athlete);
                  const today = getLocalDateString();
                  setStartDate(today);
                  if (athlete.expiresAt) {
                    setEndDate(formatToDateInput(athlete.expiresAt));
                  } else {
                    setEndDate(getDefaultEndDate(today));
                  }
                  setSuccessMsg(null);
                  setErrorMsg(null);
                }}
                className="bg-[#8E8C3A]/[0.08] hover:bg-[#8E8C3A]/[0.13] border border-[#8E8C3A]/30 hover:border-[#8E8C3A]/60 rounded-2xl p-4 transition-all cursor-pointer group active:scale-[0.99] space-y-2.5 shadow-sm backdrop-blur-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white font-barlow group-hover:text-[#B5B04E] transition-colors">
                      {athlete.fullName}
                    </h4>
                    <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-zinc-300 font-barlow">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#B5B04E]/70" />
                        {athlete.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#B5B04E]/70" />
                        {athlete.phone}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isMemberActive
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                        : 'bg-red-950/60 border-red-800/60 text-red-400'
                    }`}
                  >
                    {isMemberActive ? 'Activo' : 'Vencido'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#8E8C3A]/20 flex items-center justify-between text-[11px] font-barlow">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">Vencimiento:</span>
                    <span className="text-zinc-200 font-mono font-medium">
                      {athlete.expiresAt ? new Date(athlete.expiresAt).toLocaleDateString() : 'Sin fecha'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-zinc-400 group-hover:text-[#B5B04E] transition-colors text-[10px] font-semibold uppercase tracking-wider">
                    <span>Gestionar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Botón Cargar Más Usuarios */}
        {hasMore && (
          <div className="pt-2">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="w-full py-3 px-4 bg-[#121514] hover:bg-zinc-800 border border-zinc-800 hover:border-[#8E8C3A]/50 text-zinc-300 hover:text-white rounded-xl text-xs font-barlow font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm"
            >
              <span>Cargar más usuarios ({filteredAthletes.length - visibleCount} restantes)</span>
              <ChevronDown className="w-4 h-4 text-[#B5B04E]" />
            </button>
          </div>
        )}
      </div>

      {/* Modal de Gestión de Membresía del Atleta */}
      {selectedAthlete && (() => {
        const selectedIsExpired = selectedAthlete.expiresAt ? new Date(selectedAthlete.expiresAt).getTime() <= Date.now() : true;
        const selectedIsActive = selectedAthlete.status === 'active' && !selectedIsExpired;

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedAthlete(null)}
          />

          <div className="relative w-full max-w-md bg-[#121514] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex justify-between items-start pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#1A1F1B] border border-[#8E8C3A]/40 flex items-center justify-center text-[#B5B04E] font-bebas text-xl shrink-0">
                  {selectedAthlete.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-barlow leading-tight">
                    {selectedAthlete.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        selectedIsActive
                          ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                          : 'bg-red-950/60 border-red-800/60 text-red-400'
                      }`}
                    >
                      {selectedIsActive ? 'Membresía Activa' : 'Membresía Vencida'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAthlete(null)}
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alertas dentro del modal */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-barlow animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-center gap-2.5 text-xs text-red-300 font-barlow animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Datos de Contacto */}
            <div className="bg-[#0A0C0B] p-4 rounded-xl border border-zinc-800/80 space-y-3 font-barlow">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-0.5">
                  Correo
                </span>
                <span className="text-white font-medium text-xs break-all block">
                  {selectedAthlete.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-0.5">
                  Teléfono
                </span>
                <span className="text-white font-medium text-xs block">
                  {selectedAthlete.phone}
                </span>
              </div>

              <div className="pt-2.5 border-t border-zinc-800/60">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-0.5">
                  Vencimiento
                </span>
                <span className="text-zinc-200 font-mono font-bold text-xs block">
                  {selectedAthlete.expiresAt ? new Date(selectedAthlete.expiresAt).toLocaleDateString() : 'Sin fecha asignada'}
                </span>
              </div>
            </div>

            {/* Rango de Fechas (From / To) */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-zinc-300 font-barlow uppercase tracking-wider block">
                Vigencia de Membresía:
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Desde / Inicio */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold font-barlow">
                    Desde
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3 text-center text-xs font-mono text-white focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* Hasta / Vencimiento Editable */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] uppercase tracking-wider text-[#B5B04E] font-semibold font-barlow">
                    Hasta
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0A0C0B] border border-[#8E8C3A]/70 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3 text-center text-xs font-mono text-[#B5B04E] font-bold focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Acciones de Membresía */}
            <div className="space-y-3 pt-1">
              <button
                onClick={() => handleSaveMembership(selectedAthlete)}
                disabled={updatingId === selectedAthlete.userId || !startDate || !endDate}
                className="w-full py-3.5 px-4 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-sm tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 leading-none active:scale-[0.98] shadow-md disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {selectedAthlete.status === 'active' ? 'Actualizar Membresía' : 'Activar Membresía'}
                </span>
              </button>

              {selectedAthlete.phone && selectedAthlete.phone !== 'No registrado' && (
                <a
                  href={`https://wa.me/506${selectedAthlete.phone.replace(/\D/g, '').replace(/^506/, '')}?text=Hola%20${encodeURIComponent(
                    selectedAthlete.fullName
                  )},%20te%20saludamos%20de%20Veltron%20Training%20Club%20respecto%20a%20tu%20membres%C3%ADa.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-400 text-sm font-bebas tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-colors leading-none active:scale-[0.98]"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </section>
  );
};
