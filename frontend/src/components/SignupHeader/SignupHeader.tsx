import React from 'react';
import './SignupHeader.css';

type SignupHeaderProps = {
  showProgress?: boolean;
  progressPercent?: number; // 0-100
  onLogoClick?: () => void;
};

const SignupHeader: React.FC<SignupHeaderProps> = ({ showProgress = false, progressPercent = 0, onLogoClick }) => {
  const backgroundStyle = {
    background: `linear-gradient(90deg, #007bff 0%, #007bff ${progressPercent}%, #e0e0e0 ${progressPercent}%, #e0e0e0 100%)`,
    display: showProgress ? 'block' as const : 'none' as const
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
      return;
    }
    // 기본 동작: 확인 후 메인으로 이동
    // eslint-disable-next-line no-restricted-globals
    const ok = window.confirm('회원가입을 중단하고 메인 페이지로 이동하시겠습니까?');
    if (ok) {
      window.location.href = '/';
    }
  };

  return (
    <div className="signup-header">
      <img
        src={process.env.PUBLIC_URL + '/images/logos/codefit_logo.png'}
        className="header-logo"
        alt="CodeFIT"
        onClick={handleLogoClick}
      />
      <div className="header-progress" style={backgroundStyle} />
    </div>
  );
};

export default SignupHeader;


