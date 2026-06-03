'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
}

export interface AuthPaths {
  home: string;
  login: string;
  register: string;
  logout: string;
  profile: string;
  settings: string;
  callback: string;
  verify: string;
  forgotPassword: string;
  resetPassword: string;
  admin: string;
  dashboard: string;
}

export const authPaths: AuthPaths = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  profile: '/profile',
  settings: '/settings',
  callback: '/auth/callback',
  verify: '/auth/verify-request',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  admin: '/admin',
  dashboard: '/dashboard',
};

export const AUTH_BASE_PATH = '/auth';
export const PROTECTED_PATH_PREFIXES: string[] = ['/profile', '/settings', '/dashboard', '/admin'];
export const PUBLIC_PATHS: string[] = [
  authPaths.home,
  authPaths.login,
  authPaths.register,
  authPaths.callback,
  authPaths.verify,
  authPaths.forgotPassword,
  authPaths.resetPassword,
];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  moderator: 2,
  admin: 3,
};

export interface AuthContextValue {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (provider?: string, callbackUrl?: string) => Promise<void>;
  signOut: (callbackUrl?: string) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Session fetch failed');
        const data = await res.json();
        if (!active) return;
        if (data?.user) {
          setUser(data.user);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } catch {
        if (active) {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    }
    fetchSession();
    return () => { active = false; };
  }, []);

  const signIn = useCallback(async (provider?: string, callbackUrl?: string) => {
    const redirect = callbackUrl ?? pathname ?? authPaths.home;
    if (provider) {
      const url = new URL('/api/auth/signin', window.location.origin);
      url.searchParams.set('provider', provider);
      url.searchParams.set('callbackUrl', redirect);
      window.location.href = url.toString();
    } else {
      router.push(`${authPaths.login}?callbackUrl=${encodeURIComponent(redirect)}`);
    }
  }, [router, pathname]);

  const signOut = useCallback(async (callbackUrl?: string) => {
    try {
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
    } catch {
      // noop
    }
    setUser(null);
    setStatus('unauthenticated');
    router.push(callbackUrl ?? authPaths.home);
    router.refresh();
  }, [router]);

  const hasRole = useCallback((role: UserRole) => {
    if (!user) return false;
    return (ROLE_HIERARCHY[user.role] ?? 0) >= (ROLE_HIERARCHY[role] ?? 0);
  }, [user]);

  const isAdmin = useMemo(() => hasRole('admin'), [hasRole]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn,
      signOut,
      hasRole,
      isAdmin,
    }),
    [user, status, signIn, signOut, hasRole, isAdmin]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function isAuthRoute(pathname: string): boolean {
  return pathname === AUTH_BASE_PATH || pathname.startsWith(`${AUTH_BASE_PATH}/`);
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isProtectedRoute(pathname: string): boolean {
  if (isAuthRoute(pathname) || isPublicRoute(pathname)) return false;
  return PROTECTED_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    user: 'Usuario',
    moderator: 'Moderador',
    admin: 'Administrador',
  };
  return labels[role] || role;
}

export function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function buildCallbackUrl(fallback?: string): string {
  if (typeof window === 'undefined') return fallback ?? authPaths.home;
  const params = new URLSearchParams(window.location.search);
  return params.get('callbackUrl') || params.get('redirect') || fallback || authPaths.home;
}

export type AuthStatusPaths = Partial<Pick<AuthPaths, 'login' | 'register' | 'logout' | 'profile'>>;

export const defaultAuthStatusPaths: AuthStatusPaths = {
  login: authPaths.login,
  register: authPaths.register,
  logout: authPaths.logout,
  profile: authPaths.profile,
};
