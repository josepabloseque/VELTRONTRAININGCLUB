import { supabase } from '../lib/supabaseClient';
import type { AthleteDirectoryItem } from '../types/athletes';

export async function fetchAthletesDirectory(): Promise<AthleteDirectoryItem[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData?.session?.user?.id;

  const { data, error } = await supabase.rpc('get_athletes_directory');

  if (error) {
    throw new Error(error.message);
  }

  const directory = (data as AthleteDirectoryItem[]) || [];
  // Excluir administradores y la cuenta del administrador que gestiona el club
  return directory.filter((athlete) => athlete.role !== 'admin' && athlete.user_id !== currentUserId);
}
