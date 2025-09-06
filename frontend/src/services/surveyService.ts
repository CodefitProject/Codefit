// SurveyService - 설문 관련 API 서비스
// WebSquare XML의 submission 기능을 React fetch API로 대체

import AuthService from './authService.tsx';

const API_BASE_URL = '/api';

// 설문 응답 데이터 타입
export interface SurveyAnswer {
    questionId: number;
    answerValue: number;
}

// 설문 질문 데이터 타입
export interface SurveyQuestion {
    questionId: number;
    questionText: string;
    axis: string;
}

// 설문 질문 그룹 타입
export interface SurveyQuestionsData {
    [axis: string]: SurveyQuestion[];
}

// 설문 제출 요청 타입
export interface SurveySubmitRequest {
    userId: string;
    typeId: number;
    answers: SurveyAnswer[];
}

// 분석 결과 타입
export interface AnalysisResult {
    typeId: number;
    typeCode: string;
    typeName: string;
    typeDescription: string;
    scores: {
        [axis: string]: number;
    };
    codeAnalysisComment?: string;
    codeAnalysisDetail?: string;
    axisContributions?: string;
    answerPattern?: string;
    keyInsights?: string;
}

class SurveyService {
    /**
     * 설문 질문 조회 (SV0001Questions.pwkjson)
     * @returns {Promise<SurveyQuestionsData>} 설문 질문 데이터
     */
    async getQuestions(): Promise<SurveyQuestionsData> {
        try {
            // Public API 사용 (인증 없이 접근 가능)
            const response = await fetch(`${API_BASE_URL}/public/survey/questions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.questions) {
                return data.questions;
            } else {
                throw new Error('설문 질문 데이터가 없습니다.');
            }
        } catch (error) {
            console.error('설문 질문 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 설문 응답 제출 및 분석 (SV0001Submit.pwkjson)
     * @param {SurveySubmitRequest} submitData - 설문 제출 데이터
     * @returns {Promise<AnalysisResult>} 분석 결과 데이터
     */
    async submitSurvey(submitData: SurveySubmitRequest): Promise<AnalysisResult> {
        try {
            const token = AuthService.getToken();
            const headers: { [key: string]: string } = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE_URL}/survey/submit`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.typeCode) {
                return data;
            } else {
                throw new Error('분석 결과 데이터가 없습니다.');
            }
        } catch (error) {
            console.error('설문 분석 실패:', error);
            throw error;
        }
    }

    /**
     * MBTI 타입 정의 매핑
     */
    static getTypeDefinitions() {
        return {
            'AITF': { name: '혁신적 팀 아키텍트', desc: '새로운 기술로 팀과 함께 혁신적인 기능을 설계하는 개발자' },
            'AITD': { name: '미래지향 팀 디버거', desc: '새로운 기술로 팀과 함께 안정적인 시스템을 구축하는 개발자' },
            'AISF': { name: '창의적 솔로 아키텍트', desc: '혁신적 설계를 통해 독창적인 기능을 개발하는 개발자' },
            'AISD': { name: '혁신적 설계 전문가', desc: '새로운 기술로 안정적이고 혁신적인 설계를 하는 개발자' },
            'ARTF': { name: '구조적 팀 빌더', desc: '검증된 기술로 팀과 함께 견고한 기능을 구축하는 개발자' },
            'ARTD': { name: '완벽주의 팀 디버거', desc: '체계적 접근으로 팀과 함께 완벽한 시스템을 만드는 개발자' },
            'ARSF': { name: '균형잡힌 솔로 아키텍트', desc: '체계적 설계로 개인의 강점을 발휘하는 개발자' },
            'ARSD': { name: '체계적 리팩터 마스터', desc: '기존 시스템을 체계적으로 개선하는 개발자' },
            'BITF': { name: '혁신적 팀 크리에이터', desc: '새로운 기술로 팀과 함께 빠르게 기능을 구현하는 개발자' },
            'BITD': { name: '실험적 팀 문제 해결사', desc: '새로운 방법으로 팀과 함께 문제를 해결하는 개발자' },
            'BISF': { name: '창의적 스피드 러너', desc: '혁신적 방법으로 빠르게 기능을 구현하는 개발자' },
            'BISD': { name: '혁신적 솔로 디버거', desc: '새로운 접근법으로 독립적으로 문제를 해결하는 개발자' },
            'BRTF': { name: '빠른 팀 기능 개발자', desc: '검증된 방법으로 팀과 함께 실용적인 기능을 개발하는 개발자' },
            'BRTD': { name: '신뢰성 있는 팀 디버거', desc: '안정적 방법으로 팀과 함께 문제를 해결하는 개발자' },
            'BRSF': { name: '민첩한 기능 빌더', desc: '실용적 접근으로 빠르게 기능을 구현하는 개발자' },
            'BRSD': { name: '실용적 안정성 추구자', desc: '검증된 방법으로 안정적인 솔루션을 만드는 개발자' }
        };
    }

    /**
     * 축별 표시 이름 가져오기
     */
    static getAxisDisplayName(axis: string): string {
        const names: { [key: string]: string } = {
            'B/A': 'Builder vs Architect',
            'R/I': 'Innovate vs Refactor', 
            'S/T': 'Solo vs Team',
            'D/F': 'Debug vs Feature'
        };
        return names[axis] || axis;
    }

    /**
     * 유형 코드에서 실제 성향 추출
     */
    static getActualTypes(typeCode: string) {
        if (!typeCode || typeCode.length < 4) {
            return {
                style: 'Builder',
                tech: 'Innovator',
                collab: 'Solo', 
                work: 'Debug'
            };
        }

        return {
            style: typeCode[0] === 'A' ? 'Architect' : 'Builder',
            tech: typeCode[1] === 'R' ? 'Refactor' : 'Innovator',
            collab: typeCode[2] === 'T' ? 'Team' : 'Solo',
            work: typeCode[3] === 'F' ? 'Feature' : 'Debug'
        };
    }

    /**
     * 에러 메시지 처리
     */
    private getErrorMessage(response: any): string {
        if (response?.elHeader?.resMessage) {
            return response.elHeader.resMessage;
        }
        
        return '서버 응답을 받을 수 없습니다.';
    }

    /**
     * 에러 코드 추출
     */
    private getErrorCode(response: any): string {
        if (response?.elHeader) {
            return response.elHeader.resCode || 'UNKNOWN';
        }
        
        return 'NO_RESPONSE';
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const surveyService = new SurveyService();
export default surveyService;
export { SurveyService };
