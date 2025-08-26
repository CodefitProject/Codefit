import React, { useState } from "react";
import "./Login.css";
import AuthService from "../../services/authService";

const Login = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email || formData.email.trim() === "") {
      alert("아이디를 입력해주세요.");
      return false;
    }

    if (!formData.password || formData.password.trim() === "") {
      alert("비밀번호를 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.login({
        email: formData.email,
        password: formData.password,
      });

      // result now contains { message, accessToken, username, role }
      if (result && result.message === "로그인 성공" && result.accessToken) {
        // Store the access token (e.g., in localStorage or a state management solution)
        // For now, let's just store it in a simple way for demonstration
        localStorage.setItem("accessToken", result.accessToken);

        // Store user info (username and role)
        AuthService.setUserInfo({
          username: result.username,
          role: result.role,
        });

        if (onClose) {
          onClose();
        }

        AuthService.redirectByRole(result.role);
      } else {
        const errMsg =
          result && result.message ? result.message : "로그인에 실패했습니다.";
        alert(errMsg);
      }
    } catch (error) {
      console.error("로그인 처리 중 예외 발생:", error);
      alert("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e, nextField) => {
    if (e.key === "Enter") {
      if (nextField === "password") {
        document.getElementById("password-input").focus();
      } else if (nextField === "login") {
        handleLogin();
      }
    }
  };

  const handleForgotPassword = () => {
    alert("비밀번호 재설정 기능은 준비 중입니다.");
  };

  const handleSignup = () => {
    window.location.href = "/signup";
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="login-title2">로그인</div>
        <div className="login-subtitle">CodeFIT에 오신 것을 환영합니다</div>
      </div>

      <div className="form-group">
        <label className="form-label">아이디</label>
        <input
          type="text"
          name="email"
          className="form-input"
          placeholder="아이디를 입력하세요"
          value={formData.email}
          onChange={handleInputChange}
          onKeyPress={(e) => handleKeyPress(e, "password")}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">비밀번호</label>
        <div className="password-group">
          <input
            id="password-input"
            type="password"
            name="password"
            className="form-input"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleInputChange}
            onKeyPress={(e) => handleKeyPress(e, "login")}
            disabled={isLoading}
          />
        </div>
      </div>

      <button className="btn-login2" onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </button>

      <div className="login-links">
        <span className="login-link" onClick={handleForgotPassword}>
          비밀번호 찾기
        </span>
        <span style={{ color: "#ddd", margin: "0 10px" }}>|</span>
        <span className="login-link" onClick={handleSignup}>
          회원가입
        </span>
      </div>
    </div>
  );
};

export default Login;
