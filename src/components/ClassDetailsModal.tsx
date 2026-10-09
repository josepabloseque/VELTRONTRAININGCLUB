import React, { useState, useEffect } from 'react';
import { X, Lock, Clock, Users } from 'lucide-react';
import type { TrainingClass } from '../types/database';
import { isClassPast, getLocalDateString } from '../lib/dateUtils';
import { fetchClassAttendees, type ClassAttendee } from '../services/bookings.service';

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: TrainingClass | null;
  isActive: boolean;
  isBooked: boolean;
  hasOtherBookingOnDate?: boolean;
  isAdmin?: boolean;
  onToggleBooking: (classId: string) => void;
}

const getTitleClass = (title: string) => {
  if (title.length > 34) return 'text-base sm:text-lg tracking-normal';
  if (title.length > 25) return 'text-lg sm:text-xl tracking-wide';
  if (title.length > 18) return 'text-xl sm:text-2xl tracking-wide';
  return 'text-2xl sm:text-3xl tracking-wide';
};

// Caché en memoria para carga instantánea sin flasheos ni saltos
const memoryAttendeesCache = new Map<string, ClassAttendee[]>();

export const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  isActive,
  isBooked,
  hasOtherBookingOnDate = false,
  isAdmin = false,
  onToggleBooking,
}) => {
  const [attendees, setAttendees] = useState<ClassAttendee[]>(() => {
    if (selectedClass && memoryAttendeesCache.has(selectedClass.id)) {
      return memoryAttendeesCache.get(selectedClass.id)!;
    }
    return [];
  });
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedClass && isAdmin) {
      const cached = memoryAttendeesCache.get(selectedClass.id);
      if (cached) {
        setAttendees(cached);
        setLoadingAttendees(false);
      } else {
        setLoadingAttendees(true);
      }

      fetchClassAttendees(selectedClass.id)
        .then((data) => {
          memoryAttendeesCache.set(selectedClass.id, data);
          setAttendees(data);
        })
        .catch(() => {
          if (!cached) setAttendees([]);
        })
        .finally(() => setLoadingAttendees(false));
    }
  }, [isOpen, selectedClass?.id, isAdmin]);

  if (!isOpen || !selectedClass) return null;

  const isFreeTraining = selectedClass.title.toLowerCase().includes('libre') || (selectedClass.capacity || 0) >= 900;
  const isPast = isClassPast(selectedClass.date, selectedClass.time);
  const isFull = !isFreeTraining && (selectedClass.bookedCount || 0) >= selectedClass.capacity && !isBooked;
  const todayStr = getLocalDateString();
  const isToday = selectedClass.date === todayStr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className="relative z-10 w-full max-w-md max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem)] overflow-y-auto overscroll-contain bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-5 sm:p-7 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Botón Cerrar (X) anclado a la esquina superior derecha */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-5 sm:top-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 transition-colors z-20 flex items-center justify-center cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header con Título */}
        <div className="mb-5 pr-10">
          <h2 className={`font-bebas ${getTitleClass(selectedClass.title)} uppercase text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis`}>
            {selectedClass.title}
          </h2>
        </div>

        {/* Micro-Badges Tácticos: Horario, Cupos y Estado */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          {/* Horario Micro-Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900/90 border border-zinc-800/80 rounded-xl text-xs font-mono text-zinc-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#B5B04E]" />
            <span className="font-semibold tracking-wide text-zinc-200">{selectedClass.time}</span>
          </div>

          {/* Cupos Micro-Badge solo para clases dirigidas */}
          {!isFreeTraining && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900/90 border border-zinc-800/80 rounded-xl text-xs font-mono text-zinc-300 shadow-sm">
              <Users className="w-3.5 h-3.5 text-[#B5B04E]" />
              <div className="flex items-center gap-1">
                <span className={`font-bold ${isFull ? 'text-red-400' : 'text-[#B5B04E]'}`}>
                  {selectedClass.bookedCount || 0}
                </span>
                <span className="text-zinc-400 font-normal">/ {selectedClass.capacity}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action button / Admin View */}
        {isAdmin ? (
          <div className="space-y-4">
            {/* Sección: Lista de Inscritos */}
            <div className="bg-[#0A0C0B] border border-zinc-800/80 rounded-2xl p-4 shadow-inner space-y-3 font-barlow">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-xs uppercase font-bold tracking-wider text-[#B5B04E]">
                  Lista de Inscritos
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {selectedClass.bookedCount || attendees.length}{!isFreeTraining ? ` / ${selectedClass.capacity}` : ''}
                </span>
              </div>

              {loadingAttendees && attendees.length === 0 ? (
                <div className="space-y-2 py-1">
                  <div className="h-10 bg-[#121514] border border-zinc-800/50 rounded-xl animate-pulse" />
                </div>
              ) : attendees.length === 0 ? (
                <div className="py-5 text-center text-xs text-zinc-500 font-barlow">
                  Aún no hay usuarios inscritos en esta clase.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.id || attendee.userId}
                      className="p-2.5 px-3.5 bg-[#121514] border border-zinc-800/80 rounded-xl flex items-center"
                    >
                      <span className="text-xs sm:text-sm font-medium text-zinc-200 truncate font-barlow">
                        {attendee.fullName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bebas text-base tracking-wider uppercase rounded-xl transition-all leading-none cursor-pointer active:scale-[0.99]"
            >
              <span>Cerrar</span>
            </button>
          </div>
        ) : isPast ? (
          <div className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bebas text-lg tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-not-allowed leading-none">
            <span>{isFreeTraining ? 'Horario Finalizado' : 'Clase Finalizada'}</span>
          </div>
        ) : isActive ? (
          <div className="space-y-2">
            {hasOtherBookingOnDate && !isBooked && (
              <div className="p-4 sm:p-5 bg-[#121514] border border-amber-500/20 rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300/80 shrink-0">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="w-5 h-5 text-amber-300/80"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-barlow font-normal leading-relaxed max-w-xs">
                  Ya tienes una clase agendada para este día. Cancélala primero si deseas reservar este horario.
                </p>
              </div>
            )}

            <button
              onClick={() => onToggleBooking(selectedClass.id)}
              disabled={(isFull && !isBooked) || (hasOtherBookingOnDate && !isBooked) || (!isToday && !isBooked)}
              className={`w-full py-4 font-bebas text-lg tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 leading-none active:scale-[0.98] ${
                isBooked
                  ? 'bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900/80 hover:text-white shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                  : !isToday
                  ? 'bg-zinc-900/90 text-zinc-500 border border-zinc-800/90 cursor-not-allowed'
                  : isFull
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : hasOtherBookingOnDate
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  : 'bg-[#8E8C3A] hover:bg-[#B5B04E] text-black shadow-[0_0_20px_rgba(142,140,58,0.25)]'
              }`}
            >
              {isBooked ? (
                <span>Cancelar Mi Reserva</span>
              ) : !isToday ? (
                <>
                  <Lock className="w-4 h-4 text-zinc-500 stroke-[2.2]" />
                  <span>Disponible el Día de la Clase</span>
                </>
              ) : isFull ? (
                <span>Clase Llena (Sin cupos)</span>
              ) : hasOtherBookingOnDate ? (
                <span>Límite Diario Alcanzado (1 clase/día)</span>
              ) : (
                <span>Confirmar Mi Lugar</span>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 bg-[#16130D] border border-amber-500/30 rounded-2xl flex items-center gap-4 shadow-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.6" 
              stroke="currentColor" 
              className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div className="space-y-0.5 font-barlow">
              <span className="font-bold text-amber-400 block text-sm sm:text-base leading-tight">
                Reserva Bloqueada
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Contacta a recepción para activar tu membresía y reservar cupo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
