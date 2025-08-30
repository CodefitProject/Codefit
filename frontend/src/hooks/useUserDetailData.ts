import { useState, useEffect } from 'react';

// UserDetail.xml의 데이터 모델을 기반으로 타입 정의
export interface UserDetailInfo {
    accountId: number;
    name: string;
    career: string;
    preferredLocations: string;
    currentPosition: string;
    yearSalary: number;
    email: string;
    bio: string;
    isMbtiChecked: number; // 0: 미완료, 1: 완료
    isCodeChecked: number; // 0: 미완료, 1: 완료
    mbtiType?: string; // MBTI 타입 코드 (예: 'BITF')
}

export const useUserDetailData = () => {
    const [userInfo, setUserInfo] = useState<UserDetailInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 실제 애플리케이션에서는 여기서 API를 호출합니다.
        // 지금은 목업 데이터를 사용합니다.
        const fetchUserData = () => {
            const mockUserInfo: UserDetailInfo = {
                accountId: 1,
                name: '김코드',
                career: '주니어 (1~3년)',
                preferredLocations: '서울, 경기',
                currentPosition: '프론트엔드 개발자',
                yearSalary: 5000,
                email: 'codekim@example.com',
                bio: 'React와 TypeScript를 사용하여 사용자 친화적인 웹 서비스를 만드는 것을 좋아합니다. 새로운 기술을 배우고 적용하는 것에 즐거움을 느낍니다.',
                isMbtiChecked: 1, 
                isCodeChecked: 1,
                mbtiType: 'BITF',
            };
            setUserInfo(mockUserInfo);
            setIsLoading(false);
        };

        // 0.5초 후 데이터 로딩 시뮬레이션
        setTimeout(fetchUserData, 500);
    }, []);

    return { userInfo, isLoading };
};
