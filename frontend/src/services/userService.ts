
import AuthService from './authService.tsx';
import { UserDetailInfo } from '../hooks/useUserDetailData.ts';

const API_URL = '/api/user'; // 기본 API URL

// 사용자 프로필 정보 가져오기
export const getUserProfile = async (): Promise<UserDetailInfo> => {
    const token = AuthService.getToken();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const userInfo = AuthService.getUserInfo();
    if (!userInfo || !userInfo.accountId) {
        throw new Error('Unable to get user information');
    }

    const response = await fetch(`${API_URL}/detail/${userInfo.accountId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.error('API Error Response:', response);
        let errorData;
        try {
            errorData = await response.json();
            console.error('API Error Data:', errorData);
        } catch (e) {
            console.error('Failed to parse error response as JSON.');
            const textError = await response.text();
            console.error('API Error Text:', textError);
            errorData = { message: textError || 'Failed to fetch user profile' };
        }
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
};
