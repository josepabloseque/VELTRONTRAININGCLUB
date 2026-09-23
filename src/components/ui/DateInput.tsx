import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

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

export function displayDateToIso(display: string): string {
  if (!display) return '';
  const parts = display.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d && m && y && y.length === 4) {
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  return '';
}

interface DateInputProps {
  id?: string;
  value: string; // expects YYYY-MM-DD
  onChange: (isoValue: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  value,
  onChange,
  required = false,
  className = 'w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 pl-3 pr-8 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow font-normal',
  placeholder = 'DD/MM/AAAA',
}) => {
  const [displayValue, setDisplayValue] = useState(() => isoToDisplayDate(value));
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(isoToDisplayDate(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 8);

    let formatted = '';
    if (cleanDigits.length > 0) {
      formatted = cleanDigits.slice(0, 2);
      if (cleanDigits.length >= 3) {
        formatted += '/' + cleanDigits.slice(2, 4);
      }
      if (cleanDigits.length >= 5) {
        formatted += '/' + cleanDigits.slice(4, 8);
      }
    }

    setDisplayValue(formatted);

    if (cleanDigits.length === 8) {
      const d = parseInt(cleanDigits.slice(0, 2), 10);
      const m = parseInt(cleanDigits.slice(2, 4), 10);
      const y = parseInt(cleanDigits.slice(4, 8), 10);

      const isValidDay = d >= 1 && d <= 31;
      const isValidMonth = m >= 1 && m <= 12;
      const currentYear = new Date().getFullYear();
      const isValidYear = y >= 1920 && y <= currentYear;

      if (isValidDay && isValidMonth && isValidYear) {
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        onChange(iso);
      }
    } else if (cleanDigits.length === 0) {
      onChange('');
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (isoVal) {
      onChange(isoVal);
      setDisplayValue(isoToDisplayDate(isoVal));
    }
  };

  const openCalendar = () => {
    if (hiddenDateInputRef.current) {
      if (typeof hiddenDateInputRef.current.showPicker === 'function') {
        hiddenDateInputRef.current.showPicker();
      } else {
        hiddenDateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        required={required}
        value={displayValue}
        onChange={handleTextChange}
        placeholder={placeholder}
        maxLength={10}
        className={className}
      />

      <button
        type="button"
        onClick={openCalendar}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded transition-colors"
        title="Seleccionar fecha"
        tabIndex={-1}
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>

      <input
        ref={hiddenDateInputRef}
        type="date"
        value={value || ''}
        onChange={handlePickerChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};
