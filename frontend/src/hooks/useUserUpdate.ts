import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

export interface UserUpdateData {
  baseUserId: number;
  email: string;
  name: string;
  career: string;
  preferredLocations: string;
  currentPosition: string;
  yearSalary: number;
  bio: string;
  testChecked: boolean;
  techStack: string;
  resume_file_name?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TechStack {
  techStackId: string;
  techStackName: string;
}

export interface Location {
  label: string;
  value: string;
}

const CAREER_OPTIONS = [
  { label: "신입", value: "신입" },
  { label: "1년 미만", value: "1년 미만" },
  { label: "1-3년", value: "1-3년" },
  { label: "3-5년", value: "3-5년" },
  { label: "5-10년", value: "5-10년" },
  { label: "10년 이상", value: "10년 이상" }
];

const POSITION_OPTIONS = [
  { label: "프론트엔드 개발자", value: "프론트엔드 개발자" },
  { label: "백엔드 개발자", value: "백엔드 개발자" },
  { label: "풀스택 개발자", value: "풀스택 개발자" },
  { label: "모바일 개발자", value: "모바일 개발자" },
  { label: "데이터 엔지니어", value: "데이터 엔지니어" },
  { label: "DevOps 엔지니어", value: "DevOps 엔지니어" },
  { label: "AI/ML 엔지니어", value: "AI/ML 엔지니어" },
  { label: "보안 엔지니어", value: "보안 엔지니어" }
];

const LOCATION_OPTIONS = [
  { label: "서울", value: "서울" },
  { label: "경기", value: "경기" },
  { label: "인천", value: "인천" },
  { label: "부산", value: "부산" },
  { label: "대구", value: "대구" },
  { label: "대전", value: "대전" },
  { label: "광주", value: "광주" },
  { label: "울산", value: "울산" },
  { label: "세종", value: "세종" },
  { label: "강원", value: "강원" },
  { label: "충북", value: "충북" },
  { label: "충남", value: "충남" },
  { label: "전북", value: "전북" },
  { label: "전남", value: "전남" },
  { label: "경북", value: "경북" },
  { label: "경남", value: "경남" },
  { label: "제주", value: "제주" },
  { label: "원격근무", value: "원격근무" }
];

const SALARY_OPTIONS = [
  { label: "3,000만원 이하", value: 3000 },
  { label: "3,000 ~ 3,300만원", value: 3300 },
  { label: "3,300 ~ 3,600만원", value: 3600 },
  { label: "3,600 ~ 4,000만원", value: 4000 },
  { label: "4,000 ~ 4,500만원", value: 4500 },
  { label: "4,500 ~ 5,000만원", value: 5000 },
  { label: "5,000 ~ 6,000만원", value: 6000 },
  { label: "6,000 ~ 7,000만원", value: 7000 },
  { label: "7,000 ~ 8,000만원", value: 8000 },
  { label: "8,000만원 이상", value: 8500 }
];

export const useUserUpdate = () => {
  const { userInfo: authUserInfo, getToken } = useAuth();
  const [userInfo, setUserInfo] = useState<UserUpdateData | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTechStacks, setSelectedTechStacks] = useState<TechStack[]>([]);
  const [techStackOptions, setTechStackOptions] = useState<TechStack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 조회
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!authUserInfo?.baseUserId) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const response = await fetch(`/InsWebApp/US0002UpdView.pwkjson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userInfoVo: { baseUserId: Number(authUserInfo.baseUserId!) }
        })
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      const userData = data.elData || data;
      
      setUserInfo(userData);
      
      // 선호 지역 초기화
      if (userData.preferredLocations) {
        setSelectedLocations(userData.preferredLocations.split(','));
      }

      // 기술 스택 초기화
      if (userData.techStack) {
        const techStackIds = userData.techStack.split(',');
        const selectedStacks = techStackIds.map((id: string) => {
          const stack = techStackOptions.find(option => option.techStackId === id.trim());
          return stack || { techStackId: id.trim(), techStackName: id.trim() };
        });
        setSelectedTechStacks(selectedStacks);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [techStackOptions]);

  // 기술 스택 옵션 조회
  const fetchTechStackOptions = useCallback(async () => {
    try {
      const response = await fetch('/InsWebApp/POS0002List.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('기술스택 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setTechStackOptions(data.techStackVoList || []);
    } catch (err) {
      console.error('기술스택 조회 오류:', err);
    }
  }, []);

  // 사용자 정보 수정
  const updateUserInfo = useCallback(async () => {
    if (!userInfo) return false;

    try {
      setIsLoading(true);
      setError(null);

      const updateData = {
        ...userInfo,
        preferredLocations: selectedLocations.join(','),
        techStack: selectedTechStacks.map(stack => stack.techStackId).join(',')
      };

      const response = await fetch('/InsWebApp/USUpdateUserInfo.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('사용자 정보 수정에 실패했습니다.');
      }

      const result = await response.json();
      if (result.result === 'success') {
        return true;
      } else {
        throw new Error(result.message || '저장에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userInfo, selectedLocations, selectedTechStacks]);

  // 비밀번호 변경
  const updatePassword = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('비밀번호를 입력해주세요.');
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('새 비밀번호가 일치하지 않습니다.');
      }

      const response = await fetch('/InsWebApp/USUpdatePassword.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        throw new Error('비밀번호 변경에 실패했습니다.');
      }

      const result = await response.json();
      if (result.result === 'success') {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        return true;
      } else {
        throw new Error(result.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [passwordData]);

  // 이력서 업로드
  const uploadResume = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!file.type.includes('pdf')) {
        throw new Error('PDF 파일만 업로드 가능합니다.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB를 초과할 수 없습니다.');
      }

      const formData = new FormData();
      formData.append('resumeFile', file);
      if (!authUserInfo?.baseUserId) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }
      
      formData.append('userId', authUserInfo.baseUserId);

      const response = await fetch('/InsWebApp/USUploadResume.pwkjson', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('이력서 업로드에 실패했습니다.');
      }

      const result = await response.json();
      if (result.result === 'success') {
        if (userInfo) {
          setUserInfo({
            ...userInfo,
            resume_file_name: result.fileName
          });
        }
        return true;
      } else {
        throw new Error(result.message || '이력서 업로드에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  // 이력서 삭제
  const deleteResume = useCallback(async () => {
    if (!userInfo?.resume_file_name || !authUserInfo?.baseUserId) return false;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/InsWebApp/USDeleteResume.pwkjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          baseUserId: Number(authUserInfo.baseUserId!)
        })
      });

      if (!response.ok) {
        throw new Error('이력서 삭제에 실패했습니다.');
      }

      const result = await response.json();
      if (result.result === 'success') {
        setUserInfo({
          ...userInfo,
          resume_file_name: ''
        });
        return true;
      } else {
        throw new Error(result.message || '이력서 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userInfo, authUserInfo]);

  // 지역 토글
  const toggleLocation = useCallback((location: string) => {
    setSelectedLocations(prev => {
      const index = prev.indexOf(location);
      if (index > -1) {
        return prev.filter(loc => loc !== location);
      } else {
        if (prev.length >= 5) {
          alert('최대 5개까지만 선택 가능합니다.');
          return prev;
        }
        return [...prev, location];
      }
    });
  }, []);

  // 기술 스택 추가
  const addTechStack = useCallback((techStack: TechStack) => {
    setSelectedTechStacks(prev => {
      const exists = prev.find(stack => stack.techStackId === techStack.techStackId);
      if (exists) {
        alert('이미 추가된 기술 스택입니다.');
        return prev;
      }
      return [...prev, techStack];
    });
  }, []);

  // 기술 스택 제거
  const removeTechStack = useCallback((techStackId: string) => {
    setSelectedTechStacks(prev => prev.filter(stack => stack.techStackId !== techStackId));
  }, []);

  // 초기화
  useEffect(() => {
    fetchTechStackOptions();
  }, [fetchTechStackOptions]);

  useEffect(() => {
    if (techStackOptions.length > 0 && authUserInfo) {
      fetchUserInfo();
    }
  }, [techStackOptions, fetchUserInfo, authUserInfo]);

  return {
    // 데이터
    userInfo,
    passwordData,
    selectedLocations,
    selectedTechStacks,
    techStackOptions,
    isLoading,
    error,
    
    // 옵션들
    careerOptions: CAREER_OPTIONS,
    positionOptions: POSITION_OPTIONS,
    locationOptions: LOCATION_OPTIONS,
    salaryOptions: SALARY_OPTIONS,

    // 액션들
    setUserInfo,
    setPasswordData,
    updateUserInfo,
    updatePassword,
    uploadResume,
    deleteResume,
    toggleLocation,
    addTechStack,
    removeTechStack,
    fetchUserInfo
  };
};