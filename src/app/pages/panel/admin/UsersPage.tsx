/**
 * /panel/admin/uzytkownicy — lista userów + invite + role management
 * Renderuje ModeratorDashboard w trybie lockTab='users'.
 * Widoczne: admin, moderator.
 */
import { ModeratorDashboard } from '../ModeratorDashboard';

export function AdminUsersPage() {
  return <ModeratorDashboard lockTab="users" />;
}
