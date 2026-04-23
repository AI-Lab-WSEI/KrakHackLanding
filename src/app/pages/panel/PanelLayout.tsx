/**
 * PanelLayout — sidebar layout dla wszystkich stron /panel/*.
 *
 * Dwie supersekcje w sidebarze:
 *   • MÓJ OBSZAR — dla każdego zalogowanego (dashboard, profil, projekty, zespół)
 *   • ADMINISTRACJA — admin/moderator (15 sekcji przeportowanych ze starego /admin)
 *     + picker edycji hackathonu nad sekcją administracji (URL search param `?edition=N`)
 *
 * Style = stary panel admina: bg-gray-950 + bg-white/5 + border-white/10 + lucide ikony.
 */
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { LogOut, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { partitionNav, type NavItem } from './navConfig';
import { EDITIONS_META, CURRENT_EDITION_NUMBER } from '@/data/edition-registry';

export function PanelLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  const { user: userNav, admin: adminNav } = partitionNav(user.keycloakRoles);

  // Edycja z URL search param ?edition=N, domyślnie CURRENT_EDITION_NUMBER
  const params          = new URLSearchParams(location.search);
  const currentEdition  = parseInt(params.get('edition') ?? String(CURRENT_EDITION_NUMBER), 10) || CURRENT_EDITION_NUMBER;

  function onEditionChange(newEdition: number) {
    const next = new URLSearchParams(location.search);
    next.set('edition', String(newEdition));
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  }

  const availableEditions = EDITIONS_META.filter(e => e.status !== 'placeholder');

  return (
    <div className="bg-gray-950 text-white flex min-h-[calc(100vh-4rem)]">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 border-r border-white/10 flex flex-col py-6 px-3 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Brand + user identity */}
        <div className="px-3 mb-6">
          <p className="font-semibold text-sm tracking-tight text-white">AI Krak Hack</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate" title={user.email}>
            {user.displayName || user.email}
          </p>
          {user.keycloakRoles.includes('admin') && (
            <span className="inline-block mt-1.5 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
              admin
            </span>
          )}
          {user.keycloakRoles.includes('moderator') && !user.keycloakRoles.includes('admin') && (
            <span className="inline-block mt-1.5 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              moderator
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-4">
          <NavGroup label="Mój obszar" items={userNav} />
          {adminNav.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-medium text-gray-600 uppercase tracking-widest mb-2">
                Administracja
              </p>
              {/* Edition picker — widoczny tylko dla admina, steruje kontekstem edycji
                  dla sekcji hackathonowych (rejestracje, wyniki, galeria, certyfikaty itp.) */}
              <div className="px-3 mb-3">
                <label className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                  <Calendar className="w-3 h-3" />
                  Edycja
                </label>
                <select
                  value={currentEdition}
                  onChange={e => onEditionChange(parseInt(e.target.value, 10))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                >
                  {availableEditions.map(e => (
                    <option key={e.number} value={e.number}>
                      #{e.number} · {e.year}{e.status === 'active' ? ' · aktywna' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                {adminNav.map(item => (
                  <AdminNavLink key={item.to} item={item} edition={currentEdition} />
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-200 transition-colors rounded-lg hover:bg-white/5 w-full text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Wyloguj</span>
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div>
      <p className="px-3 text-[10px] font-medium text-gray-600 uppercase tracking-widest mb-2">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
               ${isActive
                 ? 'bg-white/10 text-white font-medium'
                 : 'text-gray-400 hover:text-white hover:bg-white/5'}`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

/**
 * Sub-admin NavLink — propaguje `?edition=N` do URL wszystkich linków admin.
 * Dzięki temu kliknięcie w np. "Wyniki" z picker'em ustawionym na edycję 2
 * przerzuci do `/panel/admin/wyniki?edition=2` (a nie gubi kontekstu).
 */
function AdminNavLink({ item, edition }: { item: NavItem; edition: number }) {
  const target = `${item.to}?edition=${edition}`;
  return (
    <NavLink
      to={target}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
         ${isActive
           ? 'bg-white/10 text-white font-medium'
           : 'text-gray-400 hover:text-white hover:bg-white/5'}`
      }
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}
