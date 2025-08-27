import React, { useEffect, useMemo, useRef, useState } from 'react';
import SignupHeader from '../../components/SignupHeader/SignupHeader.tsx';
import './ProfileAdditional.css';
import signupService from '../../services/signupService.ts';

const ProfileAdditional: React.FC = () => {
  const [bio, setBio] = useState<string>(() => localStorage.getItem('signup_profile_bio') || '');
  const [imageDataUrl, setImageDataUrl] = useState<string>(() => localStorage.getItem('signup_profile_image') || '');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const progress = useMemo(() => 100, []);

  useEffect(() => { localStorage.setItem('signup_profile_bio', bio); }, [bio]);
  useEffect(() => { if (imageDataUrl) localStorage.setItem('signup_profile_image', imageDataUrl); else localStorage.removeItem('signup_profile_image'); }, [imageDataUrl]);

  const triggerFile = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드 가능합니다.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('파일 크기는 5MB 이하여야 합니다.'); return; }
    const reader = new FileReader();
    reader.onload = ev => setImageDataUrl(String(ev.target?.result || ''));
    reader.readAsDataURL(file);
  };

  const removeImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setImageDataUrl('');
    if (inputRef.current) inputRef.current.value = '' as any;
  };

  const goBack = () => (window.location.href = '/signup/career');

  const goNext = async () => {
    try {
      const res = await signupService.updateAdditionalInfo({ bio, profileImageName: imageDataUrl ? 'inline' : undefined });
      if (res.success) {
        window.location.href = '/signup/profile-complete';
      } else {
        alert('정보 저장 중 오류가 발생했습니다.');
      }
    } catch {
      window.location.href = '/signup/profile-complete';
    }
  };

  const charCount = Math.min(bio.length, 300);

  return (
    <div>
      <SignupHeader showProgress={true} progressPercent={progress} />
      <div className="main-container">
        <div className="content-area">
          <div className="icon-container"><div className="icon">👤</div></div>
          <h1 className="main-title">프로필을 완성해주세요</h1>
          <p className="sub-title">개성 있는 프로필로 기업의 관심을 끌어보세요</p>

          <div className="form-section profile-image-section">
            <div className="section-title">프로필 사진 (선택)</div>
            <div className="image-upload-container">
              {!imageDataUrl ? (
                <div className="upload-area" onClick={triggerFile}>
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">사진 업로드</div>
                </div>
              ) : (
                <div className="preview-area" onClick={triggerFile}>
                  <img className="preview-image" src={imageDataUrl} alt="프로필 미리보기" />
                  <button className="image-remove-btn" onClick={removeImage}>×</button>
                </div>
              )}
              <input type="file" ref={inputRef} accept="image/*" className="hidden-file-input" onChange={onFileChange} />
            </div>
          </div>

          <div className="form-section additional-intro-section">
            <div className="section-title">자기소개</div>
            <div className="textarea-container">
              <textarea className="additional-intro-textarea" placeholder="개발에 대한 관심을 갖게 된 계기나 배우고 싶은 기술, 목표 등을 자유롭게 작성해주세요." value={bio} onChange={(e) => setBio(e.target.value.slice(0, 300))} />
              <div className="char-count">{charCount}/300</div>
            </div>
          </div>

          <div className="buttons-section">
            <button className="btn-back" onClick={goBack}>이전</button>
            <button className="btn-next" onClick={goNext}>완료</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdditional;


