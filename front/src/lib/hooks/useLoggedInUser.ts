import { validateLogin } from '@/utils/Utils';
import { useCallback, useMemo } from 'react';
import { useCookies } from 'react-cookie';
import api from '../../api/api';

export type Role =
  | 'superuser'
  | 'association'
  | 'rangeofficer'
  | 'rangemaster'
  | undefined;

export function useLoggedInUser() {
  const [cookies, setCookie, removeCookie] = useCookies(['username', 'role']);

  const username = useMemo(() => cookies.username, [cookies.username]);
  const role = useMemo(() => cookies.role as Role, [cookies.role]);

  const logout = useCallback(async () => {
    await api.signOut();
    removeCookie('username');
    removeCookie('role');
    location.reload();
  }, [removeCookie]);

  const validateToken = useCallback(async () => {
    if (!username) return false;
    const isTokenValid = await validateLogin();
    if (!isTokenValid) {
      await logout();
      return false;
    }
    return true;
  }, [username, logout]);

  const isLoggedIn = useMemo(() => !!username, [username]);

  return {
    isLoggedIn,
    username,
    role,
    logout,
    validateToken,
  };
}
