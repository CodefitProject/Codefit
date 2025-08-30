import React from 'react';
import { UserDetailInfo } from '../../hooks/useUserDetailData.ts';
import './ResultFrame.css';

interface ResultFrameProps {
    userInfo: UserDetailInfo;
}

const ResultFrame: React.FC<ResultFrameProps> = ({ userInfo }) => {
    // MBTI 타입 정의
    const getTypeDefinitions = () => {
        return {
            'AITF': { name: '혁신적 팀 아키텍트', desc: '새로운 기술로 팀과 함께 혁신적인 기능을 설계하는 개발자' },
            'AITD': { name: '미래지향 팀 디버거', desc: '새로운 기술로 팀과 함께 안정적인 시스템을 구축하는 개발자' },
            'AISF': { name: '창의적 솔로 아키텍트', desc: '혁신적 설계를 통해 독창적인 기능을 개발하는 개발자' },
            'AISD': { name: '혁신적 설계 전문가', desc: '새로운 기술로 안정적이고 혁신적인 설계를 하는 개발자' },
            'ARTF': { name: '구조적 팀 빌더', desc: '검증된 기술로 팀과 함께 견고한 기능을 구축하는 개발자' },
            'ARTD': { name: '완벽주의 팀 디버거', desc: '체계적 접근으로 팀과 함께 완벽한 시스템을 만드는 개발자' },
            'ARSF': { name: '균형잡힌 솔로 아키텍트', desc: '체계적 설계로 개인의 강점을 발휘하는 개발자' },
            'ARSD': { name: '체계적 리팩터 마스터', desc: '기존 시스템을 체계적으로 개선하는 개발자' },
            'BITF': { name: '혁신적 팀 크리에이터', desc: '새로운 기술로 팀과 함께 빠르게 기능을 구현하는 개발자' },
            'BITD': { name: '실험적 팀 문제 해결사', desc: '새로운 방법으로 팀과 함께 문제를 해결하는 개발자' },
            'BISF': { name: '창의적 스피드 러너', desc: '혁신적 방법으로 빠르게 기능을 구현하는 개발자' },
            'BISD': { name: '혁신적 솔로 디버거', desc: '새로운 접근법으로 독립적으로 문제를 해결하는 개발자' },
            'BRTF': { name: '빠른 팀 기능 개발자', desc: '검증된 방법으로 팀과 함께 실용적인 기능을 개발하는 개발자' },
            'BRTD': { name: '신뢰성 있는 팀 디버거', desc: '안정적 방법으로 팀과 함께 문제를 해결하는 개발자' },
            'BRSF': { name: '민첩한 기능 빌더', desc: '실용적 접근으로 빠르게 기능을 구현하는 개발자' },
            'BRSD': { name: '실용적 안정성 추구자', desc: '검증된 방법으로 안정적인 솔루션을 만드는 개발자' }
        };
    };

    const typeDefinitions = getTypeDefinitions();
    const typeCode = userInfo.mbtiType || 'BITF';
    const typeInfo = typeDefinitions[typeCode as keyof typeof typeDefinitions] || typeDefinitions['BITF'];
    const imagePath = `/images/mbti/png/${typeCode}.png`;

    return (
        <div className="result-frame-container">
            <div className="result-content">
                <h3 className="result-title">🎉 매칭 준비 완료!</h3>
                
                {/* MBTI 결과 카드 */}
                <div className="mbti-result-card">
                    <img 
                        src={imagePath} 
                        alt={`${typeCode} MBTI 결과`} 
                        className="mbti-result-image"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default/question.png';
                        }}
                    />
                    <div className="mbti-result-content">
                        <div className="mbti-type-code">{typeCode}</div>
                        <div className="mbti-type-name">{typeInfo.name}</div>
                        <div className="mbti-type-desc">{typeInfo.desc}</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResultFrame;