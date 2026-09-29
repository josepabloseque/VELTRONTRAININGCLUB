import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalDateString } from '../../lib/dateUtils';

export interface CalendarProps {
  selected?: string; // Formato YYYY-MM-DD
  onSelect?: (dateStr: string, date: Date) => void;
  minDate?: string; // Formato YYYY-MM-DD (fechas anteriores deshabilitadas)
  className?: string;
}

const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS_ES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  minDate,
  className = '',
}) => {
  const todayStr = getLocalDateString();
  const initialDate = selected ? new Date(selected + 'T00:00:00') : new Date();

  // Estado del mes y año que se está visualizando
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-11

  // Si cambia la fecha seleccionada externamente, sincronizar mes y año
  useEffect(() => {
    if (selected) {
      const parts = selected.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setCurrentYear(parts[0]);
        setCurrentMonth(parts[1] - 1);
      }
    }
  }, [selected]);

  // Navegar al mes anterior
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  // Navegar al mes siguiente
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Cantidad de días en el mes actual (incluyendo febrero bisiesto)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Offset del primer día del mes (0 = Lunes, ..., 6 = Domingo)
  const firstDayWeekIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  // Lista de días del mes
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Formato YYYY-MM-DD para un día dado
  const formatDateStr = (day: number): string => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  return (
    <div
      className={`w-full max-w-md mx-auto bg-[#0A0C0B] border border-zinc-800 rounded-2xl p-4 sm:p-5 select-none ${className}`}
    >
      {/* Encabezado: Flecha Izq, Mes (centro arriba) + Año (centro abajo), Flecha Der */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Mes anterior"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center justify-center">
          <span className="font-barlow font-bold text-base sm:text-lg text-white capitalize leading-tight">
            {MONTH_NAMES_ES[currentMonth]}
          </span>
          <span className="font-mono text-xs text-[#B5B04E] font-bold leading-none mt-1">
            {currentYear}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Mes siguiente"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Días de la semana (L M M J V S D) */}
      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
        {WEEKDAYS_ES.map((wd, index) => (
          <div
            key={index}
            className="text-xs font-barlow font-bold text-zinc-400 py-1 uppercase tracking-wider"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días del mes */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {/* Espacios vacíos de offset antes del primer día */}
        {Array.from({ length: firstDayWeekIndex }).map((_, index) => (
          <div key={`offset-${index}`} className="h-10 sm:h-11 w-full" />
        ))}

        {/* Días pertenecientes únicamente a este mes */}
        {days.map((day) => {
          const dateStr = formatDateStr(day);
          const isSelected = selected === dateStr;
          const isToday = todayStr === dateStr;
          const isPast = minDate ? dateStr < minDate : false;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              onClick={() => {
                if (!isPast && onSelect) {
                  onSelect(dateStr, new Date(currentYear, currentMonth, day));
                }
              }}
              className={`relative h-10 sm:h-11 w-full flex items-center justify-center rounded-xl text-sm font-mono transition-all ${
                isSelected
                  ? 'bg-[#8E8C3A] text-black font-bold shadow-[0_0_12px_rgba(142,140,58,0.4)] scale-105 z-10'
                  : isPast
                  ? 'text-zinc-600 cursor-not-allowed opacity-40'
                  : isToday
                  ? 'text-[#B5B04E] font-bold border border-[#8E8C3A]/50 bg-[#8E8C3A]/10'
                  : 'text-zinc-200 hover:bg-zinc-800/80 hover:text-white'
              }`}
            >
              <span className="leading-none">{day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
