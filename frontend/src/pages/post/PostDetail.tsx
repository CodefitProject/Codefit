import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.tsx';

import postService from '../../services/postService';
import AuthService from '../../services/authService.tsx';
import './PostDetail.css';

interface JobPosting {
    jobPostingId: string;
    companyId: string;
    title: string;
    description: string;
    requirements?: string;
    preferred?: string;
    benefits?: string;
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
    selectedTechStackNames: string;
    preferredDeveloperTypes: string;
    jobImageFileName?: string;
    logoFileName?: string;
    isApplied?: boolean;
}

interface UserInfo {
    accountId: string;
    name: string;
    role: string;
    companyId?: string;
}

const PostDetail: React.FC = () => {
    const { jobPostingId } = useParams<{ jobPostingId: string }>();
    const navigate = useNavigate();
    const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isApplying, setIsApplying] = useState<boolean>(false);

    useEffect(() => {
        console.log("공고 상세 페이지 로드, ID:", jobPostingId);
        checkUserLoginStatus();
        
        if (jobPostingId) {
            loadPostDetail(jobPostingId);
        } else {
            console.error("공고 ID가 없습니다.");
            navigate('/post');
        }
    }, [jobPostingId, navigate]);

    const checkUserLoginStatus = () => {
        // AuthService 사용하여 일관된 사용자 정보 가져오기
        const userInfo = AuthService.getUserInfo();
        console.log('PostDetail - 사용자 정보:', userInfo);
        
        if (userInfo) {
            // 임시로 기업 사용자의 경우 companyId: "1" 설정 (테스트용)
            const enrichedUserInfo = userInfo.role === 'COMPANY' 
                ? { ...userInfo, companyId: "1" }
                : userInfo;
            setUserInfo(enrichedUserInfo);
        } else {
            setUserInfo(null);
        }
    };

    const loadPostDetail = async (id: string) => {
        setLoading(true);
        try {
            const data = await postService.getPostDetail(id);
            console.log('공고 상세 응답:', data);
            
            // 표준 REST API 응답 처리
            setJobPosting(data);
        } catch (error) {
            console.error('공고 상세 로드 실패:', error);
            alert('공고 정보를 불러올 수 없습니다.');
            navigate('/post');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/post');
    };

    const handleApply = async () => {
        if (!userInfo) {
            alert("로그인 후 지원 가능합니다.");
            return;
        }

        if (userInfo.role === 'COMPANY') {
            alert("기업 회원은 지원할 수 없습니다.");
            return;
        }

        if (jobPosting?.isApplied) {
            alert("이미 지원한 공고입니다.");
            return;
        }

        if (!window.confirm("이 공고에 지원하시겠습니까?")) {
            return;
        }

        setIsApplying(true);
        try {
            const data = await postService.applyToPost(
                jobPosting?.jobPostingId || '',
                userInfo.accountId
            );
            
            console.log('지원 응답:', data);
            alert("지원이 완료되었습니다!");
            if (jobPosting) {
                setJobPosting({ ...jobPosting, isApplied: true });
            }
        } catch (error) {
            console.error('지원 실패:', error);
            alert('지원 중 오류가 발생했습니다.');
        } finally {
            setIsApplying(false);
        }
    };

    const handleEdit = () => {
        navigate(`/post/edit/${jobPostingId}`);
    };

    const handleDelete = async () => {
        if (!window.confirm("정말로 이 공고를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const data = await postService.deletePost(jobPostingId || '');
            
            console.log('삭제 응답:', data);
            alert("공고가 삭제되었습니다.");
            navigate('/post');
        } catch (error) {
            console.error('공고 삭제 실패:', error);
            alert('공고 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleViewApplicants = () => {
        // TODO: 지원자 목록 페이지로 이동
        alert("지원자 목록 페이지로 이동합니다.");
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
            case 'under25': return '2,500만원 미만';
            case '25to35': return '2,500-3,500만원';
            case '35to50': return '3,500-5,000만원';
            case 'over50': return '5,000만원 이상';
            default: return salaryRange || '협의';
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return "정보없음";

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const renderTechStackTags = (techStackNames: string) => {
        if (!techStackNames) return null;

        try {
            const techStacks = JSON.parse(techStackNames);
            return techStacks.map((tech: string, index: number) => (
                <span key={index} className="tag tech-tag">{tech}</span>
            ));
        } catch (e) {
            const techStacks = techStackNames.split(',').map(item => item.trim());
            return techStacks.map((tech: string, index: number) => (
                <span key={index} className="tag tech-tag">{tech}</span>
            ));
        }
    };

    const renderDeveloperTypeTags = (developerTypes: string) => {
        if (!developerTypes) return null;

        try {
            const types = JSON.parse(developerTypes);
            return types.map((type: string, index: number) => (
                <span key={index} className="tag dev-type-tag">{type}</span>
            ));
        } catch (e) {
            const types = developerTypes.split(',').map(item => item.trim());
            return types.map((type: string, index: number) => (
                <span key={index} className="tag dev-type-tag">{type}</span>
            ));
        }
    };

    const showMbtiInfo = () => {
        alert(`MBTI 성향 정보:\n\n개발자의 코딩 스타일과 업무 방식을 나타내는 지표입니다.\n각 성향별로 다른 특성을 가지고 있어 팀 매칭에 활용됩니다.`);
    };

    // 소유자 확인 로직 (데이터 타입 고려)
    const isOwner = userInfo?.role === 'COMPANY' && 
                   (String(userInfo?.companyId) === String(jobPosting?.companyId) || 
                    parseInt(userInfo?.companyId) === parseInt(jobPosting?.companyId));
                   
    console.log('권한 체크:', {
        userRole: userInfo?.role,
        userCompanyId: userInfo?.companyId,
        postCompanyId: jobPosting?.companyId,
        isOwner: isOwner
    });

    if (loading) {
        return (
            <div className="post-detail-main-wrap">
                <Header />
                <div className="container">
                    <main className="main-content">
                        <div className="loading-content">
                            <div className="loading-spinner"></div>
                            공고 정보를 불러오는 중...
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!jobPosting) {
        return (
            <div className="post-detail-main-wrap">
                <Header />
                <div className="container">
                    <main className="main-content">
                        <div className="empty-content">
                            공고 정보를 찾을 수 없습니다.
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="post-detail-main-wrap">
            <Header />
            <div className="container">
                <main className="main-content">
                    {/* 뒤로가기 버튼 */}
                    <section className="back-section">
                        <button className="btn-back" onClick={handleBack}>
                            <span>←</span>
                            <span>목록으로</span>
                        </button>
                    </section>

                    {/* 회사 이미지 섹션 */}
                    <section className="company-images">
                        <div className="image-gallery">
                            <div className="main-image">
                                {jobPosting.jobImagePath ? (
                                    <img 
                                        src={jobPosting.jobImagePath}
                                        alt={`${jobPosting.title} 공고 이미지`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/default/default_company.png';
                                        }}
                                    />
                                ) : jobPosting.jobImageFileName ? (
                                    <img 
                                        src={`/images/company/${jobPosting.jobImageFileName}`}
                                        alt={`${jobPosting.title} 이미지`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/default/default_company.png';
                                        }}
                                    />
                                ) : jobPosting.logoFileName ? (
                                    <img 
                                        src={`/images/company/${jobPosting.logoFileName}`}
                                        alt={`${jobPosting.companyName} 로고`}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/default/default_company.png';
                                        }}
                                    />
                                ) : (
                                    <img 
                                        src="/images/default/default_company.png"
                                        alt="기본 이미지"
                                    />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 공고 헤더 */}
                    <section className="job-header">
                        <div className="job-meta">
                            {jobPosting.companyName} • {jobPosting.industry || '업종 정보없음'} • 직원 {jobPosting.empCount || '정보없음'}명
                        </div>
                        <h1 className="job-title">{jobPosting.title}</h1>
                        
                        <div className="job-actions">
                            {userInfo ? (
                                isOwner ? (
                                    // 기업 사용자이면서 자신의 공고인 경우
                                    <>
                                        <button className="btn-edit" onClick={handleEdit}>
                                            수정
                                        </button>
                                        <button className="btn-delete" onClick={handleDelete}>
                                            삭제
                                        </button>
                                        <button className="btn-applicant_details" onClick={handleViewApplicants}>
                                            지원자 보기
                                        </button>
                                    </>
                                ) : userInfo.role === 'COMPANY' ? (
                                    // 다른 기업의 공고를 보는 경우
                                    <button className="btn-scout">
                                        매칭 제안하기
                                    </button>
                                ) : (
                                    // 개발자 사용자인 경우
                                    <button 
                                        className={`btn-apply ${jobPosting.isApplied ? 'btn-applied' : ''}`}
                                        onClick={handleApply}
                                        disabled={isApplying || jobPosting.isApplied}
                                    >
                                        {isApplying ? '지원 중...' : jobPosting.isApplied ? '지원 완료' : '지원하기'}
                                    </button>
                                )
                            ) : (
                                <button className="btn-apply" onClick={() => alert('로그인 후 이용해주세요.')}>
                                    지원하기
                                </button>
                            )}
                        </div>
                    </section>

                    {/* 공고 내용 */}
                    <section className="job-content">
                        {/* 기술스택 */}
                        <h2 className="section-title">기술스택</h2>
                        <div className="section-content">
                            {jobPosting.selectedTechStackNames ? (
                                <div className="tech-tags">
                                    {renderTechStackTags(jobPosting.selectedTechStackNames)}
                                </div>
                            ) : (
                                <div className="empty-content">기술스택 정보가 없습니다.</div>
                            )}
                        </div>

                        {/* 선호 개발자 성향 */}
                        <h2 className="section-title">
                            선호 개발자 성향
                            <button className="mbti-info-button" onClick={showMbtiInfo}>
                                ?
                            </button>
                        </h2>
                        <div className="section-content">
                            {jobPosting.preferredDeveloperTypes ? (
                                <div className="dev-type-tags">
                                    {renderDeveloperTypeTags(jobPosting.preferredDeveloperTypes)}
                                </div>
                            ) : (
                                <div className="empty-content">선호 성향 정보가 없습니다.</div>
                            )}
                        </div>

                        {/* 기본 정보 */}
                        <h2 className="section-title">기본 정보</h2>
                        <div className="section-content">
                            <div className="info-tags">
                                <div className="info-tag-item">
                                    <span className="info-tag-label">근무 지역</span>
                                    <span className="info-tag-value">{jobPosting.location}</span>
                                </div>
                                <div className="info-tag-item">
                                    <span className="info-tag-label">근무 형태</span>
                                    <span className="info-tag-value">{getWorkTypeText(jobPosting.workType)}</span>
                                </div>
                                <div className="info-tag-item">
                                    <span className="info-tag-label">경력 요구사항</span>
                                    <span className="info-tag-value">{getExperienceLevelText(jobPosting.experienceLevel)}</span>
                                </div>
                                <div className="info-tag-item">
                                    <span className="info-tag-label">급여 범위</span>
                                    <span className="info-tag-value">{getSalaryRangeText(jobPosting.salaryRange)}</span>
                                </div>
                                <div className="info-tag-item">
                                    <span className="info-tag-label">등록일</span>
                                    <span className="info-tag-value">{formatDate(jobPosting.postedAt)}</span>
                                </div>
                                <div className="info-tag-item">
                                    <span className="info-tag-label">마감일</span>
                                    <span className="info-tag-value">{formatDate(jobPosting.expiresAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 상세 설명 */}
                        <h2 className="section-title">상세 설명</h2>
                        <div className="section-content">
                            {jobPosting.description ? (
                                <div className="description-content">
                                    {jobPosting.description.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-content">상세 설명이 없습니다.</div>
                            )}
                        </div>

                        {/* 우대사항 */}
                        {jobPosting.preferred && (
                            <>
                                <h2 className="section-title">우대사항</h2>
                                <div className="section-content">
                                    <div className="description-content">
                                        {jobPosting.preferred.split('\n').map((line, index) => (
                                            <p key={index}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 복리후생 */}
                        {jobPosting.benefits && (
                            <>
                                <h2 className="section-title">복리후생</h2>
                                <div className="section-content">
                                    <div className="description-content">
                                        {jobPosting.benefits.split('\n').map((line, index) => (
                                            <p key={index}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default PostDetail;
