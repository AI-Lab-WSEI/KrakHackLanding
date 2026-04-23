/**
 * PanelLayout — sidebar layout dla wszystkich stron /panel/*.
 *
 * Dwie supersekcje w sidebarze:
 *   • MÓJ OBSZAR — dla każdego zalogowanego (dashboard, profil, projekty, zespół)
 *   • ADMINISTRACJA — admin/moderator (15 sekcji przeportowanych ze starego /admin)
 *
 * Style = stary panel admina: bg-gray-950 + bg-white/5 + border-white/10 + lucide ikony.
 */
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { partitionNav, type NavItem } from './navConfig';

export function PanelLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

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
          {adminNav.length > 0 && <NavGroup label="Administracja" items={adminNav} />}
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
