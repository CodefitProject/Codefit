import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UploadedFile {
  name: string;
  file: File;
}

interface CodeAnalysisCompleteResponse {
  analysisId: number;
  success: boolean;
  message: string;
}

export const useCodeAnalysis = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisCompleteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeCode = async (files: UploadedFile[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // 파일들을 FormData에 추가
      files.forEach((fileItem, index) => {
        formData.append('files', fileItem.file);
      });

      // localStorage에서 accessToken 가져오기
      const accessToken = localStorage.getItem('accessToken');
      
      // API 호출
      const response = await fetch('/api/private/code_analysis', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          // FormData 사용 시 Content-Type을 설정하지 않으면 브라우저가 자동으로 설정
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 응답 데이터 검증
      if (!data.success && data.message) {
        throw new Error(data.message);
      }

      // 결과 설정
      setAnalysisResult(data);
      
      // 디버깅용 로그
      console.log('백엔드 응답 데이터:', data);
      
      // 분석 성공 시 결과 페이지로 이동
      if (data.success && data.analysisId) {
        console.log('페이지 이동 실행:', `/analysis-result/${data.analysisId}`);
        navigate(`/analysis-result/${data.analysisId}`);
      } else {
        console.log('페이지 이동 조건 실패:', { success: data.success, analysisId: data.analysisId });
      }
      
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    analyzeCode,
    isLoading,
    analysisResult,
    error,
    reset
  };
};