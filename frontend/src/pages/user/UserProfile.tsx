import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress.ts';
import ActionCardsFrame from './ActionCardsFrame.tsx';
import ResultFrame from './ResultFrame.tsx';
import './UserProfile.css';

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { userInfo } = useOutletContext<{ userInfo: any }>();
    const { isMbtiDone, isCodeDone, isAllComplete, progressPercentage } = useProgress(userInfo);

    const handleUserUpdate = () => {
        navigate('/user/update');
    };

    return (
        <>
            {/* 개인정보 카드 */}
            <section className="info-grid">
                <div className="profile-info">
                    <div className="profile-avatar">
                        <img src="/images/default/default_user.png" alt="프로필" style={{width: '80px', height: '80px'}} />
                    </div>
                    <div className="profile-details">
                        <div className="profile-name">
                            {userInfo.name}
                        </div>
                        <div className="profile-career">
                            {userInfo.career}
                        </div>
                    </div>
                </div>
                <div className="info-card">
                    <div className="info-card-header">
                        <div className="info-card-title">개인정보</div>
                        <button 
                            className="info-card-edit" 
                            onClick={handleUserUpdate}
                            title="정보 수정"
                        >
                            ✏️
                        </button>
                    </div>

                    <div className="info-content-grid">
                        {/* 직무 */}
                        <div className="info-item">
                            <div className="info-item-label">직무</div>
                            <div className="info-item-value">{userInfo.currentPosition}</div>
                        </div>

                        {/* 근무 지역 */}
                        <div className="info-item">
                            <div className="info-item-label">근무 지역</div>
                            <div className="info-item-value">{userInfo.preferredLocations}</div>
                        </div>

                        {/* 연봉 */}
                        <div className="info-item">
                            <div className="info-item-label">희망 연봉</div>
                            <div className="info-item-value">{userInfo.yearSalary.toLocaleString()} 만원</div>
                        </div>

                        {/* 경력 수준 */}
                        <div className="info-item">
                            <div className="info-item-label">경력 수준</div>
                            <div className="info-item-value">{userInfo.career}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 매칭에 필요한 정보 섹션 */}
            <section className="section">
                <div className="section-title">
                    {isAllComplete ? "당신의 성향은..." : "매칭에 필요한 정보를 입력해주세요."}
                </div>

                {/* 동적 콘텐츠 렌더링 */}
                <div className="content-frame">
                    {isAllComplete ? (
                        <ResultFrame userInfo={userInfo} />
                    ) : (
                        <ActionCardsFrame 
                            userInfo={userInfo}
                            isMbtiDone={isMbtiDone}
                            isCodeDone={isCodeDone}
                            progressPercentage={progressPercentage}
                        />
                    )}
                </div>
            </section>
        </>
    );
};

export default UserProfile;
