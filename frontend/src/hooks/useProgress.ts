import { UserDetailInfo } from './useUserDetailData';

export const useProgress = (userInfo: UserDetailInfo | null) => {
    if (!userInfo) {
        return {
            isMbtiDone: false,
            isCodeDone: false,
            isAllComplete: false,
            progressPercentage: 0
        };
    }

    const isMbtiDone = userInfo.isMbtiChecked === 1;
    const isCodeDone = userInfo.isCodeChecked === 1;
    const isAllComplete = isMbtiDone && isCodeDone;
    
    const completedCount = (isMbtiDone ? 1 : 0) + (isCodeDone ? 1 : 0);
    const progressPercentage = (completedCount / 2) * 100;

    return {
        isMbtiDone,
        isCodeDone,
        isAllComplete,
        progressPercentage
    };
};