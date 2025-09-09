import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import Modal from '../Modal/Modal';
import Login from '../../pages/auth/Login';
import AuthService from '../../services/authService.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { userInfo, isLoggedIn, checkAuthStatus } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

    const handleLogin = () => {
        setShowLoginModal(true);
    };

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
        checkAuthStatus(); // 로그인 후 헤더 UI 업데이트
    };

    const handleLogout = () => {
        AuthService.logout();
        checkAuthStatus();
        // 로그아웃 후 화면 리렌더링을 위해 페이지 새로고침
        window.location.href = '/';
    };

    const handleLogoClick = () => {
        if (userInfo && userInfo.role === "COMPANY") {
            navigate('/company/dashboard');
        } else {
            // 비로그인 유저 또는 USER 권한: 메인 페이지로 이동
            navigate('/');
        }
    };

    const handleCodeAnalysis = () => {
        // if (!userInfo || !userInfo.baseUserId) {
        //     alert("로그인이 필요한 서비스입니다.");
        //     return;
        // }
        
        // if (userInfo.role === "COMPANY") {
        //     alert("코드 분석은 개인 사용자만 이용 가능합니다.");
        //     return;
        // }
        
        navigate("/codeanalysis");
    };

    const handlePersonalityAnalysis = () => {
        if (!userInfo) {
            alert("사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
        } else {
            navigate('/survey/mbti');
        }
    };

    const handleCompanyBrowse = () => {
        navigate('/post');
    };

    const handleEnterpriseService = () => {
        if (userInfo === null) {
            navigate('/company');
        } else if (userInfo.role === "USER") {
            navigate('/company');
        } else if (userInfo.role === "COMPANY") {
            alert("채용 대시보드로 이동합니다.");
            navigate('/company/dashboard');
        }
    };

    const handleUserDetailClick = () => {
        if (userInfo && userInfo.role === 'USER') {
            navigate('/user/detail');
        }
        // USER가 아닌 다른 역할은 아무 동작도 하지 않거나, 다른 페이지로 이동시킬 수 있습니다.
    };

    const showMenuForRole = (role: string | undefined) => {
        if (!role || role === "USER") {
            return true;
        }
        return false;
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <div className="nav-menu">
                        <img 
                            src="/images/logos/codefit_logo.png" 
                            alt="CodeFIT Logo"
                            style={{width: '150px', height: '50px', cursor: 'pointer'}}
                            className="logo"
                            onClick={handleLogoClick}
                        />
                        {showMenuForRole(userInfo?.role) && (
                            <>
                                <span 
                                    onClick={handleCodeAnalysis}
                                    className="nav-link" 
                                    style={{marginLeft: '20px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}
                                >
                                    코드분석
                                </span>
                                <Link 
                                    to="/survey/mbti"
                                    className="nav-link" 
                                    style={{fontSize: '16px', fontWeight: 'bold'}}
                                >
                                    성향분석
                                </Link>
                                <Link 
                                    to="/post"
                                    className="nav-link" 
                                    style={{fontSize: '16px', fontWeight: 'bold'}}
                                >
                                    기업 둘러보기
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="header-right">
                    {!isLoggedIn ? (
                        <button className="btn-login" onClick={handleLogin}>
                            로그인/회원가입
                        </button>
                    ) : (
                        <>
                            <span 
                                className="user-name-link"
                                onClick={handleUserDetailClick}
                                title="클릭하여 내 정보 보기"
                            >
                                {userInfo?.name}님
                            </span>
                            <button className="btn-login" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </>
                    )}
                    <button className="btn-enterprise" onClick={handleEnterpriseService}>
                        기업 서비스
                    </button>
                </div>
            </div>

            <Modal isOpen={showLoginModal} onClose={handleCloseLoginModal}>
                <Login onClose={handleCloseLoginModal} />
            </Modal>
        </header>
    );
};

export default Header;