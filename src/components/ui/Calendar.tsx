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
      className={`w-full max-w-sm mx-auto bg-[#0A0C0B] border border-zinc-800 rounded-2xl p-3 sm:p-4 select-none ${className}`}
    >
      {/* Encabezado: Flecha Izq, Mes (centro arriba) + Año (centro abajo), Flecha Der */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Mes anterior"
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center justify-center">
          <span className="font-barlow font-bold text-sm text-white capitalize leading-tight">
            {MONTH_NAMES_ES[currentMonth]}
          </span>
          <span className="font-mono text-[11px] text-[#B5B04E] font-semibold leading-none mt-0.5">
            {currentYear}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Mes siguiente"
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Días de la semana (L M M J V S D) */}
      <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
        {WEEKDAYS_ES.map((wd, index) => (
          <div
            key={index}
            className="text-[11px] font-barlow font-semibold text-zinc-400 py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días del mes */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Espacios vacíos de offset antes del primer día */}
        {Array.from({ length: firstDayWeekIndex }).map((_, index) => (
          <div key={`offset-${index}`} className="h-8 w-full" />
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
              className={`relative h-8 w-full flex items-center justify-center rounded-lg text-xs font-mono transition-all ${
                isSelected
                  ? 'bg-[#8E8C3A] text-black font-bold shadow-[0_0_10px_rgba(142,140,58,0.4)] scale-105 z-10'
                  : isPast
                  ? 'text-zinc-600 cursor-not-allowed opacity-40'
                  : 'text-zinc-200 hover:bg-zinc-800/80 hover:text-white'
              }`}
            >
              <span>{day}</span>

              {/* Indicador de "Hoy" */}
              {isToday && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isSelected ? 'bg-black' : 'bg-[#B5B04E]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
