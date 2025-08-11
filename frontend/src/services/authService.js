class AuthService {
  static async login(loginData) {
    try {
      const response = await fetch('/InsWebApp/USLogin.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginVo: loginData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }

  static setUserInfo(userInfo) {
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
      window.location.href = "../corporate/RecruitmentDashboard.xml";
    }
  }
}

export default AuthService;