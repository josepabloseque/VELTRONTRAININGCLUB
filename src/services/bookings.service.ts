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

/**
 * Consulta la lista de atletas inscritos en una clase específica mediante RPC en Supabase.
 */
export async function fetchClassAttendees(classId: string): Promise<ClassAttendee[]> {
  try {
    const numericId = Number(classId);
    const idParam = isNaN(numericId) ? classId : numericId;

    // 1. Intento primario: Función RPC optimizada en Supabase (JOIN atómico a nivel de BD)
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_class_attendees', {
      p_class_id: idParam,
    });

    if (!rpcErr && Array.isArray(rpcData)) {
      return rpcData.map((b: any) => ({
        id: String(b.booking_id || b.id),
        userId: String(b.user_id),
        fullName: b.full_name || 'Atleta',
        createdAt: b.created_at,
      }));
    }

    // 2. Fallback de compatibilidad si aún no se ha corrido la migración SQL
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
      return [];
    }

    const dirMap = new Map<string, string>();
    if (Array.isArray(directory)) {
      directory.forEach((item: any) => {
        if (item.user_id) {
          dirMap.set(item.user_id, item.full_name || item.email?.split('@')[0] || 'Atleta');
        }
      });
    }

    return (bookings || []).map((b: any) => ({
      id: String(b.id),
      userId: String(b.user_id),
      fullName: dirMap.get(b.user_id) || 'Atleta',
      createdAt: b.created_at,
    }));
  } catch (err) {
    console.error('Error al obtener lista de inscritos:', err);
    return [];
  }
}
