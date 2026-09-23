export interface AthleteDirectoryItem {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date?: string | null;
  plan_name: string;
  status: 'active' | 'inactive' | 'canceled' | string;
  expires_at: string | null;
  registered_at: string;
}
