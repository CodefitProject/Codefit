import React, { useEffect, useMemo, useState } from 'react';
import SignupHeader from '../../components/SignupHeader/SignupHeader.tsx';
import './LocationSelect.css';
import signupService from '../../services/signupService.ts';

const OPTIONS = ['서울','경기','인천','부산','대구','대전','광주','울산','강원','충북','충남','전북','전남','경북','경남','제주','원격근무'];

const LocationSelect: React.FC = () => {
  const [selectedLocations, setSelected] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('signup_selected_locations');
      return saved ? saved.split(',').filter(Boolean) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('signup_selected_locations', selectedLocations.join(','));
  }, [selectedLocations]);

  const progress = useMemo(() => 25, []);

  const toggle = (name: string) => {
    setSelected(prev => {
      const exists = prev.includes(name);
      if (exists) return prev.filter(x => x !== name);
      if (prev.length >= 5) { alert('최대 5개까지만 선택 가능합니다.'); return prev; }
      return [...prev, name];
    });
  };

  const goNext = async () => {
    if (selectedLocations.length === 0) { alert('최소 1개 이상의 지역을 선택해주세요.'); return; }
    try {
      const res = await signupService.updateLocation(selectedLocations.join(','));
      if (res.success) {
        window.location.href = '/signup/salary';
      } else {
        window.location.href = '/signup/salary';
      }
    } catch {
      window.location.href = '/signup/salary';
    }
  };

  return (
    <div>
      <SignupHeader showProgress={true} progressPercent={progress} />
      <div className="main-container">
        <div className="content-area">
          <div className="icon-container"><div className="icon">📍</div></div>
          <h1 className="main-title">희망하는 근무지역을 알려주세요</h1>

          <div className="selected-locations-section">
            <div className="selection-count">{selectedLocations.length} 개 지역 선택됨 (최대 5개)</div>
            <div className="selected-locations-container">
              {selectedLocations.length === 0 ? (
                <div className="empty-message">희망하는 근무지역을 알려주세요.</div>
              ) : (
                selectedLocations.map(loc => (
                  <div key={loc} className="location-tag">{loc} <span className="location-tag-remove" onClick={() => toggle(loc)}>×</span></div>
                ))
              )}
            </div>
          </div>

          <div className="locations-grid">
            {OPTIONS.map(opt => (
              <button key={opt} type="button" className={`location-option ${selectedLocations.includes(opt) ? 'selected' : ''}`} onClick={() => toggle(opt)}>{opt}</button>
            ))}
          </div>

          <div className="buttons-section">
            <button className="btn-back" onClick={() => (window.location.href = '/signup/complete')}>이전</button>
            <button className="btn-next" onClick={goNext}>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelect;


