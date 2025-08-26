interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

interface LoginResponse {
  message: string;
  accessToken: string | null;
  username: string | null;
  role: string | null;
}

interface UserInfo {
  accessToken: string | null;
  username: string | null;
  role: string | null;
  message?: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

class AuthService {
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

      const authHeader = response.headers.get('Authorization');
      let accessToken: string | null = null;
      let username: string | null = null;
      let role: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        try {
          const decodedToken = AuthService.decodeJwt(accessToken);
          username = decodedToken.sub;
          role = decodedToken.role;
        } catch (e) {
          console.error('Error decoding JWT token:', e);
        }
      }

      const result = await response.json();
      
      return {
        ...result,
        accessToken,
        username,
        role
      };
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  static setUserInfo(userInfo: UserInfo): void {
    document.cookie = `userInfo=${JSON.stringify(userInfo)}`;
  }

  static getUserInfo(): UserInfo | null {
    const cookies = document.cookie.split(';');
    const userInfoCookie = cookies.find(cookie => 
      cookie.trim().startsWith('userInfo=')
    );
    
    if (userInfoCookie) {
      try {
        const userInfoString = userInfoCookie.split('=')[1];
        return JSON.parse(userInfoString) as UserInfo;
      } catch (error) {
        console.error('Error parsing user info:', error);
        return null;
      }
    }
    
    return null;
  }

  static logout(): void {
    document.cookie = 'userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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