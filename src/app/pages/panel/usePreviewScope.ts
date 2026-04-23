/**
 * usePreviewScope — admin-only preview mode.
 *
 * Admin może tymczasowo "patrzeć" na panel jak uczestnik koła/hackathonu/jury
 * BEZ zmiany ról Keycloak. Source of truth: URL search param `?preview=<scope>`.
 *
 * Przetrwanie F5: zapisujemy w sessionStorage jako miękką pamięć (nie localStorage
 * — preview ma być tymczasowe i kończyć się z sesją).
 *
 * Guard: preview działa TYLKO dla adminów. Jeśli user nie jest adminem, zwracamy
 * null niezależnie od URL (żeby nie można było "unlock'ować" widoków przez URL hack).
 *
 * Ważne: preview jest WIZUALNE. Guards na route'ach i endpointy API nadal
 * sprawdzają prawdziwe role — admin i tak ma dostęp do większości user routes
 * (jest w allow-list guardów), więc preview tylko dopasowuje co jest WIDOCZNE
 * w sidebar + PanelHome. Akcje (POST do API) pozostają admin-level.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import type { UserScope } from './navConfig';

const STORAGE_KEY = 'admin_preview_scope';
const VALID_SCOPES: readonly UserScope[] = ['hackathon', 'scienceclub', 'jury'];

export function usePreviewScope() {
  const { user }   = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const isAdmin    = !!user?.keycloakRoles.includes('admin');

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlPreview   = searchParams.get('preview');

  /**
   * Effective preview — null jeśli nie-admin albo URL/storage bez wartości.
   * URL wygrywa nad sessionStorage (explicit intent).
   */
  const previewScope: UserScope | null = useMemo(() => {
    if (!isAdmin) return null;
    const candidate = urlPreview || (typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null);
    if (candidate && (VALID_SCOPES as readonly string[]).includes(candidate)) {
      return candidate as UserScope;
    }
    return null;
  }, [isAdmin, urlPreview]);

  /** Synchronizuj URL → sessionStorage (żeby F5 zachowało preview). */
  useEffect(() => {
    if (!isAdmin || typeof window === 'undefined') return;
    if (urlPreview && (VALID_SCOPES as readonly string[]).includes(urlPreview)) {
      sessionStorage.setItem(STORAGE_KEY, urlPreview);
    } else if (urlPreview === '') {
      // explicit ?preview= (pusty) → clear
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [isAdmin, urlPreview]);

  /**
   * Programatic setter — updateuje URL search param (żeby history + shareability
   * działały). sessionStorage aktualizuje się via useEffect powyżej.
   */
  const setPreviewScope = useCallback((scope: UserScope | null) => {
    if (!isAdmin) return;
    const params = new URLSearchParams(location.search);
    if (scope) {
      params.set('preview', scope);
    } else {
      params.delete('preview');
      if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
    }
    navigate(`${location.pathname}?${params.toString()}`.replace(/\?$/, ''), { replace: true });
  }, [isAdmin, location.search, location.pathname, navigate]);

  return {
    /** Aktywny preview scope (null = admin nie używa podglądu / nie jest adminem). */
    previewScope,
    /** Set/clear preview — tylko admin. */
    setPreviewScope,
    /** Admin flag — helper dla UI (pokazać switcher?). */
    canUsePreview: isAdmin,
    /** true gdy admin aktualnie patrzy w trybie preview (nie własne role). */
    isPreviewActive: !!previewScope,
  };
}
