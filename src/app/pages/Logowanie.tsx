import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

export function Logowanie() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  // Already logged in — redirect to panel
  useEffect(() => {
    if (!loading && user) navigate('/panel', { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Ładowanie…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-950 text-white px-4">
      <h1 className="text-2xl font-bold tracking-tight">AI Krak Hack — Panel</h1>
      <p className="text-gray-400 text-sm text-center max-w-xs">
        Zaloguj się przez Keycloak, żeby uzyskać dostęp do panelu uczestnika.
      </p>
      <button
        onClick={login}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
      >
        Zaloguj się
      </button>
    </div>
  );
}
