/**
 * PanelHome — /panel landing dla zalogowanego usera.
 *
 * Widok "MÓJ OBSZAR" — welcome + role badges + onboarding nudge + skróty.
 * Jeśli user ma rolę admin/moderator — dodatkowo button "Przejdź do panelu administracyjnego".
 */
import { Link } from 'react-router';
import { FolderKanban, Users2, Calendar, Award, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PanelCard } from '@/app/components/panel/shared/PanelCard';

const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
  admin:                    { label: 'Admin',               cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  moderator:                { label: 'Moderator',           cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  'hackathon-participant':  { label: 'Hackathon',           cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  'scienceclub-participant':{ label: 'Koło',                cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  jury:                     { label: 'Jury',                cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
};

export function PanelHome() {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin     = user.keycloakRoles.includes('admin');
  const isModerator = user.keycloakRoles.includes('moderator');

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Welcome */}
      <PanelCard padding="md">
        <h1 className="text-2xl font-semibold text-white">
          Cześć{user.displayName ? `, ${user.displayName}` : ''}!
        </h1>
        <p className="text-sm text-gray-400 mt-1">{user.email}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {user.keycloakRoles
            .filter(r => r in ROLE_LABEL)
            .map(r => (
              <span
                key={r}
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${ROLE_LABEL[r].cls}`}
              >
                {ROLE_LABEL[r].label}
              </span>
            ))}
        </div>
      </PanelCard>

      {/* Onboarding nudge */}
      {!user.onboardingCompleted && (
        <PanelCard padding="md" className="!bg-amber-500/10 !border-amber-500/30">
          <p className="text-amber-300 font-medium text-sm">Uzupełnij swój profil</p>
          <p className="text-amber-200/70 text-xs mt-1">
            Twój profil jest niekompletny. Dodaj bio, GitHub i umiejętności, żeby pojawić się w katalogu uczestników.
          </p>
          <Link
            to="/panel/profil"
            className="inline-block mt-3 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 px-4 py-2 rounded-lg transition-colors"
          >
            Uzupełnij profil →
          </Link>
        </PanelCard>
      )}

      {/* Admin shortcut */}
      {(isAdmin || isModerator) && (
        <PanelCard padding="md" className="!bg-purple-500/5 !border-purple-500/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-300" />
              <div>
                <p className="text-sm text-white font-medium">Panel administracyjny</p>
                <p className="text-xs text-gray-400">
                  {isAdmin ? 'Pełny dostęp admin' : 'Dostęp moderator'} — aplikacje, claims, mailing i więcej
                </p>
              </div>
            </div>
            <Link
              to="/panel/admin"
              className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 px-4 py-2 rounded-lg transition-colors"
            >
              Otwórz panel →
            </Link>
          </div>
        </PanelCard>
      )}

      {/* Quick links */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Mój obszar</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Mój profil',     icon: Users2,       href: '/panel/profil' },
            { label: 'Moje projekty',  icon: FolderKanban, href: '/panel/projekty' },
            { label: 'Mój zespół',     icon: Users2,       href: '/panel/moj-zespol' },
            { label: 'Wydarzenia',     icon: Calendar,     href: '/wydarzenia' },
            { label: 'Certyfikaty',    icon: Award,        href: '/verify' },
          ].map(l => (
            <Link
              key={l.href}
              to={l.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col gap-2 transition-colors"
            >
              <l.icon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-white">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
