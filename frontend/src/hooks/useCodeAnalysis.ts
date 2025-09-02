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
        formData.append(`files`, fileItem.file);
        
        // 파일 타입에 따라 분류
        const fileName = fileItem.file.name.toLowerCase();
        if (fileName.includes('controller')) {
          formData.append('controllerFile', fileItem.file);
          formData.append('controllerFileName', fileItem.file.name);
        } else if (fileName.includes('service')) {
          formData.append('serviceFile', fileItem.file);
          formData.append('serviceFileName', fileItem.file.name);
        } else if (fileName.includes('repository') || fileName.includes('repo')) {
          formData.append('repositoryFile', fileItem.file);
          formData.append('repositoryFileName', fileItem.file.name);
        } else if (fileName.includes('model') || fileName.includes('entity')) {
          formData.append('modelFile', fileItem.file);
          formData.append('modelFileName', fileItem.file.name);
        }
      });

      // API 호출 (원본 XML의 엔드포인트 사용)
      const response = await fetch('/InsWebApp/CA0001Analyze.pwkjson', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 응답 데이터 검증
      if (data.elHeader && data.elHeader.resSuc === false) {
        throw new Error(data.elHeader.resMsg || '서버에서 오류가 발생했습니다.');
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