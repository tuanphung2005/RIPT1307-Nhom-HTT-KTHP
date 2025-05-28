import { deleteOneSignal } from '@/services/base/api';
import { authService } from '@/services/auth/authService';
import { currentRole, oneSignalRole } from '@/utils/ip';
import { useAuth } from 'react-oidc-context';
import OneSignal from 'react-onesignal';
import { history, useModel } from 'umi';

export const useAuthActions = () => {
	const { initialState, setInitialState } = useModel('@@initialState');
	const auth = useAuth();

	const handleLogout = () => {
		// onesignal
		if (oneSignalRole.valueOf() === currentRole.valueOf()) {
			OneSignal.getUserId((playerId) => deleteOneSignal({ playerId }));
			OneSignal.setSubscription(false);
		}
		// oidc hay local
		const isOIDCAuth = auth?.user && auth?.isAuthenticated;
		const isLocalAuth = authService.isAuthenticated();

		if (isOIDCAuth) {
			// oidc logout
			auth
				.signoutRedirect({
					post_logout_redirect_uri: window.location.origin + '/user/login',
					id_token_hint: auth.user?.id_token,
				})
				.then(() => {
					sessionStorage.clear();
					localStorage.clear();
					setInitialState({ ...initialState, currentUser: undefined });
				});
		} else if (isLocalAuth) {
			// local auth logout
			authService.logout();
			setInitialState({ ...initialState, currentUser: undefined });
			history.replace('/user/login');
		} else {
			// panic clear all
			sessionStorage.clear();
			localStorage.clear();
			setInitialState({ ...initialState, currentUser: undefined });
			history.replace('/user/login');
		}
	};
	const handleLogin = () => {
		// OIDC? => local auth
		if (auth?.signinRedirect) {
			auth.signinRedirect();
		} else {
			history.replace('/user/login');
		}
	};	return {
		handleLogout,
		handleLogin,
		dangXuat: handleLogout,
		dangNhap: handleLogin,
		isLoading: auth?.isLoading ?? false,
		isAuthenticated: auth?.isAuthenticated ?? authService.isAuthenticated(),
		currentUser: auth?.user ?? authService.getCurrentUser(),
	};
};
