import React from 'react';
import './MainPage.css';
import Header from '../components/Header/Header.tsx';
import Footer from '../components/Footer/Footer.tsx';
import { useUserAuthAndInfo } from '../hooks/useUserAuthAndInfo.ts';
import { useCompanies } from '../hooks/useCompanies.ts';
import { useJobPostings } from '../hooks/useJobPostings.ts';

// 컴포넌트 외부로 이동하거나, 각 훅에서 타입을 export하여 사용할 수 있습니다.
interface Company {
    companyId: number;
    name: string;
    logoPath?: string;
}

const MainPage: React.FC = () => {
    const { userInfo, isLoggedIn, profileCompletion } = useUserAuthAndInfo();
    const { companies } = useCompanies();
    const { jobPostings } = useJobPostings();

    // Event Handlers
    const handleMainLoginClick = () => {
        // Header의 로그인 버튼 클릭과 동일한 동작을 하도록 위임할 수 있습니다.
        // 혹은 Header의 로그인 모달을 여는 함수를 props로 받아 실행할 수 있습니다.
        alert("로그인 화면으로 이동합니다.");
    };
    
    const handleCard1Click = () => {
        window.location.href = '/mbti-example';
    };
    
    const handleCard2Click = () => {
        if (!isLoggedIn) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        window.location.href = "/survey/mbti";
    };
    
    const handleCard3Click = () => {
        if (!isLoggedIn) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        alert("코드분석 페이지로 이동합니다.");
    };
    
    const handleJobPostingClick = (jobPostingId: string) => {
        console.log(`채용 공고 ${jobPostingId} 클릭`);
        alert(`채용 공고 상세 페이지로 이동합니다. (ID: ${jobPostingId})`);
    };
    
    const handleCompanyClick = (company: Company) => {
        console.log(`회사 ${company.name} 클릭`);
        alert(`${company.name} 기업 페이지로 이동합니다.`);
    };
    
    const handleMatchingProposalClick = () => {
        if (!isLoggedIn) return;
        alert("매칭 제안 페이지로 이동합니다.");
    };
    
    const handleApplicationStatusClick = () => {
        if (!isLoggedIn) return;
        alert("지원 현황 페이지로 이동합니다.");
    };
    
    const handleAdClick = () => {
        alert("회원가입 페이지로 이동합니다!");
    };

    return (
        <div className="main-wrap">
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container clearfix">
                    <div className="hero-left">
                        <div className="ad-area" onClick={handleAdClick}>
                            <span className="ad-title">당신의 꿈의 직장을</span>
                            <span className="ad-title">찾아드립니다</span>
                            <span className="ad-subtitle">AI 기반 매칭으로 최적의 기업과 만남</span>
                            <button className="ad-button">무료로 시작하기 →</button>
                        </div>
                    </div>
                    <div className="hero-right">
                        {!isLoggedIn ? (
                            <div className="login-area">
                                <span className="login-title">로그인하고 기업 매칭에 참여해 보세요.</span>
                                <button className="btn-main-login" onClick={handleMainLoginClick}>로그인</button>
                                <div className="gift-area">
                                    <span className="gift-text">매칭 퀘스트 완료하고</span>
                                    <span className="gift-text-bold">원하는 기업에 지원하세요!</span>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-area">
                                {/* 사용자 정보 헤더 */}
                                <div className="profile-header">
                                    <div className="profile-avatar">
                                        <img 
                                            src="/images/default/default_user.png"
                                            alt="User Avatar"
                                            style={{width: '60px', height: '60px', borderRadius: '50%'}}
                                        />
                                    </div>
                                    <div className="profile-info">
                                        <span className="profile-name">{userInfo?.name}님</span>
                                    </div>
                                </div>
                                
                                {/* 프로필 완성도 */}
                                <div className="profile-completion">
                                    <span className="completion-text">필수 조건을 입력하여 매칭 프로필 완성도를 높이세요!</span>
                                </div>
                                
                                <div className="matching-status-section">
                                    {/* 프로필 완성도 바 */}
                                    <div className="profile-progress">
                                        <span className="progress-label">매칭 프로필 완성도</span>
                                        <span className="progress-percent">{profileCompletion}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{width: `${profileCompletion}%`}}></div>
                                    </div>
                                </div>
                                
                                {/* 통계 영역 */}
                                <div className="stats-section">
                                    <div className="stats-item">
                                        <span 
                                            className="stats-number" 
                                            onClick={handleMatchingProposalClick}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {userInfo?.matchingProposalCount || 0}
                                        </span>
                                        <span 
                                            className="stats-label"
                                            onClick={handleMatchingProposalClick}
                                            style={{cursor: 'pointer'}}
                                        >
                                            매칭 제안
                                        </span>
                                    </div>
                                    <div className="stats-item">
                                        <span 
                                            className="stats-number"
                                            onClick={handleApplicationStatusClick}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {userInfo?.applicationStatusCount || 0}
                                        </span>
                                        <span 
                                            className="stats-label"
                                            onClick={handleApplicationStatusClick}
                                            style={{cursor: 'pointer'}}
                                        >
                                            지원현황
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Analysis Section */}
            <section className="section section-white">
                <div className="section-container">
                    <span className="section-title">성향을 분석하고 나와 맞는 기업에 지원하세요!</span>
                    
                    <div className="cards-container">
                        <div className="card card-green" onClick={handleCard1Click}>
                            <div className="card-icon card-icon-green">
                                <img 
                                    src="/images/mbti/png/BITF.png" 
                                    alt="성향 유형"
                                    style={{width: '150px', height: '150px'}}
                                />
                            </div>
                            <span className="card-title">성향 유형</span>
                        </div>
                        
                        <div className={`card card-blue ${userInfo?.isMbtiChecked ? 'completed' : ''}`} onClick={handleCard2Click}>
                            <div className="card-icon card-icon-blue">
                                <img 
                                    src="/images/main/mbti_check.png" 
                                    alt="개발자 성향분석"
                                    style={{width: '150px', height: '150px'}}
                                />
                            </div>
                            <span className="card-title">개발자 성향분석</span>
                        </div>
                        
                        <div className={`card card-orange ${userInfo?.isCodeChecked ? 'completed' : ''}`} onClick={handleCard3Click}>
                            <div className="card-icon card-icon-orange">
                                <img 
                                    src="/images/main/code_check.png" 
                                    alt="코드분석"
                                    style={{width: '150px', height: '150px'}}
                                />
                            </div>
                            <span className="card-title">코드분석</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Job Postings Section */}
            <section className="section section-gray">
                <div className="section-container">
                    <span className="section-title">최근 등록된 기업 공고</span>
                    
                    <div className="positions-container">
                        {jobPostings.length > 0 ? (
                            jobPostings.map((posting, index) => (
                                <div 
                                    key={posting.jobPostingId}
                                    className="position-card" 
                                    onClick={() => handleJobPostingClick(posting.jobPostingId)}
                                >
                                    <div className="position-header">
                                        <img 
                                            src={posting.jobImageFileName ? `/images/company/${posting.jobImageFileName}` : '/images/main/default_job.png'}
                                            alt="Job Image"
                                            style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px'}}
                                        />
                                    </div>
                                    <span className="position-company">{posting.name}</span>
                                    <span className="position-title">{posting.location} · {posting.experienceLevel}</span>
                                    <div className="dev-type-tag-container">
                                        {posting.preferredDeveloperTypes.slice(0, 4).map((type, idx) => (
                                            <span key={`${posting.jobPostingId}-${idx}`} className="dev-type-tag">{type}</span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                                등록된 공고가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Participating Companies Section */}
            <section className="section section-white">
                <div className="section-container">
                    <span className="section-title">매칭 참여 기업</span>
                    <span className="section-subtitle">참여 기업: {companies.length}개</span>
                    
                    <div className="companies-container">
                        {companies.length > 0 ? (
                            companies.map((company) => (
                                <div 
                                    key={company.companyId}
                                    className="company-item"
                                    onClick={() => handleCompanyClick(company)}
                                >
                                    <img 
                                        className="main-company-logo"
                                        src={company.logoPath || '/images/default/default_company.png'}
                                        alt={`${company.name} Logo`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null; // Prevent infinite loop
                                            target.src = '/images/default/default_company.png';
                                        }}
                                    />
                                    <span className="company-name">{company.name}</span>
                                </div>
                            ))
                        ) : (
                            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                                등록된 기업이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default MainPage;