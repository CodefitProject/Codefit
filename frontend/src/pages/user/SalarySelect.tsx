import React, { useEffect, useMemo, useState } from 'react';
import SignupHeader from '../../components/SignupHeader/SignupHeader.tsx';
import './SalarySelect.css';
import signupService from '../../services/signupService.ts';

const RANGES = [
  { key: '2000-2500', label: '2,000만원 ~ 2,500만원' },
  { key: '2500-3000', label: '2,500만원 ~ 3,000만원' },
  { key: '3000-4000', label: '3,000만원 ~ 4,000만원' },
  { key: '4000-5000', label: '4,000만원 ~ 5,000만원' },
  { key: '5000+', label: '5,000만원 이상' }
];

const SalarySelect: React.FC = () => {
  const [selected, setSelected] = useState<string>(() => localStorage.getItem('signup_selected_salary') || '');
  useEffect(() => { localStorage.setItem('signup_selected_salary', selected); }, [selected]);
  const progress = useMemo(() => 50, []);

  return (
    <div>
      <SignupHeader showProgress={true} progressPercent={progress} />
      <div className="main-container">
        <div className="content-area">
          <div className="icon-container"><div className="icon">💰</div></div>
          <h1 className="main-title">희망 연봉을 알려주세요</h1>
          <div className="info-message"><span className="info-icon">ℹ️</span><span>정확한 매칭을 위해 솔직하게 알려주세요</span></div>

          <div className="salary-options">
            {RANGES.map(r => (
              <button key={r.key} type="button" className={`salary-option ${selected === r.key ? 'selected' : ''}`} onClick={() => setSelected(r.key)}>{r.label}</button>
            ))}
          </div>

          <div className="button-area">
            <button className="btn-back" onClick={() => (window.location.href = '/signup/location')}>이전</button>
            <button className="btn-next" onClick={async () => {
              if (!selected) { alert('연봉을 선택해주세요.'); return; }
              try {
                const res = await signupService.updateSalary(selected);
                if (res.success) {
                  window.location.href = '/signup/career';
                } else {
                  window.location.href = '/signup/career';
                }
              } catch {
                window.location.href = '/signup/career';
              }
            }}>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalarySelect;


