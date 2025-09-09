import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import axios from "axios";
import "./CompanyRegister.css";

interface FormData {
  email: string;
  password: string;
  name: string;
  businessNumber: string;
  industry: string;
  empCount: string;
  description: string;
  businessCertificate: File | null;
  logo: File | null;
}

interface FileNames {
  businessCertificate: string;
  logo: string;
}

interface ImagePreviews {
  businessCertificate: string | null;
  logo: string | null;
}

interface BusinessNumberApiResponse {
  data?: Array<{
    tax_type?: string;
  }>;
}

const CompanyRegister: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
    businessNumber: "",
    industry: "",
    empCount: "",
    description: "",
    businessCertificate: null,
    logo: null,
  });

  const [fileNames, setFileNames] = useState<FileNames>({
    businessCertificate: "",
    logo: "",
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreviews>({
    businessCertificate: null,
    logo: null,
  });

  const businessCertificateRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
      setFileNames((prev) => ({
        ...prev,
        [name]: file.name,
      }));

      // 이미지 파일인 경우 미리보기 생성
      if (isImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagePreviews((prev) => ({
              ...prev,
              [name]: event.target!.result as string,
            }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        // 이미지가 아닌 경우 미리보기 제거
        setImagePreviews((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
  };

  const handleBusinessNumberCheck = async (): Promise<void> => {
    const bizNo = formData.businessNumber.replace(/[^0-9]/g, "");
    // if (bizNo.length === 0) {
    //   alert("사업자등록번호를 입력해 주세요.");
    //   return;
    // }

    // try {
    //   const response = await fetch(
    //     "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=yinZtZoIZHJc8jq8NnIE8zNvIc69XfYrMflYSywUFhAQr9ShfzBmntj7d4jMkuLJ5kZomJ7i7bOFOUAykjWAOw%3D%3D",
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ b_no: [bizNo] }),
    //     }
    //   );

    //   const result: BusinessNumberApiResponse = await response.json();

    //   if (result && result.data && result.data.length > 0) {
    //     const info = result.data[0];
    //     if (
    //       info.tax_type &&
    //       info.tax_type.indexOf("국세청에 등록되지 않은 사업자등록번호") > -1
    //     ) {
    //       alert(
    //         "국세청에 등록되지 않은 사업자등록번호입니다.\n번호를 다시 확인해 주세요."
    //       );
    //       return;
    //     }
    //     alert("유효한 사업자등록번호입니다.");
    //   } else {
    //     alert("조회 결과가 없습니다. 번호를 확인해 주세요.");
    //   }
    // } catch (error) {
    //   console.error("Business number check error:", error);
    //   alert("조회 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
    // }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const errors: string[] = [];
    if (!formData.email) errors.push("이메일을 입력해주세요.");
    if (!formData.password) errors.push("패스워드를 입력해주세요.");
    if (!formData.name) errors.push("기업명을 입력해주세요.");
    if (!formData.businessNumber) errors.push("사업자등록번호를 입력해주세요.");
    if (!formData.industry) errors.push("산업분류를 선택해주세요.");
    if (!formData.businessCertificate)
      errors.push("사업자등록증명원을 업로드해주세요.");

    if (errors.length > 0) {
      alert("다음 항목들을 확인해주세요:\n\n" + errors.join("\n"));
      return;
    }

    if (window.confirm("저장하시겠습니까?")) {
      try {
        // FormData 객체 생성
        const submitFormData = new FormData();
        submitFormData.append("email", formData.email);
        submitFormData.append("password", formData.password);
        submitFormData.append("name", formData.name);
        submitFormData.append("businessNumber", formData.businessNumber);
        submitFormData.append("industry", formData.industry);
        submitFormData.append("empCount", formData.empCount);
        submitFormData.append("description", formData.description);

        if (formData.businessCertificate) {
          submitFormData.append(
            "businessCertificate",
            formData.businessCertificate
          );
        }

        if (formData.logo) {
          submitFormData.append("logo", formData.logo);
        }

        console.log("Submitting form data:", {
          email: formData.email,
          name: formData.name,
          businessNumber: formData.businessNumber,
          industry: formData.industry,
          hasBusinessCertificate: !!formData.businessCertificate,
          hasLogo: !!formData.logo,
        });

        const response = await axios.post(
          "/api/public/company/register",
          submitFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert("등록 성공: " + response.data);
        // 성공 시 폼 초기화 또는 리다이렉트
        window.location.href = "/company";
      } catch (error) {
        console.error("API 호출 오류:", error);
        alert("서버와의 통신 중 오류가 발생했습니다.");
      }
    }
  };

  const handleCancel = (): void => {
    window.history.back();
  };

  const handleFileButtonClick = (
    fileType: "businessCertificate" | "logo"
  ): void => {
    if (fileType === "businessCertificate" && businessCertificateRef.current) {
      businessCertificateRef.current.click();
    } else if (fileType === "logo" && logoRef.current) {
      logoRef.current.click();
    }
  };

  return (
    <div className="main-container">
      <div className="page-title">
        <h1 className="main-title">기업 등록</h1>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        {/* 이메일 */}
        <div className="form-group">
          <label className="form-label required">이메일</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="예) company@example.com"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        {/* 패스워드 */}
        <div className="form-group">
          <label className="form-label required">패스워드</label>
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="8자 이상 입력해주세요"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        {/* 기업명 */}
        <div className="form-group">
          <label className="form-label required">기업명</label>
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="ex) 인스웨이브"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        {/* 사업자등록번호 */}
        <div className="form-group">
          <div className="business-number-group">
            <label className="form-label required">사업자등록번호</label>
            <a href="#" className="overseas-link">
              <span className="info-icon">i</span>
              <span>해외 기업인가요?</span>
            </a>
          </div>
          <div className="input-with-button">
            <input
              type="text"
              name="businessNumber"
              className="form-input-with-btn"
              placeholder="10자리 숫자"
              value={formData.businessNumber}
              onChange={handleInputChange}
            />
            <button
              type="button"
              className="check-btn"
              onClick={handleBusinessNumberCheck}
            >
              검사
            </button>
          </div>
          <div className="help-text">사업자 등록번호 10자리를 입력해주세요</div>
        </div>

        {/* 사업자등록증명원 */}
        <div className="form-group">
          <label className="form-label required">사업자등록증명원</label>
          <div
            className={`upload-container ${
              fileNames.businessCertificate ? "file-selected" : ""
            }`}
          >
            <div className="upload-label">
              PDF, JPG, PNG 파일 업로드 (최대 10MB)
            </div>
            <div className="file-upload-section">
              <input
                type="file"
                name="businessCertificate"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="file-input-hidden"
                ref={businessCertificateRef}
              />
              <button
                type="button"
                className="file-upload-btn"
                onClick={() => handleFileButtonClick("businessCertificate")}
              >
                파일 선택
              </button>
              {fileNames.businessCertificate && (
                <div className="file-status">
                  <div className="file-info show">
                    <span className="file-name">
                      {fileNames.businessCertificate}
                    </span>
                    <div>✓ 파일이 선택되었습니다</div>
                  </div>
                </div>
              )}
            </div>
            {imagePreviews.businessCertificate && (
              <div className="image-preview">
                <img
                  src={imagePreviews.businessCertificate}
                  alt="사업자등록증명원 미리보기"
                  className="preview-image"
                />
              </div>
            )}
          </div>
        </div>

        {/* 산업 선택 */}
        <div className="form-group">
          <label className="form-label required">산업 선택</label>
          <select
            name="industry"
            className="form-select"
            value={formData.industry}
            onChange={handleInputChange}
          >
            <option value="">선택하기</option>
            <option value="1">IT/소프트웨어</option>
            <option value="2">제조업</option>
            <option value="3">서비스업</option>
            <option value="4">기타</option>
          </select>
        </div>

        {/* 기업의 직원 수 */}
        <div className="form-group">
          <label className="form-label">기업의 직원 수</label>
          <input
            type="number"
            name="empCount"
            className="form-input"
            placeholder="예 : 50"
            value={formData.empCount}
            onChange={handleInputChange}
          />
        </div>

        {/* 회사 소개 */}
        <div className="form-group">
          <label className="form-label">회사 소개</label>
          <textarea
            name="description"
            className="form-textarea"
            placeholder="개발자들이 우리 회사를 이해할 수 있도록 자세히 작성해주세요."
            value={formData.description}
            onChange={handleInputChange}
          />
          <div className="help-text">
            개발자들이 우리 회사를 이해할 수 있도록 자세히 작성해주세요.
          </div>
        </div>

        {/* 기업 로고 */}
        <div className="form-group">
          <label className="form-label">기업 로고 (선택사항)</label>
          <div
            className={`upload-container ${
              fileNames.logo ? "file-selected" : ""
            }`}
          >
            <div className="upload-label">
              PNG, JPG, SVG 파일 업로드 (최대 5MB)
            </div>
            <div className="file-upload-section">
              <input
                type="file"
                name="logo"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleFileChange}
                className="file-input-hidden"
                ref={logoRef}
              />
              <button
                type="button"
                className="file-upload-btn"
                onClick={() => handleFileButtonClick("logo")}
              >
                파일 선택
              </button>
              {fileNames.logo && (
                <div className="file-status">
                  <div className="file-info show">
                    <span className="file-name">{fileNames.logo}</span>
                    <div>✓ 파일이 선택되었습니다</div>
                  </div>
                </div>
              )}
            </div>
            {imagePreviews.logo && (
              <div className="image-preview">
                <img
                  src={imagePreviews.logo}
                  alt="기업 로고 미리보기"
                  className="preview-image"
                />
              </div>
            )}
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="button-container">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            취소
          </button>
          <button type="submit" className="btn-primary">
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyRegister;
