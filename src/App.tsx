import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { Gatekeeper } from './components/Gatekeeper';
import { Welcome } from './pages/Welcome';
import { VeltronLogo } from './components/VeltronLogo';
import { AdminClassModal } from './components/AdminClassModal';
import { AdminMembershipsModal } from './components/AdminMembershipsModal';
import { AdminAccessView } from './components/AdminAccessView';
import { AdminClassesView } from './components/AdminClassesView';
import { ClassDetailsModal } from './components/ClassDetailsModal';
import type { TrainingClass } from './types/database';
import { 
  User, 
  House, 
  ChevronRight
} from 'lucide-react';
import { BicepsFlexedIcon } from './components/BicepsFlexedIcon';

// Custom Logout Icon solicitado
const LogoutCustomIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" 
    />
  </svg>
);

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

// Custom Calendar Icon solicitado (24px)
const CalendarCustomIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 stroke-[1.8]' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="1.8" 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" 
    />
  </svg>
);

// Custom Accesos Icon solicitado (Credencial / Carnet de Identificación 24px)
const AccesosCustomIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    viewBox="3 9 42 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path d="M24 23H10V21H24V23Z" fill="currentColor"/>
    <path d="M10 19H24V17H10V19Z" fill="currentColor"/>
    <path d="M24 27H10V25H24V27Z" fill="currentColor"/>
    <path d="M10 31H24V29H10V31Z" fill="currentColor"/>
    <path d="M28 27.4396C28 26.1776 29.1546 25.231 30.3922 25.4785L32.6078 25.9216C32.8667 25.9734 33.1333 25.9734 33.3922 25.9216L35.6078 25.4785C36.8454 25.231 38 26.1776 38 27.4396V32H28V27.4396Z" fill="currentColor"/>
    <path d="M33 24C35.2091 24 37 22.2091 37 20C37 17.7909 35.2091 16 33 16C30.7909 16 29 17.7909 29 20C29 22.2091 30.7909 24 33 24Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7 10C5.34315 10 4 11.3431 4 13V35C4 36.6569 5.34315 38 7 38H41C42.6569 38 44 36.6569 44 35V13C44 11.3431 42.6569 10 41 10H7ZM41 12H7C6.44772 12 6 12.4477 6 13V35C6 35.5523 6.44772 36 7 36H41C41.5523 36 42 35.5523 42 35V13C42 12.4477 41.5523 12 41 12Z" fill="currentColor"/>
  </svg>
);

import { getLocalDateString, isClassPast } from './lib/dateUtils';

// Panel principal de la plataforma
const Dashboard: React.FC = () => {
  const { membership, user, isActive, isAdmin, signOut, refreshMembership } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'clases' | 'membresias' | 'perfil'>('inicio');

  // Modales
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isMembershipsModalOpen, setIsMembershipsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TrainingClass | null>(null);

  // Clases registradas (100% dinámicas desde Supabase)
  const [classes, setClasses] = useState<TrainingClass[]>(() => {
    try {
      const saved = localStorage.getItem('veltron_training_classes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => !['class-1', 'class-2', 'class-3'].includes(c.id));
        }
      }
    } catch (e) {
      console.error('Error cargando clases guardadas:', e);
    }
    return [];
  });

  // Reservas del usuario actual (100% dinámicas desde Supabase)
  const [bookedClassIds, setBookedClassIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('veltron_booked_classes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error cargando reservas guardadas:', e);
    }
    return [];
  });

  const [completedClassesCount, setCompletedClassesCount] = useState<number>(0);

  // Función reutilizable para consultar clases desde Supabase (solo de Hoy en adelante)
  const fetchSupabaseClasses = async () => {
    try {
      const todayStr = getLocalDateString();
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .gte('date', todayStr)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (!error && data) {
        const mapped: TrainingClass[] = data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          coach: item.coach || 'Coach',
          date: item.date || todayStr,
          time: item.time,
          capacity: Number(item.capacity) || 16,
          bookedCount: Number(item.booked_count) || 0,
          workoutDescription: item.workout_description || '',
          exercises: Array.isArray(item.exercises) ? item.exercises : [],
        }));
        setClasses(mapped);
      }
    } catch (err) {
      console.error('Error al sincronizar clases desde Supabase:', err);
    }
  };

  // Función reutilizable para consultar reservas del usuario
  const fetchUserBookings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('class_bookings')
        .select('class_id')
        .eq('user_id', user.id);

      if (!error && data) {
        setBookedClassIds(data.map((b: any) => String(b.class_id)));
      }
    } catch (err) {
      console.error('Error al sincronizar reservas desde Supabase:', err);
    }
  };

  // Función para consultar el total histórico de clases reservadas del usuario
  const fetchUserMetrics = async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('class_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!error && typeof count === 'number') {
        setCompletedClassesCount(count);
      }
    } catch (err) {
      console.error('Error al consultar total de clases del usuario:', err);
    }
  };

  // 1. CARGA INICIAL INMEDIATA AL MONTAR:
  // Garantiza que la vista de Inicio (y cualquier pestaña de entrada) tenga los datos cargados desde el primer render
  useEffect(() => {
    fetchSupabaseClasses();
    fetchUserBookings();
    fetchUserMetrics();
  }, [user]);

  // 2. SUSCRIPCIÓN REALTIME OPTIMIZADA:
  useEffect(() => {
    if (activeTab === 'perfil' || activeTab === 'inicio') {
      fetchUserMetrics();
    }

    if (activeTab !== 'clases') return;

    // Actualizar datos al entrar a la pestaña
    fetchSupabaseClasses();
    fetchUserBookings();
    fetchUserMetrics();

    const channel = supabase
      .channel('realtime_classes_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes' },
        () => {
          fetchSupabaseClasses();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_bookings' },
        () => {
          fetchSupabaseClasses();
          fetchUserBookings();
          fetchUserMetrics();
        }
      )
      .subscribe();

    // Limpieza estricta: Desconectar el canal al salir de la pestaña
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, user]);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const phone = user?.user_metadata?.phone || 'No registrado';

  const handleSaveClass = async (newClass: TrainingClass) => {
    // Actualización optimista local
    const tempId = newClass.id;
    setClasses((prev) => [newClass, ...prev]);

    // Persistencia en Supabase con payload estricto
    try {
      const payload = {
        title: newClass.title,
        time: newClass.time,
        capacity: newClass.capacity,
        date: newClass.date || new Date().toISOString().split('T')[0],
        workout_description: newClass.workoutDescription || '',
        exercises: Array.isArray(newClass.exercises) ? newClass.exercises : [],
      };

      const { data, error } = await supabase
        .from('classes')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error al guardar clase en Supabase:', error);
      } else if (data) {
        // Reemplazar ID temporal por el ID real de Supabase
        setClasses((prev) =>
          prev.map((c) =>
            c.id === tempId
              ? {
                  id: String(data.id),
                  title: data.title,
                  coach: data.coach || 'Coach',
                  date: data.date,
                  time: data.time,
                  capacity: Number(data.capacity),
                  bookedCount: Number(data.booked_count) || 0,
                  workoutDescription: data.workout_description || '',
                  exercises: Array.isArray(data.exercises) ? data.exercises : [],
                }
              : c
          )
        );
      }
    } catch (e) {
      console.error('Error al guardar clase en Supabase:', e);
    }
  };

  const handleUpdateClass = async (updatedClass: TrainingClass) => {
    // Actualización optimista local
    setClasses((prev) => prev.map((c) => (c.id === updatedClass.id ? updatedClass : c)));

    // Persistencia en Supabase con payload estricto
    try {
      const updatePayload = {
        title: updatedClass.title,
        time: updatedClass.time,
        capacity: updatedClass.capacity,
        date: updatedClass.date || new Date().toISOString().split('T')[0],
        workout_description: updatedClass.workoutDescription || '',
        exercises: Array.isArray(updatedClass.exercises) ? updatedClass.exercises : [],
      };

      const { error } = await supabase
        .from('classes')
        .update(updatePayload)
        .eq('id', updatedClass.id);

      if (error) {
        console.error('Error al actualizar clase en Supabase:', error);
      }
    } catch (e) {
      console.error('Error al actualizar clase en Supabase:', e);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    // Actualización optimista local
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    setBookedClassIds((prev) => prev.filter((id) => id !== classId));

    // Persistencia en Supabase
    try {
      await supabase.from('classes').delete().eq('id', classId);
    } catch (e) {
      console.error('Error al eliminar clase en Supabase:', e);
    }
  };

  const handleToggleBooking = async (classId: string) => {
    if (!isActive || !user) return;

    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) return;

    const isPast = isClassPast(targetClass.date, targetClass.time);
    const isAlreadyBooked = bookedClassIds.includes(classId);

    // Bloquear reservas en clases que ya finalizaron
    if (isPast && !isAlreadyBooked) {
      alert('Esta clase ya ha finalizado y no admite nuevas reservas.');
      return;
    }

    // Actualización optimista local
    if (isAlreadyBooked) {
      setBookedClassIds((prev) => prev.filter((id) => id !== classId));
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, bookedCount: Math.max(0, c.bookedCount - 1) } : c))
      );
      try {
        await supabase
          .from('class_bookings')
          .delete()
          .eq('class_id', classId)
          .eq('user_id', user.id);
        fetchUserMetrics();
      } catch (e) {
        console.error('Error al cancelar reserva en Supabase:', e);
      }
    } else {
      setBookedClassIds((prev) => [...prev, classId]);
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, bookedCount: c.bookedCount + 1 } : c))
      );
      try {
        await supabase.from('class_bookings').insert({
          class_id: classId,
          user_id: user.id,
        });
        fetchUserMetrics();
      } catch (e) {
        console.error('Error al crear reserva en Supabase:', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0B] text-white flex flex-col justify-between font-sans selection:bg-[#8E8C3A]/30 pb-20">
      {/* Header Superior con soporte Safe-Area para Notch / Dynamic Island */}
      <header className="sticky top-0 z-30 bg-[#0A0C0B] border-b border-zinc-900 px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3.5">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <VeltronLogo size="sm" />
          <p className="font-bebas text-lg tracking-wider text-[#B5B04E] uppercase leading-none">
            Training Club
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-md mx-auto w-full px-5 pt-5 space-y-5 flex-1">


        {/* Pestaña: INICIO (Exclusivo Atletas) */}
        {!isAdmin && activeTab === 'inicio' && (
          <section className="space-y-6">
            {/* Tarjeta de Historial / Récord Total de Entrenamientos */}
            <div className="bg-[#121514] border border-[#8E8C3A]/30 rounded-2xl p-4 relative overflow-hidden shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#8E8C3A]/15 border border-[#8E8C3A]/40 flex items-center justify-center text-[#B5B04E] shrink-0">
                  <BicepsFlexedIcon size={28} className="text-[#B5B04E]" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-barlow block mb-0.5">
                    HISTORIAL DE ENTRENAMIENTOS
                  </span>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bebas text-3xl font-bold text-white tracking-wide leading-none">
                      {completedClassesCount}
                    </span>
                    <span className="text-xs text-zinc-300 font-barlow">
                      {completedClassesCount === 1 ? 'clase completada en el club' : 'clases completadas en el club'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Días / Clases Agendadas por el Usuario */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bebas text-xl tracking-wide uppercase text-white leading-none">
                  Tus Clases Agendadas
                </h3>
              </div>

              {classes.filter((c) => bookedClassIds.includes(c.id)).length === 0 ? (
                <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-6 text-center space-y-3">
                  <p className="text-xs font-semibold text-zinc-300 font-barlow">
                    No tienes clases agendadas para hoy ni mañana.
                  </p>
                  <p className="text-[11px] text-zinc-500 font-barlow">
                    Explora los horarios disponibles y reserva tu cupo en sala.
                  </p>
                  <button
                    onClick={() => setActiveTab('clases')}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-sm tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <span>Ver Horarios Disponibles</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {classes
                    .filter((c) => bookedClassIds.includes(c.id))
                    .map((item) => {
                      const isPast = isClassPast(item.date, item.time);

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedClass(item)}
                          className={`border rounded-2xl p-4 transition-all cursor-pointer group shadow-sm backdrop-blur-sm ${
                            isPast
                              ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80'
                              : 'bg-[#8E8C3A]/[0.10] hover:bg-[#8E8C3A]/[0.16] border-[#8E8C3A]/40 hover:border-[#8E8C3A]/70'
                          }`}
                        >
                          <div className="flex justify-between items-center gap-2 mb-2">
                            <h4 className={`text-sm font-bold font-barlow truncate ${isPast ? 'text-zinc-400' : 'text-white group-hover:text-[#B5B04E] transition-colors'}`}>
                              {item.title}
                            </h4>
                            <span className="text-xs font-mono bg-black/60 border border-[#8E8C3A]/40 text-[#B5B04E] font-bold px-2.5 py-1 rounded-lg shrink-0">
                              {item.time}
                            </span>
                          </div>

                          <div className="pt-2.5 mt-2.5 border-t border-[#8E8C3A]/20 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded">
                              {isPast ? 'Finalizada' : 'Reservado'}
                            </span>

                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#B5B04E] transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Pestaña: CLASES (Atletas) o INICIO (Admin) */}
        {((!isAdmin && activeTab === 'clases') || (isAdmin && activeTab === 'inicio')) && (
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
                Programación de Clases
              </h2>
              <span className="text-[11px] text-zinc-400 font-barlow capitalize">
                {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>

            {/* Listado de Clases */}
            <div className="space-y-2.5 pt-1.5">
              {classes.length === 0 ? (
                <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-6 text-center text-zinc-400 font-barlow text-xs">
                  <p className="font-semibold text-zinc-300">No hay clases programadas para hoy.</p>
                  <p className="text-zinc-500 mt-1">El coach publicará los entrenamientos y horarios en breve.</p>
                </div>
              ) : (
                classes.map((item) => {
                  const isBooked = bookedClassIds.includes(item.id);
                  const isFull = (item.bookedCount || 0) >= item.capacity;
                  const isPast = isClassPast(item.date, item.time);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedClass(item)}
                      className={`border rounded-2xl p-4 transition-all cursor-pointer group shadow-sm backdrop-blur-sm ${
                        isPast
                          ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80'
                          : 'bg-[#8E8C3A]/[0.08] hover:bg-[#8E8C3A]/[0.13] border-[#8E8C3A]/30 hover:border-[#8E8C3A]/60'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0 pr-1">
                          <h3 className={`text-sm font-bold font-barlow truncate ${isPast ? 'text-zinc-400' : 'text-white group-hover:text-[#B5B04E] transition-colors'}`}>
                            {item.title}
                          </h3>
                        </div>
                        <span className="text-xs font-mono bg-black/50 border border-[#8E8C3A]/30 text-zinc-200 px-2 py-1 rounded-lg shrink-0">
                          {item.time}
                        </span>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-[#8E8C3A]/20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-barlow">
                          <span className="text-zinc-400 font-medium">Inscritos:</span>
                          <div className="flex items-baseline font-mono font-bold">
                            <span className={`text-base ${isPast ? 'text-zinc-500' : isFull ? 'text-red-400' : 'text-[#B5B04E]'}`}>
                              {item.bookedCount || 0}
                            </span>
                            <span className="text-xs text-zinc-400 ml-0.5 font-normal">
                              /{item.capacity}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPast && (
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800/80 border border-zinc-700 px-2 py-0.5 rounded">
                              Finalizada
                            </span>
                          )}

                          {isBooked && !isPast && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                              Reservado
                            </span>
                          )}

                          <span className="text-xs text-zinc-400 group-hover:text-white flex items-center gap-1 font-barlow font-medium">
                            <span>Ver</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Pestaña: CONFIGURACIÓN DE CLASES (Exclusivo Administrador) */}
        {isAdmin && activeTab === 'clases' && (
          <AdminClassesView
            classes={classes}
            onAddClass={handleSaveClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
            onSelectClass={setSelectedClass}
          />
        )}

        {/* Pestaña: CONTROL DE MEMBRESÍAS (Exclusivo Administrador) */}
        {isAdmin && activeTab === 'membresias' && (
          <AdminAccessView onMembershipUpdated={() => refreshMembership()} />
        )}

        {/* Pestaña: PERFIL */}
        {activeTab === 'perfil' && (
          <section className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-5 space-y-4">
            {/* Header con Avatar, Nombre y Badge */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-800/80">
              <div className="w-11 h-11 rounded-full bg-[#1A1F1B] border border-[#8E8C3A]/40 flex items-center justify-center text-[#B5B04E] font-bebas text-lg shrink-0">
                {fullName.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white font-barlow leading-tight">
                  {fullName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ${
                      isAdmin
                        ? 'bg-[#3A3A1A] border-[#8E8C3A]/50 text-[#B5B04E]'
                        : isActive
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                        : 'bg-red-950/60 border-red-800/60 text-red-400'
                    }`}
                  >
                    {isAdmin ? 'Administrador' : isActive ? 'Activo' : 'Vencido'}
                  </span>
                </div>
              </div>
            </div>


            {/* Datos de Contacto Unificados */}
            <div className="bg-[#0A0C0B] p-4 rounded-xl border border-zinc-800/80 space-y-3 font-barlow">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-0.5">
                  Correo
                </span>
                <span className="text-white font-medium text-xs break-all block">
                  {user?.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-0.5">
                  Teléfono
                </span>
                <span className="text-white font-medium text-xs block">
                  {phone}
                </span>
              </div>

              {!isAdmin && (
                <div className="pt-2.5 border-t border-zinc-800/60">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block mb-0.5">
                    Vencimiento
                  </span>
                  <span className={`font-mono font-bold text-xs block ${isActive ? 'text-zinc-200' : 'text-red-400'}`}>
                    {membership?.expires_at ? new Date(membership.expires_at).toLocaleDateString() : 'Sin fecha asignada'}
                  </span>
                  {!isActive && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/40">
                      <a
                        href="https://wa.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-xs tracking-wider rounded-lg transition-all"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Contactar Recepción por WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => signOut()}
              className="w-full mt-2 py-3 bg-red-950/20 hover:bg-red-950/35 border border-red-900/40 hover:border-red-500/50 text-red-400 hover:text-red-300 font-bebas text-base tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <LogoutCustomIcon className="w-4 h-4 text-red-400" />
              <span>Cerrar Sesión</span>
            </button>
          </section>
        )}
      </main>

      {/* Navegación Móvil Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0C0B]/95 backdrop-blur-lg border-t border-zinc-900 px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center gap-1 text-xs font-barlow font-medium transition-all active:scale-95 ${
              activeTab === 'inicio' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <House className="w-6 h-6 stroke-[2.2]" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('clases')}
            className={`flex flex-col items-center gap-1 text-xs font-barlow font-medium transition-all active:scale-95 ${
              activeTab === 'clases' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarCustomIcon className="w-6 h-6 stroke-[1.8]" />
            <span>Clases</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('membresias')}
              className={`flex flex-col items-center gap-1 text-xs font-barlow font-medium transition-all active:scale-95 ${
                activeTab === 'membresias' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AccesosCustomIcon className="w-6 h-6" />
              <span>Membresías</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center gap-1 text-xs font-barlow font-medium transition-all active:scale-95 ${
              activeTab === 'perfil' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-6 h-6 stroke-[2.2]" />
            <span>Perfil</span>
          </button>
        </div>
      </nav>

      {/* Modales */}
      <AdminClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSaveClass={handleSaveClass}
      />

      <AdminMembershipsModal
        isOpen={isMembershipsModalOpen}
        onClose={() => setIsMembershipsModalOpen(false)}
        onMembershipUpdated={() => refreshMembership()}
      />

      <ClassDetailsModal
        isOpen={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        selectedClass={selectedClass}
        isActive={isActive}
        isAdmin={isAdmin}
        isBooked={Boolean(selectedClass && bookedClassIds.includes(selectedClass.id))}
        onToggleBooking={handleToggleBooking}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route element={<Gatekeeper />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}