import React from "react";
import "./ResumePreviewModal.css";

interface ResumePreviewModalProps {
  open: boolean;
  onClose: () => void;
  resumeUrl: string; // PDF 경로
  applicantName: string;
}

const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  open,
  onClose,
  resumeUrl,
  applicantName,
}) => {
  if (!open) return null;

  const openInNewWindow = () => {
    window.open(resumeUrl, "_blank", "width=1200,height=800");
  };

  const openInNewTab = () => {
    window.open(resumeUrl, "_blank");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* 헤더 영역 */}
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-subtitle">이력서 미리보기</div>
            <div className="modal-filename">{applicantName}의 이력서</div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-blue" onClick={openInNewWindow}>
              새창에서 열기
            </button>
            <button className="btn btn-green" onClick={openInNewTab}>
              새탭에서 열기
            </button>
            <button className="btn btn-gray" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>

        {/* 본문 영역 */}
        <div className="modal-body">
          <iframe
            src={resumeUrl}
            title="Resume Preview"
            className="resume-iframe"
            width="100%"
            height="600px"
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewModal;
