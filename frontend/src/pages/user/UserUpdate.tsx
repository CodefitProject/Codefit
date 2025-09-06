import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.tsx';
import { useUserUpdate, TechStack } from '../../hooks/useUserUpdate.ts';
import './UserUpdate.css';

const UserUpdate: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const {
    userInfo,
    passwordData,
    selectedLocations,
    selectedTechStacks,
    techStackOptions,
    isLoading,
    error,
    careerOptions,
    positionOptions,
    locationOptions,
    salaryOptions,
    setUserInfo,
    setPasswordData,
    updateUserInfo,
    updatePassword,
    toggleLocation,
    addTechStack,
    removeTechStack
  } = useUserUpdate();


  const handleSave = async () => {
    if (!userInfo?.name?.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (window.confirm('변경사항을 저장하시겠습니까?')) {
      const success = await updateUserInfo(resumeFile);
      if (success) {
        alert('개인정보가 성공적으로 수정되었습니다.');
        navigate('/user/detail');
      }
    }
  };

  const handleCancel = () => {
    if (window.confirm('변경사항을 저장하지 않고 돌아가시겠습니까?')) {
      navigate('/user/detail');
    }
  };

  const handlePasswordChange = async () => {
    const success = await updatePassword();
    if (success) {
      alert('비밀번호가 성공적으로 변경되었습니다.');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('pdf')) {
        alert('PDF 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB를 초과할 수 없습니다.');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleTechStackSelect = (stack: TechStack) => {
    addTechStack(stack);
    setSearchTerm('');
  };

  const handleViewPdf = () => {
    if (userInfo?.resume_file_name) {
      const viewUrl = `/InsWebApp/USViewResume.pwkjson?filePath=${encodeURIComponent(userInfo.resume_file_name)}`;
      window.open(viewUrl, '_blank', 'width=800,height=800');
    }
  };

  const displayFileName = (fileName: string) => {
    if (!fileName) return '';
    
    let displayName = fileName;
    
    // 경로에서 파일명만 추출
    if (fileName.includes('/')) {
      displayName = fileName.substring(fileName.lastIndexOf('/') + 1);
    }
    
    // 사용자 ID 부분 제거
    if (displayName.includes('_')) {
      displayName = displayName.substring(displayName.indexOf('_') + 1);
    }
    
    return `이력서_${displayName}`;
  };

  if (isLoading && !userInfo) {
    return (
      <>
        <Header />
        <div className="update-container">
          <div className="loading">사용자 정보를 불러오는 중...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="update-container">
          <div className="error">오류: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="update-container">
        {/* 헤더 영역 */}
        <div className="update-header">
          <h1 className="update-title">개인정보 수정</h1>
          <p className="update-subtitle">프로필 정보를 수정할 수 있습니다.</p>
        </div>

        {/* 폼 영역 */}
        <div className="update-form">
          {/* 이메일 (읽기전용) */}
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              className="form-input"
              value={userInfo?.email || ''}
              readOnly
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>

          {/* 이름 */}
          <div className="form-group">
            <label className="form-label">
              이름 <span className="form-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="이름을 입력하세요"
              value={userInfo?.name || ''}
              onChange={(e) => setUserInfo(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
          </div>

          {/* 경력 */}
          <div className="form-group">
            <label className="form-label">경력</label>
            <select
              className="form-select"
              value={userInfo?.career || ''}
              onChange={(e) => setUserInfo(prev => prev ? { ...prev, career: e.target.value } : null)}
            >
              <option value="">선택하세요</option>
              {careerOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 직무분야 */}
          <div className="form-group">
            <label className="form-label">직무분야</label>
            <select
              className="form-select"
              value={userInfo?.currentPosition || ''}
              onChange={(e) => setUserInfo(prev => prev ? { ...prev, currentPosition: e.target.value } : null)}
            >
              <option value="">선택하세요</option>
              {positionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 선호 지역 */}
          <div className="form-group">
            <label className="form-label">선호 지역 (최대 5개)</label>
            <div className="location-container">
              <div className="location-header">
                <span id="locationCountText">{selectedLocations.length}개 선택됨 (최대 5개)</span>
              </div>
              
              <div className="location-tag-container">
                {selectedLocations.map(location => (
                  <div key={location} className="location-tag">
                    {location}
                    <span
                      className="location-tag-remove"
                      onClick={() => toggleLocation(location)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="location-grid">
                {locationOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`location-option ${selectedLocations.includes(option.value) ? 'selected' : ''}`}
                    onClick={() => toggleLocation(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 희망연봉 */}
          <div className="form-group">
            <label className="form-label">희망연봉</label>
            <select
              className="form-select"
              value={userInfo?.yearSalary || ''}
              onChange={(e) => setUserInfo(prev => prev ? { ...prev, yearSalary: e.target.value } : null)}
            >
              <option value="">선택하세요</option>
              {salaryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 기술스택 */}
          <div className="form-group">
            <label className="form-label">기술스택</label>
            <div className="tech-stack-section">
              <input
                type="text"
                className="form-input"
                placeholder="기술스택을 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const selectedStack = techStackOptions.find(
                      stack => stack.techStackName.toLowerCase() === searchTerm.toLowerCase()
                    );
                    if (selectedStack) {
                      handleTechStackSelect(selectedStack);
                    }
                  }
                }}
                list="techstack-datalist"
              />
              
              <datalist id="techstack-datalist">
                {techStackOptions.map(stack => (
                  <option key={stack.techStackId} value={stack.techStackName} />
                ))}
              </datalist>
              
              <div className="tech-stack-tags">
                {selectedTechStacks.map(stack => (
                  <div key={stack.techStackId} className="tech-stack-tag">
                    <span>{stack.techStackName}</span>
                    <button
                      type="button"
                      className="remove-tag-btn"
                      onClick={() => removeTechStack(stack.techStackId)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 자기소개 */}
          <div className="form-group">
            <label className="form-label">자기소개</label>
            <textarea
              className="form-textarea"
              placeholder="간단한 자기소개를 작성해주세요"
              value={userInfo?.bio || ''}
              onChange={(e) => setUserInfo(prev => prev ? { ...prev, bio: e.target.value } : null)}
            />
          </div>

          {/* 이력서 업로드 */}
          <div className="form-group">
            <label className="form-label">이력서 PDF</label>
            <div className="resume-upload-container">
              <input
                type="text"
                className="form-input"
                readOnly
                style={{ backgroundColor: '#f5f5f5', cursor: (userInfo?.resume_file_name && !resumeFile) ? 'pointer' : 'default' }}
                placeholder="업로드된 이력서 파일이 없습니다"
                value={
                  resumeFile 
                    ? `새 파일: ${resumeFile.name}` 
                    : (userInfo?.resume_file_name ? displayFileName(userInfo.resume_file_name) : '')
                }
                onClick={(userInfo?.resume_file_name && !resumeFile) ? handleViewPdf : undefined}
                title={(userInfo?.resume_file_name && !resumeFile) ? "클릭하여 PDF 파일 보기" : ""}
              />
              <div className="resume-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleFileUpload}
                >
                  {resumeFile ? '다른 파일 선택' : '이력서 업로드'}
                </button>
                {resumeFile && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setResumeFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    선택 취소
                  </button>
                )}
              </div>
              <p className="file-info">* PDF 파일만 업로드 가능합니다. (최대 5MB)</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* 버튼 영역 */}
          <div className="button-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              취소
            </button>
          </div>
        </div>

        {/* 비밀번호 변경 폼 */}
        <div className="update-form password-form">
          <h2 className="form-section-title">비밀번호 변경</h2>
          
          {/* 현재 비밀번호 */}
          <div className="form-group">
            <label className="form-label">현재 비밀번호</label>
            <input
              type="password"
              className="form-input"
              placeholder="현재 비밀번호를 입력하세요"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
          </div>

          {/* 새 비밀번호 */}
          <div className="form-group">
            <label className="form-label">새 비밀번호</label>
            <input
              type="password"
              className="form-input"
              placeholder="새 비밀번호를 입력하세요"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="form-group">
            <label className="form-label">새 비밀번호 확인</label>
            <input
              type="password"
              className="form-input"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>

          {/* 비밀번호 변경 버튼 */}
          <div className="button-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePasswordChange}
              disabled={isLoading}
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserUpdate;