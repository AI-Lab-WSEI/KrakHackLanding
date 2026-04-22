/**
 * AdminDashboard — /panel/admin
 * Dostęp: tylko rola 'admin'
 * Kafelki do starych narzędzi + nowych funkcji Faza 2+
 */
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

const TILES = [
  {
    label: 'Stary panel admina',
    emoji: '🔧',
    href: '/admin',
    desc: 'Certyfikaty, submissions, mailingi, konfiguracja',
    external: false,
  },
  {
    label: 'Użytkownicy & zaproszenia',
    emoji: '👥',
    href: '/panel/moderator',
    desc: 'Lista użytkowników, zmiana ról, wysyłanie zaproszeń',
    external: false,
  },
  {
    label: 'Obecność',
    emoji: '✅',
    href: '/admin/attendance',
    desc: 'Rejestracja obecności uczestników',
    external: false,
  },
  {
    label: 'Hackathon Timer',
    emoji: '⏱',
    href: '/timer',
    desc: 'Zarządzanie odliczaniem i harmonogramem',
    external: false,
  },
  {
    label: 'Wydarzenia',
    emoji: '📅',
    href: '/panel/admin/wydarzenia',
    desc: 'Zarządzaj wydarzeniami w kalendarzu (dodaj, ukryj, usuń)',
    external: false,
  },
] as const;

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  if (!user.keycloakRoles.includes('admin')) {
    return <Navigate to="/panel" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold">Panel Admina</h1>
        <p className="text-gray-400 text-sm mt-1">Zarządzaj platformą AI Krak Hack</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TILES.map(tile => (
          <button
            key={tile.label}
            onClick={() => navigate(tile.href)}
            className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-xl p-5 text-left flex flex-col gap-1.5 transition-colors"
          >
            <span className="text-2xl">{tile.emoji}</span>
            <span className="font-medium text-sm">{tile.label}</span>
            <span className="text-xs text-gray-500">{tile.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
