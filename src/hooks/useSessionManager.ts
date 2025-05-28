// KHONG DUOC XOA
// KHONG DUOC XOA
// CAI NAY CUA TUAN

/*
import { authService } from '@/services/auth/authService';
import { useEffect, useCallback } from 'react';
import { history, useModel } from 'umi';

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if expiring within 10 minutes

export const useSessionManager = () => {
  const { setInitialState } = useModel('@@initialState');

  const handleSessionExpired = useCallback(() => {
    authService.logout();
    setInitialState({ currentUser: undefined, permissionLoading: false });
    history.replace('/user/login');
  }, [setInitialState]);

  const checkAndRefreshSession = useCallback(async () => {
    try {
      // Check if user is still authenticated
      if (!authService.isAuthenticated()) {
        handleSessionExpired();
        return;
      }

      // Check if token needs refreshing
      const tokenData = (authService as any).getTokenData();
      if (tokenData) {
        const expiryTime = new Date(tokenData.expiresAt).getTime();
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        // If token expires within threshold, refresh it
        if (timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0) {
          const refreshResult = await authService.autoRefreshToken();
          if (!refreshResult) {
            handleSessionExpired();
            return;
          }
        }
      }

      // Verify session is still valid
      if (!authService.checkSession()) {
        handleSessionExpired();
      }
    } catch (error) {
      console.error('Session check failed:', error);
      handleSessionExpired();
    }
  }, [handleSessionExpired]);

  useEffect(() => {
    // Only run session management if user is authenticated
    if (!authService.isAuthenticated()) {
      return;
    }

    // Initial session check
    checkAndRefreshSession();

    // Set up periodic session checks
    const intervalId = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL);

    // Check session on page focus (user came back to tab)
    const handleFocus = () => {
      checkAndRefreshSession();
    };

    // Check session on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAndRefreshSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAndRefreshSession]);
  return {
    checkAndRefreshSession,
    handleSessionExpired,
  };
};
*/
