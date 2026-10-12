import { supabase } from '../lib/supabaseClient';

export interface BookingResponse {
  success: boolean;
  message: string;
}

/**
 * Realiza la reserva atómica en PostgreSQL con bloqueo de concurrencia.
 */
export async function reserveClass(classId: string): Promise<BookingResponse> {
  // Llamada RPC para reserva segura a nivel de base de datos
  const { data, error } = await supabase.rpc('book_class', {
    p_class_id: classId,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (typeof data === 'object' && data !== null && 'success' in data) {
    if (!data.success) {
      throw new Error(data.message || 'No fue posible completar la reserva.');
    }
    return data as BookingResponse;
  }

  return { success: true, message: 'Reserva confirmada con éxito.' };
}

/**
 * Cancela una reserva existente para el usuario activo.
 */
export async function cancelClassBooking(classId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('class_bookings')
    .delete()
    .eq('class_id', classId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export interface ClassAttendee {
  id: string;
  userId: string;
  fullName: string;
  createdAt: string;
}

// Caché global compartida para acceso instantáneo en 0ms desde cualquier vista
const attendeesMemoryCache = new Map<string, ClassAttendee[]>();
let isGetClassAttendeesRpcAvailable: boolean | null = null;

export function getCachedAttendees(classId: string): ClassAttendee[] | undefined {
  return attendeesMemoryCache.get(String(classId));
}

export function setCachedAttendees(classId: string, list: ClassAttendee[]): void {
  attendeesMemoryCache.set(String(classId), list);
}

/**
 * Pre-carga en lote (1 sola consulta) los inscritos de múltiples clases en segundo plano
 * para que al abrir cualquier clase como Admin la lista aparezca en 0ms sin flasheos.
 */
export async function prefetchClassesAttendees(classIds: string[]): Promise<void> {
  if (!classIds || classIds.length === 0) return;

  try {
    const cleanIds = Array.from(new Set(classIds.map(String)));
    const [{ data: bookings, error: bookingsErr }, { data: directory }] = await Promise.all([
      supabase
        .from('class_bookings')
        .select('id, class_id, user_id, created_at')
        .in('class_id', cleanIds)
        .order('created_at', { ascending: true }),
      supabase.rpc('get_athletes_directory'),
    ]);

    if (bookingsErr) return;

    const dirMap = new Map<string, string>();
    if (Array.isArray(directory)) {
      directory.forEach((item: any) => {
        if (item.user_id) {
          dirMap.set(String(item.user_id), item.full_name || item.email?.split('@')[0] || 'Atleta');
        }
      });
    }

    const grouped = new Map<string, ClassAttendee[]>();
    cleanIds.forEach((id) => grouped.set(id, []));

    (bookings || []).forEach((b: any) => {
      const cId = String(b.class_id);
      const list = grouped.get(cId) || [];
      list.push({
        id: String(b.id),
        userId: String(b.user_id),
        fullName: dirMap.get(String(b.user_id)) || 'Atleta',
        createdAt: b.created_at,
      });
      grouped.set(cId, list);
    });

    grouped.forEach((list, cId) => {
      attendeesMemoryCache.set(cId, list);
    });
  } catch {
    // Fallo silencioso en pre-carga de fondo
  }
}

/**
 * Consulta la lista de atletas inscritos en una clase específica mediante RPC en Supabase.
 */
export async function fetchClassAttendees(classId: string): Promise<ClassAttendee[]> {
  const key = String(classId);
  try {
    const numericId = Number(classId);
    const idParam = isNaN(numericId) ? classId : numericId;

    // 1. Intento primario: Función RPC optimizada en Supabase (si está disponible)
    if (isGetClassAttendeesRpcAvailable !== false) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('get_class_attendees', {
        p_class_id: idParam,
      });

      if (!rpcErr && Array.isArray(rpcData)) {
        isGetClassAttendeesRpcAvailable = true;
        const result = rpcData.map((b: any) => ({
          id: String(b.booking_id || b.id),
          userId: String(b.user_id),
          fullName: b.full_name || 'Atleta',
          createdAt: b.created_at,
        }));
        attendeesMemoryCache.set(key, result);
        return result;
      }

      if (rpcErr && (rpcErr.code === 'PGRST202' || rpcErr.message?.includes('Could not find'))) {
        isGetClassAttendeesRpcAvailable = false;
      }
    }

    // 2. Fallback directo en paralelo
    const [{ data: bookings, error: bookingsErr }, { data: directory }] = await Promise.all([
      supabase
        .from('class_bookings')
        .select('id, user_id, created_at')
        .eq('class_id', classId)
        .order('created_at', { ascending: true }),
      supabase.rpc('get_athletes_directory'),
    ]);

    if (bookingsErr) {
      console.error('Error al consultar inscritos:', bookingsErr);
      return attendeesMemoryCache.get(key) || [];
    }

    const dirMap = new Map<string, string>();
    if (Array.isArray(directory)) {
      directory.forEach((item: any) => {
        if (item.user_id) {
          dirMap.set(String(item.user_id), item.full_name || item.email?.split('@')[0] || 'Atleta');
        }
      });
    }

    const result = (bookings || []).map((b: any) => ({
      id: String(b.id),
      userId: String(b.user_id),
      fullName: dirMap.get(String(b.user_id)) || 'Atleta',
      createdAt: b.created_at,
    }));

    attendeesMemoryCache.set(key, result);
    return result;
  } catch (err) {
    console.error('Error al obtener lista de inscritos:', err);
    return attendeesMemoryCache.get(key) || [];
  }
}
