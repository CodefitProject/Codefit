import React, { useState, useEffect } from 'react';
import './CompanyDashboard.css';
import Header from '../../components/Header/Header.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import AuthService from '../../services/authService.tsx';
import postService from '../../services/postService';
import { useNavigate } from 'react-router-dom'; // Added import

interface JobPosting {
  jobPostingId: string;
  companyId: string;
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: string;
  salaryRange: string;
  location: string;
  workType: string;
  preferredDeveloperTypes: string;
  expiresAt: string;
  postedAt: string;
  status: string;
}

interface PostVo {
  pageIndex: number;
  pageSize: number;
  companyId: string;
}

interface Statistics {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
}

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate(); // Added hook
  const [postVo, setPostVo] = useState<PostVo>({
    pageIndex: 1,
    pageSize: 9,
    companyId: ''
  });
  
  const [postList, setPostList] = useState<JobPosting[]>([]);
  const [filteredPostList, setFilteredPostList] = useState<JobPosting[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = () => {
    try {
      const userInfo = AuthService.getUserInfo();
      const isLoggedIn = AuthService.isLoggedIn();

      // 로그인하지 않은 경우 메인페이지로 리다이렉트
      if (!isLoggedIn || !userInfo) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/';
        return;
      }

      // USER 권한인 경우 메인페이지로 리다이렉트
      if (userInfo.role !== 'COMPANY') {
        alert('기업 회원만 접근 가능한 페이지입니다.');
        window.location.href = '/';
        return;
      }

      // 권한 체크 통과 시 대시보드 초기화
      initializeDashboard();
    } catch (error) {
      console.error('Access check error:', error);
      window.location.href = '/';
    }
  };

  const initializeDashboard = () => {
    // 사용자 정보에서 companyId 가져오기
    const userInfo = AuthService.getUserInfo();
    const companyId = userInfo?.companyId;
    
    if (!companyId) {
      alert('회사 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      window.location.href = '/';
      return;
    }
    
    setPostVo(prev => ({ ...prev, companyId }));
    loadPostList(companyId);
  };

  const loadPostList = async (companyId: string) => {
    setLoading(true);
    try {
      // postService를 사용하여 전체 공고 조회
      const requestData = {
        pageIndex: postVo.pageIndex - 1, // Spring Data JPA는 0부터 시작
        pageSize: postVo.pageSize
      };

      const data = await postService.getPostList(requestData);
      console.log('기업 대시보드 공고 응답:', data);
      
      const allPosts = data.jobPostings || [];
      
      // 현재 회사의 공고만 필터링
      const companyPosts = allPosts.filter((post: any) => 
        post.companyId === parseInt(companyId) || post.companyId === companyId
      );
      
      setPostList(companyPosts);
        
        calculateStatistics(companyPosts);
        setFilteredPostList(companyPosts);
    } catch (error) {
      console.error("API 호출 오류:", error);
      alert("공고 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (posts: JobPosting[]) => {
    const totalJobs = posts.length;
    let activeJobs = 0;
    let closedJobs = 0;
    const currentDate = new Date();

    posts.forEach(post => {
      const expirationDate = post.expiresAt ? new Date(post.expiresAt) : null;
      const isExpired = expirationDate && expirationDate < currentDate;

      if (isExpired) {
        closedJobs++;
      } else {
        activeJobs++;
      }
    });

    setStatistics({ totalJobs, activeJobs, closedJobs });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR');
    } catch (e) {
      return dateStr;
    }
  };

  const handlePostCardClick = (post: JobPosting) => {
    window.location.href = `/post/detail/${post.jobPostingId}`;
  };

  const handleNewJob = () => {
    window.location.href = '/company/posts/create';
  };

  const handleAllPosts = () => {
    navigate('/post'); // Changed navigation
  };

  const handleCompanyUpdate = () => {
    window.location.href = '/company/profile';
  };

  const handleRefresh = () => {
    // 현재 회사 ID로 새로고침
    const userInfo = AuthService.getUserInfo();
    const companyId = userInfo?.companyId;
    
    if (!companyId) {
      alert('회사 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      window.location.href = '/';
      return;
    }
    
    loadPostList(companyId);
  };

  const handlePageChange = (pageIndex: number) => {
    setPostVo(prev => ({ ...prev, pageIndex }));
  };

  const renderPostCards = () => {
    const startIndex = (postVo.pageIndex - 1) * postVo.pageSize;
    const endIndex = Math.min(startIndex + postVo.pageSize, filteredPostList.length);
    const currentPagePosts = filteredPostList.slice(startIndex, endIndex);

    return currentPagePosts.map((post, index) => (
      <div 
        key={post.jobPostingId} 
        className="post_card"
        onClick={() => handlePostCardClick(post)}
      >
        <div className="post_header">
          <h3 className="post_title">{post.title}</h3>
          <span className="post_status">활성</span>
        </div>
        <p className="post_description">
          {post.description.length > 80 
            ? post.description.substring(0, 80) + "..."
            : post.description
          }
        </p>
        <div className="post_details">
          <div className="post_detail_item">
            <span className="post_detail_icon">📍</span>
            <span>{post.location}</span>
          </div>
          <div className="post_detail_item">
            <span className="post_detail_icon">🏢</span>
            <span>{post.workType}</span>
          </div>
          <div className="post_detail_item">
            <span className="post_detail_icon">💼</span>
            <span>{post.experienceLevel}</span>
          </div>
          <div className="post_detail_item">
            <span className="post_detail_icon">💰</span>
            <span>{post.salaryRange}</span>
          </div>
        </div>
        <div className="post_footer">
          <div className="post_date">
            <span>📅</span>
            {formatDate(post.postedAt)}
          </div>
          <div className="post_id">ID: {post.jobPostingId}</div>
        </div>
      </div>
    ));
  };

  const totalPages = Math.ceil(filteredPostList.length / postVo.pageSize);

  return (
    <>
      <Header />
      <div className="dashboard_container">
        <div className="dashboard_content">
        <div className="dashboard_header fade-in-up">
          <h1 className="dashboard_title">채용관리 대시보드</h1>
          <p className="dashboard_subtitle">우리 회사의 공고를 관리하고 우수한 인재를 찾아보세요</p>
        </div>

        <div className="stats_grid">
          <div className="stat_card blue fade-in-up delay-100" onClick={() => document.querySelector('.posts_section')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="stat_icon">
              📊
            </div>
            <div className="stat_value">{statistics.totalJobs}</div>
            <div className="stat_label">총 공고 수</div>
          </div>

          <div className="stat_card green fade-in-up delay-200" onClick={() => document.querySelector('.posts_section')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="stat_icon">
              ✅
            </div>
            <div className="stat_value">{statistics.activeJobs}</div>
            <div className="stat_label">활성 공고</div>
          </div>

          <div className="stat_card orange fade-in-up delay-300" onClick={() => document.querySelector('.posts_section')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="stat_icon">
              ❌
            </div>
            <div className="stat_value">{statistics.closedJobs}</div>
            <div className="stat_label">마감된 공고</div>
          </div>
        </div>

        <div className="action_grid">
          <div className="action_card fade-in-up delay-100">
            <div className="action_header">
              <div className="action_icon">
                ➕
              </div>
              <h3 className="action_title">새로운 공고 작성</h3>
            </div>
            <p className="action_description">새로운 채용공고를 작성하여 우수한 인재를 찾아보세요.</p>
            <button className="btn_secondary" onClick={handleNewJob}>
              공고 작성하기
            </button>
          </div>

          <div className="action_card fade-in-up delay-200">
            <div className="action_header">
              <div className="action_icon">
                🔍
              </div>
              <h3 className="action_title">전체 공고 보기</h3>
            </div>
            <p className="action_description">시장의 다른 공고들을 확인하고 경쟁력을 분석해보세요.</p>
            <button className="btn_secondary" onClick={handleAllPosts}>
              전체 공고 보기
            </button>
          </div>

          <div className="action_card fade-in-up delay-300">
            <div className="action_header">
              <div className="action_icon">
                ⚙️
              </div>
              <h3 className="action_title">기업정보 관리</h3>
            </div>
            <p className="action_description">회사 정보와 프로필을 최신 상태로 유지하세요.</p>
            <button className="btn_secondary" onClick={handleCompanyUpdate}>
              정보 수정
            </button>
          </div>
        </div>
      </div>

      <div className="posts_section fade-in-up">
        <div className="section_header">
          <h2 className="section_title">현재 진행 중인 채용공고</h2>
        </div>

        <div className="posts_container">
          <div className="posts_header_controls">
            <div className="record_count">
              <span>활성 공고</span>
              <span className="record_number">{filteredPostList.length}</span>
              <span>개 (마감된 공고 제외)</span>
            </div>
            <div className="posts_actions">
              <button className="btn_refresh" onClick={handleRefresh}>
                새로고침
              </button>
            </div>
          </div>

          <div className="posts_grid">
            {loading ? (
              <div>로딩 중...</div>
            ) : filteredPostList.length > 0 ? (
              renderPostCards()
            ) : (
              <div className="no_posts">
                <div className="no_posts_icon">📭</div>
                <div className="no_posts_title">등록된 공고가 없습니다</div>
                <div className="no_posts_desc">새로운 채용공고를 등록하여 우수한 인재를 찾아보세요.</div>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ textAlign: 'center', padding: '25px 0' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page_button ${page === postVo.pageIndex ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyDashboard;