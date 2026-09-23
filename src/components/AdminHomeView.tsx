import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { SevenSegmentDisplay } from './ui/SevenSegmentNumber';
import { fetchAthletesDirectory } from '../services/athletes.service';
import type { AthleteDirectoryItem } from '../types/athletes';
import type { TrainingClass } from '../types/database';
import { getLocalDateString, isClassPast } from '../lib/dateUtils';

interface AdminHomeViewProps {
  classes?: TrainingClass[];
  onSelectClass?: (c: TrainingClass) => void;
  onNavigateToClasses?: () => void;
}

// Caché en memoria para evitar el flash de 0 al alternar entre pestañas
let memoryActiveUsersCache: number | null = null;
let memoryAthletesCache: AthleteDirectoryItem[] | null = null;

interface UpcomingBirthday {
  item: AthleteDirectoryItem;
  nextAge: number;
  daysUntil: number;
  dateFormatted: string;
  isToday: boolean;
  isTomorrow: boolean;
}

export const AdminHomeView: React.FC<AdminHomeViewProps> = ({
  classes = [],
  onSelectClass,
  onNavigateToClasses,
}) => {
  const [activeUsersCount, setActiveUsersCount] = useState<number>(
    () => memoryActiveUsersCache ?? 0
  );
  const [athletes, setAthletes] = useState<AthleteDirectoryItem[]>(
    () => memoryAthletesCache ?? []
  );

  const fetchMetrics = async () => {
    try {
      const data = await fetchAthletesDirectory();
      memoryAthletesCache = data;
      setAthletes(data);

      const active = data.filter((item) => item.status === 'active').length;
      memoryActiveUsersCache = active;
      setActiveUsersCount(active);
    } catch (err) {
      console.error('Error al cargar métricas y directorio:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const todayStr = getLocalDateString();
  const todayClasses = classes.filter((c) => c.date === todayStr);
  const todayBookingsCount = todayClasses.reduce((sum, c) => sum + (c.bookedCount || 0), 0);

  // Cálculo de próximos cumpleaños en los siguientes 30 días
  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentYear = todayMidnight.getFullYear();

    const results: UpcomingBirthday[] = [];

    for (const athlete of athletes) {
      if (!athlete.birth_date) continue;
      
      const parts = athlete.birth_date.split('-');
      if (parts.length < 3) continue;
      
      const [birthYear, birthMonth, birthDay] = parts.map(Number);
      if (!birthYear || !birthMonth || !birthDay) continue;

      let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay);
      let nextAge = currentYear - birthYear;

      // Si el cumpleaños de este año ya pasó, calcular para el próximo año
      if (nextBirthday.getTime() < todayMidnight.getTime()) {
        nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
        nextAge = (currentYear + 1) - birthYear;
      }

      const diffMs = nextBirthday.getTime() - todayMidnight.getTime();
      const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

      // Considerar próximos 30 días
      if (daysUntil >= 0 && daysUntil <= 30) {
        const isToday = daysUntil === 0;
        const isTomorrow = daysUntil === 1;
        const dateFormatted = nextBirthday.toLocaleDateString('es-CR', {
          day: 'numeric',
          month: 'short',
        });

        results.push({
          item: athlete,
          nextAge,
          daysUntil,
          dateFormatted,
          isToday,
          isTomorrow,
        });
      }
    }

    // Ordenar de más cercano a más lejano
    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [athletes]);

  return (
    <section className="space-y-4 animate-in fade-in duration-200">
      {/* 1. MÉTRICAS SUPERIORES (GRID DE 2 COLUMNAS) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Columna 1: Usuarios Activos */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm space-y-2">
          <SevenSegmentDisplay
            value={activeUsersCount}
            minDigits={2}
            onColor="#B5B04E"
            offColor="#181C1A"
            digitWidth={18}
            digitHeight={34}
          />
          <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 font-barlow leading-tight">
            Usuarios Activos
          </span>
        </div>

        {/* Columna 2: Reservas Hoy */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm space-y-2">
          <SevenSegmentDisplay
            value={todayBookingsCount}
            minDigits={2}
            onColor="#B5B04E"
            offColor="#181C1A"
            digitWidth={18}
            digitHeight={34}
          />
          <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 font-barlow leading-tight">
            Reservas Hoy
          </span>
        </div>
      </div>

      {/* 2. SECCIÓN DE CUMPLEAÑOS (CARRUSEL HORIZONTAL CON MISMO ANCHO) */}
      <div className="space-y-2">
        <div className="px-0.5">
          <h3 className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 font-barlow leading-none">
            Próximos Cumpleaños
          </h3>
        </div>

        {/* Contenedor con scroll horizontal */}
        {upcomingBirthdays.length === 0 ? (
          <div className="h-10 w-full flex items-center justify-center bg-neutral-900/40 border border-neutral-800/60 rounded-xl text-xs text-neutral-500 font-barlow">
            Sin cumpleaños en los próximos 30 días
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x">
            {upcomingBirthdays.map(({ item, nextAge, daysUntil, isToday, isTomorrow, dateFormatted }) => (
              <div
                key={item.user_id}
                className={`shrink-0 w-[calc(50%-0.375rem)] p-3 rounded-2xl border transition-all snap-start select-none flex flex-col justify-between ${
                  isToday
                    ? 'bg-neutral-900 border-[#8E8C3A]/60 shadow-[0_0_12px_rgba(181,176,78,0.15)]'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <span className="text-xs font-bold text-white truncate font-barlow leading-tight block">
                  {item.full_name}
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-barlow text-neutral-400 truncate leading-none">
                  <span className="font-mono">{dateFormatted}</span>
                  <span>•</span>
                  <span>
                    {isToday
                      ? `¡Hoy! (${nextAge} años)`
                      : isTomorrow
                      ? 'Mañana'
                      : `En ${daysUntil} días`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. SECCIÓN SESIONES DE HOY */}
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between items-center px-0.5">
          <h3 className="font-bebas text-xl tracking-wide uppercase text-white leading-none">
            Sesiones de Hoy
          </h3>
          <span className="text-[11px] text-neutral-400 font-barlow capitalize">
            {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Listado o Empty State */}
        {todayClasses.length === 0 ? (
          <button
            type="button"
            onClick={() => onNavigateToClasses?.()}
            className="w-full border border-dashed border-neutral-800 hover:border-[#8E8C3A]/50 bg-neutral-900/30 hover:bg-neutral-900/60 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-all group active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-[#B5B04E] group-hover:scale-110 group-hover:border-[#8E8C3A]/60 group-hover:bg-[#8E8C3A]/15 transition-all shadow-inner">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 group-hover:text-[#B5B04E] transition-colors font-barlow block">
                Programar Clase de Hoy
              </span>
              <span className="text-[11px] text-neutral-500 font-barlow block">
                Ir a la pestaña de Clases para programar
              </span>
            </div>
          </button>
        ) : (
          <div className="space-y-2.5">
            {todayClasses.map((item) => {
              const isFull = (item.bookedCount || 0) >= item.capacity;
              const isPast = isClassPast(item.date, item.time);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectClass?.(item)}
                  className={`border rounded-2xl p-4 transition-all cursor-pointer group shadow-sm backdrop-blur-sm ${
                    isPast
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-80'
                      : 'bg-neutral-900 hover:bg-[#8E8C3A]/[0.06] border-neutral-800 hover:border-[#8E8C3A]/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className={`text-sm font-bold font-barlow truncate ${isPast ? 'text-neutral-400' : 'text-white group-hover:text-[#B5B04E] transition-colors'}`}>
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-xs font-mono bg-[#0A0C0B] border border-neutral-800 text-neutral-200 px-2 py-1 rounded-lg shrink-0">
                      {item.time}
                    </span>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-neutral-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-barlow">
                      <span className="text-neutral-400 font-medium">Inscritos:</span>
                      <div className="flex items-baseline font-mono font-bold">
                        <span className={`text-base ${isPast ? 'text-neutral-500' : isFull ? 'text-red-400' : 'text-[#B5B04E]'}`}>
                          {item.bookedCount || 0}
                        </span>
                        <span className="text-xs text-neutral-400 ml-0.5 font-normal">
                          /{item.capacity}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-neutral-400 group-hover:text-white flex items-center gap-1 font-barlow font-medium">
                      <span>Ver</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
