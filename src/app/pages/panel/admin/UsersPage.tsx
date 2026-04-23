/**
 * /panel/admin/uzytkownicy — pełny CRUD na użytkownikach.
 *
 * Widoczne: admin, moderator.
 *   • admin         — edycja wszystkich pól + role + is_active toggle + hard delete + invite
 *   • moderator     — edycja profilu (display_name, bio, github, linkedin, university, skills)
 *                     bez role, bez is_active, bez delete
 *
 * Styl = stary admin: bg-white/5 + border-white/10 + lucide ikony.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router';
import { Search, UserPlus, Edit3, Ban, CheckCircle2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminFetch } from '@/lib/adminApi';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role =
  | 'admin'
  | 'moderator'
  | 'hackathon-participant'
  | 'scienceclub-participant'
  | 'jury';

interface UserRow {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  onboardingCompleted: boolean;
  isActive: boolean;
  createdAt: string;
}

interface UserDetail extends UserRow {
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  university: string | null;
  graduationYear: number | null;
  skills: string[];
  isPublic: boolean;
  notifyEvents: boolean;
  profileSlug: string | null;
  avatarUrl: string | null;
  updatedAt: string;
}

const ROLE_LABEL: Record<Role, string> = {
  'admin':                    'Admin',
  'moderator':                'Moderator',
  'hackathon-participant':    'Hackathon',
  'scienceclub-participant':  'Koło',
  'jury':                     'Jury',
};

const ROLE_STYLE: Record<Role, string> = {
  'admin':                    'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'moderator':                'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'hackathon-participant':    'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  'scienceclub-participant':  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'jury':                     'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

const ROLE_OPTIONS: Role[] = ['admin', 'moderator', 'hackathon-participant', 'scienceclub-participant', 'jury'];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [roleFilter, setRoleFilter]     = useState<'all' | Role>('all');
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [showInvite, setShowInvite]     = useState(false);

  if (!user) return null;
  const canAccess = user.keycloakRoles.includes('admin') || user.keycloakRoles.includes('moderator');
  if (!canAccess) return <Navigate to="/panel" replace />;

  const isAdmin = user.keycloakRoles.includes('admin');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/panel/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(u => {
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'disabled' && u.isActive) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!term) return true;
      return (
        u.email.toLowerCase().includes(term) ||
        (u.displayName ?? '').toLowerCase().includes(term)
      );
    });
  }, [users, search, statusFilter, roleFilter]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <PanelSectionHeader
        eyebrow="Zarządzanie"
        title="Użytkownicy"
        subtitle={isAdmin ? 'Pełna kontrola — edycja, zawieszenie, usunięcie, zmiana roli.' : 'Edycja profili (bez zmiany roli i dezaktywacji).'}
        cta={isAdmin ? (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Zaproś
          </button>
        ) : undefined}
      />

      {/* Filters */}
      <PanelCard padding="sm" className="mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj po emailu lub imieniu…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="active">Aktywni</option>
            <option value="disabled">Zawieszeni</option>
          </select>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
          >
            <option value="all">Wszystkie role</option>
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>

          <span className="text-xs text-gray-500 whitespace-nowrap">
            {filtered.length} / {users.length}
          </span>
        </div>
      </PanelCard>

      {/* Table */}
      {loading ? (
        <PanelCard padding="lg" className="text-center text-sm text-gray-400">Ładowanie…</PanelCard>
      ) : error ? (
        <PanelCard padding="lg" className="text-center text-sm text-red-400">{error}</PanelCard>
      ) : filtered.length === 0 ? (
        <PanelCard padding="lg" className="text-center text-sm text-gray-500">Brak użytkowników</PanelCard>
      ) : (
        <PanelCard padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">Użytkownik</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">Rola</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">Dołączył</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <UserRowView
                    key={u.id}
                    user={u}
                    isAdmin={isAdmin}
                    isCurrentUser={u.id === user.id}
                    onEdit={() => setEditingId(u.id)}
                    onReload={load}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      )}

      {/* Edit modal */}
      {editingId && (
        <UserEditModal
          userId={editingId}
          isAdmin={isAdmin}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); load(); }}
        />
      )}

      {/* Invite modal (admin only) */}
      {showInvite && isAdmin && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSent={() => { setShowInvite(false); load(); }}
        />
      )}
    </div>
  );
}

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRowView({
  user, isAdmin, isCurrentUser, onEdit, onReload,
}: {
  user: UserRow;
  isAdmin: boolean;
  isCurrentUser: boolean;
  onEdit: () => void;
  onReload: () => void;
}) {
  const [busyAction, setBusyAction] = useState<string | null>(null);

  async function toggleRole(role: Role) {
    if (!isAdmin) return;
    setBusyAction('role');
    try {
      await adminFetch(`/api/panel/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      onReload();
    } finally {
      setBusyAction(null);
    }
  }

  async function toggleActive() {
    if (!isAdmin) return;
    setBusyAction('active');
    try {
      await adminFetch(`/api/panel/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      onReload();
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelete() {
    if (!isAdmin) return;
    if (isCurrentUser) {
      alert('Nie możesz usunąć własnego konta z poziomu panelu.');
      return;
    }
    const label = user.displayName || user.email;
    if (!confirm(`Usunąć użytkownika "${label}"?\n\nTej operacji nie można cofnąć.\nWszystkie projekty, claimy, głosy tego usera zostaną skasowane.`)) return;
    setBusyAction('delete');
    try {
      const res = await adminFetch(`/api/panel/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? `HTTP ${res.status}`);
        return;
      }
      onReload();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <tr className={`border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors ${!user.isActive ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3">
        <p className="font-medium text-white">{user.displayName ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
      </td>
      <td className="px-4 py-3">
        {isAdmin ? (
          <select
            value={user.role}
            disabled={busyAction === 'role'}
            onChange={e => toggleRole(e.target.value as Role)}
            className={`text-xs rounded-md border px-2 py-1 focus:outline-none focus:border-white/30 disabled:opacity-50 ${ROLE_STYLE[user.role]}`}
          >
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r} className="bg-gray-900">{ROLE_LABEL[r]}</option>
            ))}
          </select>
        ) : (
          <span className={`text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-full ${ROLE_STYLE[user.role]}`}>
            {ROLE_LABEL[user.role]}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {!user.isActive ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            Zawieszony
          </span>
        ) : user.onboardingCompleted ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
            Aktywny
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Niekompletny
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {new Date(user.createdAt).toLocaleDateString('pl-PL')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <IconButton onClick={onEdit} title="Edytuj profil">
            <Edit3 className="w-3.5 h-3.5" />
          </IconButton>
          {isAdmin && (
            <>
              <IconButton
                onClick={toggleActive}
                disabled={busyAction === 'active' || isCurrentUser}
                title={user.isActive ? 'Zawieś konto (is_active=false)' : 'Aktywuj konto'}
                className={user.isActive ? 'hover:text-amber-300' : 'hover:text-green-300'}
              >
                {busyAction === 'active'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : user.isActive
                    ? <Ban className="w-3.5 h-3.5" />
                    : <CheckCircle2 className="w-3.5 h-3.5" />}
              </IconButton>
              <IconButton
                onClick={handleDelete}
                disabled={busyAction === 'delete' || isCurrentUser}
                title="Usuń konto (nieodwracalne)"
                className="hover:text-red-400"
              >
                {busyAction === 'delete'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />}
              </IconButton>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function IconButton({
  onClick, disabled, title, className, children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function UserEditModal({
  userId, isAdmin, onClose, onSaved,
}: {
  userId: string;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData]       = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Form state — editable fields
  const [form, setForm] = useState({
    displayName:     '',
    bio:             '',
    githubUrl:       '',
    linkedinUrl:     '',
    university:      '',
    graduationYear:  '',
    skills:          '',
    isActive:        true,
    isPublic:        true,
    notifyEvents:    true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminFetch(`/api/panel/users/${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d: UserDetail = await res.json();
        if (cancelled) return;
        setData(d);
        setForm({
          displayName:    d.displayName       ?? '',
          bio:            d.bio               ?? '',
          githubUrl:      d.githubUrl         ?? '',
          linkedinUrl:    d.linkedinUrl       ?? '',
          university:     d.university        ?? '',
          graduationYear: d.graduationYear?.toString() ?? '',
          skills:         (d.skills ?? []).join(', '),
          isActive:       d.isActive,
          isPublic:       d.isPublic,
          notifyEvents:   d.notifyEvents,
        });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        displayName:    form.displayName.trim() || null,
        bio:            form.bio.trim()         || null,
        githubUrl:      form.githubUrl.trim()   || null,
        linkedinUrl:    form.linkedinUrl.trim() || null,
        university:     form.university.trim()  || null,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        skills:         form.skills.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (isAdmin) {
        body.isActive     = form.isActive;
        body.isPublic     = form.isPublic;
        body.notifyEvents = form.notifyEvents;
      }

      const res = await adminFetch(`/api/panel/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30';

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-gray-950 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-semibold text-white">Edycja użytkownika</h3>
            {data && <p className="text-xs text-gray-500 mt-0.5">{data.email}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Ładowanie…</p>
          ) : error ? (
            <p className="text-sm text-red-400 text-center py-8">{error}</p>
          ) : data ? (
            <form onSubmit={handleSubmit} className="space-y-4" id="user-edit-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Imię i nazwisko">
                  <input
                    value={form.displayName}
                    onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    className={inputCls}
                    placeholder="Jan Kowalski"
                  />
                </Field>
                <Field label="Email" hint="tylko do odczytu (identyfikator Keycloak)">
                  <input value={data.email} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </Field>
              </div>

              <Field label="Bio">
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Krótki opis usera (publicznie widoczny)"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="GitHub URL">
                  <input
                    type="url"
                    value={form.githubUrl}
                    onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                    className={inputCls}
                    placeholder="https://github.com/user"
                  />
                </Field>
                <Field label="LinkedIn URL">
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
                    className={inputCls}
                    placeholder="https://linkedin.com/in/user"
                  />
                </Field>
                <Field label="Uczelnia">
                  <input
                    value={form.university}
                    onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                    className={inputCls}
                    placeholder="AGH, UJ, WSEI, …"
                  />
                </Field>
                <Field label="Rok ukończenia">
                  <input
                    type="number"
                    value={form.graduationYear}
                    onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))}
                    className={inputCls}
                    placeholder="2026"
                  />
                </Field>
              </div>

              <Field label="Umiejętności (po przecinku)">
                <input
                  value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  className={inputCls}
                  placeholder="React, Python, ML, ..."
                />
              </Field>

              {isAdmin && (
                <div className="border-t border-white/10 pt-4 mt-2 space-y-3">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Admin — ustawienia konta</p>
                  <Toggle
                    label="Aktywne konto"
                    hint={form.isActive ? 'User może się logować' : 'User zablokowany (is_active = false)'}
                    checked={form.isActive}
                    onChange={v => setForm(f => ({ ...f, isActive: v }))}
                  />
                  <Toggle
                    label="Profil publiczny"
                    hint={form.isPublic ? 'Widoczny na /uczestnicy' : 'Ukryty w katalogu'}
                    checked={form.isPublic}
                    onChange={v => setForm(f => ({ ...f, isPublic: v }))}
                  />
                  <Toggle
                    label="Powiadomienia o wydarzeniach"
                    hint={form.notifyEvents ? 'Dostaje maile o nowych eventach' : 'Opted-out'}
                    checked={form.notifyEvents}
                    onChange={v => setForm(f => ({ ...f, notifyEvents: v }))}
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
                  {error}
                </div>
              )}
            </form>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-white/10 sticky bottom-0 bg-gray-950 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="submit"
            form="user-edit-form"
            disabled={loading || saving || !data}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-gray-600">{hint}</span>}
    </label>
  );
}

function Toggle({
  label, hint, checked, onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-indigo-600 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-white">{label}</div>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [email, setEmail]     = useState('');
  const [name, setName]       = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await adminFetch('/api/invite/send', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), displayName: name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Błąd serwera');
      setResult({ ok: true, message: `Zaproszenie wysłane na ${email}` });
      onSent();
    } catch (err) {
      setResult({ ok: false, message: (err as Error).message });
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30';

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Wyślij zaproszenie</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jan.kowalski@example.com"
              className={inputCls}
            />
          </Field>
          <Field label="Imię i nazwisko (opcjonalnie)">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jan Kowalski"
              className={inputCls}
            />
          </Field>

          {result && (
            <div className={`p-3 rounded-lg text-xs text-center ${
              result.ok
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {result.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Wyślij
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
