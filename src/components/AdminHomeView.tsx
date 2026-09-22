import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { SevenSegmentDisplay } from './ui/SevenSegmentNumber';
import { fetchAthletesDirectory } from '../services/athletes.service';
import type { TrainingClass } from '../types/database';
import { getLocalDateString, isClassPast } from '../lib/dateUtils';

interface AdminHomeViewProps {
  classes?: TrainingClass[];
  onSelectClass?: (c: TrainingClass) => void;
}

// Caché en memoria para evitar el flash de 0 al alternar entre pestañas
let memoryActiveUsersCache: number | null = null;

export const AdminHomeView: React.FC<AdminHomeViewProps> = ({
  classes = [],
  onSelectClass,
}) => {
  const [activeUsersCount, setActiveUsersCount] = useState<number>(
    () => memoryActiveUsersCache ?? 0
  );

  const fetchMetrics = async () => {
    try {
      const data = await fetchAthletesDirectory();
      const active = data.filter((item) => item.status === 'active').length;
      memoryActiveUsersCache = active;
      setActiveUsersCount(active);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const todayStr = getLocalDateString();
  const todayClasses = classes.filter((c) => c.date === todayStr);

  return (
    <section className="space-y-6 animate-in fade-in duration-200">
      {/* Tarjeta de Ancho Completo: Usuarios Activos */}
      <div className="w-full bg-[#121514] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm space-y-2.5">
        {/* Display Digital de 7 Segmentos */}
        <SevenSegmentDisplay
          value={activeUsersCount}
          minDigits={2}
          onColor="#B5B04E"
          offColor="#181C1A"
          digitWidth={22}
          digitHeight={42}
        />

        {/* Etiqueta */}
        <h3 className="font-bebas text-lg sm:text-xl tracking-wide uppercase text-white leading-none">
          Usuarios Activos
        </h3>
      </div>

      {/* Sección: Sesiones de Hoy */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bebas text-xl tracking-wide uppercase text-white leading-none">
            Sesiones de Hoy
          </h3>
          <span className="text-[11px] text-zinc-400 font-barlow capitalize">
            {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Listado de Clases de Hoy */}
        <div className="space-y-2.5">
          {todayClasses.length === 0 ? (
            <div className="bg-[#121514] border border-zinc-800/80 rounded-2xl p-6 text-center text-zinc-400 font-barlow text-xs">
              <p className="font-semibold text-zinc-300">No hay sesiones programadas para hoy.</p>
              <p className="text-zinc-500 mt-1">Crea nuevas clases desde la pestaña de Clases.</p>
            </div>
          ) : (
            todayClasses.map((item) => {
              const isFull = (item.bookedCount || 0) >= item.capacity;
              const isPast = isClassPast(item.date, item.time);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectClass?.(item)}
                  className={`border rounded-2xl p-4 transition-all cursor-pointer group shadow-sm backdrop-blur-sm ${
                    isPast
                      ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80'
                      : 'bg-[#121514] hover:bg-[#8E8C3A]/[0.08] border-zinc-800/80 hover:border-[#8E8C3A]/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className={`text-sm font-bold font-barlow truncate ${isPast ? 'text-zinc-400' : 'text-white group-hover:text-[#B5B04E] transition-colors'}`}>
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-[#0A0C0B] border border-zinc-800/80 text-zinc-200 px-2 py-1 rounded-lg shrink-0">
                      {item.time}
                    </span>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-zinc-800/60 flex items-center justify-between">
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

                    <span className="text-xs text-zinc-400 group-hover:text-white flex items-center gap-1 font-barlow font-medium">
                      <span>Ver</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
