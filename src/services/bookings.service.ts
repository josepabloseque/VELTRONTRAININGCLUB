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
