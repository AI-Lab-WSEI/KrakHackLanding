/**
 * PanelHome — główna strona panelu uczestnika (/panel)
 * Wyświetla powitanie, role badges, nudge do onboardingu i kafelki.
 */
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_LABEL: Record<string, string> = {
  admin:                   '⚙️ Admin',
  moderator:               '🛡 Moderator',
  'hackathon-participant':  '🚀 Uczestnik Hackathonu',
  'scienceclub-participant':'🔬 Uczestnik Koła',
  jury:                    '⚖️ Jury',
};

export function PanelHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Welcome card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-3">
        <h2 className="text-xl font-semibold">
          Cześć{user.displayName ? `, ${user.displayName}` : ''}! 👋
        </h2>
        <p className="text-gray-400 text-sm">{user.email}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {user.keycloakRoles
            .filter(r => r in ROLE_LABEL)
            .map(r => (
              <span
                key={r}
                className="text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-2.5 py-1 rounded-full"
              >
                {ROLE_LABEL[r]}
              </span>
            ))}
        </div>
      </div>

      {/* Onboarding nudge */}
      {!user.onboardingCompleted && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-5 flex flex-col gap-2">
          <p className="text-amber-300 font-medium text-sm">Uzupełnij swój profil</p>
          <p className="text-amber-400/70 text-xs">
            Twój profil jest niekompletny. Dodaj bio, GitHub i umiejętności,
            żeby pojawić się w katalogu uczestników.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="mt-2 self-start text-xs bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Uzupełnij profil →
          </button>
        </div>
      )}

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {([
          { label: 'Moje projekty', emoji: '📁', disabled: false, href: '/panel/projekty' },
          { label: 'Mój zespół',    emoji: '👥', disabled: false, href: '/panel/moj-zespol' },
          { label: 'Wydarzenia',    emoji: '📅', disabled: false, href: '/wydarzenia' },
          { label: 'Certyfikaty',   emoji: '🏆', disabled: false, href: '/verify' },
        ] as const).map(item => (
          <button
            key={item.label}
            disabled={item.disabled}
            onClick={() => !item.disabled && 'href' in item && navigate(item.href)}
            className={`bg-gray-900 border rounded-xl p-5 text-left flex flex-col gap-1.5 transition-colors
              ${item.disabled
                ? 'border-gray-800 opacity-40 cursor-not-allowed'
                : 'border-gray-700 hover:border-indigo-600 cursor-pointer'}`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="font-medium text-sm">{item.label}</span>
            {item.disabled && (
              <span className="text-xs text-gray-600">{item.phase}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
