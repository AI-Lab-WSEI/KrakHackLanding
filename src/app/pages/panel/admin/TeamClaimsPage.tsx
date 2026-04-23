/**
 * /panel/admin/team-claims — team claims (pending/confirmed/rejected) + backfill
 * Renderuje ModeratorDashboard w trybie lockTab='claims'.
 * Widoczne: admin, moderator.
 */
import { ModeratorDashboard } from '../ModeratorDashboard';

export function AdminTeamClaimsPage() {
  return <ModeratorDashboard lockTab="claims" />;
}
