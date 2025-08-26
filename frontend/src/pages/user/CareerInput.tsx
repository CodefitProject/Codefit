import React, { useMemo, useState } from 'react';
import SignupHeader from '../../components/SignupHeader/SignupHeader.tsx';
import './CareerInput.css';
import signupService from '../../services/signupService.ts';

const PERIODS = ['1년 미만','1-3년','3-5년','5-10년','10년 이상'];

const CareerInput: React.FC = () => {
  const [careerType, setCareerType] = useState<string>(() => localStorage.getItem('signup_career_type') || '');
  const [careerPeriod, setCareerPeriod] = useState<string>(() => localStorage.getItem('signup_career_period') || '');
  const progress = useMemo(() => 75, []);

  const selectType = (type: string) => {
    setCareerType(type);
    localStorage.setItem('signup_career_type', type);
    if (type !== 'experienced') {
      setCareerPeriod('');
      localStorage.removeItem('signup_career_period');
    }
  };

  const selectPeriod = (period: string) => {
    setCareerPeriod(period);
    localStorage.setItem('signup_career_period', period);
  };

  const goNext = async () => {
    if (!careerType) { alert('경력을 선택해주세요.'); return; }
    if (careerType === 'experienced' && !careerPeriod) { alert('경력 기간을 선택해주세요.'); return; }
    try {
      const res = await signupService.updateCareer({
        career: careerType === 'experienced' ? (careerPeriod || '') : '신입',
        careerType: careerType as 'freshman' | 'experienced',
        careerPeriod: careerPeriod || undefined
      });
      if (res.success) {
        window.location.href = '/signup/additional';
      } else {
        window.location.href = '/signup/additional';
      }
    } catch {
      window.location.href = '/signup/additional';
    }
  };

  return (
    <div>
      <SignupHeader showProgress={true} progressPercent={progress} />
      <div className="main-container">
        <div className="content-area">
          <div className="icon-container"><div className="icon">💼</div></div>
          <h1 className="main-title">경력을 알려주세요</h1>
          <p className="sub-title">개발 경험에 따라 맞춤형 정보를 제공해드려요</p>

          <div className="form-section">
            <div className="section-title">경력 구분</div>
            <div className="career-type-options">
              <button type="button" className={`career-type-option ${careerType === 'freshman' ? 'selected' : ''}`} onClick={() => selectType('freshman')}>신입</button>
              <button type="button" className={`career-type-option ${careerType === 'experienced' ? 'selected' : ''}`} onClick={() => selectType('experienced')}>경력</button>
            </div>

            {careerType === 'experienced' && (
              <div className="experience-section">
                <div className="section-title">경력 기간</div>
                <div className="period-options">
                  {PERIODS.map(p => (
                    <button key={p} type="button" className={`period-option ${careerPeriod === p ? 'selected' : ''}`} onClick={() => selectPeriod(p)}>{p}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="buttons-section">
            <button className="btn-back" onClick={() => (window.location.href = '/signup/salary')}>이전</button>
            <button className="btn-next" onClick={goNext}>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerInput;


