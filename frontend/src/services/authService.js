class AuthService {
  static async login(loginData) {
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
      let accessToken = null;
      let username = null;
      let role = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        try {
          const decodedToken = AuthService.decodeJwt(accessToken);
          username = decodedToken.sub; // 'sub' is typically the subject, often the username/email
          role = decodedToken.role; // Assuming 'role' is a custom claim in your JWT
        } catch (e) {
          console.error('Error decoding JWT token:', e);
        }
      }

      const result = await response.json(); // Get the message from the body
      
      return {
        ...result, // Contains { message: "로그인 성공" }
        accessToken,
        username,
        role
      };
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  static setUserInfo(userInfo){
    document.cookie = `userInfo=${JSON.stringify(userInfo)}`;
  }

  static getUserInfo() {
    const cookies = document.cookie.split(';');
    const userInfoCookie = cookies.find(cookie => 
      cookie.trim().startsWith('userInfo=')
    );
    
    if (userInfoCookie) {
      try {
        const userInfoString = userInfoCookie.split('=')[1];
        return JSON.parse(userInfoString);
      } catch (error) {
        console.error('Error parsing user info:', error);
        return null;
      }
    }
    
    return null;
  }

  static logout() {
    document.cookie = 'userInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  static redirectByRole(userRole) {
    if (userRole === "USER") {
      window.location.reload();
    } else if (userRole === "COMPANY") {
      window.location.href = "/company/dashboard";
    }
  }

  static decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Invalid JWT token:', e);
      throw e;
    }
  }
}

export default AuthService;