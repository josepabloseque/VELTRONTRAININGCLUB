import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import type { TrainingClass } from '../types/database';
import { getLocalDateString, getTomorrowDateString, isClassPast } from '../lib/dateUtils';

interface AdminClassesViewProps {
  classes: TrainingClass[];
  onAddClass: (newClass: TrainingClass) => void;
  onUpdateClass: (updatedClass: TrainingClass) => void;
  onDeleteClass: (classId: string) => void;
  onSelectClass?: (c: TrainingClass) => void;
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
  const [editingClass, setEditingClass] = useState<TrainingClass | null>(null);

  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [hour, setHour] = useState('6');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [capacity, setCapacity] = useState<number | string>(16);
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const todayStr = getLocalDateString();
  const tomorrowStr = getTomorrowDateString();

  const resetFormFields = () => {
    setTitle('');
    setSelectedDate(getLocalDateString());
    setHour('6');
    setMinute('00');
    setPeriod('AM');
    setCapacity(16);
    setDescription('');
    setEditingClass(null);
  };

  const handleOpenAdd = () => {
    resetFormFields();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEdit = (cls: TrainingClass) => {
    setEditingClass(cls);
    setTitle(cls.title);
    setSelectedDate(cls.date || getLocalDateString());
    const parsed = parseTimeString(cls.time);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
    setCapacity(cls.capacity);
    setDescription(cls.workoutDescription);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    resetFormFields();
    setShowForm(false);
  };

  const formattedTime = `${hour}:${minute} ${period}`;
  const isInvalidPastToday = selectedDate === todayStr && isClassPast(selectedDate, formattedTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validación: No permitir guardar si el horario ya transcurrió hoy
    if (isInvalidPastToday) return;

    if (editingClass) {
      // Actualización de clase existente
      const updated: TrainingClass = {
        ...editingClass,
        title: title.trim(),
        date: selectedDate,
        time: formattedTime,
        capacity: Number(capacity) || 16,
        workoutDescription: description.trim() || 'Entrenamiento de alto rendimiento programado por el staff.',
        exercises: editingClass.exercises || [],
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
        capacity: Number(capacity) || 16,
        bookedCount: 0,
        workoutDescription: description.trim() || 'Entrenamiento de alto rendimiento programado por el staff.',
        exercises: [],
      };

      onAddClass(newClass);
      setSuccessMsg(`Clase "${title}" programada para el ${selectedDate === todayStr ? 'día de hoy' : 'día de mañana'} exitosamente`);
    }

    setTimeout(() => setSuccessMsg(null), 3500);
    handleCloseForm();
  };

  return (
    <section className="space-y-4">
      {/* Alerta de éxito */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-barlow animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* VISTA 1: FORMULARIO EXCLUSIVO (AGREGAR / EDITAR) */}
      {showForm ? (
        <div className="space-y-4 pb-2 sm:pb-4 animate-in fade-in duration-200">
          {/* Encabezado del Formulario */}
          <div>
            <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
              {editingClass ? 'Editar Clase' : 'Nueva Sesión de Clase'}
            </h2>
          </div>

          <div className="bg-[#121514] border border-[#8E8C3A]/40 rounded-2xl p-5 shadow-xl">
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
                  placeholder="Ej: Tactical WOD • Strength & Conditioning"
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-barlow"
                />
              </div>

              {/* Selector de Fecha: HOY vs MAÑANA */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold font-barlow flex justify-between items-center">
                  <span>Día de la Clase</span>
                  <span className="text-zinc-500 font-mono text-[10px]">{selectedDate}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-barlow font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      selectedDate === todayStr
                        ? 'bg-[#8E8C3A]/20 border-[#8E8C3A] text-[#B5B04E] shadow-[0_0_10px_rgba(142,140,58,0.2)]'
                        : 'bg-[#0A0C0B] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>HOY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDate(tomorrowStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-barlow font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      selectedDate === tomorrowStr
                        ? 'bg-[#8E8C3A]/20 border-[#8E8C3A] text-[#B5B04E] shadow-[0_0_10px_rgba(142,140,58,0.2)]'
                        : 'bg-[#0A0C0B] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>MAÑANA</span>
                  </button>
                </div>
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
                        setCapacity(16);
                      }
                    }}
                    className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-3 text-center text-base sm:text-xs font-mono text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Enfoque / Descripción del WOD */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
                  Enfoque del WOD / Descripción
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Sesión integral enfocada en potencia muscular con barra y conditioning metabólico."
                  className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-barlow resize-none leading-relaxed"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck="false"
                />
              </div>

              {/* Botones de acción del formulario */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isInvalidPastToday}
                  className={`flex-1 py-3 font-bebas text-base tracking-wider uppercase rounded-xl transition-all leading-none ${
                    isInvalidPastToday
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-[#8E8C3A] hover:bg-[#B5B04E] text-black shadow-[0_0_15px_rgba(142,140,58,0.25)] active:scale-[0.98]'
                  }`}
                >
                  {isInvalidPastToday
                    ? 'Horario Pasado'
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
      ) : (
        /* VISTA 2: LISTA DE CLASES PROGRAMADAS */
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Encabezado */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
                Configuración de Clases
              </h2>
              <p className="text-xs text-zinc-400 font-barlow mt-0.5">
                Administra los horarios y programación
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="py-2 px-3 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-xs tracking-wider uppercase rounded-xl transition-all flex items-center gap-1.5 active:scale-95 leading-none shadow-[0_0_12px_rgba(142,140,58,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Clase</span>
            </button>
          </div>

          {/* Listado de Clases */}
          <div className="space-y-2.5">
            {classes.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-barlow bg-[#121514] rounded-2xl border border-zinc-800/80">
                No hay clases programadas. Toca "Agregar Clase" para crear una.
              </div>
            ) : (
              classes.map((item) => {
                const isFull = (item.bookedCount || 0) >= item.capacity;
                const isCurrentlyEditing = editingClass?.id === item.id;
                const isPast = isClassPast(item.date, item.time);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleStartEdit(item)}
                    className={`border rounded-2xl p-4 transition-all group shadow-sm backdrop-blur-sm cursor-pointer active:scale-[0.99] ${
                      isCurrentlyEditing
                        ? 'bg-[#8E8C3A]/20 border-[#B5B04E]'
                        : isPast
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

                      <div className="flex items-center gap-3">
                        {/* Botón Eliminar rápido */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Seguro que deseas eliminar la clase "${item.title}" a las ${item.time}?`)) {
                              onDeleteClass(item.id);
                            }
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg transition-colors"
                          title="Eliminar clase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

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
      )}
    </section>
  );
};
