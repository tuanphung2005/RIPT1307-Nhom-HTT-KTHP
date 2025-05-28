import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
// import SessionManager from '@/components/SessionManager';
import { authService } from '@/services/auth/authService';
// import { useSessionManager } from '@/hooks/useSessionManager';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import ErrorBoundary from './components/ErrorBoundary';
import NotAccessible from './pages/exception/403';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';

export const initialStateConfig = {
    loading: <></>,
};

export async function getInitialState(): Promise<IInitialState> {
    // check xem user dang nhap chua
    const currentUser = authService.getCurrentUser();
    
    return {
        currentUser,
        permissionLoading: false,
    };
}

export const request: RequestConfig = {
    errorHandler: (error: ResponseError) => {
        const { messages } = getIntl(getLocale());
        const { response } = error;

        if (response && response.status) {
            const { status, statusText, url } = response;
            const requestErrorMessage = messages['app.request.error'];
            const errorMessage = `${requestErrorMessage} ${status}: ${url}`;
            const errorDescription = messages[`app.request.${status}`] || statusText;
            notification.error({
                message: errorMessage,
                description: errorDescription,
            });
        }

        if (!response) {
            notification.error({
                description: 'Yêu cầu gặp lỗi',
                message: 'Bạn hãy thử lại sau',
            });
        }
        throw error;
    },
};

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
    return {
        unAccessible: <NotAccessible />,
        noFound: <NotFoundContent />,
        rightContentRender: () => <RightContent />,
        disableContentMargin: false,
        footerRender: () => <Footer />,        onPageChange: () => {
            const { location } = history;
            
            // check auth cho routes protected
            const isAuthenticated = authService.isAuthenticated();
            const isLoginPage = location.pathname === '/user/login';
            
            if (!isAuthenticated && !isLoginPage) {
                history.replace('/user/login');
                return;
            }
            
            if (isAuthenticated && isLoginPage) {
                history.replace('/dashboard');
                return;
            }
            
            if (location.pathname === '/') {
                history.replace(isAuthenticated ? '/dashboard' : '/user/login');
            }
        },

        menuItemRender: (item: any, dom: any) => (
            <a
                className='not-underline'
                key={item?.path}
                href={item?.path}
                onClick={(e) => {
                    e.preventDefault();
                    history.push(item?.path ?? '/');
                }}
                style={{ display: 'block' }}
            >
                {dom}
            </a>
        ),        childrenRender: (dom) => (
            <ErrorBoundary>
                <>                {dom}
                    {/* hay
					{initialState?.currentUser && (
                        <div style={{ display: 'none' }}>
                            <SessionManager />
                        </div>
                    )} */}
                </>
            </ErrorBoundary>
        ),
        
        menuHeaderRender: undefined,
        ...initialState?.settings,
    };
};
