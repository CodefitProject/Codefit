import React, { useState, useEffect } from 'react';
import './Header.css';
import Modal from '../Modal/Modal';
import Login from '../../pages/auth/Login';

interface UserInfo {
    accountId: string;
    name: string;
    role: 'USER' | 'COMPANY';
}

const Header: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

    useEffect(() => {
        updateHeaderUI();
    }, []);

    const updateHeaderUI = () => {
        // setUserInfo(user);
        // setIsLoggedIn(user !== null);
    };

    const handleLogin = () => {
        setShowLoginModal(true);
    };

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
        updateHeaderUI(); // 로그인 후 헤더 UI 업데이트
    };

    const handleLogout = () => {
        // 쿠키 삭제
        document.cookie = "userInfo=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        updateHeaderUI();
        window.location.reload();
    };

    const handleLogoClick = () => {
        if (userInfo && userInfo.role === "COMPANY") {
            alert("기업 대시보드로 이동합니다.");
        } else {
            window.location.reload(); // 메인 페이지로 이동
        }
    };

    const handleCodeAnalysis = () => {
        if (!userInfo || !userInfo.accountId) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }
        
        if (userInfo.role === "COMPANY") {
            alert("죄송합니다. 코드 분석은 개인 사용자만 이용 가능합니다.");
            return;
        }
        
        alert("코드분석 페이지로 이동합니다.");
    };

    const handlePersonalityAnalysis = () => {
        if (!userInfo) {
            alert("사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
        } else {
            alert("성향분석 페이지로 이동합니다.");
        }
    };

    const handleCompanyBrowse = () => {
        alert("기업 둘러보기 페이지로 이동합니다.");
    };

    const handleEnterpriseService = () => {
        if (userInfo === null) {
            window.location.href = "/company";
        } else if (userInfo.role === "USER") {
            window.location.href = "/company";
        } else if (userInfo.role === "COMPANY") {
            alert("채용 대시보드로 이동합니다.");
        }
    };

    const handleUserDetailClick = () => {
        alert("사용자 상세 페이지로 이동합니다.");
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
                                <a 
                                    className="nav-link" 
                                    onClick={handleCodeAnalysis}
                                    style={{marginLeft: '20px', fontSize: '16px'}}
                                >
                                    코드분석
                                </a>
                                <a 
                                    className="nav-link" 
                                    onClick={handlePersonalityAnalysis}
                                    style={{fontSize: '16px'}}
                                >
                                    성향분석
                                </a>
                                <a 
                                    className="nav-link" 
                                    onClick={handleCompanyBrowse}
                                    style={{fontSize: '16px'}}
                                >
                                    기업 둘러보기
                                </a>
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