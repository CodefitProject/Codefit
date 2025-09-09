const API_BASE_URL = "/api";

export interface ApplicantDto {
  name: string;
  email: string;
  career: string;
  currentPosition: string;
  applicationStatus: string;
  typeCode: string;
  stacks: string[];
  resumeFileName: string;
  applicationId: string;
}

export interface ApplicantResponse {
  result: ApplicantDto[];
  currentPage: number;
  totalPage: number;
}

export interface JobApplicationsRequestDto {
  applicationIds: number[];
  applicationStatus: string;
  sendEmail: boolean;
  emailContent: string;
}

export interface ScoutRequestDto {
  page: number;
  pageSize: number;
  scoutFilter: "unscouted" | "scouted";
  mbtiFilters: string[];
  mbtiCount: number;
  techStackFilter: string[];
}

export interface ScoutDto {
  applicationId: string;
  name: string;
  email: string;
  career: string;
  currentPosition: string;
  resumeFileName?: string;
  typeCode?: string;
  stacks?: string[];
  userId?: string;
}

export interface ScoutResponse {
  result: ScoutDto[];
  currentPage: number;
  totalPage: number;
}

export interface TechStackDto {
  techStackId: number;
  techStackName: string;
}

export interface RecommendScoutDto {
  userIdList: number[];
  sendEmail: boolean;
  emailList: string[];
  emailContent: string;
}

class ApplicationService {
  /**
   * 특정 공고에 지원한 사용자 목록 조회
   */
  async getApplicantsByJobPostingId(
    jobPostingId: number,
    page: number = 1,
    pageSize: number = 10,
    status: string = ""
  ): Promise<ApplicantResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/application/${jobPostingId}?page=${page}&status=${status}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApplicantResponse = await response.json();
      return data;
    } catch (error) {
      console.error("지원자 목록 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 지원자 상태 일괄 수정
   */
  async modifyApplicationStatus(
    jobPostingId: number,
    requestDto: JobApplicationsRequestDto
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/application/${jobPostingId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestDto),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("지원자 상태 수정 실패:", error);
      throw error;
    }
  }

  /**
   * 특정 공고에 대한 스카웃 대상자 조회
   */
  async getScoutsByJobPostingId(
    jobPostingId: number,
    requestDto: ScoutRequestDto
  ): Promise<ScoutResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/scout/${jobPostingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDto),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ScoutResponse = await response.json();
      return data;
    } catch (error) {
      console.error("스카웃 대상자 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 기술 스택 목록 조회
   */
  async getTechStacks(): Promise<TechStackDto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/tech-stacks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TechStackDto[] = await response.json();
      return data;
    } catch (error) {
      console.error("기술 스택 목록 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 스카웃 추천 요청
   */
  async recommendScout(
    jobPostingId: number,
    requestDto: RecommendScoutDto
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/scout/${jobPostingId}/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestDto),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("스카웃 추천 실패:", error);
      throw error;
    }
  }
}

export default new ApplicationService();
