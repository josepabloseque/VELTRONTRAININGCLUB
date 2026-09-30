import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, ChevronRight, X, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/Calendar';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
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
  const [capacity, setCapacity] = useState<number | string>(12);
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
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showForm]);

  const resetFormFields = () => {
    setTitle('Clases Dirigidas');
    setSelectedDate(filterDate || getLocalDateString());
    setHour('6');
    setMinute('00');
    setPeriod('AM');
    setCapacity(12);
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
    const parsed = parseTimeString(cls.time);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
    setCapacity(cls.capacity || 12);
    setIsSubmitting(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    resetFormFields();
    setShowForm(false);
  };

  const formattedTime = `${hour}:${minute} ${period}`;
  const isInvalidPastToday = selectedDate === todayStr && isClassPast(selectedDate, formattedTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;

    // Validación: No permitir guardar si el horario ya transcurrió hoy
    if (isInvalidPastToday) return;

    setIsSubmitting(true);

    if (editingClass) {
      // Actualización de clase existente
      const updated: TrainingClass = {
        ...editingClass,
        title: title.trim(),
        date: selectedDate,
        time: formattedTime,
        capacity: Number(capacity) || 12,
      };

      onUpdateClass(updated);
      setSuccessMsg(`Clase "${title}" actualizada correctamente`);
    } else {
      // Creación de nueva clase
      const newClass: TrainingClass = {
        id: `class-${Date.now()}`,
        title: title.trim(),
        coach: 'Coach Veltron',
        date: selectedDate,
        time: formattedTime,
        capacity: Number(capacity) || 12,
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
              className="py-2 px-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-xs tracking-wider uppercase rounded-xl transition-all inline-flex items-center justify-center gap-1.5 active:scale-95 leading-none shadow-[0_0_12px_rgba(142,140,58,0.25)] shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="leading-none">Agregar Clase</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400 font-barlow mt-1">
            Administra y agrega clases
          </p>
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
        <div className="space-y-2.5">
          {filteredDayClasses.length === 0 ? (
            <div className="p-6 text-center bg-[#121514] rounded-2xl border border-zinc-800/80">
              <p className="text-zinc-400 text-xs font-barlow font-medium">
                No hay clases programadas para esta fecha.
              </p>
            </div>
          ) : (
            filteredDayClasses.map((item) => {
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
            })
          )}
        </div>
      </div>

      {/* MODAL FLOTANTE CENTRADO (AGREGAR / EDITAR CLASE) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop oscuro con blur que congela y cubre toda la pantalla */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={handleCloseForm}
            aria-hidden="true"
          />

          {/* Tarjeta Modal */}
          <div 
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-5 sm:p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center"
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
                      className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-2 text-base sm:text-xs text-white focus:outline-none transition-colors font-mono text-center"
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
                        className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 ${
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
                        className={`flex-1 rounded-lg text-xs font-mono font-bold transition-all py-1.5 ${
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

                {/* Cupos */}
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
                        setCapacity(12);
                      }
                    }}
                    className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-3 text-center text-base sm:text-xs font-mono text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

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
      {showFilterCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setShowFilterCalendar(false)}
            aria-hidden="true"
          />

          <div
            className="relative z-10 w-full max-w-md bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-5 sm:p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
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
        </div>
      )}

      {/* Diálogo de Confirmación Táctico para Eliminar Clase */}
      <AlertDialog open={Boolean(classToDelete)} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Clase</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la clase <span className="text-white font-semibold">{classToDelete?.title}</span> de las <span className="text-[#B5B04E] font-semibold">{classToDelete?.time}{classToDelete ? ` - ${formatDisplayDate(classToDelete.date)}` : ''}</span>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (classToDelete) {
                  onDeleteClass(classToDelete.id);
                  setClassToDelete(null);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
