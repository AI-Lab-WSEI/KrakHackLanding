/**
 * ProtectedRoute — auth guard dla Keycloak JWT
 *
 * Użycie:
 *   <ProtectedRoute>...</ProtectedRoute>                       // wymaga logowania
 *   <ProtectedRoute roles={['admin']}>...</ProtectedRoute>    // wymaga roli
 */
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  /** Jeśli podane — użytkownik musi mieć co najmniej jedną z tych ról */
  roles?: string[];
  children: React.ReactNode;
}

export function ProtectedRoute({ roles, children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-400 text-sm">Ładowanie…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/logowanie" replace />;
  }

  if (roles && roles.length > 0) {
    const hasRole = roles.some(r => user.keycloakRoles.includes(r));
    if (!hasRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
          <div className="text-center space-y-2">
            <p className="text-3xl">🚫</p>
            <h2 className="text-lg font-bold">Brak dostępu</h2>
            <p className="text-gray-400 text-sm">
              Nie masz uprawnień do tej strony.<br />
              Wymagana rola: <code className="text-indigo-400">{roles.join(' | ')}</code>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
