// PostService - 공고 관련 API 서비스
// WebSquare XML의 submission 기능을 React fetch API로 대체

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

class PostService {
    /**
     * 공고 목록 조회 (POS0001List.pwkjson)
     * @param {Object} params - 조회 파라미터
     * @param {number} params.pageIndex - 페이지 번호
     * @param {number} params.pageSize - 페이지 크기
     * @returns {Promise<Object>} 공고 목록 데이터
     */
    async getPostList(params) {
        try {
            const response = await fetch(`${API_BASE_URL}/POS0001List.pwkjson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postVo: params
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('공고 목록 조회 실패:', error);
            throw error;
        }
    }

    /**
     * MBTI 매칭 공고 목록 조회 (POS0004List.pwkjson)
     * @param {Object} params - 매칭 조회 파라미터
     * @param {number} params.pageIndex - 페이지 번호
     * @param {number} params.pageSize - 페이지 크기
     * @param {string} params.userMbti - 사용자 MBTI
     * @param {string} params.mbtiMatchFilter - 매칭 필터
     * @returns {Promise<Object>} MBTI 매칭 공고 목록 데이터
     */
    async getMbtiMatchedPostList(params) {
        try {
            const response = await fetch(`${API_BASE_URL}/POS0004List.pwkjson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postMatchVo: params
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('MBTI 매칭 공고 목록 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 공고 상세 조회 (POS0001Detail.pwkjson)
     * @param {string} jobPostingId - 공고 ID
     * @returns {Promise<Object>} 공고 상세 데이터
     */
    async getPostDetail(jobPostingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/POS0001Detail.pwkjson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postVo: { jobPostingId }
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('공고 상세 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 공고 등록 (POS0001Ins.pwkjson)
     * @param {Object} postData - 공고 데이터
     * @param {File} imageFile - 공고 이미지 파일 (선택사항)
     * @returns {Promise<Object>} 등록 결과
     */
    async createPost(postData, imageFile = null) {
        try {
            // FormData 생성 (파일 업로드 지원)
            const formData = new FormData();
            
            // JSON 데이터 추가
            formData.append('postVo', JSON.stringify(postData));
            
            // 이미지 파일이 있으면 추가
            if (imageFile) {
                formData.append('jobImage', imageFile);
            }

            const response = await fetch(`${API_BASE_URL}/POS0001Ins.pwkjson`, {
                method: 'POST',
                // FormData 사용 시 Content-Type 헤더를 설정하지 않음 (브라우저가 자동 설정)
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('공고 등록 실패:', error);
            throw error;
        }
    }

    /**
     * 공고 수정 (POS0001Upd.pwkjson)
     * @param {Object} postData - 수정할 공고 데이터
     * @returns {Promise<Object>} 수정 결과
     */
    async updatePost(postData) {
        try {
            const response = await fetch(`${API_BASE_URL}/POS0001Upd.pwkjson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postVo: postData
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('공고 수정 실패:', error);
            throw error;
        }
    }

    /**
     * 공고 삭제 (POS0001Del.pwkjson)
     * @param {string} jobPostingId - 삭제할 공고 ID
     * @returns {Promise<Object>} 삭제 결과
     */
    async deletePost(jobPostingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/POS0001Del.pwkjson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postVo: { jobPostingId }
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('공고 삭제 실패:', error);
            throw error;
        }
    }

    /**
     * 공고 지원 (POS0001JAPL.pwkjson)
     * @param {string} jobPostingId - 공고 ID
     * @param {string} accountId - 지원자 ID
     * @returns {Promise<Object>} 지원 결과
     */
    async applyToPost(jobPostingId, accountId) {
        try {
            const response = await fetch(`${API_BASE_URL}/POS0001JAPL.pwkjson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobApplicationVo: {
                        jobPostingId,
                        accountId
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('공고 지원 실패:', error);
            throw error;
        }
    }

    /**
     * 기술스택 목록 조회 (POS0002List.pwkjson)
     * @returns {Promise<Object>} 기술스택 목록 데이터
     */
    async getTechStackList() {
        try {
            const response = await fetch(`${API_BASE_URL}/POS0002List.pwkjson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('기술스택 목록 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 응답 데이터 검증
     * @param {Object} response - 서버 응답 데이터
     * @returns {boolean} 성공 여부
     */
    isResponseSuccessful(response) {
        return response.elHeader && response.elHeader.resSuc !== false;
    }

    /**
     * 에러 메시지 추출
     * @param {Object} response - 서버 응답 데이터
     * @returns {string} 에러 메시지
     */
    getErrorMessage(response) {
        if (response.elHeader) {
            return response.elHeader.resMsg || '알 수 없는 오류가 발생했습니다.';
        }
        return '서버 응답을 받을 수 없습니다.';
    }

    /**
     * 에러 코드 추출
     * @param {Object} response - 서버 응답 데이터
     * @returns {string} 에러 코드
     */
    getErrorCode(response) {
        if (response.elHeader) {
            return response.elHeader.resCode || 'UNKNOWN';
        }
        return 'NO_RESPONSE';
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const postService = new PostService();
export default postService;
