import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, CheckCircle2, ChevronRight, X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/Calendar';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/AlertDialog';
import type { TrainingClass } from '../types/database';
import { getLocalDateString, isClassPast, compareClassesChronological } from '../lib/dateUtils';

interface AdminClassesViewProps {
  classes: TrainingClass[];
  onAddClass: (newClass: TrainingClass) => void;
  onUpdateClass: (updatedClass: TrainingClass) => void;
  onDeleteClass: (classId: string) => void;
}

const parseTimeString = (t: string) => {
  const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let rawHour = parseInt(match[1], 10);
    const rawMin = match[2];
    let rawPeriod = (match[3] || 'AM').toUpperCase() as 'AM' | 'PM';

    if (rawHour > 12) {
      rawHour = rawHour - 12;
      rawPeriod = 'PM';
    } else if (rawHour === 0) {
      rawHour = 12;
      rawPeriod = 'AM';
    }
    return {
      hour: String(rawHour),
      minute: ['00', '15', '30', '45'].includes(rawMin) ? rawMin : '00',
      period: rawPeriod,
    };
  }
  return { hour: '6', minute: '00', period: 'AM' as 'AM' | 'PM' };
};

const parseTimeRangeString = (t: string) => {
  const parts = t.split(/[-–—]/);
  if (parts.length >= 2) {
    const start = parseTimeString(parts[0].trim());
    const end = parseTimeString(parts[1].trim());
    return { start, end };
  }
  const single = parseTimeString(t);
  return {
    start: single,
    end: { hour: '11', minute: '00', period: 'AM' as 'AM' | 'PM' },
  };
};

export const AdminClassesView: React.FC<AdminClassesViewProps> = ({
  classes,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showFilterCalendar, setShowFilterCalendar] = useState(false);
  const [editingClass, setEditingClass] = useState<TrainingClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<TrainingClass | null>(null);

  const [title, setTitle] = useState('Clases Dirigidas');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [filterDate, setFilterDate] = useState<string>(getLocalDateString());
  const [hour, setHour] = useState('6');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState('11');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
  const [capacity, setCapacity] = useState<number | string>(14);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = getLocalDateString();

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  useEffect(() => {
    if (showForm || showFilterCalendar || classToDelete) {
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
  }, [showForm, showFilterCalendar, classToDelete]);

  const resetFormFields = () => {
    setTitle('Clases Dirigidas');
    setSelectedDate(filterDate || getLocalDateString());
    setHour('6');
    setMinute('00');
    setPeriod('AM');
    setEndHour('11');
    setEndMinute('00');
    setEndPeriod('AM');
    setCapacity(14);
    setEditingClass(null);
    setIsSubmitting(false);
  };

  const handleOpenAdd = () => {
    resetFormFields();
    setSelectedDate(filterDate || getLocalDateString());
    setShowForm(true);
  };

  const handleStartEdit = (cls: TrainingClass) => {
    setEditingClass(cls);
    setTitle(cls.title);
    setSelectedDate(cls.date || getLocalDateString());
    const isFree = cls.title.toLowerCase().includes('libre') || (cls.capacity || 0) >= 900;
    if (isFree) {
      const range = parseTimeRangeString(cls.time);
      setHour(range.start.hour);
      setMinute(range.start.minute);
      setPeriod(range.start.period);
      setEndHour(range.end.hour);
      setEndMinute(range.end.minute);
      setEndPeriod(range.end.period);
    } else {
      const parsed = parseTimeString(cls.time);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
      setEndHour('11');
      setEndMinute('00');
      setEndPeriod('AM');
    }
    setCapacity(cls.capacity || 14);
    setIsSubmitting(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    resetFormFields();
    setShowForm(false);
  };

  const isFormFreeTraining =
    title.toLowerCase().includes('libre') ||
    (editingClass && (editingClass.capacity || 0) >= 900) ||
    Number(capacity) >= 900;

  const formattedTime = isFormFreeTraining
    ? `${hour}:${minute} ${period} - ${endHour}:${endMinute} ${endPeriod}`
    : `${hour}:${minute} ${period}`;

  const isInvalidPastToday = selectedDate === todayStr && isClassPast(selectedDate, formattedTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;

    // Validación: No permitir guardar si el horario ya transcurrió hoy
    if (isInvalidPastToday) return;

    setIsSubmitting(true);

    if (editingClass) {
      // Actualización de clase existente
      const isFree = title.toLowerCase().includes('libre') || (editingClass.capacity || 0) >= 900;
      const updated: TrainingClass = {
        ...editingClass,
        title: title.trim(),
        date: selectedDate,
        time: formattedTime,
        capacity: isFree ? 999 : Number(capacity) || 14,
      };

      onUpdateClass(updated);
      setSuccessMsg(`Clase "${title}" actualizada correctamente`);
    } else {
      // Creación de nueva clase
      const isFree = title.toLowerCase().includes('libre');
      const newClass: TrainingClass = {
        id: `class-${Date.now()}`,
        title: title.trim(),
        coach: 'Coach Veltron',
        date: selectedDate,
        time: formattedTime,
        capacity: isFree ? 999 : Number(capacity) || 14,
        bookedCount: 0,
      };

      onAddClass(newClass);
      setFilterDate(selectedDate);
      setSuccessMsg(`Clase "${title}" programada para el ${formatDisplayDate(selectedDate)} exitosamente`);
    }

    setTimeout(() => setSuccessMsg(null), 3500);
    handleCloseForm();
  };

  // Filtrado: si hay filterDate, filtra por esa fecha; si no, muestra todas
  const filteredDayClasses = (
    filterDate ? classes.filter((c) => c.date === filterDate) : classes
  ).slice().sort(compareClassesChronological);

  const freeClasses = filteredDayClasses.filter(
    (c) => c.title.toLowerCase().includes('libre') || (c.capacity || 0) >= 900
  );
  const guidedClasses = filteredDayClasses.filter(
    (c) => !c.title.toLowerCase().includes('libre') && (c.capacity || 0) < 900
  );

  return (
    <section className="space-y-4">
      {/* Alerta de éxito */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-barlow animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* LISTA DE CLASES PROGRAMADAS (Vista base) */}
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Encabezado */}
        <div>
          <div className="flex justify-between items-center gap-3">
            <h2 className="font-bebas text-xl tracking-wide uppercase text-[#B5B04E] leading-none">
              Programación de Clases
            </h2>

            <button
              onClick={handleOpenAdd}
              className="py-2 px-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-xs tracking-wider uppercase rounded-xl transition-all inline-flex items-center justify-center gap-1.5 active:scale-95 leading-none shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="leading-none">Agregar Clase</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Fecha Mínima y Elegante */}
        <div>
          <button
            type="button"
            onClick={() => setShowFilterCalendar(true)}
            className="w-full flex items-center justify-between p-3 bg-[#121514] hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl transition-all cursor-pointer active:scale-[0.99] group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#B5B04E] group-hover:border-[#8E8C3A]/50 transition-colors shrink-0">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <span className="font-bebas text-sm tracking-wider uppercase text-zinc-300 group-hover:text-white transition-colors">
                FILTRAR POR FECHA
              </span>
            </div>

            {filterDate && (
              <span className="text-xs font-barlow text-[#B5B04E] font-medium capitalize bg-[#8E8C3A]/10 border border-[#8E8C3A]/30 px-2.5 py-1 rounded-lg">
                {formatDisplayDate(filterDate)}
              </span>
            )}
          </button>
        </div>

        {/* Listado de Clases Filtradas por Día */}
        {filteredDayClasses.length === 0 ? (
          <div className="p-6 text-center bg-[#121514] rounded-2xl border border-zinc-800/80">
            <p className="text-zinc-400 text-xs font-barlow font-medium">
              No hay actividades programadas para esta fecha.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Grid de 2 Columnas para Entrenamiento Libre en Admin */}
            {freeClasses.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {freeClasses.map((item) => {
                  const isCurrentlyEditing = editingClass?.id === item.id;
                  const isPast = isClassPast(item.date, item.time);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleStartEdit(item)}
                      className={`border rounded-2xl p-3 sm:p-3.5 transition-all group shadow-sm flex flex-col justify-between cursor-pointer active:scale-[0.99] ${
                        isCurrentlyEditing
                          ? 'bg-zinc-900 border-[#8E8C3A]'
                          : isPast
                          ? 'bg-zinc-900/30 border-zinc-800/60 opacity-60'
                          : 'bg-[#121514] hover:bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <h3 className={`text-xs font-semibold font-barlow tracking-wide truncate ${isPast ? 'text-zinc-500' : 'text-white group-hover:text-[#B5B04E] transition-colors'}`}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClassToDelete(item);
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Eliminar horario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] sm:text-xs font-mono font-semibold bg-[#0A0C0B] border border-zinc-800 text-zinc-200 px-1.5 py-1 rounded-lg block text-center whitespace-nowrap tracking-tight">
                          {item.time}
                        </span>

                        <div className="flex items-center justify-end pt-1.5 border-t border-zinc-800/60">
                          <div className="flex items-center gap-0.5 text-zinc-400 group-hover:text-[#B5B04E] transition-colors text-[10px] font-semibold uppercase tracking-wider font-barlow">
                            <span>Editar</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
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
                  const isFull = (item.bookedCount || 0) >= item.capacity;
                  const isCurrentlyEditing = editingClass?.id === item.id;
                  const isPast = isClassPast(item.date, item.time);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleStartEdit(item)}
                      className={`border rounded-2xl p-4 transition-all group shadow-sm backdrop-blur-sm cursor-pointer active:scale-[0.99] ${
                        isCurrentlyEditing
                          ? 'bg-zinc-900 border-[#8E8C3A]'
                          : isPast
                          ? 'bg-zinc-900/30 border-zinc-800/60 opacity-60'
                          : 'bg-[#121514] hover:bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0 pr-1">
                          <h3 className={`text-sm font-bold font-barlow truncate ${isPast ? 'text-zinc-500' : 'text-white group-hover:text-[#B5B04E] transition-colors'}`}>
                            {item.title}
                          </h3>
                        </div>

                        <span className="text-xs font-mono bg-[#0A0C0B] border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg shrink-0">
                          {item.time}
                        </span>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-barlow">
                          <span className="text-zinc-500 font-medium">Inscritos:</span>
                          <div className="flex items-baseline font-mono font-bold">
                            <span className={`text-base ${isPast ? 'text-zinc-500' : isFull ? 'text-red-400' : 'text-[#B5B04E]'}`}>
                              {item.bookedCount || 0}
                            </span>
                            <span className="text-xs text-zinc-500 ml-0.5 font-normal">
                              /{item.capacity}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Botón Eliminar rápido */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setClassToDelete(item);
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg transition-colors"
                            title="Eliminar clase"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Acción Editar */}
                          <div className="flex items-center gap-1 text-zinc-400 group-hover:text-[#B5B04E] transition-colors text-[10px] font-semibold uppercase tracking-wider font-barlow">
                            <span>Editar</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL FLOTANTE CENTRADO (AGREGAR / EDITAR CLASE) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] animate-in fade-in duration-200">
          {/* Backdrop oscuro con blur que congela y cubre toda la pantalla */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={handleCloseForm}
            aria-hidden="true"
          />

          {/* Tarjeta Modal con scroll táctil fluido y safe area respetada */}
          <div 
            className="relative z-10 w-full max-w-lg max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem)] overflow-y-auto overscroll-contain bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-5 sm:p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
            role="dialog"
            aria-modal="true"
          >
            {/* Botón Cerrar (X) */}
            <button
              onClick={handleCloseForm}
              className="absolute right-4 top-4 sm:right-5 sm:top-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 transition-colors z-20 flex items-center justify-center"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Encabezado del Formulario */}
            <div className="mb-4 pr-10">
              <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
                {editingClass ? 'Editar Clase' : 'Crear Clase'}
              </h2>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre de la Clase */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-barlow"
                />
              </div>

              {/* Selector de Fecha: Calendario */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold font-barlow">
                  Día de la Clase
                </label>
                <Calendar
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d)}
                  minDate={todayStr}
                />
              </div>

              {/* Horario Selector Dividido y Cupos */}
              {(() => {
                const isFormFreeTraining = title.toLowerCase().includes('libre') || (editingClass && (editingClass.capacity || 0) >= 900) || Number(capacity) >= 900;

                if (isFormFreeTraining) {
                  return (
                    <div className="space-y-3.5">
                      {/* Hora de Inicio */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold font-barlow">
                          Hora de Inicio ({hour}:{minute} {period})
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <select
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center cursor-pointer"
                            title="Hora de inicio"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                              <option key={`start-${h}`} value={String(h)}>
                                {h}
                              </option>
                            ))}
                          </select>

                          <select
                            value={minute}
                            onChange={(e) => setMinute(e.target.value)}
                            className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center cursor-pointer"
                            title="Minutos de inicio"
                          >
                            {['00', '15', '30', '45'].map((m) => (
                              <option key={`start-m-${m}`} value={m}>
                                :{m}
                              </option>
                            ))}
                          </select>

                          <div className="flex rounded-xl bg-[#0A0C0B] border border-zinc-800 p-0.5">
                            <button
                              type="button"
                              onClick={() => setPeriod('AM')}
                              className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 cursor-pointer ${
                                period === 'AM'
                                  ? 'bg-[#8E8C3A] text-black shadow-sm'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              AM
                            </button>
                            <button
                              type="button"
                              onClick={() => setPeriod('PM')}
                              className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 cursor-pointer ${
                                period === 'PM'
                                  ? 'bg-[#8E8C3A] text-black shadow-sm'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              PM
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Hora de Finalización */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold font-barlow">
                          Hora de Finalización ({endHour}:{endMinute} {endPeriod})
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <select
                            value={endHour}
                            onChange={(e) => setEndHour(e.target.value)}
                            className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center cursor-pointer"
                            title="Hora de finalización"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                              <option key={`end-${h}`} value={String(h)}>
                                {h}
                              </option>
                            ))}
                          </select>

                          <select
                            value={endMinute}
                            onChange={(e) => setEndMinute(e.target.value)}
                            className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center cursor-pointer"
                            title="Minutos de finalización"
                          >
                            {['00', '15', '30', '45'].map((m) => (
                              <option key={`end-m-${m}`} value={m}>
                                :{m}
                              </option>
                            ))}
                          </select>

                          <div className="flex rounded-xl bg-[#0A0C0B] border border-zinc-800 p-0.5">
                            <button
                              type="button"
                              onClick={() => setEndPeriod('AM')}
                              className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 cursor-pointer ${
                                endPeriod === 'AM'
                                  ? 'bg-[#8E8C3A] text-black shadow-sm'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              AM
                            </button>
                            <button
                              type="button"
                              onClick={() => setEndPeriod('PM')}
                              className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 cursor-pointer ${
                                endPeriod === 'PM'
                                  ? 'bg-[#8E8C3A] text-black shadow-sm'
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              PM
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {/* Horario: Hora, Minutos, AM/PM */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold font-barlow">
                        Horario ({hour}:{minute} {period})
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Hora sin ceros iniciales */}
                        <select
                          value={hour}
                          onChange={(e) => setHour(e.target.value)}
                          className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center cursor-pointer"
                          title="Selecciona la hora"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                            <option key={h} value={String(h)}>
                              {h}
                            </option>
                          ))}
                        </select>

                        {/* Minutos */}
                        <select
                          value={minute}
                          onChange={(e) => setMinute(e.target.value)}
                          className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center cursor-pointer"
                          title="Selecciona los minutos"
                        >
                          {['00', '15', '30', '45'].map((m) => (
                            <option key={m} value={m}>
                              :{m}
                            </option>
                          ))}
                        </select>

                        {/* Toggle AM / PM */}
                        <div className="flex rounded-xl bg-[#0A0C0B] border border-zinc-800 p-0.5">
                          <button
                            type="button"
                            onClick={() => setPeriod('AM')}
                            className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 cursor-pointer ${
                              period === 'AM'
                                ? 'bg-[#8E8C3A] text-black shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setPeriod('PM')}
                            className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 cursor-pointer ${
                              period === 'PM'
                                ? 'bg-[#8E8C3A] text-black shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cupos (solo para clases dirigidas) */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold font-barlow">
                        Cupos Máximos
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={capacity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setCapacity('');
                          } else {
                            const num = parseInt(val, 10);
                            setCapacity(isNaN(num) ? '' : num);
                          }
                        }}
                        onBlur={() => {
                          if (capacity === '' || Number(capacity) < 1) {
                            setCapacity(14);
                          }
                        }}
                        className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-3 text-center text-base sm:text-xs font-mono text-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Botones de acción del formulario */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isInvalidPastToday || isSubmitting}
                  className={`flex-1 py-3 font-bebas text-base tracking-wider uppercase rounded-xl transition-all leading-none ${
                    isInvalidPastToday || isSubmitting
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                      : 'bg-[#8E8C3A] hover:bg-[#B5B04E] text-black shadow-[0_0_15px_rgba(142,140,58,0.25)] active:scale-[0.98]'
                  }`}
                >
                  {isInvalidPastToday
                    ? 'Horario Pasado'
                    : isSubmitting
                    ? 'Guardando...'
                    : editingClass
                    ? 'Guardar Cambios'
                    : 'Guardar y Publicar Clase'}
                </button>

                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="py-3 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bebas text-base tracking-wider uppercase rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL DE FILTRO POR FECHA (CALENDARIO TÁCTICO) */}
      {showFilterCalendar && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setShowFilterCalendar(false)}
            aria-hidden="true"
          />

          <div
            className="relative z-10 w-full max-w-md max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem)] overflow-y-auto overscroll-contain bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-5 sm:p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
            role="dialog"
            aria-modal="true"
          >
            {/* Botón Cerrar (X) */}
            <button
              onClick={() => setShowFilterCalendar(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800/80 transition-colors z-20 flex items-center justify-center"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pr-10">
              <h2 className="font-bebas text-xl tracking-wide uppercase text-white leading-none">
                Filtrar por Fecha
              </h2>
              <p className="text-xs text-zinc-400 font-barlow mt-1">
                Selecciona el día para ver las clases
              </p>
            </div>

            {/* Calendario Táctico */}
            <div>
              <Calendar
                selected={filterDate}
                onSelect={(d) => {
                  setFilterDate(d);
                  setShowFilterCalendar(false);
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Diálogo de Confirmación Táctico para Eliminar Clase / Entrenamiento Libre */}
      <AlertDialog open={Boolean(classToDelete)} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <AlertDialogContent className="space-y-4">
          <AlertDialogHeader className="space-y-3">
            {(() => {
              const isFreeToDelete = Boolean(
                classToDelete &&
                  (classToDelete.title.toLowerCase().includes('libre') || (classToDelete.capacity || 0) >= 900)
              );

              return (
                <>
                  <AlertDialogTitle className="normal-case font-barlow text-lg sm:text-xl font-bold tracking-normal text-white">
                    {isFreeToDelete ? '¿Deseas eliminar este entrenamiento?' : '¿Deseas eliminar esta clase?'}
                  </AlertDialogTitle>

                  {/* Tarjeta idéntica a la original sin basurero ni botón editar */}
                  {isFreeToDelete ? (
                    <div className="p-3.5 bg-[#121514] border border-zinc-800 rounded-2xl space-y-2 text-left shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold font-barlow tracking-wide text-white truncate">
                          {classToDelete?.title}
                        </h3>
                      </div>
                      <div>
                        <span className="text-[11px] sm:text-xs font-mono font-semibold bg-[#0A0C0B] border border-zinc-800 text-zinc-200 px-1.5 py-1 rounded-lg block text-center whitespace-nowrap tracking-tight">
                          {classToDelete?.time}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#121514] border border-zinc-800 rounded-2xl text-left shadow-sm">
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <h3 className="text-sm font-bold font-barlow text-white truncate">
                          {classToDelete?.title}
                        </h3>
                        <span className="text-xs font-mono bg-[#0A0C0B] border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg shrink-0">
                          {classToDelete?.time}
                        </span>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-barlow">
                          <span className="text-zinc-500 font-medium">Inscritos:</span>
                          <div className="flex items-baseline font-mono font-bold">
                            <span className="text-base text-[#B5B04E]">
                              {classToDelete?.bookedCount || 0}
                            </span>
                            <span className="text-xs text-zinc-500 ml-0.5 font-normal">
                              /{classToDelete?.capacity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center gap-3 pt-1 w-full">
            <AlertDialogCancel onClick={() => setClassToDelete(null)} className="flex-1 py-3 text-center">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (classToDelete) {
                  onDeleteClass(classToDelete.id);
                  setClassToDelete(null);
                }
              }}
              className="flex-1 py-3 text-center"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
