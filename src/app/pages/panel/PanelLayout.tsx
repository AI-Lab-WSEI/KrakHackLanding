/**
 * PanelLayout — sidebar layout dla wszystkich stron /panel/*.
 *
 * Struktura sidebara:
 *   • Brand + user identity + role badges
 *   • MÓJ OBSZAR (scope-aware per Keycloak role)
 *   • ContextSwitcher (tylko admin/mod) — przełącza ADMINISTRACJA między
 *     krakhack / lab / system.
 *   • Edition picker (tylko gdy ctx=krakhack) — dla sekcji per-edycja.
 *   • ADMINISTRACJA (filtrowane po ctx + roli)
 *
 * Styl = stary admin: bg-gray-950 + bg-white/5 + border-white/10 + lucide ikony.
 */
import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { LogOut, Calendar, Eye, X as XIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { partitionNav, type NavItem, type UserScope } from './navConfig';
import { ContextSwitcher, readCtx } from './ContextSwitcher';
import { usePreviewScope } from './usePreviewScope';
import { EDITIONS_META, CURRENT_EDITION_NUMBER } from '@/data/edition-registry';

export function PanelLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Wszystkie hook'i PRZED early returnem (React rules of hooks — stabilna kolejność)
  const { previewScope, setPreviewScope, canUsePreview, isPreviewActive } = usePreviewScope();

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

  const currentCtx                = readCtx(location.search);
  const { user: userNav, admin: adminNav } = partitionNav(user.keycloakRoles, currentCtx, previewScope);
  const isAdminOrMod              = user.keycloakRoles.includes('admin') || user.keycloakRoles.includes('moderator');

  // Edition picker: widoczny tylko gdy ctx=krakhack i user ma admin.
  const showEditionPicker  = isAdminOrMod && currentCtx === 'krakhack';
  const params             = new URLSearchParams(location.search);
  const currentEdition     = parseInt(params.get('edition') ?? String(CURRENT_EDITION_NUMBER), 10) || CURRENT_EDITION_NUMBER;
  const availableEditions  = EDITIONS_META.filter(e => e.status !== 'placeholder');

  function onEditionChange(newEdition: number) {
    const next = new URLSearchParams(location.search);
    next.set('edition', String(newEdition));
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  }

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

        <nav className="flex-1 flex flex-col gap-4">
          {/* Admin preview switcher — widoczny tylko dla admina.
              Pozwala "wejść w buty" uczestnika bez zmiany ról Keycloak. */}
          {canUsePreview && (
            <PreviewSwitcher
              current={previewScope}
              onChange={setPreviewScope}
            />
          )}

          {/* MÓJ OBSZAR — scope-aware (uwzględnia preview scope) */}
          {userNav.length > 0 && (
            <NavGroup
              label={isPreviewActive ? `Mój obszar (podgląd: ${previewScope})` : 'Mój obszar'}
              items={userNav}
            />
          )}

          {/* ContextSwitcher — widoczny dla admin/mod */}
          {isAdminOrMod && <ContextSwitcher />}

          {/* Administracja — items filtrowane po ctx */}
          {adminNav.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-medium text-gray-600 uppercase tracking-widest mb-2">
                Administracja
              </p>

              {/* Edition picker — widoczny tylko dla ctx=krakhack */}
              {showEditionPicker && (
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
              )}

              <div className="flex flex-col gap-0.5">
                {adminNav.map(item => (
                  <AdminNavLink
                    key={item.to}
                    item={item}
                    currentSearch={location.search}
                  />
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
        {/* Sticky preview banner — widoczny gdy admin w trybie podglądu. */}
        {isPreviewActive && (
          <div className="sticky top-0 z-40 bg-amber-500/15 border-b border-amber-500/40 backdrop-blur px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-100">
              <Eye className="w-3.5 h-3.5" />
              <span>
                <strong>Podgląd aktywny</strong> — widzisz panel jak użytkownik z rolą{' '}
                <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">{previewScope}</code>.
                Akcje nadal wykonują się jako admin.
              </span>
            </div>
            <button
              onClick={() => setPreviewScope(null)}
              className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-500/40 px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              <XIcon className="w-3 h-3" />
              Wyłącz podgląd
            </button>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}

/**
 * PreviewSwitcher — segmented control pozwalający adminowi wybrać widok jako
 * uczestnik koła / hackathonu / jury. Widoczny TYLKO dla adminów (guardowany
 * w PanelLayout przez canUsePreview). Stan synchronizowany z URL ?preview=.
 */
function PreviewSwitcher({
  current, onChange,
}: {
  current: UserScope | null;
  onChange: (s: UserScope | null) => void;
}) {
  const options: Array<{ value: UserScope | null; label: string; cls: string }> = [
    { value: null,          label: 'Admin',     cls: 'bg-purple-500/20 text-purple-200 border-purple-500/40' },
    { value: 'hackathon',   label: 'Hackathon', cls: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40' },
    { value: 'scienceclub', label: 'Koło',      cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' },
    { value: 'jury',        label: 'Jury',      cls: 'bg-amber-500/20 text-amber-200 border-amber-500/40' },
  ];

  return (
    <div className="px-3">
      <p className="text-[10px] font-medium text-gray-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
        <Eye className="w-3 h-3" />
        Podgląd jako
      </p>
      <div className="grid grid-cols-2 gap-1">
        {options.map(opt => {
          const active = current === opt.value;
          return (
            <button
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                active ? opt.cls + ' font-medium' : 'bg-white/5 text-gray-500 border-white/10 hover:text-gray-300 hover:border-white/20'
              }`}
              title={opt.value ? `Zobacz panel jako ${opt.label.toLowerCase()}` : 'Wróć do widoku admina'}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
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
 * AdminNavLink — propaguje ctx + edition query params do linków admin.
 * Dzięki temu kliknięcie w "Wyniki" z ctx=krakhack + edition=2 prowadzi
 * do /panel/admin/wyniki?ctx=krakhack&edition=2 (nie gubi kontekstu).
 */
function AdminNavLink({
  item, currentSearch,
}: {
  item: NavItem;
  currentSearch: string;
}) {
  const params = new URLSearchParams(currentSearch);
  // Zachowujemy tylko ctx i edition (żeby nie propagować np. ?tab=... z innej strony)
  const propagated = new URLSearchParams();
  const ctx  = params.get('ctx');
  const edt  = params.get('edition');
  if (ctx) propagated.set('ctx', ctx);
  if (edt) propagated.set('edition', edt);
  const qs   = propagated.toString();
  const to   = qs ? `${item.to}?${qs}` : item.to;

  return (
    <NavLink
      to={to}
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
