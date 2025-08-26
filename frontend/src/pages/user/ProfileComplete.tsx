import React from 'react';
import SignupHeader from '../../components/SignupHeader/SignupHeader.tsx';
import './ProfileComplete.css';

const ProfileComplete: React.FC = () => {
  const goMain = () => { window.location.href = '/'; };
  return (
    <div>
      <SignupHeader showProgress={true} progressPercent={100} />
      <div className="main-container">
        <div className="content-area">
          <div className="celebration-animation">
            <div className="success-icon-container"><div className="success-icon" /></div>
            <h1 className="main-title">프로필 작성이 완료되었습니다!</h1>
            <p className="sub-title">사용자님의 개발자 여정이 시작됩니다!</p>
            <p className="description">이제 CodeFIT에서 맞춤형 개발자 유형 분석과 채용 정보를 받아보실 수 있습니다.</p>

            <div className="features-list">
              <div className="features-title">앞으로 이런 서비스를 이용하실 수 있어요</div>
              <div className="feature-item"><div className="feature-icon">1</div><div className="feature-text">개발자 유형 분석으로 나만의 개발 스타일 발견</div></div>
              <div className="feature-item"><div className="feature-icon">2</div><div className="feature-text">유형 기반 맞춤형 채용공고 추천</div></div>
              <div className="feature-item"><div className="feature-icon">3</div><div className="feature-text">기업과의 완벽한 매칭으로 성공적인 취업</div></div>
              <div className="feature-item"><div className="feature-icon">4</div><div className="feature-text">개발 트렌드 분석 및 성장 가이드 제공</div></div>
            </div>

            <div className="button-area">
              <button className="btn-start" onClick={goMain}>메인 페이지로 이동</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComplete;


