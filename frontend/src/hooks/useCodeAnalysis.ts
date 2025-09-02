import { useState } from 'react';

interface UploadedFile {
  name: string;
  file: File;
}

interface CodeAnalysisResult {
  typeCode: string;
  typeName: string;
  typeDesc: string;
  developmentStyleScore: number;
  developerPreferenceScore: number;
  confidenceScore: number;
  language: string;
}

export const useCodeAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);
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