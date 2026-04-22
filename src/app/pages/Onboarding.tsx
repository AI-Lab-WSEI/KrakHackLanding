/**
 * Onboarding — dwa tryby:
 *
 * 1. Pre-auth (?invite_token=XXX)
 *    Weryfikuje token, pokazuje pre-fill z membership_applications.
 *    Przycisk "Utwórz konto" → Keycloak login/register.
 *    Po powrocie z Keycloak dane profilu z sessionStorage są zapisywane automatycznie.
 *
 * 2. Post-auth (zalogowany, onboarding_completed = false)
 *    Pokazuje formularz do uzupełnienia profilu.
 *    Po zapisaniu → redirect do /panel.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileForm {
  displayName: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  university: string;
  graduationYear: string;
  skills: string; // comma-separated
}

const EMPTY_FORM: ProfileForm = {
  displayName: '',
  bio: '',
  githubUrl: '',
  linkedinUrl: '',
  university: '',
  graduationYear: '',
  skills: '',
};

const PENDING_ONBOARDING_KEY = 'pending_onboarding';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function savePendingOnboarding(form: ProfileForm) {
  sessionStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(form));
}

export function loadPendingOnboarding(): ProfileForm | null {
  const raw = sessionStorage.getItem(PENDING_ONBOARDING_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as ProfileForm; } catch { return null; }
}

export function clearPendingOnboarding() {
  sessionStorage.removeItem(PENDING_ONBOARDING_KEY);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Onboarding() {
  const { user, token, login, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite_token');

  const [form, setForm]       = useState<ProfileForm>(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [verifying, setVerifying] = useState(!!inviteToken);
  const [inviteData, setInviteData] = useState<{ email: string; displayName?: string } | null>(null);

  // ── Verify invite token ───────────────────────────────────────────────────
  useEffect(() => {
    if (!inviteToken) return;
    (async () => {
      setVerifying(true);
      try {
        const res = await fetch(`/api/invite/verify?token=${encodeURIComponent(inviteToken)}`);
        if (!res.ok) throw new Error('Nieprawidłowy lub wygasły link zaproszenia.');
        const data = await res.json();
        setInviteData(data);
        setForm(prev => ({
          ...prev,
          displayName: data.displayName ?? prev.displayName,
        }));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setVerifying(false);
      }
    })();
  }, [inviteToken]);

  // ── If user is authenticated, check pending onboarding data ──────────────
  useEffect(() => {
    if (!user) return;
    const pending = loadPendingOnboarding();
    if (pending) {
      setForm(pending);
      clearPendingOnboarding();
    }
  }, [user]);

  // ── If already completed onboarding, redirect to panel ───────────────────
  useEffect(() => {
    if (user?.onboardingCompleted) navigate('/panel', { replace: true });
  }, [user, navigate]);

  // ── Submit profile ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        displayName:    form.displayName.trim()  || undefined,
        bio:            form.bio.trim()           || undefined,
        githubUrl:      form.githubUrl.trim()     || undefined,
        linkedinUrl:    form.linkedinUrl.trim()   || undefined,
        university:     form.university.trim()    || undefined,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        skills: form.skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/invite/complete', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Błąd zapisu');
      }
      await refreshUser();
      navigate('/panel', { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [form, token, user, refreshUser, navigate]);

  // ── Handle Keycloak redirect from invite link ────────────────────────────
  function handleLoginFromInvite() {
    savePendingOnboarding(form);
    login();
  }

  // ─── Loading states ───────────────────────────────────────────────────────

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-gray-400 text-sm">Weryfikacja zaproszenia…</p>
      </div>
    );
  }

  if (inviteToken && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
        <div className="text-center space-y-3">
          <p className="text-3xl">😕</p>
          <h2 className="text-lg font-bold">Nieprawidłowy link</h2>
          <p className="text-gray-400 text-sm max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const isPreAuth = !user && !!inviteToken;
  const email = inviteData?.email ?? user?.email ?? '';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {isPreAuth ? 'Witaj w AI Krak Hack!' : 'Uzupełnij profil'}
          </h1>
          {email && (
            <p className="text-gray-400 text-sm mt-1">{email}</p>
          )}
          {isPreAuth && (
            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
              Wypełnij poniższe dane, a następnie utwórz konto Keycloak — Twój profil
              zostanie automatycznie uzupełniony po rejestracji.
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <Field
            label="Imię i nazwisko"
            value={form.displayName}
            onChange={v => setForm(p => ({ ...p, displayName: v }))}
            placeholder="Jan Kowalski"
          />
          <Field
            label="Bio (kilka słów o sobie)"
            value={form.bio}
            onChange={v => setForm(p => ({ ...p, bio: v }))}
            placeholder="Frontend dev, AI entuzjasta, student UJ"
            multiline
          />
          <Field
            label="GitHub URL"
            value={form.githubUrl}
            onChange={v => setForm(p => ({ ...p, githubUrl: v }))}
            placeholder="https://github.com/jankowalski"
            type="url"
          />
          <Field
            label="LinkedIn URL"
            value={form.linkedinUrl}
            onChange={v => setForm(p => ({ ...p, linkedinUrl: v }))}
            placeholder="https://linkedin.com/in/jankowalski"
            type="url"
          />
          <Field
            label="Uczelnia"
            value={form.university}
            onChange={v => setForm(p => ({ ...p, university: v }))}
            placeholder="AGH, UJ, PK, …"
          />
          <Field
            label="Rok ukończenia studiów"
            value={form.graduationYear}
            onChange={v => setForm(p => ({ ...p, graduationYear: v }))}
            placeholder="2026"
            type="number"
          />
          <Field
            label="Umiejętności (oddzielone przecinkiem)"
            value={form.skills}
            onChange={v => setForm(p => ({ ...p, skills: v }))}
            placeholder="React, TypeScript, Python, ML"
          />

          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Action button */}
          {isPreAuth ? (
            <button
              type="button"
              onClick={handleLoginFromInvite}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              Utwórz konto w Keycloak →
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? 'Zapisywanie…' : 'Zapisz profil →'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = 'text', multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  const cls =
    'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 w-full';
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-400">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
