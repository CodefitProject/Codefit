// 설문 관련 타입 정의

export interface UserInfo {
    baseUserId: string;
    name?: string;
    role: 'USER' | 'COMPANY';
    mbti?: string;
}

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

// 축별 정보 타입
export interface AxisInfo {
    name: string;
    desc: string;
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
    confidenceScore?: number;
}

// 축별 기여도 정보 타입
export interface AxisContribution {
    total: number;
    average: number;
    count: number;
}

// 축별 기여도 전체 타입
export interface AxisContributions {
    [axis: string]: AxisContribution;
}

// 코드 패턴 분석 타입
export interface CodePattern {
    pattern: string;
    description: string;
    evidence: string[];
    impact_score: number;
}

// 상세 분석 결과 타입
export interface DetailedAnalysis {
    reasoning: string;
    code_patterns: CodePattern[];
    strengths: string[];
    suggestions: string[];
}

// 전체 분석 결과 타입
export interface FullAnalysis {
    detailed_analysis: DetailedAnalysis;
}

// MBTI 타입 정의 타입
export interface MbtiTypeDefinition {
    name: string;
    desc: string;
}

// 축별 성향 분석 타입
export interface AxisAnalysis {
    axisName: string;
    tendency: string;
    description: string;
}

// 실제 성향 타입
export interface ActualTypes {
    style: string;
    tech: string;
    collab: string;
    work: string;
}

// 탭 전환 관련 타입
export type TabType = 'code' | 'survey';

// 설문 진행 상태 타입
export interface SurveyProgress {
    totalQuestions: number;
    answeredQuestions: number;
    progress: number;
}
