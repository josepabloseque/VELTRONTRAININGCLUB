export interface Membership {
  id?: string;
  user_id: string;
  plan_name: string;
  status: 'active' | 'suspended' | 'expired' | 'inactive';
  starts_at: string;
  expires_at: string | null;
  created_at?: string;
}

export interface TrainingClass {
  id: string;
  title: string;
  coach: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  capacity: number;
  bookedCount: number;
}