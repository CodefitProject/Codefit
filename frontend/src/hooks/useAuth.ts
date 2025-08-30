import { useState, useEffect, useCallback } from 'react';
import AuthService from '../services/authService.tsx';

// AuthService.getUserInfo()가 반환하는 타입을 정의합니다.
// 실제 반환 타입에 맞게 수정해야 할 수 있습니다.
type UserInfo = {
    email: string | null;
    baseUserId: string | null;
    name: string | null;
    role: 'USER' | 'COMPANY' | 'ADMIN';
};

export const useAuth = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const checkAuthStatus = useCallback(() => {
        try {
            const user = AuthService.getUserInfo();
            const authenticated = AuthService.isLoggedIn();

            if (user && authenticated) {
                setUserInfo(user);
                setIsLoggedIn(true);
            } else {
                setUserInfo(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('useAuth - Error checking auth status:', error);
            setUserInfo(null);
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    return { userInfo, isLoggedIn, checkAuthStatus };
};
