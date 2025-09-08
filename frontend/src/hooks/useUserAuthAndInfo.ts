import { useState, useEffect } from 'react';
import { useAuth } from './useAuth.ts'; // 기존에 만든 useAuth 훅을 재사용합니다.
import { getUserProfile } from '../services/userService.ts';

// MainPage에서 사용하던 UserInfo 타입을 확장합니다.
interface ExtendedUserInfo {
    baseUserId: string;
    name: string;
    isMbtiChecked?: boolean;
    isCodeChecked?: boolean;
    matchingProposalCount?: number;
    applicationStatusCount?: number;
}

export const useUserAuthAndInfo = () => {
    const { userInfo: authInfo, isLoggedIn } = useAuth();
    const [userInfo, setUserInfo] = useState<ExtendedUserInfo | null>(null);
    const [profileCompletion, setProfileCompletion] = useState<number>(0);

    useEffect(() => {
        if (isLoggedIn && authInfo) {
            // 로그인 상태일 때 추가 정보를 가져오는 로직 (현재는 Mock 데이터 사용)
            const loadUserMatchingInfo = async (baseUserId: string) => {
                try {
                    const userDetail = await getUserProfile();

                    const extendedInfo: ExtendedUserInfo = {
                        baseUserId: baseUserId,
                        name: authInfo.name || '',
                        isMbtiChecked: userDetail.isMbtiChecked,
                        isCodeChecked: userDetail.isCodeChecked,
                        matchingProposalCount: userDetail.matchingProposalCount,
                        applicationStatusCount: userDetail.applicationStatusCount,
                    };
                    
                    setUserInfo(extendedInfo);

                    // 프로필 완성도 계산
                    let completeCount = 0;
                    if (extendedInfo.isMbtiChecked) completeCount++;
                    if (extendedInfo.isCodeChecked) completeCount++;
                    const totalTasks = 2;
                    const completionPercentage = Math.round((completeCount / totalTasks) * 100);
                    setProfileCompletion(completionPercentage);

                } catch (error) {
                    console.error('매칭 정보 로드 실패:', error);
                }
            };

            if (authInfo.baseUserId) {
                loadUserMatchingInfo(authInfo.baseUserId);
            }

        } else {
            // 비로그인 상태
            setUserInfo(null);
            setProfileCompletion(0);
        }
    }, [isLoggedIn, authInfo]);

    return { userInfo, isLoggedIn, profileCompletion };
};
