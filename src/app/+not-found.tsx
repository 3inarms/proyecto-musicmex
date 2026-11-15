import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function NotFound() {
  const { isLoggedIn } = useAuth();

  // Sin sesión se va al login; con sesión, al catálogo.
  return <Redirect href={isLoggedIn ? '/' : '/login'} />;
}