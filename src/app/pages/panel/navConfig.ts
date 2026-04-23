/**
 * navConfig — deklaratywna konfiguracja sidebara panelu.
 *
 * Sidebar ma 2 super-sekcje (grup):
 *   • MÓJ OBSZAR — widoczne dla każdego zalogowanego usera (w tym admina)
 *   • ADMINISTRACJA — widoczne dla admin / moderator (filtrowane per role)
 *
 * Ikony z lucide-react — spójne ze starymi komponentami `Admin*.tsx`.
 */
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Users2,
  Vote,
  Award,
  Users,
  ClipboardList,
  UserCheck,
  Trophy,
  Briefcase,
  Image as ImageIcon,
  Calendar,
  CalendarCheck,
  Mail,
  BarChart3,
  MessageSquare,
  Handshake,
  Settings,
  FileText,
  type LucideIcon,
} from 'lucide-react';

export type NavGroup = 'user' | 'admin';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  end?: boolean;
  /**
   * Lista ról Keycloak które widzą ten item. Pusty / undefined = każdy zalogowany.
   * Admin ma `admin`. Moderator ma `moderator`. Etc.
   */
  roles?: string[];
}

/**
 * Kolejność w tej tablicy = kolejność w sidebarze.
 * Grupy zostaną posortowane: najpierw wszystkie `group: 'user'`, potem `group: 'admin'`.
 */
export const NAV_ITEMS: NavItem[] = [
  // ─── MÓJ OBSZAR — dla każdego zalogowanego ───────────────────────────────
  { to: '/panel',              label: 'Dashboard',   icon: LayoutDashboard, group: 'user', end: true },
  { to: '/panel/profil',       label: 'Mój profil',  icon: User,            group: 'user' },
  { to: '/panel/projekty',     label: 'Moje projekty', icon: FolderKanban,  group: 'user' },
  { to: '/panel/moj-zespol',   label: 'Mój zespół',  icon: Users2,          group: 'user' },

  // ─── ADMINISTRACJA — admin / moderator ───────────────────────────────────
  { to: '/panel/admin/aplikacje',      label: 'Aplikacje do koła', icon: ClipboardList, group: 'admin', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/rejestracje',    label: 'Rejestracje',       icon: FileText,      group: 'admin', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/uzytkownicy',    label: 'Użytkownicy',       icon: Users,         group: 'admin', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/team-claims',    label: 'Team claims',       icon: UserCheck,     group: 'admin', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/zespoly',        label: 'Projekty zespołów', icon: Briefcase,     group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/wyniki',         label: 'Wyniki & Jury',     icon: Trophy,        group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/certyfikaty',    label: 'Certyfikaty',       icon: Award,         group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/obecnosc',       label: 'Attendance',        icon: CalendarCheck, group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/wydarzenia',     label: 'Wydarzenia',        icon: Calendar,      group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/mailing',        label: 'Mailing',           icon: Mail,          group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/ankiety',        label: 'Ankiety',           icon: BarChart3,     group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/zapytania',      label: 'Zapytania',         icon: MessageSquare, group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/wspolprace',     label: 'Współprace',        icon: Handshake,     group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/galeria',        label: 'Galeria',           icon: ImageIcon,     group: 'admin', roles: ['admin'] },
  { to: '/panel/admin/organizacja',    label: 'Organizacja',       icon: Settings,      group: 'admin', roles: ['admin'] },

  // ─── Głosowanie (warunkowo — tylko gdy edycja aktywna) ──────────────────
  { to: '/hackathon#voting',   label: 'Głosowanie',    icon: Vote,          group: 'user' },
];

/**
 * Filtruje NAV_ITEMS po rolach zalogowanego usera.
 * Zwraca dwie tablice — jedną na grupę — w kolejności zadeklarowanej wyżej.
 */
export function partitionNav(keycloakRoles: string[]): { user: NavItem[]; admin: NavItem[] } {
  const visible = NAV_ITEMS.filter(
    item => !item.roles || item.roles.some(r => keycloakRoles.includes(r))
  );
  return {
    user:  visible.filter(i => i.group === 'user'),
    admin: visible.filter(i => i.group === 'admin'),
  };
}
