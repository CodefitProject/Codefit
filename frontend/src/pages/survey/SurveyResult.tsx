import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import surveyService, { SurveyService } from '../../services/surveyService.ts';
import {
    AnalysisResult,
    UserInfo,
    AxisContributions,
    CodePattern,
    DetailedAnalysis,
    FullAnalysis,
    AxisAnalysis,
    TabType
} from '../../types/survey';

interface SurveyResultProps {
    result: AnalysisResult;
    onRestart: () => void;
    userInfo: UserInfo | null;
}

const SurveyResult: React.FC<SurveyResultProps> = ({ result, onRestart, userInfo }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('code');
    const [scoreAnimations, setScoreAnimations] = useState({
        ab: false,
        ri: false,
        st: false,
        df: false
    });
    const [showResultCard, setShowResultCard] = useState(false);
    const [showScoreSection, setShowScoreSection] = useState(false);
    const resultCardRef = React.useRef<HTMLDivElement>(null);

    const typeDefinitions = SurveyService.getTypeDefinitions();
    const typeCode = result.typeCode || 'ARTF';
    const typeInfo = typeDefinitions[typeCode as keyof typeof typeDefinitions] || typeDefinitions['ARTF'];

    // 이미지 경로 설정
    const imagePath = `/images/mbti/png/${typeCode}.png`;

    // 점수를 퍼센트로 변환 (-50~+50을 0~100%로)
    const scoreToPercentage = (score: number): number => {
        return Math.max(0, Math.min(100, (score + 50)));
    };

    // 결과 표시 애니메이션 시퀀스 및 포커싱
    useEffect(() => {
        const animationSequence = () => {
            // 0. 결과 카드로 스크롤 이동 (즉시)
            if (resultCardRef.current) {
                resultCardRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
            
            // 1. 결과 카드 표시 (0.5초 후)
            setTimeout(() => setShowResultCard(true), 500);
            
            // 2. 점수 섹션 표시 (1.5초 후)
            setTimeout(() => setShowScoreSection(true), 1500);
            
            // 3. 스코어 바 애니메이션 (순차적)
            setTimeout(() => setScoreAnimations(prev => ({ ...prev, ab: true })), 2000);
            setTimeout(() => setScoreAnimations(prev => ({ ...prev, ri: true })), 2300);
            setTimeout(() => setScoreAnimations(prev => ({ ...prev, st: true })), 2600);
            setTimeout(() => setScoreAnimations(prev => ({ ...prev, df: true })), 2900);
        };

        animationSequence();
    }, []);

    // 탭 전환 핸들러
    const handleTabSwitch = (tab: TabType) => {
        setActiveTab(tab);
    };

    // 강도 텍스트 계산
    const getIntensityText = (score: number): string => {
        const intensity = Math.abs(score);
        if (intensity < 10) return '약간';
        else if (intensity < 25) return '보통';
        else if (intensity < 40) return '강한';
        else return '매우 강한';
    };

    // 축별 성향 분석 생성
    const generateAxisAnalyses = (): AxisAnalysis[] => {
        const analyses: AxisAnalysis[] = [];
        const axisInfo = {
            'B_A': {
                name: '개발 스타일',
                leftType: 'Builder', rightType: 'Architect',
                leftDesc: '빠른 구현과 실용적 해결책을 선호하며, 당면한 문제를 즉시 해결하는 것을 중시합니다.',
                rightDesc: '체계적 설계와 확장성을 중시하며, 장기적인 관점에서 안정적인 구조를 만들어갑니다.'
            },
            'R_I': {
                name: '기술 접근법',
                leftType: 'Innovator', rightType: 'Refactor',
                leftDesc: '새로운 기술과 실험적 접근을 선호하며, 혁신적인 솔루션 개발에 흥미를 느낍니다.',
                rightDesc: '기존 코드의 개선과 안정성을 중시하며, 검증된 방법으로 점진적 발전을 추구합니다.'
            },
            'S_T': {
                name: '협업 방식',
                leftType: 'Solo', rightType: 'Team',
                leftDesc: '독립적인 작업을 선호하며, 개인의 집중력과 창의성을 발휘할 때 최고의 성과를 냅니다.',
                rightDesc: '팀워크와 협업적 개발을 중시하며, 함께 소통하며 문제를 해결해나가는 것을 선호합니다.'
            },
            'D_F': {
                name: '작업 선호도',
                leftType: 'Debug', rightType: 'Feature',
                leftDesc: '문제 해결과 버그 수정에 집중하며, 복잡한 이슈를 분석하고 해결하는 것에서 성취감을 느낍니다.',
                rightDesc: '새로운 기능 개발과 창작 활동을 선호하며, 무언가를 새롭게 만들어내는 것에 흥미를 느낍니다.'
            }
        };

        const scores = result.scores || {};

        Object.keys(axisInfo).forEach(axis => {
            const info = axisInfo[axis as keyof typeof axisInfo];
            const score = scores[axis] || 0;
            const absScore = Math.abs(score);
            let tendency: string;
            let description: string;
            let strengthLevel: string;

            // 강도 판단
            if (absScore >= 25) strengthLevel = '매우 강한';
            else if (absScore >= 15) strengthLevel = '강한';
            else if (absScore >= 5) strengthLevel = '약간의';
            else strengthLevel = '균형잡힌';

            // 방향과 성향 결정
            if (absScore < 5) {
                tendency = '균형잡힌 성향';
                description = `${info.leftType}와 ${info.rightType} 사이의 균형잡힌 성향을 보입니다. 상황에 따라 유연하게 접근하는 특성을 가지고 있습니다.`;
            } else if (score > 0) {
                tendency = `${strengthLevel} ${info.rightType} 성향`;
                description = `당신은 ${strengthLevel} ${info.rightType} 성향을 보입니다. ${info.rightDesc}`;
            } else {
                tendency = `${strengthLevel} ${info.leftType} 성향`;
                description = `당신은 ${strengthLevel} ${info.leftType} 성향을 보입니다. ${info.leftDesc}`;
            }

            analyses.push({
                axisName: info.name,
                tendency,
                description
            });
        });

        return analyses;
    };

    // 상세 분석 결과 렌더링
    const renderDetailedAnalysis = () => {
        // 코드 분석 정보가 없는 경우
        if (!result.codeAnalysisComment && !result.codeAnalysisDetail) {
            return (
                <div className="code-analysis-section">
                    <div className="code-analysis-title">코드 분석 AI 코멘트</div>
                    <div className="code-analysis-comment">
                        <div className="no-code-analysis">
                            <p>코드 분석 결과가 아직 없습니다.</p>
                            <p>프로필 페이지에서 코드 분석을 진행하면 설문 결과와 함께 종합된 분석을 확인할 수 있습니다.</p>
                            <div className="current-analysis-note">
                                <strong>현재 결과:</strong> 설문 응답만을 기반으로 한 개발 성향 분석입니다.
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        let fullAnalysis: FullAnalysis = { detailed_analysis: { reasoning: '', code_patterns: [], strengths: [], suggestions: [] } };
        let detailedAnalysis: DetailedAnalysis = { reasoning: '', code_patterns: [], strengths: [], suggestions: [] };

        if (result.codeAnalysisDetail) {
            try {
                fullAnalysis = JSON.parse(result.codeAnalysisDetail);
                detailedAnalysis = fullAnalysis.detailed_analysis || detailedAnalysis;
            } catch (e) {
                console.warn('codeAnalysisDetail JSON 파싱 실패:', e);
                // 파싱 실패 시 기본값 유지
                detailedAnalysis = { reasoning: '', code_patterns: [], strengths: [], suggestions: [] };
            }
        }

        return (
            <div className="code-analysis-section">
                <div className="code-analysis-header">
                    <div className="code-analysis-title">
                        <i className="fas fa-code"></i>
                        코드 분석 AI 종합 리포트
                    </div>
                    <div className="analysis-confidence">
                        <span className="confidence-label">분석 신뢰도</span>
                        <div className="confidence-bar">
                            <div className="confidence-fill" style={{width: `${result.confidenceScore || 85}%`}}></div>
                        </div>
                        <span className="confidence-score">{result.confidenceScore || 85}%</span>
                    </div>
                </div>
                
                <div className="code-analysis-summary">
                    <div className="summary-card">
                        <div className="summary-icon">🎯</div>
                        <div className="summary-content">
                            <h4>핵심 개발 성향</h4>
                            <p>{result.codeAnalysisComment || '코드 구조와 패턴을 분석하여 개발 스타일을 도출했습니다.'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="detailed-section">
                    <div className="detailed-title">
                        <i className="fas fa-chart-line"></i>
                        상세 분석 결과
                    </div>

                    {/* 분석 근거 */}
                    <div className="section-item reasoning-section">
                        <div className="section-header">분석 근거</div>
                        <div className="reasoning-content">
                            <div className="detailed-reasoning">
                                {detailedAnalysis.reasoning || '코드 구조와 패턴을 분석하여 개발 스타일을 도출했습니다.'}
                            </div>
                        </div>
                    </div>

                    {/* 코드 패턴 */}
                    <div className="section-item patterns-section">
                        <div className="section-header">발견된 코드 패턴</div>
                        <div className="code-patterns-list">
                            {Array.isArray(detailedAnalysis.code_patterns) && detailedAnalysis.code_patterns.length > 0 ? (
                                detailedAnalysis.code_patterns.map((pattern, index) => (
                                    <div key={index} className="pattern-item">
                                        <div className="pattern-header">
                                            <h4 className="pattern-title">{pattern.pattern || 'Code Pattern'}</h4>
                                            <div className="pattern-impact">
                                                <span className="impact-label">영향도</span>
                                                <div className="impact-score">
                                                    {Array.from({ length: 10 }, (_, i) => (
                                                        <span 
                                                            key={i} 
                                                            className={`impact-bar ${i < (pattern.impact_score || 0) ? 'filled' : ''}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="impact-number">{pattern.impact_score || 0}/10</span>
                                            </div>
                                        </div>
                                        <p className="pattern-description">{pattern.description || ''}</p>
                                        {pattern.evidence && pattern.evidence.length > 0 && (
                                            <div className="pattern-evidence">
                                                <ul>
                                                    {pattern.evidence.map((evidence, evidenceIndex) => (
                                                        <li key={evidenceIndex}>{evidence}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="no-patterns">발견된 코드 패턴이 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 강점 */}
                    <div className="section-item strengths-section">
                        <div className="section-header">개발 강점</div>
                        <div className="strengths-content">
                            {Array.isArray(detailedAnalysis.strengths) && detailedAnalysis.strengths.length > 0 ? (
                                <ul className="strengths-list">
                                    {detailedAnalysis.strengths.map((strength, index) => (
                                        <li key={index} className="strength-item">
                                            <span className="strength-icon">
                                                <i className="fas fa-check"></i>
                                            </span>
                                            {strength}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-strengths">분석된 강점이 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 개선 제안 */}
                    <div className="section-item suggestions-section">
                        <div className="section-header">개선 제안</div>
                        <div className="suggestions-content">
                            {Array.isArray(detailedAnalysis.suggestions) && detailedAnalysis.suggestions.length > 0 ? (
                                <ul className="suggestions-list">
                                    {detailedAnalysis.suggestions.map((suggestion, index) => (
                                        <li key={index} className="suggestion-item">
                                            <span className="suggestion-icon">
                                                <i className="fas fa-lightbulb"></i>
                                            </span>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-suggestions">개선 제안사항이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 개선된 설문 분석 생성
    const generateAdvancedSurveyAnalysis = () => {
        const scores = result.scores || {};
        const insights: string[] = [];
        
        // 성향 강도 분석
        const strongestAxis = Object.entries(scores).reduce((max, [axis, score]) => 
            Math.abs(score) > Math.abs(max[1]) ? [axis, score] : max
        );
        
        const axisNames = {
            'B_A': '개발 스타일',
            'R_I': '기술 접근법',
            'S_T': '협업 방식',
            'D_F': '작업 선호도'
        };
        
        insights.push(`가장 뚜렷한 성향은 ${axisNames[strongestAxis[0] as keyof typeof axisNames]}(${Math.abs(strongestAxis[1]).toFixed(1)}점)입니다.`);
        
        // 균형도 분석
        const scoreValues = Object.values(scores);
        const avgScore = scoreValues.reduce((sum, score) => sum + Math.abs(score), 0) / scoreValues.length;
        
        if (avgScore < 15) {
            insights.push("전반적으로 균형잡힌 성향을 보이며, 상황에 따라 유연하게 접근하는 특성을 가지고 있습니다.");
        } else if (avgScore > 35) {
            insights.push("명확하고 강한 개발 선호도를 가지고 있어, 자신만의 확고한 개발 철학을 보여줍니다.");
        } else {
            insights.push("적당한 선호도를 가지면서도 상황에 따른 적응력을 겸비한 개발자입니다.");
        }
        
        return insights;
    };

    // 답변 분석 렌더링
    const renderAnswerAnalysis = () => {
        const axisAnalyses = generateAxisAnalyses();
        const advancedInsights = generateAdvancedSurveyAnalysis();

        return (
            <div className="answer-analysis-section">
                <div className="answer-analysis-header">
                    <div className="answer-analysis-title">
                        <i className="fas fa-brain"></i>
                        설문 심층 분석
                    </div>
                    <div className="analysis-badge">
                        <span className="badge-text">개인화 분석</span>
                    </div>
                </div>
                
                {/* 핵심 인사이트 섹션 */}
                <div className="ai-insights-section">
                    <div className="insights-header">
                        <h4>🎯 핵심 인사이트</h4>
                    </div>
                    <div className="insights-list">
                        {advancedInsights.map((insight, index) => (
                            <div key={index} className="insight-item">
                                <div className="insight-number">{index + 1}</div>
                                <div className="insight-text">{insight}</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="answer-analysis-content">
                    
                    {/* 성향 분석 결과 */}
                    <div className="answer-item">
                        <div className="answer-header">
                            <h4 className="answer-title">성향 분석 결과</h4>
                        </div>
                        
                        {axisAnalyses.map((analysis, index) => (
                            <div key={index} className="axis-analysis-card">
                                <div className="axis-analysis-header">
                                    <h5 className="axis-analysis-name">{analysis.axisName}</h5>
                                    <div className="axis-analysis-tendency">{analysis.tendency}</div>
                                </div>
                                <div className="axis-analysis-content">
                                    <div className="axis-analysis-description">{analysis.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* 주요 인사이트 */}
                    {result.keyInsights && (
                        <div className="answer-item">
                            <div className="answer-header">
                                <h4 className="answer-title">주요 인사이트</h4>
                            </div>
                            {(() => {
                                try {
                                    const keyInsights: string[] = JSON.parse(result.keyInsights);
                                    return keyInsights.length > 0 ? (
                                        <ul className="insights-list">
                                            {keyInsights.map((insight, index) => (
                                                <li key={index} className="insight-item">{insight}</li>
                                            ))}
                                        </ul>
                                    ) : null;
                                } catch (e) {
                                    console.error('주요 인사이트 파싱 오류:', e);
                                    return null;
                                }
                            })()}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="result-section">
            {/* 결과 헤더 */}
            <div className="result-header">
                <h1 className="result-title">설문 분석 결과</h1>
                <p className="result-subtitle">당신의 codeFIT은...</p>
            </div>

            {/* 결과 카드 */}
            <div ref={resultCardRef} className={`result-card ${showResultCard ? 'show' : ''}`}>
                <div className="result-card-inner">
                    <img 
                        src={imagePath} 
                        alt="MBTI Result Image" 
                        className="mbti-result-image"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default/question.png';
                        }}
                    />
                    <div className="result-type-code">{typeCode}</div>
                    <div className="result-type-name">{typeInfo.name}</div>
                    <div className="result-type-desc">{typeInfo.desc}</div>
                </div>
                <div className="result-card-glow"></div>
            </div>

            {/* 점수 섹션 */}
            <div className={`score-section ${showScoreSection ? 'show' : ''}`}>
                <div className="score-title">성향 분석 결과</div>
                
                <div className="score-bars">
                    {/* Builder vs Architect */}
                    <div className="score-bar-item">
                        <div className="score-bar-title">개발 스타일</div>
                        <div className="score-bar-container">
                            <div className="left-label">Builder</div>
                            <div className="score-bar-track">
                                <div className="score-bar-center"></div>
                                <div 
                                    className="score-bar-fill score-bar-ab"
                                    style={{ 
                                        width: scoreAnimations.ab ? `${scoreToPercentage(result.scores?.['B_A'] || 0)}%` : '50%',
                                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                                <div 
                                    className="score-bar-indicator score-indicator-ab"
                                    style={{ 
                                        left: scoreAnimations.ab ? `${scoreToPercentage(result.scores?.['B_A'] || 0)}%` : '50%',
                                        transition: 'left 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                            </div>
                            <div className="right-label">Architect</div>
                        </div>
                        <div className="score-bar-result ab-result" style={{ 
                            color: (result.scores?.['B_A'] || 0) >= 0 ? '#a855f7' : '#6366f1' 
                        }}>
                            {scoreAnimations.ab ? 
                                `${getIntensityText(result.scores?.['B_A'] || 0)} ${(result.scores?.['B_A'] || 0) >= 0 ? 'Architect' : 'Builder'} 성향` 
                                : '분석 중...'
                            }
                        </div>
                    </div>

                    {/* 나머지 축들도 동일한 패턴으로 구현 */}
                    {/* Innovate vs Refactor */}
                    <div className="score-bar-item">
                        <div className="score-bar-title">기술 성향</div>
                        <div className="score-bar-container">
                            <div className="left-label">Innovate</div>
                            <div className="score-bar-track">
                                <div className="score-bar-center"></div>
                                <div 
                                    className="score-bar-fill score-bar-ri"
                                    style={{ 
                                        width: scoreAnimations.ri ? `${scoreToPercentage(result.scores?.['R_I'] || 0)}%` : '50%',
                                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                                <div 
                                    className="score-bar-indicator score-indicator-ri"
                                    style={{ 
                                        left: scoreAnimations.ri ? `${scoreToPercentage(result.scores?.['R_I'] || 0)}%` : '50%',
                                        transition: 'left 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                            </div>
                            <div className="right-label">Refactor</div>
                        </div>
                        <div className="score-bar-result ri-result" style={{ 
                            color: (result.scores?.['R_I'] || 0) >= 0 ? '#9333ea' : '#4f46e5' 
                        }}>
                            {scoreAnimations.ri ? 
                                `${getIntensityText(result.scores?.['R_I'] || 0)} ${(result.scores?.['R_I'] || 0) >= 0 ? 'Refactor' : 'Innovate'} 성향` 
                                : '분석 중...'
                            }
                        </div>
                    </div>

                    {/* Solo vs Team */}
                    <div className="score-bar-item">
                        <div className="score-bar-title">협업 방식</div>
                        <div className="score-bar-container">
                            <div className="left-label">Solo</div>
                            <div className="score-bar-track">
                                <div className="score-bar-center"></div>
                                <div 
                                    className="score-bar-fill score-bar-st"
                                    style={{ 
                                        width: scoreAnimations.st ? `${scoreToPercentage(result.scores?.['S_T'] || 0)}%` : '50%',
                                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                                <div 
                                    className="score-bar-indicator score-indicator-st"
                                    style={{ 
                                        left: scoreAnimations.st ? `${scoreToPercentage(result.scores?.['S_T'] || 0)}%` : '50%',
                                        transition: 'left 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                            </div>
                            <div className="right-label">Team</div>
                        </div>
                        <div className="score-bar-result st-result" style={{ 
                            color: (result.scores?.['S_T'] || 0) >= 0 ? '#7c2d92' : '#3730a3' 
                        }}>
                            {scoreAnimations.st ? 
                                `${getIntensityText(result.scores?.['S_T'] || 0)} ${(result.scores?.['S_T'] || 0) >= 0 ? 'Team' : 'Solo'} 성향` 
                                : '분석 중...'
                            }
                        </div>
                    </div>

                    {/* Debug vs Feature */}
                    <div className="score-bar-item">
                        <div className="score-bar-title">작업 선호</div>
                        <div className="score-bar-container">
                            <div className="left-label">Debug</div>
                            <div className="score-bar-track">
                                <div className="score-bar-center"></div>
                                <div 
                                    className="score-bar-fill score-bar-df"
                                    style={{ 
                                        width: scoreAnimations.df ? `${scoreToPercentage(result.scores?.['D_F'] || 0)}%` : '50%',
                                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                                <div 
                                    className="score-bar-indicator score-indicator-df"
                                    style={{ 
                                        left: scoreAnimations.df ? `${scoreToPercentage(result.scores?.['D_F'] || 0)}%` : '50%',
                                        transition: 'left 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                ></div>
                            </div>
                            <div className="right-label">Feature</div>
                        </div>
                        <div className="score-bar-result df-result" style={{ 
                            color: (result.scores?.['D_F'] || 0) >= 0 ? '#581c87' : '#1e40af' 
                        }}>
                            {scoreAnimations.df ? 
                                `${getIntensityText(result.scores?.['D_F'] || 0)} ${(result.scores?.['D_F'] || 0) >= 0 ? 'Feature' : 'Debug'} 성향` 
                                : '분석 중...'
                            }
                        </div>
                    </div>
                </div>

                {/* 분석 결과 탭 섹션 */}
                <div className="analysis-tabs">
                    <div className="tab-buttons">
                        <button
                            className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
                            onClick={() => handleTabSwitch('code')}
                        >
                            코드 분석 결과
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'survey' ? 'active' : ''}`}
                            onClick={() => handleTabSwitch('survey')}
                        >
                            설문 답변 분석
                        </button>
                    </div>

                    <div className="tab-content">
                        <div className={`tab-panel ${activeTab === 'code' ? 'active' : ''}`}>
                            {activeTab === 'code' && renderDetailedAnalysis()}
                        </div>
                        <div className={`tab-panel ${activeTab === 'survey' ? 'active' : ''}`}>
                            {activeTab === 'survey' && renderAnswerAnalysis()}
                        </div>
                    </div>
                </div>
            </div>

            {/* 결과 버튼들 */}
            <div className="result-buttons">
                <button className="btn-restart" onClick={onRestart}>
                    다시하기
                </button>
                <button className="btn-profile" onClick={() => navigate('/user/detail')}>
                    프로필로 이동
                </button>
            </div>
        </div>
    );
};

export default SurveyResult;
