export const AUTH_TOKEN_KEY = 'alerta-fogo-auth-token';
export const AUTH_USER_KEY = 'alerta-fogo-auth-user';

export interface FirefighterUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const clearAuthSession = () => {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

export const readCachedUser = () => {
  const cachedUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!cachedUser) {
    return null;
  }

  try {
    return JSON.parse(cachedUser) as FirefighterUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};