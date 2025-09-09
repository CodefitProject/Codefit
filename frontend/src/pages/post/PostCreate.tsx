import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.tsx';
import Footer from '../../components/Footer/Footer.tsx';
import postService from '../../services/postService';
import AuthService from '../../services/authService.tsx';
import './PostCreate.css';

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

const PostCreate: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [allTechStacks, setAllTechStacks] = useState<TechStack[]>([]);
    const [techStackSuggestions, setTechStackSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [techStackInput, setTechStackInput] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
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
        console.log("=== PostCreate 페이지 로드 ===");
        checkUserAccess();
        loadTechStacks();
    }, []);

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

            // 기업 사용자인 경우 companyId 확인
            if (!userInfo.companyId) {
                alert('회사 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
                navigate('/');
                return;
            }

            setUserInfo(userInfo);
        } catch (error) {
            console.error('Access check error:', error);
            navigate('/');
        }
    };

    const loadTechStacks = async () => {
        try {
            const data = await postService.getTechStackList();
            console.log('기술스택 목록 로드 완료:', data);
            setAllTechStacks(data || []);
        } catch (error) {
            console.error('기술스택 목록 로드 실패:', error);
            alert('기술스택 목록을 불러올 수 없습니다.');
        }
    };

    const handleInputChange = (field: keyof PostFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTechStackInputChange = (value: string) => {
        setTechStackInput(value);
        
        if (value && value.length > 0) {
            showTechStackSuggestions(value);
        } else {
            showPopularTechStacks();
        }
    };

    const handleTechStackInputFocus = () => {
        if (!techStackInput || techStackInput.trim() === '') {
            showPopularTechStacks();
        } else {
            showTechStackSuggestions(techStackInput);
        }
        setShowSuggestions(true);
    };

    const handleTechStackInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    const showPopularTechStacks = () => {
        const popularTechStacks = ["Java", "JavaScript", "Python", "React", "Spring Boot", "Node.js", 
                                "MySQL", "MongoDB", "Docker", "Kubernetes", "Vue.js", "Angular"];
        
        const availablePopularStacks = popularTechStacks.filter(tech => 
            allTechStacks.some(stack => stack.techStackName === tech) &&
            !formData.selectedTechStacks.includes(tech)
        ).slice(0, 8);
        
        setTechStackSuggestions(availablePopularStacks);
    };

    const showTechStackSuggestions = (inputValue: string) => {
        const input = inputValue.toLowerCase().trim();
        
        if (input === '') {
            showPopularTechStacks();
            return;
        }

        const suggestions = allTechStacks
            .filter(stack => 
                stack.techStackName.toLowerCase().includes(input) &&
                !formData.selectedTechStacks.includes(stack.techStackName)
            )
            .sort((a, b) => {
                const aIndex = a.techStackName.toLowerCase().indexOf(input);
                const bIndex = b.techStackName.toLowerCase().indexOf(input);
                if (aIndex !== bIndex) {
                    return aIndex - bIndex;
                }
                return a.techStackName.localeCompare(b.techStackName);
            })
            .slice(0, 8)
            .map(stack => stack.techStackName);

        setTechStackSuggestions(suggestions);
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
            selectedTechStacks: prev.selectedTechStacks.filter(tech => tech !== techStack)
        }));
    };

    const togglePersonality = (personality: string) => {
        const isSelected = formData.selectedPersonalities.includes(personality);
        
        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                selectedPersonalities: prev.selectedPersonalities.filter(p => p !== personality)
            }));
        } else {
            if (formData.selectedPersonalities.length >= maxPersonalities) {
                alert(`최대 ${maxPersonalities}개까지만 선택 가능합니다.`);
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                selectedPersonalities: [...prev.selectedPersonalities, personality]
            }));
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // 파일 크기 체크 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하만 허용됩니다.');
                return;
            }
            
            // 파일 형식 체크
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                jobImageFile: file
            }));
        }
    };

    const handleCancel = () => {
        if (window.confirm("입력한 내용이 모두 사라집니다. 정말 취소하시겠습니까?")) {
            navigate('/post');
        }
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];
        
        if (!formData.title || formData.title.trim() === "") {
            errors.push("공고 제목을 입력해주세요.");
        }
        
        if (!formData.location || formData.location.trim() === "") {
            errors.push("근무 지역을 선택해주세요.");
        }
        
        if (!formData.workType || formData.workType.trim() === "") {
            errors.push("근무 형태를 선택해주세요.");
        }
        
        if (formData.selectedTechStacks.length === 0) {
            errors.push("최소 1개 이상의 기술스택을 선택해주세요.");
        }
        
        if (formData.selectedPersonalities.length === 0) {
            errors.push("최소 1개 이상의 선호 성향을 선택해주세요.");
        }
        
        if (!formData.description || formData.description.trim() === "") {
            errors.push("상세 설명을 입력해주세요.");
        }
        
        if (!formData.expiresAt || formData.expiresAt.trim() === "") {
            errors.push("공고 만료일을 선택해주세요.");
        } else {
            // 만료일이 현재 시간보다 미래인지 확인
            const expiresDate = new Date(formData.expiresAt);
            const now = new Date();
            if (expiresDate <= now) {
                errors.push("공고 만료일은 현재 시간보다 미래여야 합니다.");
            }
        }
        
        return errors;
    };

    const handleSubmit = async () => {
        console.log("=== 공고 등록 시작 ===");
        
        const errors = validateForm();
        if (errors.length > 0) {
            alert("다음 항목들을 확인해주세요:\n\n" + errors.join("\n"));
            return;
        }
        
        if (!window.confirm("공고를 등록하시겠습니까?")) {
            return;
        }
        
        if (!userInfo?.companyId) {
            alert("회사 정보를 확인할 수 없습니다.\n다시 로그인해주세요.");
            navigate('/');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // 사용자가 설정한 만료일을 ISO 형식으로 변환
            const expiresAtISO = new Date(formData.expiresAt).toISOString();
            
            // 기본 데이터 생성
            const postData = {
                companyId: userInfo.companyId,
                title: formData.title,
                description: formData.description,
                experienceLevel: formData.experienceLevel,
                salaryRange: formData.salaryRange,
                location: formData.location,
                workType: formData.workType,
                selectedTechStackNames: JSON.stringify(formData.selectedTechStacks),
                preferredDeveloperTypes: JSON.stringify(formData.selectedPersonalities),
                expiresAt: expiresAtISO
            };
            
            console.log('전송할 공고 데이터:', postData);
            
            // postService를 사용하여 공고 등록
            const result = await postService.createPost(postData, formData.jobImageFile);
            
            console.log('공고 등록 응답:', result);
            alert("공고가 성공적으로 등록되었습니다!");
            navigate('/post');
        } catch (error) {
            console.error('공고 등록 실패:', error);
            alert('공고 등록 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="main-wrap">
            <Header />
            
            <div className="main-container">
                <div className="content-container">
                    {/* 페이지 헤더 */}
                    <div className="page-header">
                        <h1 className="main-title">공고 등록</h1>
                        <p className="page-subtitle">우리 회사의 매력적인 공고를 등록해보세요</p>
                    </div>

                    {/* 기본 정보 섹션 */}
                    <section className="form-section">
                        <h2 className="section-title">기본 정보</h2>
                        
                        <div className="form-group">
                            <label className="form-label required">공고 제목</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="매력적인 공고 제목을 입력해주세요"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group half">
                                <label className="form-label required">근무 지역</label>
                                <select
                                    className="form-select"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                >
                                    <option value="">지역 선택</option>
                                    <option value="서울">서울</option>
                                    <option value="경기">경기</option>
                                    <option value="인천">인천</option>
                                    <option value="부산">부산</option>
                                    <option value="대구">대구</option>
                                    <option value="대전">대전</option>
                                    <option value="광주">광주</option>
                                </select>
                            </div>
                            
                            <div className="form-group half">
                                <label className="form-label required">근무 형태</label>
                                <select
                                    className="form-select"
                                    value={formData.workType}
                                    onChange={(e) => handleInputChange('workType', e.target.value)}
                                >
                                    <option value="">형태 선택</option>
                                    <option value="remote">원격 근무</option>
                                    <option value="onsite">출근 근무</option>
                                    <option value="hybrid">하이브리드</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 기술스택 섹션 */}
                    <section className="form-section">
                        <h2 className="section-title">💻 기술스택</h2>

                        <div className="form-group">
                            <label className="form-label required">주요 기술스택</label>
                            <p className="help-text">
                                입력창을 클릭하면 인기 기술스택이 표시되고, 타이핑하면 자동완성 추천이 나타납니다. 
                                선택한 기술스택은 아래에 태그로 표시되며 × 버튼으로 제거할 수 있습니다.
                            </p>
                            
                            {/* 선택된 기술스택 표시 영역 */}
                            <div className="techstack-grid">
                                {formData.selectedTechStacks.length > 0 ? (
                                    formData.selectedTechStacks.map((tech, index) => (
                                        <div key={index} className="techstack-tag">
                                            <span className="techstack-text">{tech}</span>
                                            <button 
                                                className="techstack-remove-btn" 
                                                type="button"
                                                onClick={() => removeTechStack(tech)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-message">
                                        아래 입력창에서 기술스택을 검색하고 선택하세요<br/>
                                        선택된 기술스택이 여기에 태그로 표시됩니다
                                    </div>
                                )}
                            </div>
                            
                            <div className="techstack-input-container">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="기술스택을 입력하세요 (예: React, Java, Docker)"
                                    value={techStackInput}
                                    onChange={(e) => handleTechStackInputChange(e.target.value)}
                                    onFocus={handleTechStackInputFocus}
                                    onBlur={handleTechStackInputBlur}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (techStackSuggestions.length > 0) {
                                                addTechStack(techStackSuggestions[0]);
                                            }
                                        }
                                    }}
                                />
                                <button 
                                    className="btn-add-techstack" 
                                    type="button"
                                    onClick={() => {
                                        if (techStackSuggestions.length > 0) {
                                            addTechStack(techStackSuggestions[0]);
                                        }
                                    }}
                                >
                                    추가
                                </button>
                                
                                {showSuggestions && techStackSuggestions.length > 0 && (
                                    <div className="techstack-suggestions">
                                        {techStackSuggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                className="suggestion-item"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    addTechStack(suggestion);
                                                }}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 선호 성향 섹션 */}
                    <section className="form-section">
                        <h2 className="section-title">🎯 선호 성향</h2>

                        <div className="form-group personality-section" style={{ position: 'relative' }}>
                            <label className="form-label required">선호하는 개발자 성향 (최대 4개)</label>
                            <div className="personality-counter">
                                {formData.selectedPersonalities.length}/{maxPersonalities}
                            </div>
                            
                            <div className="personality-grid">
                                {allPersonalities.map(personality => (
                                    <button
                                        key={personality}
                                        type="button"
                                        className={`personality-btn ${formData.selectedPersonalities.includes(personality) ? 'selected' : ''}`}
                                        onClick={() => togglePersonality(personality)}
                                    >
                                        {personality}
                                    </button>
                                ))}
                            </div>
                            
                            <p className="help-text">우리 팀과 잘 맞을 것 같은 성향 유형을 선택해주세요</p>
                        </div>
                    </section>

                    {/* 추가 정보 섹션 */}
                    <section className="form-section">
                        <h2 className="section-title">📋 추가 정보</h2>
                        
                        <div className="form-row">
                            <div className="form-group half">
                                <label className="form-label">선호 경력</label>
                                <select
                                    className="form-select"
                                    value={formData.experienceLevel}
                                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                                >
                                    <option value="">경력 선택</option>
                                    <option value="any">상관없음</option>
                                    <option value="new">신입 (0년)</option>
                                    <option value="junior">1-2년</option>
                                    <option value="mid">3-5년</option>
                                    <option value="senior">5년 이상</option>
                                </select>
                            </div>

                            <div className="form-group half">
                                <label className="form-label">예상 연봉범위</label>
                                <select
                                    className="form-select"
                                    value={formData.salaryRange}
                                    onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                                >
                                    <option value="">연봉 선택</option>
                                    <option value="under25">2,500만원 미만</option>
                                    <option value="25to35">2,500-3,500만원</option>
                                    <option value="35to50">3,500-5,000만원</option>
                                    <option value="over50">5,000만원 이상</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label required">공고 만료일</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={formData.expiresAt}
                                onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                            <p className="help-text">
                                공고가 자동으로 마감되는 날짜와 시간을 설정해주세요.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label required">상세 설명</label>
                            <textarea
                                className="form-textarea"
                                placeholder="우리 회사에서 함께 일하고 싶은 개발자의 특징이나 역량을 구체적으로 설명해주세요."
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={6}
                            />
                        </div>

                        {/* 이미지 업로드 */}
                        <div className="form-group">
                            <label className="form-label">공고 이미지 (선택사항)</label>
                            <div className={`upload-container ${formData.jobImageFile ? 'file-selected' : ''}`}>
                                <p className="upload-label">PNG, JPG 파일 업로드 (최대 5MB)</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn-file-select"
                                >
                                    파일 선택
                                </button>

                                {formData.jobImageFile && (
                                    <div className="file-info show">
                                        <span className="file-name">{formData.jobImageFile.name}</span>
                                        <div>✓ 파일이 선택되었습니다</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 버튼 그룹 */}
                    <section className="form-section">
                        <div className="button-container">
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                취소
                            </button>
                            <button 
                                type="button" 
                                className="btn-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '등록 중...' : '🚀 공고 등록하기'}
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PostCreate;
