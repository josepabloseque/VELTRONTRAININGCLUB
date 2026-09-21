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
import { EditProfileModal } from './components/EditProfileModal';
import type { TrainingClass } from './types/database';
import { 
  User, 
  House, 
  ChevronRight,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { reserveClass, cancelClassBooking } from './services/bookings.service';

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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
  const [bookedDates, setBookedDates] = useState<string[]>([]);

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
        .select('class_id, classes(date)')
        .eq('user_id', user.id);

      if (!error && data) {
        setBookedClassIds(data.map((b: any) => String(b.class_id)));
        const dates: string[] = data
          .map((b: any) => b.classes?.date)
          .filter(Boolean);
        setBookedDates(dates);
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

  const formatPhone = (rawPhone: string) => {
    if (!rawPhone || rawPhone === 'No registrado') return 'No registrado';
    const clean = rawPhone.replace(/\D/g, '');
    if (clean.length === 8) {
      return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    }
    if (clean.length === 11 && clean.startsWith('506')) {
      return `+506 ${clean.slice(3, 7)}-${clean.slice(7)}`;
    }
    return rawPhone;
  };

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
        await cancelClassBooking(classId, user.id);
        fetchUserMetrics();
        fetchSupabaseClasses();
      } catch (e: any) {
        console.error('Error al cancelar reserva en Supabase:', e);
        // Rollback
        setBookedClassIds((prev) => [...prev, classId]);
        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? { ...c, bookedCount: c.bookedCount + 1 } : c))
        );
        fetchSupabaseClasses();
        alert(e.message || 'No fue posible cancelar la reserva.');
      }
    } else {
      setBookedClassIds((prev) => [...prev, classId]);
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, bookedCount: c.bookedCount + 1 } : c))
      );
      try {
        await reserveClass(classId);
        fetchUserMetrics();
        fetchSupabaseClasses();
      } catch (e: any) {
        console.error('Error al reservar clase con RPC:', e);
        // Rollback
        setBookedClassIds((prev) => prev.filter((id) => id !== classId));
        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? { ...c, bookedCount: Math.max(0, c.bookedCount - 1) } : c))
        );
        fetchSupabaseClasses();
        alert(e.message || 'No fue posible reservar el cupo.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0B] text-white flex flex-col justify-between font-sans selection:bg-[#8E8C3A]/30 pb-20">
      {/* Header Superior con soporte Safe-Area para Notch / Dynamic Island */}
      <header className="sticky top-0 z-30 bg-[#0A0C0B] border-b border-zinc-900 px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3.5">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <VeltronLogo size="sm" />
          <p className="font-bebas text-lg tracking-wider text-[#B5B04E] uppercase leading-none">
            Training Club
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-md mx-auto w-full px-5 pt-7 sm:pt-8 space-y-6 flex-1">


        {/* Pestaña: INICIO (Exclusivo Atletas) */}
        {!isAdmin && activeTab === 'inicio' && (
          <section className="space-y-8">
            {/* Barra de Asistencia / Racha Semanal (Lunes a Viernes) */}
            {(() => {
              const now = new Date();
              const currentDay = now.getDay();
              // Si es domingo (0), apunta al lunes siguiente (+1 día) para iniciar la nueva semana
              const diffToMonday = currentDay === 0 ? 1 : 1 - currentDay;
              const monday = new Date(now);
              monday.setDate(now.getDate() + diffToMonday);

              const weekDays = [
                { label: 'LUN', full: 'Lunes' },
                { label: 'MAR', full: 'Martes' },
                { label: 'MIÉ', full: 'Miércoles' },
                { label: 'JUE', full: 'Jueves' },
                { label: 'VIE', full: 'Viernes' },
              ].map((item, idx) => {
                const d = new Date(monday);
                d.setDate(monday.getDate() + idx);
                const dateStr = getLocalDateString(d);
                return {
                  label: item.label,
                  full: item.full,
                  dateStr,
                  dayNumber: d.getDate(),
                  isToday: dateStr === getLocalDateString(now),
                };
              });

              const activeBookedDates = Array.from(
                new Set([
                  ...bookedDates,
                  ...classes.filter((c) => bookedClassIds.includes(c.id)).map((c) => c.date),
                ])
              );

              return (
                <div className="space-y-3">
                  <h3 className="font-bebas text-xl tracking-wide uppercase text-white leading-none">
                    Semana de Entrenamiento
                  </h3>
                  <div className="bg-[#121514] border border-[#8E8C3A]/30 rounded-2xl p-3.5 sm:p-4 shadow-md">
                    {/* Bloques de días LUN - MAR - MIÉ - JUE - VIE */}
                    <div className="grid grid-cols-5 gap-2">
                    {weekDays.map((day) => {
                      const isBooked = activeBookedDates.includes(day.dateStr);

                      return (
                        <div
                          key={day.dateStr}
                          className={`flex flex-col items-center justify-center py-3.5 sm:py-4 px-1 rounded-xl border transition-all ${
                            isBooked
                              ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : day.isToday
                              ? 'bg-zinc-900/90 border-[#8E8C3A]/60 text-zinc-300'
                              : 'bg-[#0A0C0B] border-zinc-800/80 text-zinc-500'
                          }`}
                        >
                          <span className={`text-[10px] font-bold tracking-wider font-barlow ${isBooked ? 'text-emerald-400' : day.isToday ? 'text-[#B5B04E]' : 'text-zinc-500'}`}>
                            {day.label}
                          </span>
                          <span className={`font-mono text-sm font-bold mt-1 ${isBooked ? 'text-white' : day.isToday ? 'text-zinc-200' : 'text-zinc-500'}`}>
                            {day.dayNumber}
                          </span>
                          <div className="mt-1.5 flex items-center justify-center">
                            {isBooked ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <div className={`w-1.5 h-1.5 rounded-full ${day.isToday ? 'bg-[#8E8C3A]' : 'bg-zinc-800'}`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

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
                <div className="space-y-3">
                  {classes
                    .filter((c) => bookedClassIds.includes(c.id))
                    .map((item) => {
                      const isPast = isClassPast(item.date, item.time);
                      const isFull = (item.bookedCount || 0) >= item.capacity;

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
                              <h4 className={`text-sm font-bold font-barlow truncate ${isPast ? 'text-zinc-400' : 'text-white group-hover:text-[#B5B04E] transition-colors'}`}>
                                {item.title}
                              </h4>
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
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded text-zinc-400 bg-zinc-800/80 border border-zinc-700">
                                  Finalizada
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
          <section className="min-h-[calc(100dvh-11.5rem)] flex flex-col justify-between pb-4 animate-in fade-in duration-200">
            {/* Bloque Superior: Header + Tarjetas */}
            <div className="space-y-4">
              {/* Header con Avatar, Nombre, Badge y Botón Sutil de Edición */}
              <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A1F1B] to-[#121514] border border-[#8E8C3A]/50 flex items-center justify-center text-[#B5B04E] font-bebas text-xl shrink-0 shadow-inner select-none">
                    {fullName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-barlow leading-tight truncate">
                        {fullName}
                      </h3>
                      {!isAdmin && (
                        <button
                          onClick={() => setIsEditProfileOpen(true)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-[#B5B04E] hover:bg-zinc-800/60 transition-colors"
                          title="Editar datos de contacto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="mt-1 flex items-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#3A3A1A] border-[#8E8C3A]/50 text-[#B5B04E] inline-flex items-center">
                          Administrador
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tarjeta Unificada de Métricas / Estado (Solo Atletas) */}
              {!isAdmin && (
                <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-4 shadow-md grid grid-cols-2 divide-x divide-zinc-800/80">
                  {/* Columna 1: Clases completadas */}
                  <div className="pr-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-barlow">
                      Clases Completadas
                    </span>
                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <span className="font-bebas text-3xl text-[#B5B04E] leading-none">
                        {completedClassesCount}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-400 font-barlow">
                        {completedClassesCount === 1 ? 'sesión' : 'sesiones'}
                      </span>
                    </div>
                  </div>

                  {/* Columna 2: Vencimiento de Membresía */}
                  <div className="pl-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-barlow">
                      Vencimiento
                    </span>
                    <div className="mt-2.5">
                      <span className={`font-mono text-sm font-bold block leading-none ${isActive ? 'text-zinc-100' : 'text-red-400'}`}>
                        {membership?.expires_at ? new Date(membership.expires_at).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin fecha'}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block mt-1.5 ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isActive ? 'Activo' : 'Vencido'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección: Información de la Cuenta */}
              <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-4 shadow-md space-y-3 font-barlow">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block pb-1 border-b border-zinc-800/60">
                  Información de la Cuenta
                </span>

                <div className="space-y-3 pt-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">
                      Correo Electrónico
                    </span>
                    <span className="text-white font-medium text-xs break-all block">
                      {user?.email}
                    </span>
                  </div>

                  {(!isAdmin || (phone && phone !== 'No registrado')) && (
                    <div className="pt-2.5 border-t border-zinc-800/40">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">
                        Teléfono de Contacto
                      </span>
                      <span className="text-white font-medium text-xs block font-mono">
                        {formatPhone(phone)}
                      </span>
                    </div>
                  )}

                  {!isActive && !isAdmin && (
                    <div className="pt-3 border-t border-zinc-800/60">
                      <a
                        href="https://wa.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Contactar Recepción por WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enlace sutil y discreto para Cerrar Sesión (Anclado al fondo útil) */}
            <div className="pt-6 pb-2 text-center">
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 py-2 px-4 text-zinc-500 hover:text-red-400 text-xs font-semibold font-barlow uppercase tracking-wider rounded-xl hover:bg-red-950/20 transition-all active:scale-95"
              >
                <LogoutCustomIcon className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </section>
        )}

        {/* Modal para editar perfil */}
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          initialName={fullName}
          initialPhone={phone}
        />
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