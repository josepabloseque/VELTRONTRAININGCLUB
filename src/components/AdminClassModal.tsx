import React, { useState } from 'react';
import { X, Plus, Trash2, Dumbbell, Sparkles } from 'lucide-react';
import type { TrainingClass } from '../types/database';

interface AdminClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClass: (newClass: TrainingClass) => void;
}

export const AdminClassModal: React.FC<AdminClassModalProps> = ({
  isOpen,
  onClose,
  onSaveClass,
}) => {
  const [title, setTitle] = useState('');
  const [coach, setCoach] = useState('');
  const [time, setTime] = useState('06:00 AM');
  const [capacity, setCapacity] = useState<number | string>(12);
  const [description, setDescription] = useState('');
  const [exerciseInput, setExerciseInput] = useState('');
  const [exercises, setExercises] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    if (exerciseInput.trim()) {
      setExercises([...exercises, exerciseInput.trim()]);
      setExerciseInput('');
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !coach.trim()) return;

    const newClass: TrainingClass = {
      id: `class-${Date.now()}`,
      title: title.trim(),
      coach: coach.trim(),
      date: new Date().toISOString().split('T')[0],
      time,
      capacity: Number(capacity) || 12,
      bookedCount: 0,
      workoutDescription: description.trim(),
      exercises: exercises,
    };

    onSaveClass(newClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div 
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#121514] border border-[#8E8C3A]/50 rounded-2xl p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#8E8C3A]/15 border border-[#8E8C3A]/40 flex items-center justify-center text-[#B5B04E]">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5B04E] font-barlow">
              Staff / Admin
            </span>
            <h2 className="font-bebas text-2xl tracking-wide uppercase text-white leading-none">
              Crear Clase del Día
            </h2>
          </div>
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
              className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow"
            />
          </div>

          {/* Coach y Horario */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
                Coach a Cargo
              </label>
              <input
                type="text"
                required
                value={coach}
                onChange={(e) => setCoach(e.target.value)}
                placeholder=""
                className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
                Horario
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow"
              >
                <option value="05:30 AM">05:30 AM</option>
                <option value="06:00 AM">06:00 AM</option>
                <option value="07:00 AM">07:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
              </select>
            </div>
          </div>

          {/* Límite de Alumnos */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow flex items-center justify-between">
              <span>Límite de Alumnos / Cupos Máximos</span>
              <span className="text-[#B5B04E] font-mono font-bold">{capacity} alumnos</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="4"
                max="30"
                step="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full accent-[#8E8C3A]"
              />
              <input
                type="number"
                min="1"
                max="100"
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
                className="w-20 bg-[#0A0C0B] border border-zinc-800 rounded-xl py-2 px-3 text-center text-sm font-mono text-white focus:outline-none focus:border-[#8E8C3A]"
              />
            </div>
          </div>

          {/* Enfoque / Descripción */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
              Enfoque / Objetivo del WOD
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
              className="w-full bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2.5 px-3.5 text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#8E8C3A] transition-all font-barlow resize-none leading-relaxed"
              autoCapitalize="sentences"
              autoCorrect="on"
              spellCheck="false"
            />
          </div>

          {/* Ejercicios de la Clase */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-1.5 font-barlow">
              Ejercicios & Estructura de la Clase
            </label>
            
            {/* Input para agregar ejercicio */}
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={exerciseInput}
                onChange={(e) => setExerciseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExercise();
                  }
                }}
                placeholder="Escribe un ejercicio y presiona Enter..."
                className="flex-1 bg-[#0A0C0B] border border-zinc-800 focus:border-[#8E8C3A] rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-barlow"
              />
              <button
                type="button"
                onClick={handleAddExercise}
                className="px-3 py-2 bg-[#8E8C3A]/20 hover:bg-[#8E8C3A]/30 border border-[#8E8C3A]/40 text-[#B5B04E] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 font-barlow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Lista de ejercicios agregados */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-[#0A0C0B] rounded-xl border border-zinc-800/80">
              {exercises.map((ex, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-2 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800/60 text-xs font-barlow text-zinc-200 group"
                >
                  <span className="font-mono text-[#8E8C3A] font-bold shrink-0">{index + 1}.</span>
                  <span className="flex-1 leading-snug">{ex}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 bg-[#8E8C3A] hover:bg-[#B5B04E] text-black font-bebas text-lg tracking-wider uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(142,140,58,0.25)] active:scale-[0.98] leading-none flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publicar Clase en el Sistema</span>
          </button>
        </form>
      </div>
    </div>
  );
};
