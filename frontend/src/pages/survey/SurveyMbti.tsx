import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import SurveyResult from './SurveyResult.tsx';
import surveyService from '../../services/surveyService.ts';
import AuthService from '../../services/authService.tsx';
import './SurveyMbti.css';
import {
    UserInfo,
    SurveyQuestionsData,
    SurveyAnswer,
    AnalysisResult,
    AxisInfo,
    SurveyProgress
} from '../../types/survey';

const SurveyMbti: React.FC = () => {
    const navigate = useNavigate();
    
    // 상태 관리
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestionsData>({});
    const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number }>({});
    const [surveyProgress, setSurveyProgress] = useState<SurveyProgress>({
        totalQuestions: 0,
        answeredQuestions: 0,
        progress: 0
    });
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showResult, setShowResult] = useState<boolean>(false);

    // 축 정보 정의
    const axisNames: { [key: string]: AxisInfo } = {
        'B/A': { name: 'Builder vs Architect', desc: '개발 스타일' },
        'R/I': { name: 'Innovate vs Refactor', desc: '기술 성향' },
        'S/T': { name: 'Solo vs Team', desc: '협업 방식' },
        'D/F': { name: 'Debug vs Feature', desc: '작업 선호' }
    };

    // 축 순서
    const axisOrder = ['B/A', 'R/I', 'S/T', 'D/F'];

    // 사용자 정보 확인 및 권한 체크
    const checkUserPermission = useCallback((): boolean => {
        try {
            const user = AuthService.getUserInfo();
            
            if (!user) {
                console.warn('사용자 정보를 가져올 수 없음');
                alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.');
                navigate('/');
                return false;
            }

            if (user.role === 'COMPANY') {
                alert('죄송합니다. 개발자 유형 검사는 개인 사용자만 이용 가능합니다.\n기업 회원은 채용 공고 등록 및 관리 기능을 이용하실 수 있습니다.');
                navigate('/');
                return false;
            }

            setUserInfo(user);
            return true;
        } catch (error) {
            console.error('사용자 권한 체크 중 오류:', error);
            alert('사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.');
            navigate('/');
            return false;
        }
    }, [navigate]);

    // 설문 질문 로드
    const loadSurveyQuestions = useCallback(async () => {
        try {
            setIsLoading(true);
            const questions = await surveyService.getQuestions();
            setSurveyQuestions(questions);
            
            // 총 질문 수 계산
            const totalQuestions = Object.values(questions).reduce((total, axisQuestions) => 
                total + axisQuestions.length, 0
            );
            
            setSurveyProgress(prev => ({
                ...prev,
                totalQuestions
            }));
        } catch (error) {
            console.error('설문 질문 로드 실패:', error);
            alert('설문 질문을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 초기화
    useEffect(() => {
        if (checkUserPermission()) {
            loadSurveyQuestions();
        }
    }, [checkUserPermission, loadSurveyQuestions]);

    // 답변 변경 핸들러
    const handleAnswerChange = useCallback((questionId: number, value: number) => {
        setUserAnswers(prev => {
            const newAnswers = { ...prev, [questionId]: value };
            
            // 진행률 업데이트
            const answeredQuestions = Object.keys(newAnswers).length;
            const progress = surveyProgress.totalQuestions > 0 
                ? Math.round((answeredQuestions / surveyProgress.totalQuestions) * 100) 
                : 0;
            
            setSurveyProgress(prev => ({
                ...prev,
                answeredQuestions,
                progress
            }));
            
            return newAnswers;
        });
    }, [surveyProgress.totalQuestions]);

    // 설문 제출
    const handleSubmit = useCallback(async () => {
        if (!userInfo) {
            alert('사용자 정보를 확인할 수 없습니다.');
            return;
        }

        const answeredQuestions = Object.keys(userAnswers).length;
        if (answeredQuestions < surveyProgress.totalQuestions) {
            alert('아직 답변하지 않은 문항이 있습니다.');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // 답변 데이터 준비
            const answers: SurveyAnswer[] = Object.entries(userAnswers).map(([questionId, answerValue]) => ({
                questionId: parseInt(questionId),
                answerValue
            }));

            const submitData = {
                userId: userInfo.accountId,
                typeId: 1,
                answers
            };

            const result = await surveyService.submitSurvey(submitData);
            setAnalysisResult(result);

            // 사용자 정보에 MBTI 추가
            const updatedUserInfo = { ...userInfo, mbti: result.typeCode };
            AuthService.setUserInfo(updatedUserInfo);
            setUserInfo(updatedUserInfo);

            setShowResult(true);
        } catch (error) {
            console.error('설문 제출 실패:', error);
            alert('설문 분석 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }, [userInfo, userAnswers, surveyProgress.totalQuestions]);

    // 다시하기
    const handleRestart = useCallback(() => {
        setUserAnswers({});
        setSurveyProgress(prev => ({
            ...prev,
            answeredQuestions: 0,
            progress: 0
        }));
        setAnalysisResult(null);
        setShowResult(false);
        window.scrollTo(0, 0);
    }, []);

    // 설문 섹션 렌더링
    const renderSurveySection = () => {
        if (isLoading) {
            return (
                <div className="loading-container">
                    <div className="loading-message">설문 질문을 불러오는 중입니다...</div>
                </div>
            );
        }

        return (
            <div className="survey-section">
                {/* 페이지 헤더 */}
                <div className="page-header">
                    <h1 className="main-title">개발자 성향 설문조사</h1>
                    <p className="sub-title">당신의 개발 스타일과 선호도를 알아보세요</p>
                </div>

                {/* 진행률 섹션 */}
                <div className="progress-section">
                    <div className="progress-header">
                        <div className="progress-title">진행률</div>
                        <div className="progress-text">
                            {surveyProgress.answeredQuestions} / {surveyProgress.totalQuestions} 완료 ({surveyProgress.progress}%)
                        </div>
                    </div>
                    
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${surveyProgress.progress}%` }}
                        />
                    </div>

                    <div className="progress-nav">
                        {axisOrder.map(axis => (
                            <div key={axis} className="progress-axis">
                                {axisNames[axis]?.name || axis}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 설문 문항 */}
                <div className="question-container">
                    {axisOrder.map(axis => {
                        const questions = surveyQuestions[axis];
                        const axisInfo = axisNames[axis];
                        
                        if (!questions || questions.length === 0) {
                            return null;
                        }

                        return (
                            <div key={axis} className="axis-section">
                                <div className="axis-header">
                                    <h3 className="axis-title">{axisInfo.name}</h3>
                                    <p className="axis-desc">{axisInfo.desc}</p>
                                </div>

                                {questions.map(question => (
                                    <div key={question.questionId} className="question-card">
                                        <div className="question-number">Q{question.questionId}</div>
                                        <div className="question-text">{question.questionText}</div>
                                        <div className="answer-options">
                                            {[1, 2, 3, 4, 5, 6, 7].map(value => {
                                                let label = '';
                                                if (value === 1) label = '전혀 그렇지 않다';
                                                else if (value === 4) label = '보통이다';
                                                else if (value === 7) label = '매우 그렇다';

                                                return (
                                                    <label key={value} className="option-label">
                                                        <input
                                                            type="radio"
                                                            name={`question_${question.questionId}`}
                                                            value={value}
                                                            checked={userAnswers[question.questionId] === value}
                                                            onChange={() => handleAnswerChange(question.questionId, value)}
                                                        />
                                                        <span className="option-number">{value}</span>
                                                        <span className="option-text">{label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* 제출 버튼 */}
                <div className="submit-section">
                    <button
                        className={`btn-submit ${surveyProgress.progress !== 100 ? 'disabled' : ''}`}
                        disabled={surveyProgress.progress !== 100 || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? '분석 중...' : '분석 시작'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="survey-mbti-page">
            <Header />
            <div className="survey-main-container">
                <div className="content-area">
                    {showResult && analysisResult ? (
                        <SurveyResult 
                            result={analysisResult}
                            onRestart={handleRestart}
                            userInfo={userInfo}
                        />
                    ) : (
                        renderSurveySection()
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SurveyMbti;
