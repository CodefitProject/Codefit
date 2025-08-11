import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <span className="footer-title">CodeFIT</span>
                <span className="footer-text">(주)코드핏 | 대표이사 김지훈 | 대표고객문의 support@weavetype.com</span>
                <span className="footer-text">서울특별시 강남구 테헤란로 123 위브타워 15층 | 전화번호: 02-123-4567</span>
                <span className="footer-text">© 2025 CodeFIT Inc. All Rights Reserved.</span>
            </div>
        </footer>
    );
};

export default Footer;