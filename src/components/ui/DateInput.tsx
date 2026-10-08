import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function isoToDisplayDate(iso: string): string {
  if (!iso) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
  const parts = iso.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y.length === 4 && m && d) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  return iso;
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS_ES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface DateInputProps {
  id?: string;
  value: string; // Formato esperado YYYY-MM-DD
  onChange: (isoValue: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  value,
  onChange,
  required = false,
  className = 'w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-3 pr-8 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal',
  placeholder = 'DD/MM/AAAA',
  minYear = 1920,
  maxYear = new Date().getFullYear(),
}) => {
  const [displayValue, setDisplayValue] = useState(() => isoToDisplayDate(value));
  const [isOpen, setIsOpen] = useState(false);

  // Inicializar año y mes de visualización (por defecto año 2000 para nacimiento de adultos)
  const parseYearMonth = (isoStr: string) => {
    if (isoStr && isoStr.includes('-')) {
      const parts = isoStr.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { year: parts[0], month: parts[1] - 1 };
      }
    }
    const currentYear = new Date().getFullYear();
    const defaultYear = Math.min(2000, currentYear);
    return { year: defaultYear, month: 0 };
  };

  const initialYM = parseYearMonth(value);
  const [viewYear, setViewYear] = useState(initialYM.year);
  const [viewMonth, setViewMonth] = useState(initialYM.month); // 0-11

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplayValue(isoToDisplayDate(value));
    if (value) {
      const ym = parseYearMonth(value);
      setViewYear(ym.year);
      setViewMonth(ym.month);
    }
  }, [value]);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Normaliza y valida una fecha flexible (ej. 10/5/2002, 1/5/2002, 10/05/2002)
  const tryParseFlexibleDate = (rawText: string): { iso: string; display: string } | null => {
    if (!rawText) return null;
    const clean = rawText.trim();
    
    // Si contiene separadores / o -
    const parts = clean.split(/[/.-]/);
    if (parts.length === 3) {
      const [dStr, mStr, yStr] = parts;
      const d = parseInt(dStr, 10);
      const m = parseInt(mStr, 10);
      const y = parseInt(yStr, 10);

      const currentYear = new Date().getFullYear();
      if (
        !isNaN(d) && !isNaN(m) && !isNaN(y) &&
        m >= 1 && m <= 12 &&
        y >= minYear && y <= currentYear
      ) {
        const daysInSelectedMonth = new Date(y, m, 0).getDate();
        if (d >= 1 && d <= daysInSelectedMonth) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const display = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
          return { iso, display };
        }
      }
    }

    // Si son solo dígitos continuos (ej. 10052002)
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length === 8) {
      const d = parseInt(digitsOnly.slice(0, 2), 10);
      const m = parseInt(digitsOnly.slice(2, 4), 10);
      const y = parseInt(digitsOnly.slice(4, 8), 10);
      const currentYear = new Date().getFullYear();

      if (
        m >= 1 && m <= 12 &&
        y >= minYear && y <= currentYear
      ) {
        const daysInSelectedMonth = new Date(y, m, 0).getDate();
        if (d >= 1 && d <= daysInSelectedMonth) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const display = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
          return { iso, display };
        }
      }
    }

    return null;
  };

  // Formatea automáticamente con barras separadoras DD/MM/AAAA y valida rangos lógicos
  const formatInputWithMask = (raw: string, prev: string): string => {
    // Si el usuario está borrando
    const isDeleting = raw.length < prev.length;

    // Si el usuario borró la barra directamente (ej. estaba en "19/" y ahora es "19")
    if (isDeleting && prev.endsWith('/') && !raw.endsWith('/')) {
      const digits = raw.replace(/\D/g, '');
      if (digits.length === 2) return digits.slice(0, 1);
      if (digits.length === 4) return `${digits.slice(0, 2)}/${digits.slice(2, 3)}`;
      return raw;
    }

    // Extraer únicamente los dígitos (máximo 8 dígitos: 2 día, 2 mes, 4 año)
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (!digits) return '';

    // Validar DÍA
    // Si escribe un primer dígito > 3 (ej. '4' al '9'), se auto-completa como día de un solo dígito con cero (ej. '04/')
    if (digits.length === 1 && !isDeleting) {
      const dNum = parseInt(digits, 10);
      if (dNum > 3) {
        return `0${dNum}/`;
      }
      return digits;
    }

    let day = digits.slice(0, 2);
    if (day.length === 2) {
      let dNum = parseInt(day, 10);
      if (dNum > 31) dNum = 31;
      if (dNum === 0 && digits.length >= 2) dNum = 1;
      day = String(dNum).padStart(2, '0');
    }

    if (digits.length <= 2) {
      if (digits.length === 2 && !isDeleting) {
        return `${day}/`;
      }
      return digits.length === 2 ? day : digits;
    }

    // Validar MES
    // Si el primer dígito de mes es > 1 (ej. '2' al '9'), se auto-completa como mes con cero (ej. '02/')
    if (digits.length === 3 && !isDeleting) {
      const mFirstDigit = parseInt(digits.slice(2, 3), 10);
      if (mFirstDigit > 1) {
        return `${day}/0${mFirstDigit}/`;
      }
      return `${day}/${digits.slice(2, 3)}`;
    }

    let month = digits.slice(2, 4);
    if (month.length === 2) {
      let mNum = parseInt(month, 10);
      if (mNum > 12) mNum = 12;
      if (mNum === 0 && digits.length >= 4) mNum = 1;
      month = String(mNum).padStart(2, '0');
    }

    if (digits.length <= 4) {
      if (digits.length === 4 && !isDeleting) {
        return `${day}/${month}/`;
      }
      return `${day}/${month}`;
    }

    const year = digits.slice(4, 8);
    return `${day}/${month}/${year}`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatInputWithMask(rawVal, displayValue);
    setDisplayValue(formatted);

    // Intentar validar inmediatamente
    const parsed = tryParseFlexibleDate(formatted);
    if (parsed) {
      onChange(parsed.iso);
      const ym = parseYearMonth(parsed.iso);
      setViewYear(ym.year);
      setViewMonth(ym.month);
    } else if (!formatted.trim()) {
      onChange('');
    }
  };

  const handleBlur = () => {
    if (!displayValue.trim()) {
      onChange('');
      setDisplayValue('');
      return;
    }

    const parsed = tryParseFlexibleDate(displayValue);
    if (parsed) {
      // Normalizar visualmente con ceros a la izquierda (ej. 10/5/2002 -> 10/05/2002)
      setDisplayValue(parsed.display);
      onChange(parsed.iso);
      const ym = parseYearMonth(parsed.iso);
      setViewYear(ym.year);
      setViewMonth(ym.month);
    } else {
      // Si la fecha es inválida, se restaura a la última válida o se limpia
      if (value) {
        setDisplayValue(isoToDisplayDate(value));
      } else {
        setDisplayValue('');
        onChange('');
      }
    }
  };

  const handlePrevYear = () => {
    setViewYear((prev) => Math.max(minYear, prev - 1));
  };

  const handleNextYear = () => {
    setViewYear((prev) => Math.min(maxYear, prev + 1));
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => Math.max(minYear, prev - 1));
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => Math.min(maxYear, prev + 1));
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (dayNum: number) => {
    if (viewYear < minYear || viewYear > maxYear) return;

    const isoStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    onChange(isoStr);
    setDisplayValue(isoToDisplayDate(isoStr));
    setIsOpen(false);
  };

  // Cantidad de días y offsets
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayWeekIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  // Comprobar si el día está seleccionado
  const parsedSelected = value ? value.split('-').map(Number) : null;
  const isSelectedDate = (d: number, m: number, y: number) => {
    if (!parsedSelected || parsedSelected.length !== 3) return false;
    return parsedSelected[0] === y && parsedSelected[1] === (m + 1) && parsedSelected[2] === d;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        required={required}
        value={displayValue}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={10}
        className={className}
      />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded transition-colors"
        title="Abrir calendario"
        tabIndex={-1}
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#B5B04E]" />
      </button>

      {/* Modal Centrado con estilo auténtico Veltron */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-[340px] sm:max-w-[370px] bg-[#121514] border border-[#8E8C3A]/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-5 sm:p-6 font-barlow text-white select-none animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Calendario: Flechas exteriores para años, interiores para meses */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-800/80">
              {/* Flecha Año Anterior */}
              <button
                type="button"
                onClick={handlePrevYear}
                aria-label="Año anterior"
                title="Año anterior"
                className="p-2 rounded-xl text-zinc-400 hover:text-[#B5B04E] hover:bg-zinc-800/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Centro: Mes con flechas compactas + Año */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Mes anterior"
                    title="Mes anterior"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-barlow font-bold text-base sm:text-lg text-white capitalize leading-tight px-2">
                    {MONTH_NAMES_ES[viewMonth]}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Mes siguiente"
                    title="Mes siguiente"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <span className="font-mono text-base sm:text-lg text-white font-bold tracking-wider leading-none mt-1.5">
                  {viewYear}
                </span>
              </div>

              {/* Flecha Año Siguiente */}
              <button
                type="button"
                onClick={handleNextYear}
                aria-label="Año siguiente"
                title="Año siguiente"
                className="p-2 rounded-xl text-zinc-400 hover:text-[#B5B04E] hover:bg-zinc-800/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Encabezados de días de la semana */}
            <div className="grid grid-cols-7 gap-1.5 mb-2.5 text-center">
              {WEEKDAYS_ES.map((w, idx) => (
                <span
                  key={`${w}-${idx}`}
                  className="text-xs sm:text-sm font-barlow font-bold text-zinc-400 uppercase tracking-wider py-1"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Matriz de días con altura fija y solo días del mes actual */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {/* Espacios vacíos antes del primer día del mes */}
              {Array.from({ length: firstDayWeekIndex }).map((_, idx) => (
                <div key={`empty-start-${idx}`} className="h-9 sm:h-10 w-full" />
              ))}

              {/* Días pertenecientes únicamente al mes actual */}
              {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                const day = idx + 1;
                const isSelected = isSelectedDate(day, viewMonth, viewYear);
                return (
                  <button
                    key={`curr-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-9 sm:h-10 w-full flex items-center justify-center rounded-xl text-xs sm:text-sm font-mono transition-all ${
                      isSelected
                        ? 'bg-[#8E8C3A] text-black font-bold shadow-[0_0_12px_rgba(142,140,58,0.4)] scale-105 z-10'
                        : 'text-zinc-200 hover:bg-zinc-800/80 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}

              {/* Espacios vacíos restantes para mantener la altura constante de 6 filas (42 celdas) */}
              {(() => {
                const totalUsed = firstDayWeekIndex + daysInCurrentMonth;
                const remainingSlots = Math.max(0, 42 - totalUsed);
                return Array.from({ length: remainingSlots }).map((_, idx) => (
                  <div key={`empty-end-${idx}`} className="h-9 sm:h-10 w-full" />
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


