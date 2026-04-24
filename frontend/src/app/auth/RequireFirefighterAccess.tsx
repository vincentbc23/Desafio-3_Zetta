import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthSession, readCachedUser, type FirefighterUser } from './session';

interface RequireFirefighterAccessProps {
  children: ReactNode;
}

export function RequireFirefighterAccess({ children }: RequireFirefighterAccessProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsLoading(false);
        }
        return;
      }

      const cachedUser = readCachedUser();
      if (cachedUser && cachedUser.role?.toLowerCase() !== 'bombeiro') {
        clearAuthSession();
        if (isMounted) {
          setIsAuthorized(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Sessão inválida');
        }

        const data = (await response.json()) as { firefighter: FirefighterUser };

        if (data.firefighter.role.toLowerCase() !== 'bombeiro') {
          throw new Error('Acesso não autorizado');
        }

        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.firefighter));

        if (isMounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch {
        clearAuthSession();
        if (isMounted) {
          setIsAuthorized(false);
          setIsLoading(false);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center text-[#F2F2F7]">
        <div className="flex items-center gap-3 bg-[#1C1C1E]/80 border border-white/10 rounded-2xl px-6 py-4">
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Verificando acesso...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}