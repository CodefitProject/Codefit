import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/userService.ts';

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const data = await getUserProfile();
                setUserInfo(data);
                setError(null);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
                console.error("Failed to fetch user data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return { userInfo, isLoading, error };
};
