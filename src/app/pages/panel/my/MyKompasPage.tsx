/**
 * /panel/moj-kompas — profil kompetencji użytkownika (tylko scienceclub + admin).
 *
 * Widok "swoje kompetencje vs średnia koła" — lekka wersja admin-side Kompasu,
 * użytkownik widzi tylko siebie + anonimizowane porównanie.
 */
import { useEffect, useState } from 'react';
import { Compass, AlertCircle } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';
import { PanelSectionHeader } from '@/app/components/panel/shared/PanelSectionHeader';
import { useAuth } from '@/contexts/AuthContext';

interface MyStats {
  mySkillsCount:  number;
  clubSize:       number;
  clubAvgSkills:  number;
  topClubSkills:  { skill: string; count: number }[];
}

export function MyKompasPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch('/api/panel/my-stats');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        if (!cancelled) setStats(d);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!user) return null;

  const mySkillsLower = new Set(user.skills.map(s => s.toLowerCase()));

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <PanelSectionHeader
        eyebrow="Mój obszar · Koło"
        title="Mój kompas kompetencji"
        subtitle="Porównanie Twoich umiejętności z tym, co dominuje w kole. Uzupełnij profil żeby widok pokazał pełniejszy obraz."
      />

      {!user.onboardingCompleted && (
        <PanelCard padding="md" className="!bg-amber-500/10 !border-amber-500/30 mb-6">
          <p className="text-amber-300 font-medium text-sm">Uzupełnij profil</p>
          <p className="text-amber-200/70 text-xs mt-1">
            Twój profil jest niekompletny. Bez skilli w profilu kompas nie pokaże Twoich mocnych stron.
          </p>
          <a
            href="/panel/profil"
            className="inline-block mt-3 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-4 py-2 rounded-lg transition-colors"
          >
            Uzupełnij profil →
          </a>
        </PanelCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <PanelCard padding="sm">
          <Compass className="w-5 h-5 text-indigo-300 mb-2" />
          <p className="text-2xl font-bold text-white tabular-nums">{stats?.mySkillsCount ?? '—'}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Twoje umiejętności</p>
        </PanelCard>
        <PanelCard padding="sm">
          <p className="text-2xl font-bold text-white tabular-nums">{stats?.clubSize ?? '—'}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Rozmiar koła</p>
        </PanelCard>
        <PanelCard padding="sm">
          <p className="text-2xl font-bold text-white tabular-nums">{stats?.clubAvgSkills ?? '—'}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Średnia skilli / osobę</p>
        </PanelCard>
      </div>

      <PanelCard padding="md">
        <h3 className="text-sm font-medium text-white mb-1">Najczęstsze skille w kole</h3>
        <p className="text-xs text-gray-500 mb-4">
          Podświetlone = masz je w profilu. Reszta pokazuje gdzie jest najwięcej ekspertów (pożytek
          dla sesji parowania, mentoringu, projektów współzałożycielskich).
        </p>

        {loading ? (
          <p className="text-xs text-gray-500 py-6 text-center">Ładowanie…</p>
        ) : !stats || stats.topClubSkills.length === 0 ? (
          <div className="py-6 text-center">
            <AlertCircle className="w-5 h-5 text-gray-500 inline mr-2" />
            <span className="text-sm text-gray-400">Za mało danych — potrzebujemy kilku userów w kole z wypełnionymi skillami.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {stats.topClubSkills.map(sk => {
              const iHave = mySkillsLower.has(sk.skill.toLowerCase());
              const pct   = stats.clubSize > 0 ? Math.min(100, Math.round((sk.count / stats.clubSize) * 100)) : 0;
              return (
                <div key={sk.skill} className="flex items-center gap-3">
                  <div className={`text-xs w-36 shrink-0 truncate ${iHave ? 'text-indigo-300 font-medium' : 'text-gray-400'}`}>
                    {iHave && <span className="mr-1">✓</span>}
                    {sk.skill}
                  </div>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${iHave ? 'bg-indigo-400' : 'bg-white/30'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 w-16 text-right">{sk.count} · {pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </PanelCard>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Więcej analityki (funnel aplikacji, split WSEI, AI chat z kandydatami) —
        <a href="/panel/admin/lab/kompas" className="text-indigo-400 hover:underline ml-1">panel admina → Kompas</a>.
      </p>
    </div>
  );
}
