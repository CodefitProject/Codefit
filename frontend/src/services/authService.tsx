interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message?: string;
}

interface UserInfo {
  email : string | null;
  name: string | null;
  role:  'USER' | 'COMPANY' | 'ADMIN';
  baseUserId: string | null;
  companyId?: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  baseUserId: string;
  email: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

class AuthService {
  static getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  static isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken = this.decodeJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp ? decodedToken.exp > currentTime : true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
  static async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response = await fetch('/loginPro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: LoginResponse = await response.json();
      
      if (result.accessToken && result.refreshToken) {
        this.setToken(result.accessToken);
        this.setRefreshToken(result.refreshToken);
      }
      
      return result;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  static setToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  static getUserInfo(): UserInfo | null {
    try {
      const token = this.getToken();
      if (!token || !this.isLoggedIn()) {
        return null;
      }
      
      const decodedToken = this.decodeJwt(token);
      return {
        email: decodedToken.sub,
        name: decodedToken.name,
        role: decodedToken.role as 'USER' | 'COMPANY' | 'ADMIN',
        baseUserId: decodedToken.baseUserId
      };
    } catch (error) {
      console.error('Error getting user info from token:', error);
      return null;
    }
  }

  static logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  static redirectByRole(userRole: string): void {
    if (userRole === "USER") {
      window.location.reload();
    } else if (userRole === "COMPANY") {
      window.location.href = "/company/dashboard";
    }
  }

  static decodeJwt(token: string): JwtPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload) as JwtPayload;
    } catch (e) {
      console.error('Invalid JWT token:', e);
      throw e;
    }
  }
}

export default AuthService;
