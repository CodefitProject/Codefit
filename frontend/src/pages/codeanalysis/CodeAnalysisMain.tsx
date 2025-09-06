import React, { useState, useRef } from 'react';
import { useCodeAnalysis } from '../../hooks/useCodeAnalysis.ts';
import Header from '../../components/Header/Header.tsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.tsx';
import './CodeAnalysisMain.css';

interface UploadedFile {
  name: string;
  file: File;
}

const CodeAnalysisMain: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { analyzeCode, isLoading } = useCodeAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        name: file.name,
        file
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      alert('분석할 파일을 먼저 업로드해주세요.');
      return;
    }

    try {
      await analyzeCode(uploadedFiles);
    } catch (error) {
      console.error('Code analysis failed:', error);
      alert('코드 분석 중 오류가 발생했습니다.');
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="code-analysis-container">
      <Header />
      
      {/* Loading Overlay */}
      {isLoading && (
        <LoadingSpinner 
          message="코드 분석 중입니다..."
          overlay={true}
          size="large"
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        <h1 className="main-title">다양한 언어의 코드를 분석해드립니다</h1>
        <p className="main-subtitle">Java, Python, JavaScript 등 어떤 언어든 분석 가능합니다</p>
        
        <input
          type="file"
          multiple
          accept=".java,.js,.ts,.py,.cpp,.c,.cs,.go,.php,.rb,.swift,.kt"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Upload Area */}
        <div className="upload-area" onClick={handleUploadAreaClick}>
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#007bff"/>
              <path d="M14 2v6h6" fill="#007bff"/>
              <path d="M12 11v6m-3-3l3-3 3 3" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className="upload-text">코드 파일 업로드</div>
          <div className="upload-subtext">여러 파일을 선택하거나 드래그 앤 드롭으로 업로드하세요</div>
          <button className="upload-button">파일 선택</button>
        </div>

        {/* Uploaded Files */}
        <div className="uploaded-files-section">
          <h3 className="section-title">업로드된 파일 목록</h3>
          <div className="uploaded-files">
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <button 
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="no-files">업로드된 파일이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Analyze Button */}
        <button 
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={isLoading || uploadedFiles.length === 0}
        >
          {isLoading ? '분석 중...' : '분석'}
        </button>
      </div>
    </div>
  );
};

export default CodeAnalysisMain;