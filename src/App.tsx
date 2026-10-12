import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { Gatekeeper } from './components/Gatekeeper';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { VeltronLogo } from './components/VeltronLogo';

// Carga perezosa protegida contra fallos de despliegue y desincronización de chunks
const Welcome = lazyWithRetry(() => import('./pages/Welcome').then((m) => ({ default: m.Welcome })));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword })));
const Terms = lazyWithRetry(() => import('./pages/Terms').then((m) => ({ default: m.Terms })));
import { AdminClassModal } from './components/AdminClassModal';
import { AdminAccessView } from './components/AdminAccessView';
import { AdminClassesView } from './components/AdminClassesView';
import { AdminHomeView } from './components/AdminHomeView';
import { ClassDetailsModal } from './components/ClassDetailsModal';
import { EditProfileModal } from './components/EditProfileModal';
import type { TrainingClass } from './types/database';
import { 
  User, 
  House, 
  ChevronRight,
  Plus
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

// Custom Notification Bell Icon
const NotificationBellCustomIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" 
    />
  </svg>
);

import { getLocalDateString, isClassPast, compareClassesChronological } from './lib/dateUtils';


// Panel principal de la plataforma
const Dashboard: React.FC = () => {
  const { membership, user, isActive, isAdmin, signOut, refreshMembership } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'clases' | 'membresias' | 'perfil'>('inicio');

  // Al cambiar de pestaña principal, posicionar la nueva vista arriba del todo de forma instantánea
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Modales
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TrainingClass | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Fecha seleccionada para el filtro de clases de usuarios
  const [selectedClassDate, setSelectedClassDate] = useState<string>(getLocalDateString());

  // Generación de tira horizontal de los próximos 14 días
  const classStripDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const dateStr = getLocalDateString(d);
      const isToday = i === 0;
      const isTomorrow = i === 1;

      days.push({
        dateStr,
        dayNumber: d.getDate(),
        dayName: dayNames[d.getDay()],
        isToday,
        isTomorrow,
        formattedDisplay: d.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      });
    }
    return days;
  }, []);

  // Clases registradas (100% dinámicas desde Supabase)
  const [classes, setClasses] = useState<TrainingClass[]>([]);

  // Reservas del usuario actual (100% dinámicas desde Supabase)
  const [bookedClassIds, setBookedClassIds] = useState<string[]>([]);

  const [completedClassesCount, setCompletedClassesCount] = useState<number>(0);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
  const bookingInProgressRef = useRef<string | null>(null);
  const lastActionTimeRef = useRef<number>(0);

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
          capacity: Number(item.capacity) || 14,
          bookedCount: Number(item.booked_count) || 0,
        }));
        const sorted = mapped.slice().sort(compareClassesChronological);
        setClasses(sorted);
        setSelectedClass((prev) => {
          if (!prev) return null;
          // Si el usuario tiene una acción local activa en esta clase, proteger el número optimista
          if (bookingInProgressRef.current === prev.id) return prev;
          const fresh = sorted.find((c) => c.id === prev.id);
          return fresh ? { ...prev, bookedCount: fresh.bookedCount } : prev;
        });
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
          .map((b: any) => {
            if (Array.isArray(b.classes)) {
              return b.classes[0]?.date;
            }
            return b.classes?.date;
          })
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

  // Cronómetro interno para auto-actualizar clases pasadas cada 30 segundos
  const [, setMinuteTicker] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setMinuteTicker((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // 1. CARGA INICIAL INMEDIATA AL MONTAR:
  // Garantiza que la vista de Inicio (y cualquier pestaña de entrada) tenga los datos cargados desde el primer render
  useEffect(() => {
    fetchSupabaseClasses();
    fetchUserBookings();
    fetchUserMetrics();
  }, [user, isAdmin]);

  // 2. SUSCRIPCIÓN REALTIME OPTIMIZADA:
  useEffect(() => {
    if (activeTab === 'perfil') {
      fetchUserMetrics();
      fetchUserBookings();
      return;
    }

    if (activeTab !== 'clases' && activeTab !== 'inicio') return;

    // Actualizar datos al entrar a la pestaña Inicio o Clases
    fetchSupabaseClasses();
    fetchUserBookings();
    fetchUserMetrics();

    let syncTimeout: any;
    const scheduleSync = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        fetchSupabaseClasses();
        fetchUserBookings();
        fetchUserMetrics();
      }, 300);
    };

    const channel = supabase
      .channel('realtime_classes_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes' },
        scheduleSync
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_bookings' },
        scheduleSync
      )
      .subscribe();

    // Limpieza estricta: Desconectar el canal al salir de la pestaña
    return () => {
      clearTimeout(syncTimeout);
      supabase.removeChannel(channel);
    };
  }, [activeTab, user]);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const phone = user?.user_metadata?.phone || 'No registrado';
  const birthDate = user?.user_metadata?.birth_date || '';

  const isProfileIncomplete = useMemo(() => {
    if (!user || isAdmin) return false;
    const rawPhone = user.user_metadata?.phone;
    const rawBirthDate = user.user_metadata?.birth_date;
    const hasPhone = rawPhone && rawPhone !== 'No registrado' && String(rawPhone).trim().length >= 8;
    const hasBirthDate = rawBirthDate && rawBirthDate !== 'No registrada' && String(rawBirthDate).trim().length > 0;
    return !hasPhone || !hasBirthDate;
  }, [user, isAdmin]);

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

  const formatBirthDate = (rawDate: string) => {
    if (!rawDate) return 'No registrada';
    try {
      const parts = rawDate.split('-');
      if (parts.length < 3) return rawDate;
      const [y, m, d] = parts.map(Number);
      if (!y || !m || !d) return rawDate;
      
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return rawDate;
    }
  };

  const handleSaveClass = async (newClass: TrainingClass) => {
    try {
      const payload = {
        title: newClass.title,
        time: newClass.time,
        capacity: newClass.capacity,
        date: newClass.date || getLocalDateString(),
      };

      const { data, error } = await supabase
        .from('classes')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error al guardar clase en Supabase:', error);
      } else if (data) {
        await fetchSupabaseClasses();
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
    const now = Date.now();
    // Protección contra doble-clic o spam rápido (mínimo 600ms entre acciones consecutivas)
    if (now - lastActionTimeRef.current < 600) return;
    if (!isActive || !user || isBookingLoading || bookingInProgressRef.current) return;

    lastActionTimeRef.current = now;
    bookingInProgressRef.current = classId;
    setIsBookingLoading(true);

    const targetClass = classes.find((c) => c.id === classId);
    if (!targetClass) {
      setIsBookingLoading(false);
      bookingInProgressRef.current = null;
      return;
    }

    const isPast = isClassPast(targetClass.date, targetClass.time);
    const isAlreadyBooked = bookedClassIds.includes(classId);

    // Bloquear reservas en clases que ya finalizaron
    if (isPast && !isAlreadyBooked) {
      setIsBookingLoading(false);
      bookingInProgressRef.current = null;
      alert('Esta clase ya ha finalizado y no admite nuevas reservas.');
      return;
    }

    // Regla de Negocio: Validar que el usuario no tenga ya otra clase activa/pendiente agendada en la misma fecha
    if (!isAlreadyBooked) {
      const alreadyHasActiveBookingOnDate = classes.some(
        (c) =>
          c.id !== classId &&
          bookedClassIds.includes(c.id) &&
          c.date === targetClass.date &&
          !isClassPast(c.date, c.time)
      );

      if (alreadyHasActiveBookingOnDate) {
        setIsBookingLoading(false);
        bookingInProgressRef.current = null;
        alert('Ya tienes una clase activa reservada para este día. Debes cancelar tu reserva actual si deseas agendar este horario.');
        return;
      }
    }

    // Actualización optimista local
    if (isAlreadyBooked) {
      const nextBookedIds = bookedClassIds.filter((id) => id !== classId);
      setBookedClassIds(nextBookedIds);
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, bookedCount: Math.max(0, c.bookedCount - 1) } : c))
      );
      setSelectedClass((prev) =>
        prev && prev.id === classId
          ? { ...prev, bookedCount: Math.max(0, prev.bookedCount - 1) }
          : prev
      );
      setBookedDates((prev) => {
        const hasOtherOnDate = classes.some(
          (c) => c.id !== classId && nextBookedIds.includes(c.id) && c.date === targetClass.date
        );
        return hasOtherOnDate ? prev : prev.filter((d) => d !== targetClass.date);
      });

      try {
        await cancelClassBooking(classId, user.id);
        fetchUserMetrics();
        fetchUserBookings();
      } catch (e: any) {
        console.error('Error al cancelar reserva en Supabase:', e);
        // Rollback
        setBookedClassIds((prev) => [...prev, classId]);
        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? { ...c, bookedCount: c.bookedCount + 1 } : c))
        );
        setSelectedClass((prev) =>
          prev && prev.id === classId
            ? { ...prev, bookedCount: prev.bookedCount + 1 }
            : prev
        );
        fetchSupabaseClasses();
        fetchUserBookings();
        alert(e.message || 'No fue posible cancelar la reserva.');
      } finally {
        setIsBookingLoading(false);
        lastActionTimeRef.current = Date.now();
        setTimeout(() => {
          bookingInProgressRef.current = null;
        }, 300);
      }
    } else {
      setBookedClassIds((prev) => [...prev, classId]);
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, bookedCount: c.bookedCount + 1 } : c))
      );
      setSelectedClass((prev) =>
        prev && prev.id === classId
          ? { ...prev, bookedCount: prev.bookedCount + 1 }
          : prev
      );
      setBookedDates((prev) => Array.from(new Set([...prev, targetClass.date])));

      try {
        await reserveClass(classId);
        fetchUserMetrics();
        fetchUserBookings();
      } catch (e: any) {
        console.error('Error al reservar clase con RPC:', e);
        // Rollback
        setBookedClassIds((prev) => prev.filter((id) => id !== classId));
        setClasses((prev) =>
          prev.map((c) => (c.id === classId ? { ...c, bookedCount: Math.max(0, c.bookedCount - 1) } : c))
        );
        setSelectedClass((prev) =>
          prev && prev.id === classId
            ? { ...prev, bookedCount: Math.max(0, prev.bookedCount - 1) }
            : prev
        );
        fetchSupabaseClasses();
        fetchUserBookings();
        alert(e.message || 'No fue posible reservar el cupo.');
      } finally {
        setIsBookingLoading(false);
        lastActionTimeRef.current = Date.now();
        setTimeout(() => {
          bookingInProgressRef.current = null;
        }, 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0B] text-white flex flex-col font-sans selection:bg-[#8E8C3A]/30 pb-28 sm:pb-32">
      {/* Header Superior Fijo con soporte Safe-Area para Notch / Dynamic Island */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0C0B] border-b border-zinc-900 px-5 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3.5 before:content-[''] before:fixed before:-top-24 before:left-0 before:right-0 before:h-24 before:bg-[#0A0C0B] before:pointer-events-none">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <VeltronLogo size="sm" />
          <p className="font-bebas text-lg tracking-wider text-[#B5B04E] uppercase leading-none">
            Training Club
          </p>
        </div>
      </header>
      {/* Espaciador exacto para mantener el flujo idéntico al píxel */}
      <div className="pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3.5 border-b border-transparent pointer-events-none select-none shrink-0" aria-hidden="true">
        <div className="h-8" />
      </div>

      {/* Contenido Principal con espacio de desplazamiento inferior completo */}
      <main className="max-w-md mx-auto w-full px-5 pt-7 sm:pt-8 pb-6 space-y-6">


        {/* Pestaña: INICIO (Exclusivo Atletas) */}
        {!isAdmin && activeTab === 'inicio' && (
          <section className="space-y-5 animate-in fade-in duration-200">
            {/* Aviso No Invasivo: Completar Información de Perfil */}
            {isProfileIncomplete && (
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full bg-[#121514] border border-[#8E8C3A]/30 hover:border-[#8E8C3A]/70 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] group shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#0A0C0B] border border-[#8E8C3A]/40 text-[#B5B04E] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <NotificationBellCustomIcon className="w-5 h-5 text-[#B5B04E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-white font-barlow tracking-wide leading-tight">
                      Aún hace falta completar información
                    </p>
                    <p className="text-[10px] text-zinc-400 font-barlow mt-0.5">
                      Toca aquí para registrar tu teléfono y fecha de nacimiento
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-zinc-400 group-hover:text-[#B5B04E] transition-colors shrink-0 font-barlow text-xs font-medium">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            )}

            {/* Tarjeta 1: Asistencia Semanal / Racha */}
            {(() => {
              const now = new Date();
              const currentDay = now.getDay();
              // Si es domingo (0), apunta al lunes siguiente (+1 día) para iniciar la nueva semana
              const diffToMonday = currentDay === 0 ? 1 : 1 - currentDay;
              const monday = new Date(now);
              monday.setDate(now.getDate() + diffToMonday);

              // Determinar si hay clases programadas o reservas en sábado para esta semana
              const saturdayDate = new Date(monday);
              saturdayDate.setDate(monday.getDate() + 5);
              const saturdayDateStr = getLocalDateString(saturdayDate);
              const hasSaturdayClass = classes.some((c) => c.date === saturdayDateStr) || bookedDates.includes(saturdayDateStr);

              const baseDays = [
                { label: 'LUN', full: 'Lunes' },
                { label: 'MAR', full: 'Martes' },
                { label: 'MIÉ', full: 'Miércoles' },
                { label: 'JUE', full: 'Jueves' },
                { label: 'VIE', full: 'Viernes' },
              ];

              if (hasSaturdayClass) {
                baseDays.push({ label: 'SÁB', full: 'Sábado' });
              }

              const weekDays = baseDays.map((item, idx) => {
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
                <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-4 shadow-md space-y-3 font-barlow">
                  <div className="pb-1 border-b border-zinc-800/60">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#B5B04E] font-barlow">
                      Asistencia Semanal
                    </span>
                  </div>

                  {/* Bloques de días (5 o 6 columnas según haya actividad sabatina) */}
                  <div className={`grid gap-1.5 sm:gap-2 ${hasSaturdayClass ? 'grid-cols-6' : 'grid-cols-5'}`}>
                    {weekDays.map((day) => {
                      const isBooked = activeBookedDates.includes(day.dateStr);

                      return (
                        <div
                          key={day.dateStr}
                          className={`flex flex-col items-center justify-center py-3.5 px-1.5 rounded-xl border transition-all ${
                            isBooked
                              ? 'bg-[#121514] border-zinc-800 border-b-[3.5px] border-b-[#8E8C3A] shadow-sm'
                              : day.isToday
                              ? 'bg-zinc-900/60 border-zinc-800'
                              : 'bg-[#0A0C0B] border-zinc-800/80'
                          }`}
                        >
                          <span className={`text-[11px] font-bold tracking-wider font-barlow ${
                            isBooked ? 'text-zinc-300' : day.isToday ? 'text-zinc-400' : 'text-zinc-600'
                          }`}>
                            {day.label}
                          </span>
                          <span className={`font-mono text-base font-bold mt-1.5 leading-none ${
                            isBooked ? 'text-white' : day.isToday ? 'text-zinc-200' : 'text-zinc-600'
                          }`}>
                            {day.dayNumber}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
          })()}

            {/* Días / Clases Agendadas por el Usuario */}
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between items-center px-0.5">
                <h3 className="font-bebas text-base tracking-wider uppercase text-[#B5B04E] leading-none">
                  Clases Agendadas
                </h3>
              </div>

              {(() => {
                const todayStr = getLocalDateString();
                const bookedClassesList = classes
                  .filter((c) => bookedClassIds.includes(c.id) && !isClassPast(c.date, c.time))
                  .slice()
                  .sort(compareClassesChronological);

                if (bookedClassesList.length === 0) {
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveTab('clases')}
                      className="w-full border border-dashed border-zinc-800 hover:border-[#8E8C3A]/50 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-all group active:scale-[0.99]"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-[#B5B04E] group-hover:scale-110 group-hover:border-[#8E8C3A]/60 group-hover:bg-[#8E8C3A]/15 transition-all shadow-inner">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-[#B5B04E] transition-colors font-barlow block">
                          Agendar Clase
                        </span>
                        <span className="text-[11px] text-zinc-500 font-barlow block">
                          Ir a la pestaña de Clases para agendar
                        </span>
                      </div>
                    </button>
                  );
                }

                return (
                  <div className="space-y-3">
                    {bookedClassesList.map((item) => {
                      const isToday = item.date === todayStr;

                      let dateBadge = 'Hoy';
                      if (!isToday) {
                        try {
                          const [y, m, d] = item.date.split('-').map(Number);
                          const dateObj = new Date(y, m - 1, d);
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          if (item.date === getLocalDateString(tomorrow)) {
                            dateBadge = 'Mañana';
                          } else {
                            const weekday = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').trim();
                            const month = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').trim();
                            const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
                            const capMonth = month.charAt(0).toUpperCase() + month.slice(1);
                            dateBadge = `${capWeekday} ${d} ${capMonth}`;
                          }
                        } catch {
                          dateBadge = item.date;
                        }
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedClass(item)}
                          className="bg-[#121514] hover:bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0 pr-1">
                              <h4 className="text-sm font-semibold font-barlow tracking-wide truncate text-zinc-200 group-hover:text-white transition-colors">
                                {item.title}
                              </h4>
                            </div>
                            <span className="text-xs font-mono bg-[#0A0C0B] border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg shrink-0">
                              {item.time}
                            </span>
                          </div>

                          <div className="pt-2.5 mt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                            <span className="text-xs font-barlow font-medium text-zinc-400">
                              {dateBadge}
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="text-xs flex items-center gap-1 font-barlow font-medium text-zinc-400 group-hover:text-white transition-colors">
                                <span>Ver</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* Pestaña: INICIO (Exclusivo Administrador) */}
        {isAdmin && activeTab === 'inicio' && (
          <AdminHomeView
            classes={classes}
            onSelectClass={setSelectedClass}
            onNavigateToClasses={() => setActiveTab('clases')}
          />
        )}

        {/* Pestaña: CLASES (Exclusivo Atletas / Usuarios) */}
        {!isAdmin && activeTab === 'clases' && (() => {
          const dayClasses = classes
            .filter((item) => item.date === selectedClassDate)
            .slice()
            .sort(compareClassesChronological);
          
          const freeClasses = dayClasses.filter((c) => c.title.toLowerCase().includes('libre') || (c.capacity || 0) >= 900);
          const guidedClasses = dayClasses.filter((c) => !c.title.toLowerCase().includes('libre') && (c.capacity || 0) < 900);

          return (
            <section className="space-y-3.5 animate-in fade-in duration-200">
              {/* Tira Horizontal de Días (Próximos 14 Días) - Ahora en la parte superior sin cabecera redundante */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none no-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {classStripDays.map((day) => {
                  const isSelected = selectedClassDate === day.dateStr;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => setSelectedClassDate(day.dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[56px] py-2.5 px-1.5 rounded-2xl border transition-all shrink-0 snap-start active:scale-95 select-none ${
                        isSelected
                          ? 'bg-[#8E8C3A] border-[#8E8C3A] text-black shadow-md font-bold'
                          : day.isToday
                          ? 'bg-[#121514] border-zinc-700 text-white hover:border-zinc-600'
                          : 'bg-[#111413] border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold font-barlow tracking-wider ${
                          isSelected ? 'text-black' : day.isToday ? 'text-[#B5B04E]' : 'text-zinc-500'
                        }`}
                      >
                        {day.isToday ? 'HOY' : day.dayName}
                      </span>

                      <span
                        className={`font-mono text-base font-bold mt-0.5 leading-none ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contenido del Día Seleccionado */}
              {dayClasses.length === 0 ? (
                <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-6 text-center font-barlow">
                  <p className="text-xs text-zinc-500 font-medium">
                    No hay actividades programadas para este día.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-0.5">
                  {/* Grid de 2 Columnas para Horario Libre (si existe en la fecha) */}
                  {freeClasses.length > 0 && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {freeClasses.map((item) => {
                        const isPast = isClassPast(item.date, item.time);
                        const isBooked = bookedClassIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedClass(item)}
                            className={`border rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer group shadow-sm flex flex-col justify-between ${
                              isPast
                                ? 'bg-zinc-900/30 border-zinc-800/60 opacity-60'
                                : isBooked
                                ? 'bg-[#121514] border-zinc-800 border-l-[3.5px] border-l-[#8E8C3A] hover:border-zinc-700 hover:border-l-[#8E8C3A]'
                                : 'bg-[#121514] border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <h3 className={`text-xs font-semibold font-barlow tracking-wide truncate ${isPast ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                                {item.title}
                              </h3>
                              <ChevronRight className="w-3.5 h-3.5 transition-colors shrink-0 text-zinc-500 group-hover:text-white" />
                            </div>

                            <div>
                              <span className="text-[11px] sm:text-xs font-mono font-semibold px-1.5 py-1 rounded-lg block text-center whitespace-nowrap tracking-tight bg-[#0A0C0B] border border-zinc-800 text-zinc-200">
                                {item.time}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Listado Vertical de Clases Dirigidas */}
                  {guidedClasses.length > 0 && (
                    <div className="space-y-2.5">
                      {guidedClasses.map((item) => {
                        const isBooked = bookedClassIds.includes(item.id);
                        const isFull = (item.bookedCount || 0) >= item.capacity;
                        const isPast = isClassPast(item.date, item.time);

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedClass(item)}
                            className={`border rounded-2xl p-4 transition-all cursor-pointer group shadow-sm backdrop-blur-sm ${
                              isPast
                                ? 'bg-zinc-900/30 border-zinc-800/60 opacity-60'
                                : isBooked
                                ? 'bg-[#121514] border-zinc-800 border-l-[3.5px] border-l-[#8E8C3A] hover:border-zinc-700 hover:border-l-[#8E8C3A]'
                                : 'bg-[#121514] border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div className="flex-1 min-w-0 pr-1">
                                <h3 className={`text-sm font-semibold font-barlow tracking-wide truncate ${
                                  isPast ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white transition-colors'
                                }`}>
                                  {item.title}
                                </h3>
                              </div>
                              <span className="text-xs font-mono px-2.5 py-1 rounded-lg shrink-0 bg-[#0A0C0B] border border-zinc-800 text-zinc-300">
                                {item.time}
                              </span>
                            </div>

                            <div className="pt-2.5 mt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-barlow">
                                {isPast ? (
                                  <span className="font-medium text-zinc-500">
                                    Finalizada
                                  </span>
                                ) : isFull && !isBooked ? (
                                  <span className="font-bold text-red-400">
                                    Clase Llena
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs flex items-center gap-1 font-barlow font-medium text-zinc-400 group-hover:text-white transition-colors">
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
              )}
            </section>
          );
        })()}

        {/* Pestaña: CONFIGURACIÓN DE CLASES (Exclusivo Administrador) */}
        {isAdmin && activeTab === 'clases' && (
          <AdminClassesView
            classes={classes}
            onAddClass={handleSaveClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
          />
        )}

        {/* Pestaña: CONTROL DE MEMBRESÍAS (Exclusivo Administrador) */}
        {isAdmin && activeTab === 'membresias' && (
          <AdminAccessView onMembershipUpdated={() => refreshMembership()} />
        )}

        {/* Pestaña: PERFIL */}
        {activeTab === 'perfil' && (
          <section className="space-y-4 animate-in fade-in duration-200">
            {/* Tarjeta Principal de Atleta: Identidad + Métricas/Estado */}
            <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl shadow-md overflow-hidden">
              {/* Header: Avatar, Nombre y Botón de Edición */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A1F1B] to-[#121514] border border-[#8E8C3A]/50 flex items-center justify-center text-[#B5B04E] font-bebas text-xl shrink-0 shadow-inner select-none">
                    {fullName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-white font-barlow leading-none truncate">
                        {fullName}
                      </h3>
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => setIsEditProfileOpen(true)}
                          className="inline-flex items-center justify-center p-1 rounded-lg text-zinc-400 hover:text-[#B5B04E] hover:bg-zinc-800/60 transition-colors shrink-0"
                          title="Editar datos de contacto"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.6"
                            stroke="currentColor"
                            className="w-[18px] h-[18px]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subsección: Métricas de Entrenamiento y Estado de Membresía (Solo Atletas) */}
              {!isAdmin && (
                <div className="border-t border-zinc-800/80 p-4 grid grid-cols-2 divide-x divide-zinc-800/80 bg-zinc-950/30">
                  {/* Columna 1: Clases completadas */}
                  <div className="pr-4 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-barlow">
                      Clases Completadas
                    </span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="font-bebas text-2xl sm:text-3xl text-[#B5B04E] leading-none">
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
                    <div className="mt-2">
                      <span className={`font-mono text-sm font-bold block leading-none ${isActive ? 'text-zinc-100' : 'text-red-400'}`}>
                        {isAdmin
                          ? 'Ilimitado'
                          : membership?.expires_at
                          ? new Date(membership.expires_at).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : 'Sin fecha'}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block mt-1 ${isAdmin ? 'text-[#B5B04E]' : isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isAdmin ? 'Administrador' : isActive ? 'Activo' : 'Vencido'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sección: Información de la Cuenta */}
            <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-4 shadow-md space-y-3 font-barlow">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block pb-1 border-b border-zinc-800/60">
                {isAdmin ? 'Cuenta Administrador' : 'Información de la Cuenta'}
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

                {!isAdmin && (
                  <div className="pt-2.5 border-t border-zinc-800/40">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">
                      Fecha de Nacimiento
                    </span>
                    <span className="text-white font-medium text-xs block">
                      {formatBirthDate(birthDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canales Oficiales - Barra Unificada Dividida */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-barlow px-1 block">
                Canales Oficiales
              </span>
              <div className="flex items-center rounded-xl bg-[#121514] border border-zinc-800/80 divide-x divide-zinc-800/80 overflow-hidden shadow-sm">
                <a
                  href="https://www.instagram.com/veltron_trainingclub?utm_source=ig_web_button_share_sheet&vrfl=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-3 text-zinc-300 select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
                  aria-label="Instagram de Veltron Training Club"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-4 h-4 fill-current text-zinc-400 shrink-0"
                  >
                    <path d="M224.3 141a115 115 0 1 0 -.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1 -.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1 -53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                  <span className="font-barlow text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Instagram
                  </span>
                </a>

                <a
                  href="https://chat.whatsapp.com/HRijARQOUNo0KKDL3v94ZB?mode=gi_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-3 text-zinc-300 select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
                  aria-label="WhatsApp de Veltron Training Club"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-4 h-4 fill-current text-zinc-400 shrink-0"
                  >
                    <path d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                  <span className="font-barlow text-xs font-bold uppercase tracking-wider text-zinc-300">
                    WhatsApp
                  </span>
                </a>
              </div>
            </div>

            {/* Enlace sutil y discreto para Cerrar Sesión */}
            <div className="pt-3 pb-1 text-center">
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
      </main>

      {/* Navegación Móvil Inferior Táctica y Ergonómica (Estándar Nativo iOS/Android) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0C0B]/95 backdrop-blur-lg border-t border-zinc-900 px-2 pt-2 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)*0.65))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto flex items-stretch">
          <button
            type="button"
            onClick={() => setActiveTab('inicio')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 gap-1 transition-all active:scale-95 cursor-pointer rounded-xl select-none min-h-[50px] ${
              activeTab === 'inicio' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
            }`}
          >
            <House className={`w-6 h-6 ${activeTab === 'inicio' ? 'stroke-[2.5] text-[#B5B04E]' : 'stroke-[2]'}`} />
            <span className="text-xs font-barlow tracking-wider leading-none">Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clases')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 gap-1 transition-all active:scale-95 cursor-pointer rounded-xl select-none min-h-[50px] ${
              activeTab === 'clases' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
            }`}
          >
            <CalendarCustomIcon className={`w-6 h-6 ${activeTab === 'clases' ? 'stroke-[2.2] text-[#B5B04E]' : 'stroke-[1.8]'}`} />
            <span className="text-xs font-barlow tracking-wider leading-none">Clases</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('membresias')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 gap-1 transition-all active:scale-95 cursor-pointer rounded-xl select-none min-h-[50px] ${
                activeTab === 'membresias' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              <AccesosCustomIcon className={`w-6 h-6 ${activeTab === 'membresias' ? 'text-[#B5B04E]' : ''}`} />
              <span className="text-xs font-barlow tracking-wider leading-none">Membresías</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 gap-1 transition-all active:scale-95 cursor-pointer rounded-xl select-none min-h-[50px] ${
              activeTab === 'perfil' ? 'text-[#B5B04E] font-bold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
            }`}
          >
            <User className={`w-6 h-6 ${activeTab === 'perfil' ? 'stroke-[2.5] text-[#B5B04E]' : 'stroke-[2]'}`} />
            <span className="text-xs font-barlow tracking-wider leading-none">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Modales a nivel raíz */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialName={fullName}
        initialPhone={phone}
        initialBirthDate={birthDate}
      />

      <AdminClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSaveClass={handleSaveClass}
      />

      {(() => {
        const liveSelectedClass = selectedClass
          ? classes.find((c) => c.id === selectedClass.id) || selectedClass
          : null;

        return (
          <ClassDetailsModal
            isOpen={Boolean(liveSelectedClass)}
            onClose={() => setSelectedClass(null)}
            selectedClass={liveSelectedClass}
            isActive={isActive}
            isAdmin={isAdmin}
            isBooked={Boolean(liveSelectedClass && bookedClassIds.includes(liveSelectedClass.id))}
            hasOtherBookingOnDate={Boolean(
              liveSelectedClass &&
              !bookedClassIds.includes(liveSelectedClass.id) &&
              classes.some(
                (c) =>
                  c.id !== liveSelectedClass.id &&
                  bookedClassIds.includes(c.id) &&
                  c.date === liveSelectedClass.date &&
                  !isClassPast(c.date, c.time)
              )
            )}
            isBookingLoading={isBookingLoading}
            onToggleBooking={handleToggleBooking}
          />
        );
      })()}
    </div>
  );
};

const RouteFallback: React.FC = () => (
  <div className="min-h-screen bg-[#0A0C0B] flex items-center justify-center p-4">
    <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-[#8E8C3A] animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Navigate to="/welcome" replace />} />
            <Route path="/register" element={<Navigate to="/welcome" replace />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/recuperar-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/privacy" element={<Terms />} />
            <Route path="/privacidad" element={<Terms />} />
            <Route element={<Gatekeeper />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}