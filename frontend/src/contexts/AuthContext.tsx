import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// UserInfo 타입 정의
export interface UserInfo {
  email: string | null;
  name: string | null;
  role: 'USER' | 'COMPANY' | 'ADMIN';
  baseUserId: string | null;
  companyId?: string;
}

// JWT Payload 타입 정의
interface JwtPayload {
  sub: string;
  role: string;
  baseUserId: string;
  email: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

// AuthContext 타입 정의
interface AuthContextType {
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
  getToken: () => string | null;
  refreshAccessToken: () => Promise<boolean>;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// JWT 디코딩 함수
const decodeJwt = (token: string): JwtPayload => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (e) {
    console.error('Invalid JWT token:', e);
    throw e;
  }
};

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 토큰 가져오기
  const getToken = useCallback((): string | null => {
    return localStorage.getItem('accessToken');
  }, []);

  // 토큰에서 사용자 정보 추출
  const getUserInfoFromToken = useCallback((): UserInfo | null => {
    try {
      const token = getToken();
      if (!token) return null;

      const decoded = decodeJwt(token);
      
      return {
        email: decoded.sub || null,  // JWT의 subject는 email
        name: decoded.name || null,
        role: decoded.role as 'USER' | 'COMPANY' | 'ADMIN',
        baseUserId: decoded.baseUserId ? String(decoded.baseUserId) : null
      };
    } catch (error) {
      console.error('Error getting user info from token:', error);
      return null;
    }
  }, [getToken]);

  // 로그인 상태 확인
  const checkAuthStatus = useCallback(() => {
    try {
      const token = getToken();
      if (!token) {
        setUserInfo(null);
        setIsLoggedIn(false);
        return;
      }

      // 토큰 만료 확인
      const decoded = decodeJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (decoded.exp && decoded.exp < currentTime) {
        // 토큰 만료됨
        logout();
        return;
      }

      const user = getUserInfoFromToken();
      if (user) {
        setUserInfo(user);
        setIsLoggedIn(true);
      } else {
        setUserInfo(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUserInfo(null);
      setIsLoggedIn(false);
    }
  }, [getToken, getUserInfoFromToken]);

  // 로그인
  const login = useCallback((token: string, refreshToken?: string) => {
    localStorage.setItem('accessToken', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 로그아웃
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUserInfo(null);
    setIsLoggedIn(false);
  }, []);

  // 토큰 갱신
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        checkAuthStatus();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  }, [logout, checkAuthStatus]);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // 토큰 만료 체크 (선택적 - 5분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoggedIn) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, [isLoggedIn, checkAuthStatus]);

  const contextValue: AuthContextType = {
    userInfo,
    isLoggedIn,
    login,
    logout,
    checkAuthStatus,
    getToken,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};