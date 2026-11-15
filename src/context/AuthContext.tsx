import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { deleteToken, saveToken } from '@/utils/tokenStorage';

interface AuthState {
  isLoggedIn: boolean;
  ready: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  // Al abrir la app se borra cualquier sesión guardada: siempre empieza en el login.
  // Para que la app recuerde la sesión, aquí se leería el token guardado en lugar de borrarlo.
  useEffect(() => {
    deleteToken()
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (token: string) => {
    await saveToken(token);
    setIsLoggedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await deleteToken();
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({ isLoggedIn, ready, signIn, signOut }),
    [isLoggedIn, ready, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}