import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import postService from '../../services/postService';
import './PostList.css';

interface JobPosting {
    jobPostingId: string;
    companyId: string;
    title: string;
    description: string;
    experienceLevel: string;
    salaryRange: string;
    location: string;
    workType: string;
    expiresAt: string;
    postedAt: string;
    status: string;
    companyName: string;
    industry: string;
    empCount: string;
    techStackNames: string;
    preferredDeveloperTypes: string;
    jobImageFileName?: string;
    logoFileName?: string;
}

interface PostListParams {
    pageIndex: number;
    pageSize: number;
}

interface UserInfo {
    accountId: string;
    name: string;
    role: string;
    mbti?: string;
}

const PostList: React.FC = () => {
    const navigate = useNavigate();
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [mbtiFilter, setMbtiFilter] = useState<string>('0');
    
    const pageSize = 12;

    useEffect(() => {
        console.log("채용공고 목록 페이지 로드");
        checkUserLoginStatus();
        loadPostList();
    }, [currentPage, mbtiFilter]);

    const checkUserLoginStatus = () => {
        const userInfoStr = document.cookie
            .split('; ')
            .find(row => row.startsWith('userInfo='))
            ?.split('=')[1];

        if (userInfoStr) {
            try {
                const parsedUserInfo = JSON.parse(decodeURIComponent(userInfoStr));
                setUserInfo(parsedUserInfo);
            } catch (e) {
                console.error('사용자 정보 파싱 오류:', e);
                setUserInfo(null);
            }
        }
    };

    const loadPostList = async () => {
        setLoading(true);
        try {
            const requestData: PostListParams = {
                pageIndex: currentPage,
                pageSize: pageSize
            };

            const data = await postService.getPostList(requestData);
            
            if (postService.isResponseSuccessful(data)) {
                setJobPostings(data.elData?.postVoList || []);
                setTotalCount(data.elData?.totalCount || 0);
            } else {
                console.error('공고 목록 조회 에러:', data.elHeader);
                setJobPostings([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('공고 목록 로드 실패:', error);
            setJobPostings([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const loadMbtiFilteredPosts = async () => {
        if (!userInfo || userInfo.role === 'COMPANY' || userInfo.mbti === 'ZZZZ' || !userInfo.mbti) {
            return;
        }

        setLoading(true);
        try {
            const requestData = {
                pageIndex: currentPage,
                pageSize: pageSize,
                mbtiMatchFilter: mbtiFilter,
                userMbti: userInfo.mbti
            };

            const data = await postService.getMbtiMatchedPostList(requestData);
            
            if (postService.isResponseSuccessful(data)) {
                setJobPostings(data.elData?.postVoList || []);
                setTotalCount(data.elData?.totalCount || 0);
            }
        } catch (error) {
            console.error('MBTI 필터링 공고 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMbtiFilterChange = (value: string) => {
        if (!userInfo) {
            alert("로그인 후 사용가능한 기능입니다.");
            return;
        }

        if (userInfo.mbti === 'ZZZZ') {
            alert("mbti 및 성향검사 후 진행 가능합니다.");
            return;
        }

        if (userInfo.role === 'COMPANY') {
            alert("기업회원은 사용 불가능한 기능입니다.");
            return;
        }

        setMbtiFilter(value);
        setCurrentPage(1);
        
        if (value === '0') {
            loadPostList();
        } else {
            loadMbtiFilteredPosts();
        }
    };

    const openPostDetail = (jobPostingId: string) => {
        if (!jobPostingId || jobPostingId.trim() === "") {
            console.error("공고 ID가 없습니다.");
            alert("선택된 공고의 정보를 찾을 수 없습니다.");
            return;
        }

        navigate(`/post/detail/${jobPostingId}`);
    };

    const viewCompany = (e: React.MouseEvent, companyId: string) => {
        e.stopPropagation();
        console.log("회사 정보 보기:", companyId);
        // TODO: 회사 상세 페이지로 이동
    };

    const getExperienceLevelText = (experienceLevel: string): string => {
        switch (experienceLevel) {
            case 'any': return '경력무관';
            case 'new': return '신입';
            case 'junior': return '1-2년';
            case 'mid': return '3-5년';
            case 'senior': return '5년 이상';
            default: return experienceLevel || '정보없음';
        }
    };

    const getWorkTypeText = (workType: string): string => {
        switch (workType) {
            case 'remote': return '원격근무';
            case 'onsite': return '출근근무';
            case 'hybrid': return '하이브리드';
            default: return workType || '정보없음';
        }
    };

    const getSalaryRangeText = (salaryRange: string): string => {
        switch (salaryRange) {
            case 'under25': return '~2,500만원';
            case '25to35': return '2,500~3,500만원';
            case '35to50': return '3,500~5,000만원';
            case 'over50': return '5,000만원+';
            default: return salaryRange || '협의';
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return "정보없음";

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) return "어제";
            if (diffDays < 7) return `${diffDays}일 전`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;

            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const renderJobCard = (jobData: JobPosting) => {
        // 선호 개발자 유형 태그 생성
        let developerTypeTags: string[] = [];
        if (jobData.preferredDeveloperTypes) {
            try {
                developerTypeTags = JSON.parse(jobData.preferredDeveloperTypes);
            } catch (e) {
                developerTypeTags = jobData.preferredDeveloperTypes.split(',').map(item => item.trim());
            }
        }

        // 이미지 경로 결정
        let imagePath = '';
        let imageAlt = '';

        if (jobData.jobImageFileName && jobData.jobImageFileName.trim() !== "" && jobData.jobImageFileName !== "null") {
            imagePath = `/images/company/${jobData.jobImageFileName}`;
            imageAlt = `${jobData.title || '공고'} 이미지`;
        } else if (jobData.logoFileName && jobData.logoFileName.trim() !== "" && jobData.logoFileName !== "null") {
            imagePath = `/images/company/${jobData.logoFileName}`;
            imageAlt = `${jobData.companyName || '회사'} 로고`;
        } else {
            imagePath = '/images/default/default_company.png';
            imageAlt = `${jobData.companyName || '회사'} 기본 이미지`;
        }

        return (
            <div 
                key={jobData.jobPostingId}
                className="job-card"
                onClick={() => openPostDetail(jobData.jobPostingId)}
            >
                <div className="job-image">
                    <img 
                        src={imagePath} 
                        alt={imageAlt}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default/default_company.png';
                        }}
                    />
                </div>
                
                <div className="job-content">
                    <div className="job-header">
                        <div className="job-title">{jobData.title || '제목없음'}</div>
                    </div>
                    
                    <div className="job-company" onClick={(e) => viewCompany(e, jobData.companyId)}>
                        <img 
                            src={jobData.logoFileName && jobData.logoFileName.trim() !== "" && jobData.logoFileName !== "null" 
                                ? `/images/company/${jobData.logoFileName}` 
                                : '/images/default/default_company.png'
                            }
                            alt={`${jobData.companyName || '회사'} 로고`}
                            className="company-logo"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/default/default_company.png';
                            }}
                        />
                        <span>{jobData.companyName || '회사명 정보없음'}</span>
                    </div>
                    
                    <div className="job-meta">
                        <div className="job-meta-item">
                            <span className="job-meta-icon">📍</span>
                            {jobData.location}
                        </div>
                        <div className="job-meta-item">
                            <span className="job-meta-icon">💼</span>
                            {getWorkTypeText(jobData.workType)}
                        </div>
                        <div className="job-meta-item">
                            <span className="job-meta-icon">⭐</span>
                            {getExperienceLevelText(jobData.experienceLevel)}
                        </div>
                    </div>
                    
                    {developerTypeTags.length > 0 && (
                        <div className="tech-tags">
                            {developerTypeTags.slice(0, 4).map((type, idx) => (
                                <span key={idx} className="tech-tag">{type}</span>
                            ))}
                        </div>
                    )}
                    
                    <div className="job-footer">
                        <div className="job-salary">
                            {getSalaryRangeText(jobData.salaryRange)}
                        </div>
                        <div className="job-date">
                            {formatDate(jobData.postedAt)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(totalCount / pageSize);
        const pages: JSX.Element[] = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`page-btn ${i === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="pagination">
                {currentPage > 1 && (
                    <button 
                        className="page-btn"
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        이전
                    </button>
                )}
                {pages}
                {currentPage < totalPages && (
                    <button 
                        className="page-btn"
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        다음
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="main-wrap">
            <Header />
            
            {/* 필터 섹션 */}
            <section className="filter-section">
                <div className="header-container">
                    <div className="header-left">
                        <div className="main-filters">
                            <select 
                                value={mbtiFilter}
                                onChange={(e) => handleMbtiFilterChange(e.target.value)}
                                className="mbti-filter-select"
                            >
                                <option value="0">모든 성향</option>
                                <option value="4">4개 이상</option>
                                <option value="3">3개 이상</option>
                                <option value="2">2개 이상</option>
                                <option value="1">1개 이상</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* 메인 컨텐츠 */}
            <main className="main-content">
                <section className="job-list-section">
                    <div className="section-header">
                        <h1 className="section-title">채용공고</h1>
                        <div className="job-count">
                            <span>총</span>
                            <span className="num">{totalCount}</span>
                            <span>개의 공고</span>
                        </div>
                    </div>

                    {/* 공고 카드 컨테이너 */}
                    <div className="job-cards">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <div>채용공고를 불러오는 중...</div>
                            </div>
                        ) : jobPostings.length > 0 ? (
                            jobPostings.map((posting) => renderJobCard(posting))
                        ) : (
                            <div className="empty-state">
                                <img 
                                    src="/images/default/not_found.png" 
                                    alt="빈 상태 이미지" 
                                    className="empty-image"
                                />
                                <div className="empty-message">등록된 채용공고가 없습니다</div>
                                <div className="empty-submessage">나중에 다시 확인해보세요</div>
                            </div>
                        )}
                    </div>

                    {/* 페이징 */}
                    {totalCount > 0 && (
                        <div className="paging-section">
                            {renderPagination()}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PostList;
