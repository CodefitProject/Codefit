import { useState, useEffect } from 'react';
import { useAuth } from './useAuth.ts'; // 기존에 만든 useAuth 훅을 재사용합니다.

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
                    // TODO: API를 통해 실제 사용자 매칭 정보를 가져와야 합니다.
                    const extendedInfo: ExtendedUserInfo = {
                        baseUserId: baseUserId,
                        name: authInfo.name || '',
                    };
                    
                    setUserInfo(extendedInfo);

                    // 프로필 완성도는 userInfo.isMbtiChecked와 userInfo.isCodeChecked를 기반으로 계산됩니다.
                    setProfileCompletion(0); // 우선 0으로 초기화

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
