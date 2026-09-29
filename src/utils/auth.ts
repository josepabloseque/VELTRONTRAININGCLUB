import type { User } from '@supabase/supabase-js';

export function isAdmin(user: User | null): boolean {
  if (!user) return false;

  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  const isUserAdminMeta = user.user_metadata?.isAdmin === true;

  return (
    appRole === 'admin' ||
    userRole === 'admin' ||
    isUserAdminMeta
  );
}
