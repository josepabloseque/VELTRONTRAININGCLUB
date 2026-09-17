import React from 'react';
import { X, CheckCircle2, Lock, Clock, Users } from 'lucide-react';
import type { TrainingClass } from '../types/database';
import { isClassPast } from '../lib/dateUtils';

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: TrainingClass | null;
  isActive: boolean;
  isBooked: boolean;
  isAdmin?: boolean;
  onToggleBooking: (classId: string) => void;
}

const getTitleClass = (title: string) => {
  if (title.length > 34) return 'text-base sm:text-lg tracking-normal';
  if (title.length > 25) return 'text-lg sm:text-xl tracking-wide';
  if (title.length > 18) return 'text-xl sm:text-2xl tracking-wide';
  return 'text-2xl sm:text-3xl tracking-wide';
};

export const ClassDetailsModal: React.FC<ClassDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  isActive,
  isBooked,
  isAdmin = false,
  onToggleBooking,
}) => {
  if (!isOpen || !selectedClass) return null;

  const isPast = isClassPast(selectedClass.date, selectedClass.time);
  const isFull = (selectedClass.bookedCount || 0) >= selectedClass.capacity && !isBooked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
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
        <div className="mb-3.5 pr-8">
          <h2 className={`font-bebas ${getTitleClass(selectedClass.title)} uppercase text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis`}>
            {selectedClass.title}
          </h2>
        </div>

        {/* Micro-Badges Tácticos: Horario, Cupos y Estado */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Horario Micro-Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0C0B] border border-[#8E8C3A]/30 rounded-xl text-xs font-mono text-zinc-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#B5B04E]" />
            <span className="font-semibold tracking-wide">{selectedClass.time}</span>
          </div>

          {/* Cupos / Inscritos Micro-Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0C0B] border border-[#8E8C3A]/30 rounded-xl text-xs font-barlow text-zinc-300 shadow-sm">
            <Users className="w-3.5 h-3.5 text-[#B5B04E]" />
            <span className="text-[11px] uppercase font-bold text-zinc-400">Inscritos:</span>
            <span className={`font-mono font-bold ${(selectedClass.bookedCount || 0) >= selectedClass.capacity ? 'text-red-400' : 'text-[#B5B04E]'}`}>
              {selectedClass.bookedCount || 0}
            </span>
            <span className="text-zinc-500 font-mono">/{selectedClass.capacity}</span>
          </div>

          {/* Badge de Estado: Finalizada */}
          {isPast && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/80 border border-zinc-700 px-2.5 py-1 rounded-xl">
              Finalizada
            </span>
          )}
        </div>

        {/* Programación del Entreno / Descripción */}
        <div className="space-y-2 mb-5">
          <h3 className="font-bebas text-lg tracking-wider uppercase text-white leading-none">
            Programación del Entreno
          </h3>

          <div className="p-4 bg-[#0A0C0B] border border-zinc-800/80 rounded-xl text-xs text-zinc-200 font-barlow leading-relaxed whitespace-pre-line">
            {selectedClass.workoutDescription || 'La rutina y programación serán dirigidas directamente por el coach en sala.'}
          </div>
        </div>

        {/* Action button */}
        {isAdmin ? (
          <button
            onClick={onClose}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bebas text-base tracking-wider uppercase rounded-xl transition-all leading-none"
          >
            <span>Cerrar</span>
          </button>
        ) : isPast ? (
          <div className="w-full py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bebas text-base tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-not-allowed leading-none">
            <span>Clase Finalizada</span>
          </div>
        ) : isActive ? (
          <button
            onClick={() => onToggleBooking(selectedClass.id)}
            disabled={isFull && !isBooked}
            className={`w-full py-3.5 font-bebas text-lg tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 leading-none active:scale-[0.98] ${
              isBooked
                ? 'bg-red-950/80 border border-red-800 text-red-200 hover:bg-red-900'
                : isFull
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-[#8E8C3A] hover:bg-[#B5B04E] text-black shadow-[0_0_20px_rgba(142,140,58,0.25)]'
            }`}
          >
            {isBooked ? (
              <span>Cancelar Mi Reserva</span>
            ) : isFull ? (
              <span>Clase Llena (Sin cupos)</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirmar Mi Lugar</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-3 bg-[#16130D] border border-amber-500/30 rounded-xl flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-zinc-300 font-barlow">
              <span className="font-bold text-amber-400 block">Reserva Bloqueada</span>
              Contacta a recepción para activar tu membresía y reservar cupo.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
