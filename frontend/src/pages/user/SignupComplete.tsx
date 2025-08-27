import React from 'react';
import SignupHeader from '../../components/SignupHeader/SignupHeader.tsx';
import './SignupComplete.css';

const SignupComplete: React.FC = () => {
  const handleNext = () => {
    window.location.href = '/signup/location';
  };

  return (
    <div>
      <SignupHeader showProgress={true} progressPercent={20} />
      <div className="main-container">
        <div className="content-area">
          <div className="success-icon"><div className="success-checkmark">✓</div></div>
          <div className="celebration-text">🎉 축하합니다!</div>
          <h1 className="main-title">CodeFIT 회원가입이 완료되었습니다!</h1>
          <p className="sub-title">사용자님, 환영합니다!</p>
          <p className="description">이제 당신만의 개발자 유형을 분석하고 맞춤형 채용 정보를 받아보세요.</p>

          <div className="feature-list">
            <div className="feature-item"><div className="feature-icon">1</div><div>개발자 유형 분석으로 나만의 코딩 스타일 발견</div></div>
            <div className="feature-item"><div className="feature-icon">2</div><div>맞춤형 채용공고 추천으로 시간 절약</div></div>
            <div className="feature-item"><div className="feature-icon">3</div><div>기업과의 완벽한 매칭으로 성공적인 취업</div></div>
          </div>

          <button className="next-button" onClick={handleNext}>추가정보 입력하기</button>
        </div>
      </div>
    </div>
  );
};

export default SignupComplete;


