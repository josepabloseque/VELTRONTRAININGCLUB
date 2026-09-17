import { supabase } from '../lib/supabaseClient';
import type { AthleteDirectoryItem } from '../types/athletes';

export async function fetchAthletesDirectory(): Promise<AthleteDirectoryItem[]> {
  const { data, error } = await supabase.rpc('get_athletes_directory');

  if (error) {
    throw new Error(error.message);
  }

  return (data as AthleteDirectoryItem[]) || [];
}
