import React, { useState, useEffect } from 'react';
import './common.css';

interface Company {
    userId: number;
    name: string;
    logoFileName?: string;
}

interface JobPosting {
    jobPostingId: string;
    name: string;
    location: string;
    experienceLevel: string;
    preferredDeveloperTypes: string[];
    jobImageFileName?: string;
}

interface UserInfo {
    accountId: string;
    name: string;
    isMbtiChecked?: boolean;
    isCodeChecked?: boolean;
    matchingProposalCount?: number;
    applicationStatusCount?: number;
}

const MainPage: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [profileCompletion, setProfileCompletion] = useState<number>(0);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");

    useEffect(() => {
        console.log("메인 페이지가 로드되었습니다.");
        
        // 쿠키에서 사용자 정보 확인
        checkUserLoginStatus();
        
        // 데이터 로딩
        loadCompanyList();
        loadJobPostings();
    }, []);

    const checkUserLoginStatus = () => {
        // 실제 구현에서는 쿠키나 세션에서 사용자 정보 확인
        const userInfoStr = document.cookie
            .split('; ')
            .find(row => row.startsWith('userInfo='))
            ?.split('=')[1];

        if (userInfoStr) {
            try {
                const parsedUserInfo = JSON.parse(decodeURIComponent(userInfoStr));
                setUserInfo(parsedUserInfo);
                setIsLoggedIn(true);
                loadUserMatchingInfo(parsedUserInfo.accountId);
            } catch (e) {
                console.error('사용자 정보 파싱 오류:', e);
                setIsLoggedIn(false);
            }
        }
    };

    const loadCompanyList = async () => {
        // 실제 구현에서는 API 호출
        try {
            // Mock data for demonstration
            const mockCompanies: Company[] = [
                { userId: 1, name: 'kakaobank', logoFileName: 'kakaobank.png' },
                { userId: 2, name: '(주)카카오페이', logoFileName: 'kakaopay.png' },
                { userId: 3, name: '(주)파라다이스', logoFileName: 'paradise.png' },
                { userId: 4, name: 'SHINSEGAE', logoFileName: 'shinsegae.png' },
            ];
            setCompanies(mockCompanies);
        } catch (error) {
            console.error('회사 목록 로드 실패:', error);
        }
    };

    const loadJobPostings = async () => {
        // 실제 구현에서는 API 호출
        try {
            const mockPostings: JobPosting[] = [
                {
                    jobPostingId: '1',
                    name: '(주)이디야',
                    location: '서울',
                    experienceLevel: '경력',
                    preferredDeveloperTypes: ['백엔드', '프론트엔드'],
                    jobImageFileName: 'ediya.jpg'
                },
                {
                    jobPostingId: '2',
                    name: '동아사이그룹',
                    location: '수도권',
                    experienceLevel: '신입/경력',
                    preferredDeveloperTypes: ['풀스택', '백엔드'],
                    jobImageFileName: 'donga.jpg'
                }
            ];
            setJobPostings(mockPostings);
        } catch (error) {
            console.error('채용 공고 로드 실패:', error);
        }
    };

    const loadUserMatchingInfo = async (accountId: string) => {
        // 실제 구현에서는 API 호출
        try {
            // Mock data
            const mockData = {
                isMbtiChecked: true,
                isCodeChecked: false,
                matchingProposalCount: 3,
                applicationStatusCount: 5
            };
            
            if (userInfo) {
                setUserInfo({ ...userInfo, ...mockData });
                updateProfileCompletion(mockData.isMbtiChecked, mockData.isCodeChecked);
            }
        } catch (error) {
            console.error('매칭 정보 로드 실패:', error);
        }
    };

    const updateProfileCompletion = (mbtiChecked: boolean, codeChecked: boolean) => {
        let completeCount = 0;
        if (mbtiChecked) completeCount++;
        if (codeChecked) completeCount++;
        const totalTasks = 2;
        const completionPercentage = (completeCount / totalTasks) * 100;
        setProfileCompletion(completionPercentage);
    };

    // Event Handlers
    const handleLogoClick = () => window.location.reload();
    
    const handleLoginClick = () => {
        // 실제 구현에서는 로그인 팝업 열기
        alert("로그인/회원가입 페이지로 이동합니다.");
    };
    
    const handleMainLoginClick = () => {
        // 실제 구현에서는 로그인 팝업 열기
        alert("로그인 화면으로 이동합니다.");
    };
    
    const handleCard1Click = () => {
        // MBTI 예제 페이지로 이동
        alert("성향 유형 페이지로 이동합니다.");
    };
    
    const handleCard2Click = () => {
        if (!isLoggedIn) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        // 개발자 성향분석 페이지로 이동
        alert("개발자 성향분석 페이지로 이동합니다.");
    };
    
    const handleCard3Click = () => {
        if (!isLoggedIn) {
            alert("로그인 후 이용해주세요.");
            return;
        }
        // 코드분석 페이지로 이동
        alert("코드분석 페이지로 이동합니다.");
    };
    
    const handleJobPostingClick = (jobPostingId: string) => {
        // 채용 공고 상세 페이지로 이동
        console.log(`채용 공고 ${jobPostingId} 클릭`);
        alert(`채용 공고 상세 페이지로 이동합니다. (ID: ${jobPostingId})`);
    };
    
    const handleCompanyClick = (company: Company) => {
        console.log(`회사 ${company.name} 클릭`);
        alert(`${company.name} 기업 페이지로 이동합니다.`);
    };
    
    const handleMatchingProposalClick = () => {
        if (!isLoggedIn) return;
        // UserDetail 페이지의 매칭 제안으로 이동
        alert("매칭 제안 페이지로 이동합니다.");
    };
    
    const handleApplicationStatusClick = () => {
        if (!isLoggedIn) return;
        // UserDetail 페이지의 지원 현황으로 이동
        alert("지원 현황 페이지로 이동합니다.");
    };
    
    const handleAdClick = () => {
        alert("회원가입 페이지로 이동합니다!");
    };
    
    const goToUserDetail = () => {
        alert("사용자 상세 페이지로 이동합니다.");
        closeSideMenu();
    };
    
    const handleEnterpriseClick = () => {
        alert("기업 서비스 페이지로 이동합니다.");
    };
    
    const goToCompanyRegister = () => {
        alert("기업 등록 페이지로 이동합니다.");
        closeSideMenu();
    };
    
    const handleMenu1Click = () => {
        alert("매칭 페이지로 이동합니다.");
        closeSideMenu();
    };
    
    const handleMenu2Click = () => {
        alert("MBTI 검사 페이지로 이동합니다.");
        closeSideMenu();
    };
    
    const handleMenu3Click = () => {
        alert("기업 둘러보기 페이지로 이동합니다.");
        closeSideMenu();
    };

    const handleSearch = () => {
        if (searchText && searchText.trim() !== "") {
            alert(`'${searchText}'를 검색합니다.`);
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleSideMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeSideMenu = () => setIsMenuOpen(false);

    return (
        <div className="main-wrap">
            {/* Header */}
            <header className="header clearfix">
                <div className="header-left">
                    <div className="hamburger-menu" onClick={toggleSideMenu}>
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                    </div>
                    <div className="nav-menu">
                        <img src="/images/ws5/weaveTypeLogo.png" style={{ width: '120px', height: '32px', objectFit: 'contain' }} alt="WeaveType Logo" className="logo" onClick={handleLogoClick} />
                        <a href="#" className="nav-link" onClick={handleMenu1Click}>매칭</a>
                        <a href="#" className="nav-link" onClick={handleMenu2Click}>mbti검사</a>
                        <a href="#" className="nav-link" onClick={handleMenu3Click}>기업 둘러보기</a>
                    </div>
                </div>
                <div className="header-right">
                    <div className="search-container">
                        <input 
                            id="searchInput" 
                            className="search-input" 
                            placeholder="검색어를 입력하세요" 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                        />
                        <button className="search-btn" onClick={handleSearch}>🔍</button>
                    </div>
                    <button className="btn-login" onClick={handleLoginClick}>로그인/회원가입</button>
                    <button className="btn-enterprise" onClick={handleEnterpriseClick}>기업 서비스</button>
                </div>
            </header>

            {/* Side Menu */}
            <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeSideMenu}></div>
            <nav className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                <span className="side-menu-title">메뉴</span>
                <div className="side-menu-section">
                    <span className="side-menu-section-title">매칭 서비스</span>
                    <a href="#" className="side-menu-item" onClick={handleMenu1Click}>💼 매칭</a>
                    <a href="#" className="side-menu-item" onClick={handleMenu2Click}>🧠 MBTI 검사</a>
                    <a href="#" className="side-menu-item" onClick={handleMenu3Click}>🏢 기업 둘러보기</a>
                </div>
                <div className="side-menu-section">
                    <span className="side-menu-section-title">개인 서비스</span>
                    <a href="#" className="side-menu-item" onClick={goToUserDetail}>👤 내 정보</a>
                    <a href="#" className="side-menu-item">📝 지원현황</a>
                    <a href="#" className="side-menu-item">❤️ 관심기업</a>
                    <a href="#" className="side-menu-item">🔖 북마크</a>
                </div>
                <div className="side-menu-section">
                    <span className="side-menu-section-title">기업 서비스</span>
                    <a href="#" className="side-menu-item" onClick={handleEnterpriseClick}>📊 채용관리 대시보드</a>
                    <a href="#" className="side-menu-item" onClick={goToCompanyRegister}>📋 기업 등록</a>
                </div>
            </nav>

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
                                            src="/images/ws5/default_user.png" 
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
                <span className="section-title">성향을 분석하고 나와 맞는 기업에 지원하세요!</span>
                
                <div className="cards-container">
                    <div className="card card-green" onClick={handleCard1Click}>
                        <div className="card-icon card-icon-green">
                            <img 
                                src="/images/ws5/mbti/png/BITF.png" 
                                alt="성향 유형"
                                style={{width: '150px', height: '150px'}}
                            />
                        </div>
                        <span className="card-title">성향 유형</span>
                    </div>
                    
                    <div className={`card card-blue ${userInfo?.isMbtiChecked ? 'completed' : ''}`} onClick={handleCard2Click}>
                        <div className="card-icon card-icon-blue">
                            <img 
                                src="/images/ws5/main/mbti_check.png" 
                                alt="개발자 성향분석"
                                style={{width: '150px', height: '150px'}}
                            />
                        </div>
                        <span className="card-title">개발자 성향분석</span>
                    </div>
                    
                    <div className={`card card-orange ${userInfo?.isCodeChecked ? 'completed' : ''}`} onClick={handleCard3Click}>
                        <div className="card-icon card-icon-orange">
                            <img 
                                src="/images/ws5/main/code_check.png" 
                                alt="코드분석"
                                style={{width: '150px', height: '150px'}}
                            />
                        </div>
                        <span className="card-title">코드분석</span>
                    </div>
                </div>
            </section>

            {/* Job Postings Section */}
            <section className="section section-gray">
                <span className="section-title">최근 등록된 기업 공고</span>
                
                <div className="positions-container">
                    {jobPostings.map((posting, index) => (
                        <div 
                            key={posting.jobPostingId}
                            className="position-card" 
                            onClick={() => handleJobPostingClick(posting.jobPostingId)}
                        >
                            <div className="position-header">
                                <img 
                                    src={posting.jobImageFileName ? `/images/company/${posting.jobImageFileName}` : '/images/ws5/default_job.png'}
                                    alt="Job Image"
                                    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px'}}
                                />
                            </div>
                            <span className="position-company">{posting.name}</span>
                            <span className="position-title">{posting.location} · {posting.experienceLevel}</span>
                            <div className="dev-type-tag-container">
                                {posting.preferredDeveloperTypes.slice(0, 4).map((type, idx) => (
                                    <span key={idx} className="dev-type-tag">{type}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Participating Companies Section */}
            <section className="section section-white">
                <span className="section-title">매칭 참여 기업</span>
                <span className="section-subtitle">참여 기업: {companies.length}개</span>
                
                <div className="companies-container">
                    {companies.map((company) => (
                        <div 
                            key={company.userId}
                            className="company-item"
                            onClick={() => handleCompanyClick(company)}
                        >
                            <img 
                                className="company-logo"
                                src={company.logoFileName ? `/images/company/${company.logoFileName}` : '/images/ws5/default_company.png'}
                                alt={`${company.name} Logo`}
                            />
                            <span className="company-name">{company.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <span className="footer-title">WeaveType</span>
                <span className="footer-text">(주)위브타입 | 대표이사 홍길동 | 대표고객문의 support@weavetype.com</span>
                <span className="footer-text">서울특별시 강남구 테헤란로 123 위브타워 15층 | 전화번호: 02-123-4567</span>
                <span className="footer-text">© 2023 WeaveType Inc. All Rights Reserved.</span>
            </footer>
        </div>
    );
}

export default MainPage;
