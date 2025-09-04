import React from 'react';
import { useParams } from 'react-router-dom';
import { useAnalysisResult } from '../../hooks/useAnalysisResult.ts';
import Header from '../../components/Header/Header.tsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.tsx';
import './AnalysisResult.css';

const AnalysisResult: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { analysisResult, isLoading, error } = useAnalysisResult(analysisId);

  if (isLoading) {
    return (
      <>
        <Header />
        <LoadingSpinner 
          message="분석 결과를 불러오는 중입니다..." 
          overlay={true} 
          size="large" 
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="analysis-result-container">
        <Header />
        <div className="error-section">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="analysis-result-container">
        <Header />
        <div className="error-section">
          <h2>분석 결과를 찾을 수 없습니다</h2>
          <p>요청하신 분석 결과가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-result-container">
      <Header />
      
      <div className="result-content">
        <div className="result-header">
          <h1>코드 분석 결과</h1>
          <p className="result-date">
            분석 완료: {new Date(analysisResult.createdAt).toLocaleString('ko-KR')}
          </p>
        </div>

        <div className="analysis-info-card">
          <div className="developer-type-section">
            <h2 className="developer-type-title">{analysisResult.typeName}</h2>
            <div className="type-code-badge">{analysisResult.typeCode}</div>
          </div>

          <div className="type-description">
            <p>{analysisResult.comment}</p>
          </div>

          <div className="scores-section">
            <div className="score-grid">
              <div className="score-item">
                <span className="score-label">개발 스타일 점수</span>
                <div className="score-bar">
                  <div 
                    className="score-fill development-style" 
                    style={{ width: `${Math.abs(analysisResult.developmentStyleScore) * 2}%` }}
                  ></div>
                  <span className="score-value">{analysisResult.developmentStyleScore}</span>
                </div>
              </div>
              
              <div className="score-item">
                <span className="score-label">개발자 선호도 점수</span>
                <div className="score-bar">
                  <div 
                    className="score-fill preference" 
                    style={{ width: `${Math.abs(analysisResult.developerPreferenceScore) * 2}%` }}
                  ></div>
                  <span className="score-value">{analysisResult.developerPreferenceScore}</span>
                </div>
              </div>
              
              <div className="score-item">
                <span className="score-label">신뢰도</span>
                <div className="score-bar">
                  <div 
                    className="score-fill confidence" 
                    style={{ width: `${Number(analysisResult.confidenceScore) * 100}%` }}
                  ></div>
                  <span className="score-value">{(Number(analysisResult.confidenceScore) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>


          <div className="analysis-meta">
            <div className="meta-item">
              <span className="meta-label">분석 방법:</span>
              <span className="meta-value">{analysisResult.detectedLanguage}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">분석 ID:</span>
              <span className="meta-value">{analysisResult.analysisId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;