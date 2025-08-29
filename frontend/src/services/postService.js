// PostService - 공고 관련 API 서비스
// WebSquare XML의 submission 기능을 React fetch API로 대체

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

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
            const { pageIndex = 0, pageSize = 16 } = params || {};
            const response = await fetch(`${API_BASE_URL}/posts?page=${pageIndex}&size=${pageSize}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            const { pageIndex = 0, pageSize = 16, userMbti } = params || {};
            const response = await fetch(`${API_BASE_URL}/posts/mbti-matched?mbtiType=${userMbti}&page=${pageIndex}&size=${pageSize}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    async getPostDetail(jobPostingId, userId = null) {
        try {
            const url = userId ? 
                `${API_BASE_URL}/posts/${jobPostingId}?userId=${userId}` : 
                `${API_BASE_URL}/posts/${jobPostingId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
     * 공고 등록 (/posts)
     * @param {Object} postData - 공고 데이터
     * @param {File} imageFile - 공고 이미지 파일 (선택사항, 현재 미지원)
     * @returns {Promise<Object>} 등록 결과
     */
    async createPost(postData, imageFile = null) {
        try {
            // companyId를 숫자로 변환
            const requestData = {
                ...postData,
                companyId: parseInt(postData.companyId) || 1 // 임시로 1 사용
            };

            console.log('공고 등록 요청 데이터:', requestData);

            // JWT 토큰 가져오기
            const token = localStorage.getItem('accessToken');
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('공고 등록 오류 응답:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('공고 등록 성공:', data);
            return data;
        } catch (error) {
            console.error('공고 등록 실패:', error);
            throw error;
        }
    }

    /**
     * 공고 수정 (PUT /posts/{id})
     * @param {string} jobPostingId - 수정할 공고 ID
     * @param {Object} postData - 수정할 공고 데이터
     * @returns {Promise<Object>} 수정 결과
     */
    async updatePost(jobPostingId, postData) {
        try {
            // JWT 토큰 가져오기
            const token = localStorage.getItem('accessToken');
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('공고 수정 요청 - ID:', jobPostingId, '데이터:', postData);

            const response = await fetch(`${API_BASE_URL}/posts/${jobPostingId}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('공고 수정 오류 응답:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('공고 수정 성공:', data);
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
            // JWT 토큰 가져오기
            const token = localStorage.getItem('accessToken');
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('공고 삭제 요청 - ID:', jobPostingId);

            const response = await fetch(`${API_BASE_URL}/posts/${jobPostingId}`, {
                method: 'DELETE',
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('공고 삭제 성공');
            return { success: true };
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
    async applyToPost(jobPostingId, userId) {
        try {
            const requestData = {
                jobPostingId: parseInt(jobPostingId),
                userId: parseInt(userId)
            };

            console.log('공고 지원 요청 데이터:', requestData);

            // JWT 토큰 가져오기
            const token = localStorage.getItem('accessToken');
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/posts/apply`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('공고 지원 성공');
            return { success: true };
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
            const response = await fetch(`${API_BASE_URL}/posts/tech-stacks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
