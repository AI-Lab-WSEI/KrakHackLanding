/**
 * PanelLayout — sidebar layout dla wszystkich stron /panel/*
 * Obsługuje auth guard i nawigację role-aware.
 */
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  emoji: string;
  end?: boolean;
  roles?: string[]; // puste = dostępne dla wszystkich zalogowanych
}

const NAV_ITEMS: NavItem[] = [
  { to: '/panel',            label: 'Dashboard',   emoji: '🏠', end: true },
  { to: '/panel/moderator',  label: 'Użytkownicy', emoji: '👥', roles: ['admin', 'moderator'] },
  { to: '/panel/admin',      label: 'Admin',       emoji: '⚙️', roles: ['admin'] },
  { to: '/verify',           label: 'Certyfikaty', emoji: '🏆' },
];

export function PanelLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/logowanie', { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400 text-sm">Ładowanie…</p>
      </div>
    );
  }

  const visibleNav = NAV_ITEMS.filter(
    item => !item.roles || item.roles.some(r => user.keycloakRoles.includes(r))
  );

  return (
    <div className="bg-gray-950 text-white flex min-h-[calc(100vh-4rem)]">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 border-r border-gray-800 flex flex-col py-6 px-3 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Brand + user */}
        <div className="px-2 mb-6">
          <p className="font-bold text-sm tracking-tight">AI Krak Hack</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {user.displayName || user.email}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                 ${isActive
                   ? 'bg-indigo-900/50 text-indigo-300 font-medium'
                   : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}`
              }
            >
              <span className="text-base leading-none">{item.emoji}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-4 flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-800/40 w-full text-left"
        >
          <span>↩</span>
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
