import React, { useState, useEffect } from "react";
import "./EmailTemplateModal.css";

interface EmailTemplateModalProps {
  open: boolean;
  onClose: () => void;
  type: "pass" | "fail" | "scout";
  onConfirm: (formData: {
    date?: string;
    content: string;
    sendEmail: boolean;
  }) => void;
}

const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  open,
  onClose,
  type,
  onConfirm,
}) => {
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [sendEmail, setSendEmail] = useState(false);

  const templates = {
    pass: `서류심사 결과를 안내드립니다.

축하드립니다! 서류심사에 통과하셨습니다.
면접은 {{날짜}}에 진행할 예정입니다.
아래 링크를 클릭하여 원하는 시간대로 면접을 예약해 주세요.
감사합니다.
인사팀 드림`,
    fail: `서류심사 결과를 안내드립니다.

아쉽게도 이번 서류심사에서는 인연이 닿지 않았습니다.
향후 다른 기회가 있을 때 다시 도전해 주시기 바랍니다.

좋은 하루 되세요.
인사팀 드림`,
    scout: `안녕하세요!

귀하의 프로필을 보고 관심이 생겨 연락드립니다.
현재 진행 중인 포지션과 잘 맞는다고 판단되어 스카웃 제안을 드립니다.
관심 있으시면 아래 링크를 통해 지원해 주세요.

감사합니다.
인사팀 드림`,
  };

  useEffect(() => {
    if (open) {
      setContent(templates[type]);
      setDate("");
      setSendEmail(false);
    }
  }, [open, type]);

  if (!open) return null;

  const applyDate = () => {
    if (date) {
      setContent(content.replace("{{날짜}}", date));
    }
  };

  const handleConfirm = () => {
    onConfirm({ date, content, sendEmail });
    onClose();
  };

  return (
    <div className="email-modal-overlay">
      <div className="email-modal">
        <div className="email-modal-header">
          <h3>
            {type === "pass"
              ? "합격 메일 보내기"
              : type === "fail"
              ? "불합격 메일 보내기"
              : "스카웃 메일 보내기"}
          </h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div
          className={`email-modal-template-title ${
            type === "pass" ? "success" : type === "fail" ? "fail" : "scout"
          }`}
        >
          {type === "pass"
            ? "합격자 메일 템플릿"
            : type === "fail"
            ? "불합격자 메일 템플릿"
            : "스카웃 메일 템플릿"}
        </div>

        <div className="email-modal-body">
          <textarea
            className="email-template-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {type === "pass" && (
            <div className="date-row">
              <label>면접 날짜:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button className="apply-date-btn" onClick={applyDate}>
                날짜 적용
              </button>
            </div>
          )}

          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            <label>이메일 발송</label>
          </div>
        </div>

        <div className="email-modal-footer">
          <button
            className="reset-btn"
            onClick={() => setContent(templates[type])}
          >
            템플릿 초기화
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            확인
          </button>
          <button className="cancel-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateModal;
