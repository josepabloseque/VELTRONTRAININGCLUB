// Utilidades para manejo seguro de fechas y horarios de clases

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return getLocalDateString(d);
};

export const parseClassTime = (timeStr: string): { hour: number; minute: number } => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { hour: 0, minute: 0 };

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = (match[3] || 'AM').toUpperCase();

  if (period === 'PM' && hour < 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
};

/**
 * Determina si una clase ya inició o ya transcurrió en el tiempo (al minuto exacto).
 */
export const isClassPast = (dateStr: string, timeStr: string): boolean => {
  try {
    const todayStr = getLocalDateString();
    
    // Si la fecha es de un día anterior, ya finalizó
    if (dateStr < todayStr) return true;
    // Si la fecha es futura, no ha finalizado
    if (dateStr > todayStr) return false;

    // Si es hoy, comparar hora y minutos exactos
    const { hour, minute } = parseClassTime(timeStr);
    const [y, mon, d] = dateStr.split('-').map(Number);
    const classDateTime = new Date(y, mon - 1, d, hour, minute, 0, 0);

    return classDateTime.getTime() <= Date.now();
  } catch (err) {
    console.error('Error calculando si la clase ya pasó:', err);
    return false;
  }
};
