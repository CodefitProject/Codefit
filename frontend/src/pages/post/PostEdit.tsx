import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import postService from '../../services/postService';
import AuthService from '../../services/authService.tsx';
import './PostCreate.css'; // PostCreate 스타일 재사용

interface TechStack {
    techStackId: string;
    techStackName: string;
}

interface PostFormData {
    title: string;
    location: string;
    workType: string;
    experienceLevel: string;
    salaryRange: string;
    description: string;
    selectedTechStacks: string[];
    selectedPersonalities: string[];
    expiresAt: string;
    jobImageFile?: File;
}

interface UserInfo {
    email: string | null;
    name: string | null;
    role: 'USER' | 'COMPANY' | 'ADMIN';
    baseUserId: string | null;
    companyId?: string;
}

const PostEdit: React.FC = () => {
    const navigate = useNavigate();
    const { jobPostingId } = useParams<{ jobPostingId: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [allTechStacks, setAllTechStacks] = useState<TechStack[]>([]);
    const [techStackSuggestions, setTechStackSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [techStackInput, setTechStackInput] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [formData, setFormData] = useState<PostFormData>({
        title: '',
        location: '',
        workType: '',
        experienceLevel: '',
        salaryRange: '',
        description: '',
        selectedTechStacks: [],
        selectedPersonalities: [],
        expiresAt: '',
    });

    const maxPersonalities = 4;
    
    // 모든 가능한 성향 타입
    const allPersonalities = [
        'ARSD', 'ARSF', 'ARTD', 'ARTF', 'AISD', 'AISF', 'AITD', 'AITF',
        'BRSD', 'BRSF', 'BRTD', 'BRTF', 'BISD', 'BISF', 'BITD', 'BITF'
    ];

    useEffect(() => {
        console.log("=== PostEdit 페이지 로드 ===");
        checkUserAccess();
        loadTechStacks();
    }, []);

    useEffect(() => {
        if (jobPostingId && userInfo) {
            loadPostData();
        }
    }, [jobPostingId, userInfo]);

    const checkUserAccess = () => {
        try {
            const userInfo = AuthService.getUserInfo();
            const isLoggedIn = AuthService.isLoggedIn();

            // 로그인하지 않은 경우 메인페이지로 리다이렉트
            if (!isLoggedIn || !userInfo) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/');
                return;
            }

            // USER 권한인 경우 메인페이지로 리다이렉트
            if (userInfo.role !== 'COMPANY') {
                alert('기업 회원만 접근 가능한 페이지입니다.');
                navigate('/');
                return;
            }

            // 임시 companyId 설정 (나중에 백엔드에서 제공되어야 함)
            const userInfoWithCompanyId = {
                ...userInfo,
                companyId: "1"  // 숫자 문자열로 설정
            };

            setUserInfo(userInfoWithCompanyId);
        } catch (error) {
            console.error('Access check error:', error);
            navigate('/');
        }
    };

    const loadPostData = async () => {
        try {
            setIsLoading(true);
            const response = await postService.getPostDetail(jobPostingId);
            
            console.log('공고 데이터 로드:', response);
            
            // 권한 체크: 본인 회사의 공고인지 확인
            if (userInfo && userInfo.companyId && response.companyId && 
                userInfo.companyId !== response.companyId.toString()) {
                alert('본인 회사의 공고만 수정할 수 있습니다.');
                navigate('/post');
                return;
            }
            
            // 기존 데이터를 폼에 채우기
            // expiresAt을 input[type="datetime-local"] 형식으로 변환
            let expiresAtValue = '';
            if (response.expiresAt) {
                // ISO 형식을 datetime-local 형식으로 변환 (YYYY-MM-DDTHH:mm)
                const date = new Date(response.expiresAt);
                expiresAtValue = date.toISOString().slice(0, 16);
            }
            
            setFormData({
                title: response.title || '',
                location: response.location || '',
                workType: response.workType || '',
                experienceLevel: response.experienceLevel || '',
                salaryRange: response.salaryRange || '',
                description: response.description || '',
                selectedTechStacks: response.selectedTechStackNames ? response.selectedTechStackNames.split(',').map(s => s.trim()) : [],
                selectedPersonalities: response.preferredDeveloperTypes ? response.preferredDeveloperTypes.split(',').map(s => s.trim()) : [],
                expiresAt: expiresAtValue,
            });
            
        } catch (error) {
            console.error('공고 데이터 로드 실패:', error);
            alert('공고 데이터를 불러오는데 실패했습니다.');
            navigate('/post');
        } finally {
            setIsLoading(false);
        }
    };

    const loadTechStacks = async () => {
        try {
            const response = await postService.getTechStackList();
            console.log('기술스택 목록 로드:', response);
            setAllTechStacks(response || []);
        } catch (error) {
            console.error('기술스택 목록 로드 실패:', error);
        }
    };

    const handleInputChange = (field: keyof PostFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTechStackInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setTechStackInput(inputValue);

        if (inputValue.trim()) {
            const filtered = allTechStacks
                .filter(stack => stack.techStackName.toLowerCase().includes(inputValue.toLowerCase()))
                .map(stack => stack.techStackName)
                .filter(name => !formData.selectedTechStacks.includes(name))
                .slice(0, 5);
            
            setTechStackSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const addTechStack = (techStack: string) => {
        if (!formData.selectedTechStacks.includes(techStack)) {
            setFormData(prev => ({
                ...prev,
                selectedTechStacks: [...prev.selectedTechStacks, techStack]
            }));
        }
        setTechStackInput('');
        setShowSuggestions(false);
    };

    const removeTechStack = (techStack: string) => {
        setFormData(prev => ({
            ...prev,
            selectedTechStacks: prev.selectedTechStacks.filter(stack => stack !== techStack)
        }));
    };

    const togglePersonality = (personality: string) => {
        setFormData(prev => {
            const isSelected = prev.selectedPersonalities.includes(personality);
            if (isSelected) {
                return {
                    ...prev,
                    selectedPersonalities: prev.selectedPersonalities.filter(p => p !== personality)
                };
            } else if (prev.selectedPersonalities.length < maxPersonalities) {
                return {
                    ...prev,
                    selectedPersonalities: [...prev.selectedPersonalities, personality]
                };
            }
            return prev;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                jobImageFile: file
            }));
        }
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            alert('공고 제목을 입력해주세요.');
            return false;
        }
        if (!formData.location.trim()) {
            alert('근무 지역을 선택해주세요.');
            return false;
        }
        if (!formData.workType.trim()) {
            alert('근무 형태를 선택해주세요.');
            return false;
        }
        if (!formData.experienceLevel.trim()) {
            alert('경력 요구사항을 선택해주세요.');
            return false;
        }
        if (!formData.salaryRange.trim()) {
            alert('급여 범위를 선택해주세요.');
            return false;
        }
        if (!formData.description.trim()) {
            alert('공고 상세내용을 입력해주세요.');
            return false;
        }
        if (formData.selectedTechStacks.length === 0) {
            alert('최소 1개의 기술스택을 선택해주세요.');
            return false;
        }
        if (formData.selectedPersonalities.length === 0) {
            alert('최소 1개의 선호 개발자 성향을 선택해주세요.');
            return false;
        }
        if (!formData.expiresAt.trim()) {
            alert('공고 만료일을 선택해주세요.');
            return false;
        }
        
        // 만료일이 현재 시간보다 미래인지 확인
        const expiresDate = new Date(formData.expiresAt);
        const now = new Date();
        if (expiresDate <= now) {
            alert('공고 만료일은 현재 시간보다 미래여야 합니다.');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !userInfo || !jobPostingId) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // expiresAt을 ISO 형식으로 변환
            const expiresAtISO = new Date(formData.expiresAt).toISOString();
            
            const submitData = {
                companyId: parseInt(userInfo.companyId || '1'),
                title: formData.title.trim(),
                description: formData.description.trim(),
                experienceLevel: formData.experienceLevel,
                salaryRange: formData.salaryRange,
                location: formData.location,
                workType: formData.workType,
                selectedTechStackNames: JSON.stringify(formData.selectedTechStacks),
                preferredDeveloperTypes: JSON.stringify(formData.selectedPersonalities),
                expiresAt: expiresAtISO
            };

            console.log('공고 수정 데이터:', submitData);

            const response = await postService.updatePost(jobPostingId, submitData);
            console.log('공고 수정 성공:', response);
            
            alert('공고가 성공적으로 수정되었습니다!');
            navigate(`/post/detail/${jobPostingId}`);
            
        } catch (error) {
            console.error('공고 수정 실패:', error);
            alert('공고 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="post-create-main-wrap" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div>공고 데이터를 불러오는 중...</div>
                </div>
                <Footer style={{ marginTop: 'auto', flexShrink: 0 }} />
            </div>
        );
    }

    return (
        <div className="post-create-main-wrap" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            
            <div className="container" style={{ flex: 1 }}>
                <main className="main-content">
                    <section className="back-section">
                        <button className="btn-back" onClick={() => navigate(-1)}>
                            ← 뒤로가기
                        </button>
                    </section>

                    <section className="form-section">
                        <h1 className="form-title">공고 수정하기</h1>
                        
                        <form className="post-form" onSubmit={handleSubmit}>
                            {/* 공고 제목 */}
                            <div className="form-group">
                                <label htmlFor="title" className="form-label">공고 제목 *</label>
                                <input
                                    type="text"
                                    id="title"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="예: 프론트엔드 개발자 모집"
                                    maxLength={100}
                                />
                            </div>

                            {/* 근무 지역 */}
                            <div className="form-group">
                                <label htmlFor="location" className="form-label">근무 지역 *</label>
                                <select
                                    id="location"
                                    className="form-select"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                >
                                    <option value="">지역을 선택해주세요</option>
                                    <option value="서울">서울</option>
                                    <option value="경기">경기</option>
                                    <option value="인천">인천</option>
                                    <option value="부산">부산</option>
                                    <option value="대구">대구</option>
                                    <option value="광주">광주</option>
                                    <option value="대전">대전</option>
                                    <option value="울산">울산</option>
                                    <option value="강원">강원</option>
                                    <option value="충북">충북</option>
                                    <option value="충남">충남</option>
                                    <option value="전북">전북</option>
                                    <option value="전남">전남</option>
                                    <option value="경북">경북</option>
                                    <option value="경남">경남</option>
                                    <option value="제주">제주</option>
                                    <option value="재택">재택</option>
                                </select>
                            </div>

                            {/* 근무 형태 */}
                            <div className="form-group">
                                <label htmlFor="workType" className="form-label">근무 형태 *</label>
                                <select
                                    id="workType"
                                    className="form-select"
                                    value={formData.workType}
                                    onChange={(e) => handleInputChange('workType', e.target.value)}
                                >
                                    <option value="">근무 형태를 선택해주세요</option>
                                    <option value="정규직">정규직</option>
                                    <option value="계약직">계약직</option>
                                    <option value="인턴">인턴</option>
                                    <option value="프리랜서">프리랜서</option>
                                    <option value="파트타임">파트타임</option>
                                </select>
                            </div>

                            {/* 경력 요구사항 */}
                            <div className="form-group">
                                <label htmlFor="experienceLevel" className="form-label">경력 요구사항 *</label>
                                <select
                                    id="experienceLevel"
                                    className="form-select"
                                    value={formData.experienceLevel}
                                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                                >
                                    <option value="">경력을 선택해주세요</option>
                                    <option value="신입">신입</option>
                                    <option value="1년 이상">1년 이상</option>
                                    <option value="3년 이상">3년 이상</option>
                                    <option value="5년 이상">5년 이상</option>
                                    <option value="10년 이상">10년 이상</option>
                                    <option value="경력무관">경력무관</option>
                                </select>
                            </div>

                            {/* 급여 범위 */}
                            <div className="form-group">
                                <label htmlFor="salaryRange" className="form-label">급여 범위 *</label>
                                <select
                                    id="salaryRange"
                                    className="form-select"
                                    value={formData.salaryRange}
                                    onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                                >
                                    <option value="">급여 범위를 선택해주세요</option>
                                    <option value="2000만원 이하">2000만원 이하</option>
                                    <option value="2000만원-3000만원">2000만원-3000만원</option>
                                    <option value="3000만원-4000만원">3000만원-4000만원</option>
                                    <option value="4000만원-5000만원">4000만원-5000만원</option>
                                    <option value="5000만원-6000만원">5000만원-6000만원</option>
                                    <option value="6000만원-7000만원">6000만원-7000만원</option>
                                    <option value="7000만원-8000만원">7000만원-8000만원</option>
                                    <option value="8000만원 이상">8000만원 이상</option>
                                    <option value="협의">협의</option>
                                </select>
                            </div>

                            {/* 공고 만료일 */}
                            <div className="form-group">
                                <label htmlFor="expiresAt" className="form-label">공고 만료일 *</label>
                                <input
                                    type="datetime-local"
                                    id="expiresAt"
                                    className="form-input"
                                    value={formData.expiresAt}
                                    onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                                <p className="form-help-text">
                                    공고가 자동으로 마감되는 날짜와 시간을 설정해주세요.
                                </p>
                            </div>

                            {/* 공고 상세내용 */}
                            <div className="form-group">
                                <label htmlFor="description" className="form-label">공고 상세내용 *</label>
                                <textarea
                                    id="description"
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="회사 소개, 담당 업무, 우대사항 등을 자세히 작성해주세요."
                                    rows={10}
                                />
                            </div>

                            {/* 기술스택 선택 */}
                            <div className="form-group">
                                <label className="form-label">요구 기술스택 *</label>
                                <div className="tech-stack-input-container">
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={techStackInput}
                                        onChange={handleTechStackInputChange}
                                        placeholder="기술스택을 검색해보세요 (예: React, Java, Python)"
                                    />
                                    {showSuggestions && techStackSuggestions.length > 0 && (
                                        <div className="tech-stack-suggestions">
                                            {techStackSuggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className="tech-stack-suggestion"
                                                    onClick={() => addTechStack(suggestion)}
                                                >
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {formData.selectedTechStacks.length > 0 && (
                                    <div className="selected-tech-stacks">
                                        {formData.selectedTechStacks.map((techStack, index) => (
                                            <span key={index} className="tech-stack-tag">
                                                {techStack}
                                                <button
                                                    type="button"
                                                    className="tech-stack-remove"
                                                    onClick={() => removeTechStack(techStack)}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 선호 개발자 성향 선택 */}
                            <div className="form-group">
                                <label className="form-label">선호 개발자 성향 * (최대 {maxPersonalities}개)</label>
                                <div className="personality-grid">
                                    {allPersonalities.map((personality) => (
                                        <button
                                            key={personality}
                                            type="button"
                                            className={`personality-button ${formData.selectedPersonalities.includes(personality) ? 'selected' : ''}`}
                                            onClick={() => togglePersonality(personality)}
                                            disabled={!formData.selectedPersonalities.includes(personality) && formData.selectedPersonalities.length >= maxPersonalities}
                                        >
                                            {personality}
                                        </button>
                                    ))}
                                </div>
                                {formData.selectedPersonalities.length > 0 && (
                                    <div className="selected-personalities">
                                        선택된 성향: {formData.selectedPersonalities.join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* 공고 이미지 업로드 */}
                            <div className="form-group">
                                <label className="form-label">공고 이미지 (선택사항)</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="form-file-input"
                                />
                                <p className="form-help-text">
                                    * 이미지 업로드는 현재 지원되지 않습니다.
                                </p>
                            </div>

                            {/* 버튼 그룹 */}
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => navigate(-1)}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '수정 중...' : '공고 수정'}
                                </button>
                            </div>
                        </form>
                    </section>
                </main>
            </div>

            <Footer style={{ marginTop: 'auto', flexShrink: 0 }} />
        </div>
    );
};

export default PostEdit;
