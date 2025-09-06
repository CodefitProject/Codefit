import { useState, useEffect } from 'react';

export interface AnalysisResult {
  analysisId: number;
  userId: number;
  typeCode: string;
  typeName: string;
  typeDescription: string;
  developmentStyleScore: number;
  developerPreferenceScore: number;
  confidenceScore: number;
  language: string;
  reasoning: string;
  strengths: string;
  suggestions: string;
  codePatterns: string;
  comment: string;
  createdAt: string;
  success: boolean;
  message: string;
}

export interface DeveloperTypeInfo {
  title: string;
  description: string;
  characteristics: string[];
}

const developerTypes: Record<string, DeveloperTypeInfo> = {
  "ARTF": { 
    title: "설계의 마에스트로", 
    description: "완벽한 아키텍처를 바탕으로 팀과 함께 레거시 시스템을 혁신적인 기능으로 탈바꿈시키는 전략가입니다. 코드 리뷰에서는 구조적 개선점을 날카롭게 지적하지만, 동시에 팀원들의 창의적 아이디어를 하나로 엮어내는 마법을 부립니다.", 
    characteristics: ["시스템 전체를 조망하는 통찰력", "레거시 코드 현대화 전문가", "팀 아키텍처 리딩과 멘토링", "기능 설계와 구현의 완벽한 조화"] 
  },
  "ARTD": { 
    title: "완벽주의 코드 닥터", 
    description: "체계적인 접근으로 기존 코드의 숨겨진 문제점을 찾아내고, 팀과의 협업을 통해 근본적인 해결책을 제시합니다. 버그 리포트를 받으면 단순한 임시방편이 아닌, 시스템 전체의 안정성을 높이는 완전한 치료법을 찾아냅니다.", 
    characteristics: ["근본 원인 분석의 달인", "코드 품질 가디언", "팀 기반 디버깅 프로세스 구축", "예방적 버그 헌팅 시스템"] 
  },
  "ARSF": { 
    title: "고독한 설계 장인", 
    description: "조용한 공간에서 완벽한 설계 문서와 함께 기존 코드를 예술작품으로 승화시키는 장인입니다. 혼자만의 시간 속에서 새로운 기능의 청사진을 그리고, 한 줄 한 줄 정성스럽게 리팩토링하여 아름다운 코드를 만들어냅니다.", 
    characteristics: ["완벽한 아키텍처 설계", "심미적 코드 리팩토링", "독립적 창작 프로세스", "기능과 구조의 우아한 통합"] 
  },
  "ARSD": { 
    title: "침묵의 버그 헌터", 
    description: "조용히 홀로 앉아 복잡한 시스템의 미로 같은 코드를 헤쳐나가며, 숨어있는 버그들을 하나씩 찾아내는 탐정입니다. 완벽한 설계 원칙에 따라 체계적으로 문제를 추적하고, 조용하지만 확실한 해결책을 제시합니다.", 
    characteristics: ["체계적 버그 추적 시스템", "독립적 문제 해결 능력", "심층 코드 분석 전문가", "조용하지만 확실한 성과"] 
  },
  "AITF": { 
    title: "혁신적 팀 빌더", 
    description: "최신 기술 트렌드를 팀에 도입하며, 기존의 틀을 깨뜨리는 혁신적인 기능을 함께 만들어나가는 미래 지향적 리더입니다. 새로운 프레임워크나 도구를 두려워하지 않고, 팀원들과 함께 실험하며 차세대 솔루션을 창조합니다.", 
    characteristics: ["신기술 도입 및 전파", "혁신적 기능 아키텍처 설계", "팀 기반 실험과 학습 문화", "미래 지향적 기술 전략"] 
  },
  "AITD": { 
    title: "차세대 문제 해결사", 
    description: "최신 디버깅 도구와 혁신적인 접근 방식으로 팀과 함께 복잡한 문제들을 해결해나가는 기술 혁신가입니다. AI 도구나 새로운 모니터링 시스템을 활용하여 기존에는 찾기 어려웠던 문제들을 척척 해결해냅니다.", 
    characteristics: ["차세대 디버깅 툴 마스터", "혁신적 문제 해결 방법론", "팀 기반 기술 실험", "미래형 시스템 모니터링"] 
  },
  "AISF": { 
    title: "독창적 혁신가", 
    description: "조용한 연구실에서 최신 기술을 탐구하며, 아무도 시도하지 않은 창의적인 기능을 혼자서 묵묵히 개발해내는 기술 아티스트입니다. 새로운 알고리즘이나 패러다임을 연구하여 독창적인 솔루션을 창조하는 것이 삶의 보람입니다.", 
    characteristics: ["독창적 기술 연구", "혁신적 알고리즘 개발", "개인적 기술 실험실 운영", "미래 지향적 창작 활동"] 
  },
  "AISD": { 
    title: "미래지향 솔로 파이터", 
    description: "최신 기술과 도구를 무기로 삼아 혼자서 복잡한 버그들과 맞서 싸우는 기술 전사입니다. 기계학습 기반 디버깅이나 자동화된 테스팅 도구를 활용하여, 전통적인 방법으로는 해결하기 어려운 문제들을 척척 해결해냅니다.", 
    characteristics: ["AI 기반 버그 디텍션", "자동화된 문제 해결 시스템", "독립적 기술 도구 개발", "미래형 디버깅 워크플로우"] 
  },
  "BRTF": { 
    title: "실전 파이터", 
    description: "빠른 프로토타이핑과 실용적인 접근으로 팀과 함께 기존 시스템을 개선하며 즉시 사용 가능한 기능들을 만들어내는 실전형 개발자입니다. '일단 돌아가게 만들고 나서 개선하자'는 철학으로, 빠른 iteration을 통해 완성도를 높여갑니다.", 
    characteristics: ["빠른 프로토타이핑", "실용적 코드 개선", "팀 기반 빠른 개발", "즉시 배포 가능한 기능 구현"] 
  },
  "BRTD": { 
    title: "즉석 문제 해결사", 
    description: "빠른 판단력과 실용적인 접근으로 팀과 함께 현장에서 발생하는 문제들을 즉시 해결하는 트러블슈터입니다. 완벽한 해결책보다는 지금 당장 서비스를 살릴 수 있는 현실적인 방법을 찾아내어 위기를 모면시키는 전문가입니다.", 
    characteristics: ["긴급 상황 대응 전문가", "실용적 버그 픽스", "팀 기반 빠른 문제 해결", "현장 중심적 사고"] 
  },
  "BRSF": { 
    title: "실용주의 크리에이터", 
    description: "혼자서 빠르게 기존 코드를 개선하고 실용적인 새 기능을 척척 만들어내는 원맨 팩토리입니다. 복잡한 설계보다는 '지금 필요한 것'에 집중하여, 사용자가 바로 체감할 수 있는 개선사항들을 연달아 배포합니다.", 
    characteristics: ["빠른 개인 개발 사이클", "실용성 중심 기능 설계", "독립적 코드 개선", "사용자 중심적 사고"] 
  },
  "BRSD": { 
    title: "고속 버그 킬러", 
    description: "빠른 직감과 경험을 바탕으로 혼자서 버그들을 순식간에 해치우는 디버깅의 달인입니다. 복잡한 분석 도구보다는 예리한 관찰력과 풍부한 경험으로 문제의 핵심을 바로 찾아내어 신속하게 해결합니다.", 
    characteristics: ["직감적 버그 추적", "경험 기반 빠른 진단", "독립적 문제 해결", "실용적 수정 방법"] 
  },
  "BITF": { 
    title: "창의적 스피드 러너", 
    description: "최신 기술을 빠르게 습득하여 팀과 함께 혁신적인 기능을 신속하게 구현해내는 기술 스프린터입니다. 새로운 프레임워크나 라이브러리가 나오면 바로 적용해보며, 팀원들과 함께 빠른 실험을 통해 놀라운 결과물을 만들어냅니다.", 
    characteristics: ["신기술 빠른 도입", "혁신적 빠른 프로토타이핑", "팀 기반 기술 실험", "스피드 개발 문화 조성"] 
  },
  "BITD": { 
    title: "번개같은 해결사", 
    description: "최신 디버깅 도구와 기법을 활용하여 팀과 함께 복잡한 문제들을 번개처럼 빠르게 해결하는 기술 닌자입니다. 새로운 모니터링 툴이나 분석 기법을 바로 도입하여, 기존에는 며칠 걸렸던 문제들을 몇 시간 만에 해결해냅니다.", 
    characteristics: ["최신 디버깅 툴 활용", "빠른 기술 적응력", "팀 기반 신속 대응", "혁신적 문제 해결 속도"] 
  },
  "BISF": { 
    title: "창조적 솔로 러너", 
    description: "최신 기술을 혼자서 탐구하며 독창적이고 혁신적인 기능을 빠르게 구현해내는 기술 아티스트입니다. 새로운 기술 트렌드를 남들보다 빨리 캐치하여, 아무도 생각하지 못한 창의적인 솔루션을 혼자서 뚝딱 만들어냅니다.", 
    characteristics: ["독창적 기술 실험", "빠른 혁신 구현", "개인적 기술 연구", "창의적 솔루션 개발"] 
  },
  "BISD": { 
    title: "플래시 픽서", 
    description: "최신 기술과 도구를 무기로 삼아 혼자서 복잡한 버그들을 순식간에 해결해버리는 기술 닌자입니다. 자동화 스크립트나 AI 도구를 활용하여 전통적인 디버깅으로는 해결하기 어려운 문제들을 번개같이 처리합니다.", 
    characteristics: ["자동화된 버그 디텍션", "혁신적 디버깅 기법", "독립적 고속 문제 해결", "미래형 수정 도구 활용"] 
  }
};

export const useAnalysisResult = (analysisId: string | undefined) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysisResult = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // localStorage에서 accessToken 가져오기
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/private/code_analysis/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      setAnalysisResult(result);
      
    } catch (err) {
      console.error('분석 결과 조회 실패:', err);
      setError('분석 결과를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisResult(analysisId);
    }
  }, [analysisId]);

  return {
    analysisResult,
    isLoading,
    error,
    refetch: () => analysisId && fetchAnalysisResult(analysisId)
  };
};