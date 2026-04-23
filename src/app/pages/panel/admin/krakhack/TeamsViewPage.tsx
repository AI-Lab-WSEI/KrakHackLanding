/**
 * /panel/admin/krakhack/zespoly-view — grid widok zespołów + członkowie (nie
 * edycja projektów). To osobny widok od 'Projekty zespołów' (AdminTeamProjects
 * to edycja projektów z tokenami, a to jest lista zespołów z członkami).
 * Reużywa AdminDashboard embedded z tabem 'teams'.
 */
import { AdminDashboard } from '@/app/components/AdminDashboard';

export function KrakHackTeamsViewPage() {
  return <AdminDashboard embeddedTab="teams" embeddedDomain="hackathon" />;
}
