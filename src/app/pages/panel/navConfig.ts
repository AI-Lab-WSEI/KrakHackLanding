/**
 * navConfig — deklaratywna konfiguracja sidebara panelu.
 *
 * Sidebar ma:
 *   • MÓJ OBSZAR (`group: 'user'`) — widoczne dla każdego zalogowanego,
 *     filtrowane dodatkowo po `requiredScopes` (hackathon-participant /
 *     scienceclub-participant / jury).
 *   • ADMINISTRACJA — pod kontrolą ContextSwitcher (krakhack / lab / system).
 *     Itemy oznaczone `ctx: 'krakhack' | 'lab' | 'system'` filtrowane po
 *     aktualnym kontekście.
 *
 * Ikony z lucide-react — spójne ze starymi komponentami `Admin*.tsx`.
 */
import {
  LayoutDashboard, User, FolderKanban, Users2, Vote, Award, Users, ClipboardList,
  UserCheck, Trophy, Briefcase, Image as ImageIcon, Calendar, CalendarCheck,
  Mail, BarChart3, MessageSquare, Handshake, Settings, FileText, Compass,
  type LucideIcon,
} from 'lucide-react';
import type { PanelCtx } from './ContextSwitcher';

export type NavGroup  = 'user' | 'admin';
export type UserScope = 'hackathon' | 'scienceclub' | 'jury';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  end?: boolean;
  /**
   * Keycloak role permissions (user ma zobaczyć item jeśli ma jedną z).
   * Undefined = każdy zalogowany.
   */
  roles?: string[];
  /**
   * (Tylko dla `group: 'admin'`) — pod który kontekst ContextSwitcher należy.
   * Ukryty gdy aktywny ctx jest inny.
   */
  ctx?: PanelCtx;
  /**
   * (Tylko dla `group: 'user'`) — wymagany scope uczestnictwa.
   * Example: `['hackathon']` = tylko widoczne dla hackathon-participant/admin.
   * Undefined = każdy zalogowany (np. profil, dashboard).
   */
  requiredScopes?: UserScope[];
}

/**
 * Kolejność w tej tablicy = kolejność w sidebarze po filtrowaniu.
 */
export const NAV_ITEMS: NavItem[] = [
  // ─── MÓJ OBSZAR ─────────────────────────────────────────────────────────
  { to: '/panel',              label: 'Dashboard',     icon: LayoutDashboard, group: 'user', end: true },
  { to: '/panel/profil',       label: 'Mój profil',    icon: User,            group: 'user' },
  { to: '/panel/projekty',     label: 'Moje projekty', icon: FolderKanban,    group: 'user' },

  // Scope: hackathon-participant
  { to: '/panel/moj-zespol',    label: 'Mój zespół',     icon: Users2,   group: 'user', requiredScopes: ['hackathon'] },
  { to: '/panel/moja-obecnosc', label: 'Moja obecność',  icon: CalendarCheck, group: 'user', requiredScopes: ['hackathon'] },

  // Scope: scienceclub-participant
  { to: '/panel/moj-kompas',    label: 'Mój kompas',     icon: Compass, group: 'user', requiredScopes: ['scienceclub'] },

  // Scope: any (public for logged-in — voting może być dla każdego)
  { to: '/panel/glosowanie',    label: 'Głosowanie',     icon: Vote, group: 'user', requiredScopes: ['hackathon', 'scienceclub'] },

  // ─── ADMINISTRACJA — ctx: krakhack ──────────────────────────────────────
  { to: '/panel/admin/krakhack/edycje',       label: 'Edycje',            icon: Calendar,     group: 'admin', ctx: 'krakhack', roles: ['admin'] },
  { to: '/panel/admin/rejestracje',           label: 'Rejestracje',       icon: FileText,     group: 'admin', ctx: 'krakhack', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/zespoly',               label: 'Projekty zespołów', icon: Briefcase,    group: 'admin', ctx: 'krakhack', roles: ['admin'] },
  { to: '/panel/admin/wyniki',                label: 'Wyniki & Jury',     icon: Trophy,       group: 'admin', ctx: 'krakhack', roles: ['admin'] },
  { to: '/panel/admin/certyfikaty',           label: 'Certyfikaty',       icon: Award,        group: 'admin', ctx: 'krakhack', roles: ['admin'] },
  { to: '/panel/admin/obecnosc',              label: 'Attendance',        icon: CalendarCheck, group: 'admin', ctx: 'krakhack', roles: ['admin'] },
  { to: '/panel/admin/galeria',               label: 'Galeria',           icon: ImageIcon,    group: 'admin', ctx: 'krakhack', roles: ['admin'] },

  // ─── ADMINISTRACJA — ctx: lab ───────────────────────────────────────────
  { to: '/panel/admin/aplikacje',             label: 'Aplikacje do koła', icon: ClipboardList, group: 'admin', ctx: 'lab', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/lab/kompas',            label: 'Kompas kompetencji', icon: Compass,      group: 'admin', ctx: 'lab', roles: ['admin'] },
  { to: '/panel/admin/wspolprace',            label: 'Współprace',        icon: Handshake,    group: 'admin', ctx: 'lab', roles: ['admin'] },
  { to: '/panel/admin/zapytania',             label: 'Zapytania',         icon: MessageSquare, group: 'admin', ctx: 'lab', roles: ['admin'] },
  { to: '/panel/admin/organizacja',           label: 'Organizacja',       icon: Settings,     group: 'admin', ctx: 'lab', roles: ['admin'] },

  // ─── ADMINISTRACJA — ctx: system ────────────────────────────────────────
  { to: '/panel/admin/uzytkownicy',           label: 'Użytkownicy',       icon: Users,         group: 'admin', ctx: 'system', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/team-claims',           label: 'Team claims',       icon: UserCheck,     group: 'admin', ctx: 'system', roles: ['admin', 'moderator'] },
  { to: '/panel/admin/wydarzenia',            label: 'Wydarzenia',        icon: Calendar,      group: 'admin', ctx: 'system', roles: ['admin'] },
  { to: '/panel/admin/mailing',               label: 'Mailing',           icon: Mail,          group: 'admin', ctx: 'system', roles: ['admin'] },
  { to: '/panel/admin/ankiety',               label: 'Ankiety',           icon: BarChart3,     group: 'admin', ctx: 'system', roles: ['admin'] },
];

/**
 * Mapa Keycloak role → UserScope. Admin ma wszystkie scope (widzi wszystko).
 */
function scopesForRoles(keycloakRoles: string[]): Set<UserScope> {
  const scopes = new Set<UserScope>();
  if (keycloakRoles.includes('admin')) {
    scopes.add('hackathon');
    scopes.add('scienceclub');
    scopes.add('jury');
    return scopes;
  }
  if (keycloakRoles.includes('hackathon-participant'))    scopes.add('hackathon');
  if (keycloakRoles.includes('scienceclub-participant'))  scopes.add('scienceclub');
  if (keycloakRoles.includes('jury'))                      scopes.add('jury');
  return scopes;
}

/**
 * Filtruje NAV_ITEMS po rolach Keycloak + aktualnym ctx + scope uczestnictwa.
 * Zwraca dwie tablice: user (zawsze widoczne po scope filter) i admin (filter po ctx).
 */
export function partitionNav(
  keycloakRoles: string[],
  currentCtx: PanelCtx,
): { user: NavItem[]; admin: NavItem[] } {
  const userScopes = scopesForRoles(keycloakRoles);

  const userItems = NAV_ITEMS.filter(item => {
    if (item.group !== 'user') return false;
    // Role-check (jeśli explicit)
    if (item.roles && !item.roles.some(r => keycloakRoles.includes(r))) return false;
    // Scope-check
    if (item.requiredScopes && !item.requiredScopes.some(s => userScopes.has(s))) return false;
    return true;
  });

  const adminItems = NAV_ITEMS.filter(item => {
    if (item.group !== 'admin') return false;
    if (item.ctx && item.ctx !== currentCtx) return false;
    if (item.roles && !item.roles.some(r => keycloakRoles.includes(r))) return false;
    return true;
  });

  return { user: userItems, admin: adminItems };
}
