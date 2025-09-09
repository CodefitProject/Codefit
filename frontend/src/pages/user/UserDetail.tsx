import React from 'react';
import { Routes, Route, NavLink, Outlet } from 'react-router-dom';
import './UserDetail.css';
import Header from '../../components/Header/Header.tsx';
import UserProfile from './UserProfile.tsx';
import ApplicationHistory from './ApplicationHistory.tsx';
import UserMatchPage from './UserMatchPage.tsx';
import { useUserDetailData } from '../../hooks/useUserDetailData.ts';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner.tsx';

// XML의 데이터 모델을 기반으로 타입 정의
interface UserInfo {
    baseUserId: number;
    name: string;
    career: string;
    isMbtiChecked: number;
    isCodeChecked: number;
    // ... 기타 필요한 속성들
}

// 사이드바 메뉴 컴포넌트
const Sidebar: React.FC<{ userInfo: UserInfo | null }> = ({ userInfo }) => {
    const isProfileComplete = userInfo ? userInfo.isMbtiChecked === 1 && userInfo.isCodeChecked === 1 : true;

    return (
        <aside className="sidebar">
            <h2 className="menu-category-title">내 정보</h2>
            <nav>
                <ul className="sidebar-menu">
                    <li>
                        <NavLink 
                            to="/user/detail/profile" 
                            className={({ isActive }) => 
                                `menu-item ${isActive ? 'active' : ''} ${!isProfileComplete ? 'incomplete' : ''}`
                            }
                        >
                            프로필
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/user/detail/history" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                            지원현황
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/user/detail/matching" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                            매칭제안
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

// 메인 레이아웃 컴포넌트
const UserDetail: React.FC = () => {
    const { userInfo, isLoading, error } = useUserDetailData();

    return (
        <>
            <Header />
            {isLoading && <LoadingSpinner message="사용자 정보를 불러오는 중..." overlay={true} size="large" />}
            <div className="user-detail-page-container">
                <Sidebar userInfo={userInfo} />
                <main className="user-detail-main-area">
                    {error && <div>오류: {error}</div>}
                    {userInfo && <Outlet context={{ userInfo }} />} {/* 중첩된 라우트의 컴포넌트가 여기에 렌더링됩니다. */}
                </main>
            </div>
        </>
    );
};

// UserDetail 페이지의 중첩 라우트를 정의하는 컴포넌트
const UserDetailRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<UserDetail />}>
                <Route index element={<UserProfile />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="history" element={<ApplicationHistory />} />
                <Route path="matching" element={<UserMatchPage />} />
            </Route>
        </Routes>
    );
};

export default UserDetailRoutes;
