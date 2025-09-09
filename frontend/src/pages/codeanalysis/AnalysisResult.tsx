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
          </div>
          <div className="type-code-section">
            <div className="type-code-badge">{analysisResult.typeCode}</div>
          </div>

          <div className="type-description">
            <p>{analysisResult.comment}</p>
          </div>

          <div className="scores-section">
            <div className="score-grid">
              <div className="score-item bipolar">
                <span className="score-label">개발 스타일 점수</span>
                <div className="bipolar-score-container">
                  <span className="score-label-left">B</span>
                  <div className="bipolar-score-bar">
                    <div className="score-center-line"></div>
                    <div 
                      className={`bipolar-score-fill development-style ${analysisResult.developmentStyleScore >= 0 ? 'positive' : 'negative'}`}
                      style={{ 
                        width: `${Math.abs(analysisResult.developmentStyleScore)}%`,
                        [analysisResult.developmentStyleScore >= 0 ? 'left' : 'right']: '50%'
                      }}
                    ></div>
                    <span className="bipolar-score-value">{analysisResult.developmentStyleScore}</span>
                  </div>
                  <span className="score-label-right">A</span>
                </div>
              </div>
              
              <div className="score-item bipolar">
                <span className="score-label">개발자 선호도 점수</span>
                <div className="bipolar-score-container">
                  <span className="score-label-left">I</span>
                  <div className="bipolar-score-bar">
                    <div className="score-center-line"></div>
                    <div 
                      className={`bipolar-score-fill preference ${analysisResult.developerPreferenceScore >= 0 ? 'positive' : 'negative'}`}
                      style={{ 
                        width: `${Math.abs(analysisResult.developerPreferenceScore)}%`,
                        [analysisResult.developerPreferenceScore >= 0 ? 'left' : 'right']: '50%'
                      }}
                    ></div>
                    <span className="bipolar-score-value">{analysisResult.developerPreferenceScore}</span>
                  </div>
                  <span className="score-label-right">R</span>
                </div>
              </div>
              
              <div className="score-item single">
                <span className="score-label">신뢰도</span>
                <div className="confidence-container">
                  <span className="confidence-spacer"></span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${Number(analysisResult.confidenceScore) * 100}%` }}
                    ></div>
                  </div>
                  <span className="confidence-value">{(Number(analysisResult.confidenceScore) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>


          <div className="analysis-meta">
            <div className="meta-item">
              <span className="meta-label">분석 언어:</span>
              <span className="meta-value">{analysisResult.language}</span>
            </div>
          </div>

          {analysisResult.reasoning && (
            <div className="analysis-section">
              <h3 className="section-title">분석 근거</h3>
              <div className="card-grid">
                {analysisResult.reasoning.split(/\n(?=\S)/).filter(item => item.trim() !== '').map((reason, index) => (
                  <div key={index} className="analysis-card">
                    <div className="card-content">
                      {reason.trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResult.strengths && (
            <div className="analysis-section">
              <h3 className="section-title">강점</h3>
              <div className="card-grid">
                {analysisResult.strengths.split(/\n(?=\S)/).filter(item => item.trim() !== '').map((strength, index) => (
                  <div key={index} className="analysis-card">
                    <div className="card-content">
                      {strength.trim().replace(/^[•\-\*]\s*/, '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResult.suggestions && (
            <div className="analysis-section">
              <h3 className="section-title">개선 제안</h3>
              <div className="card-grid">
                {analysisResult.suggestions.split(/\n(?=\S)/).filter(item => item.trim() !== '').map((suggestion, index) => (
                  <div key={index} className="analysis-card">
                    <div className="card-content">
                      {suggestion.trim().replace(/^[•\-\*]\s*/, '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResult.codePatterns && (
            <div className="analysis-section">
              <h3 className="section-title">코드 패턴 분석</h3>
              <div className="card-grid">
                {analysisResult.codePatterns.split(/\n(?=\S)/).filter(item => item.trim() !== '').map((pattern, index) => (
                  <div key={index} className="analysis-card">
                    <div className="card-content" dangerouslySetInnerHTML={{
                      __html: pattern.trim()
                        .replace(/^(\d+\.\s*[^설명\n]*?)(?=\s*설명:)/g, '<strong>$1</strong>')
                        .replace(/(\s*영향도:\s*\d+)$/g, '\n<strong>$1</strong>')
                    }}>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;