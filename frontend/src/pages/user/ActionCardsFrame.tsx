import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDetailInfo } from '../../hooks/useUserDetailData.ts';
import './ActionCardsFrame.css';

interface ActionCardsFrameProps {
    userInfo: UserDetailInfo;
    isMbtiDone: boolean;
    isCodeDone: boolean;
    progressPercentage: number;
}

const ActionCardsFrame: React.FC<ActionCardsFrameProps> = ({ 
    userInfo, 
    isMbtiDone, 
    isCodeDone, 
    progressPercentage 
}) => {
    const navigate = useNavigate();

    const handleMbtiTest = () => {
        navigate('/survey/mbti');
    };

    const handleCodeAnalysis = () => {
        navigate('/survey/code');
    };

    return (
        <div className="action-cards-container">
            <div className="action-cards-grid">
                {/* MBTI 검사 카드 */}
                <div className={`action-card ${isMbtiDone ? 'completed' : 'incomplete'}`}>
                    <div className="card-icon">
                        <img 
                            src="/images/main/mbti_check.png" 
                            alt="MBTI 검사"
                            className="card-icon-image"
                        />
                    </div>
                    <div className="card-content">
                        <h3 className="card-title">MBTI 성격 검사</h3>
                        <p className="card-description">
                            {isMbtiDone 
                                ? '검사가 완료되었습니다!' 
                                : '당신의 성격 유형을 알아보세요'
                            }
                        </p>
                        <div className="card-status">
                            <span className={`status-badge ${isMbtiDone ? 'completed' : 'pending'}`}>
                                {isMbtiDone ? '완료' : '미완료'}
                            </span>
                        </div>
                    </div>
                    {!isMbtiDone && (
                        <button className="card-action-btn" onClick={handleMbtiTest}>
                            검사 시작
                        </button>
                    )}
                </div>

                {/* 코드 분석 카드 */}
                <div className={`action-card ${isCodeDone ? 'completed' : 'incomplete'}`}>
                    <div className="card-icon">
                        <img 
                            src="/images/main/code_check.png" 
                            alt="코드 분석"
                            className="card-icon-image"
                        />
                    </div>
                    <div className="card-content">
                        <h3 className="card-title">코드 분석</h3>
                        <p className="card-description">
                            {isCodeDone 
                                ? '분석이 완료되었습니다!' 
                                : '코딩 스타일과 실력을 분석해보세요'
                            }
                        </p>
                        <div className="card-status">
                            <span className={`status-badge ${isCodeDone ? 'completed' : 'pending'}`}>
                                {isCodeDone ? '완료' : '미완료'}
                            </span>
                        </div>
                    </div>
                    {!isCodeDone && (
                        <button className="card-action-btn" onClick={handleCodeAnalysis}>
                            분석 시작
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionCardsFrame;