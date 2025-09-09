import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./ApplicationList.css";
import applicantService, {
  ApplicantDto,
} from "../../services/applicationService.ts";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header.tsx";
import EmailTemplateModal from "./EmailTemplateModal.tsx";
import ResumePreviewModal from "./ResumePreviewModal.tsx";
import AuthService from "../../services/authService.tsx";

interface ApplicationListProps {
  jobPostingId: number;
}

interface Application {
  chk?: boolean;
  name: string;
  career: string;
  currentPosition: string;
  techStack: string;
  typeCode: string;
  resumeFileName: string;
  applicationStatus: string;
  email: string;
  applicationId: string;
}

const statusMap: Record<string, string> = {
  서류검토: "PENDING",
  서류합격: "ACCEPTED",
  서류탈락: "REJECTED",
};

const ApplicantList: React.FC<ApplicationListProps> = ({}) => {
  const { id } = useParams<{ id: string }>();
  const jobPostingId = parseInt(id ?? "0", 10);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"pass" | "fail" | null>(null);

  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeApplicationName, setResumeApplicationName] = useState("");

  useEffect(() => {
    checkAccess();
    fetchApplications();
  }, [pageIndex, statusFilter]);

  useEffect(() => {
    setSelectedRows([]);
  }, [statusFilter]);

  const checkAccess = () => {
    try {
      const userInfo = AuthService.getUserInfo();
      const isLoggedIn = AuthService.isLoggedIn();

      if (!isLoggedIn || !userInfo) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = "/";
        return;
      }

      if (userInfo.role !== "COMPANY") {
        alert("기업 회원만 접근 가능한 페이지입니다.");
        window.location.href = "/";
        return;
      }
    } catch (error) {
      console.error("Access check error:", error);
      window.location.href = "/";
    }
  };

  const fetchApplications = async () => {
    try {
      const mappedStatus = statusMap[statusFilter] ?? "";
      console.log(mappedStatus);

      const data = await applicantService.getApplicantsByJobPostingId(
        jobPostingId,
        pageIndex,
        pageSize,
        mappedStatus
      );

      const mappedApplications: Application[] = data.result.map(
        (dto: ApplicantDto) => ({
          name: dto.name,
          email: dto.email,
          career: dto.career,
          currentPosition: dto.currentPosition,
          techStack: dto.stacks.join(", "),
          typeCode: dto.typeCode,
          resumeFileName: dto.resumeFileName ?? "",
          applicationStatus: dto.applicationStatus,
          applicationId: dto.applicationId ?? "",
        })
      );
      console.log(data.result[0]);
      setApplications(mappedApplications);
      setTotalPage(data.totalPage);
    } catch (err) {
      console.error("지원자 목록 조회 실패:", err);
    }
  };

  const onStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPageIndex(1);
  };

  const passBtnOnClick = () => {
    if (statusFilter !== "서류검토") {
      alert("필터링 조건이 서류검토일 경우에만 사용가능합니다.");
      return;
    }
    if (selectedRows.length === 0) {
      alert("선택된 지원자가 없습니다.");
      return;
    }
    setModalType("pass");
    setIsModalOpen(true);
  };

  const failBtnOnClick = () => {
    if (statusFilter !== "서류검토") {
      alert("필터링 조건이 서류검토일 경우에만 사용가능합니다.");
      return;
    }
    if (selectedRows.length === 0) {
      alert("선택된 지원자가 없습니다.");
      return;
    }
    setModalType("fail");
    setIsModalOpen(true);
  };

  const displayResumeFileName = (value: string) => {
    return value && value.trim() !== "" ? (
      <span className="resume-link-text">이력서 보기</span>
    ) : (
      <span className="resume-none-text">이력서 없음</span>
    );
  };

  const gridViewOnCellClick = (rowIndex: number) => {
    const applicant = applications[rowIndex];
    const resumeFileName = applicant.resumeFileName;
    if (!resumeFileName) return;

    setResumeUrl(resumeFileName);
    setResumeApplicationName(applicant.name);
    setIsResumeModalOpen(true);
  };

  const toggleCheckbox = (rowIndex: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const onPageChange = (newPage: number) => {
    setPageIndex(newPage);
  };

  return (
    <div className="sub_contents">
      <Header />

      <div className="control-bar">
        <div className="filter-group">
          <select onChange={onStatusFilterChange} value={statusFilter}>
            <option value="">상태 필터</option>
            <option value="서류검토">서류검토</option>
            <option value="서류합격">서류합격</option>
            <option value="서류탈락">서류탈락</option>
          </select>
        </div>

        <div className="button-group">
          <button
            id="pass_btn"
            className={`btn-approve ${
              statusFilter !== "서류검토" ? "btn-disabled" : ""
            }`}
            onClick={passBtnOnClick}
            disabled={statusFilter !== "서류검토"}
          >
            ✓ 일괄 합격
          </button>

          <button
            id="fail_btn"
            className={`btn-reject ${
              statusFilter !== "서류검토" ? "btn-disabled" : ""
            }`}
            onClick={failBtnOnClick}
            disabled={statusFilter !== "서류검토"}
          >
            ✗ 일괄 불합격
          </button>
        </div>
      </div>

      <div className="grid-container">
        <table className="applicant-grid">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIndexes = applications.map((_, index) => index);
                      setSelectedRows(allIndexes);
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                  checked={
                    selectedRows.length === applications.length &&
                    applications.length > 0
                  }
                />
              </th>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>경력</th>
              <th>포지션</th>
              <th>이력서</th>
              <th>MBTI</th>
              <th>기술스택</th>
              <th>상태</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((applicant, rowIndex) => (
              <tr
                key={rowIndex}
                className={
                  selectedRows.includes(rowIndex) ? "selected-row" : ""
                }
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => toggleCheckbox(rowIndex)}
                  />
                </td>
                <td>{applicant.applicationId}</td>
                <td>{applicant.name}</td>
                <td>{applicant.email}</td>
                <td>{applicant.career}</td>
                <td>{applicant.currentPosition}</td>
                <td onClick={() => gridViewOnCellClick(rowIndex)}>
                  {displayResumeFileName(applicant.resumeFileName)}
                </td>
                <td>{applicant.typeCode}</td>
                <td>{applicant.techStack || "없음"}</td>
                <td>{applicant.applicationStatus || "상태 없음"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pglbox">
          <div className="pgl">
            <button
              disabled={pageIndex === 1}
              onClick={() => onPageChange(pageIndex - 1)}
              className="page-btn"
            >
              <FaChevronLeft />
            </button>
            <span>
              {pageIndex} / {totalPage}
            </span>
            <button
              disabled={pageIndex >= totalPage}
              onClick={() => onPageChange(pageIndex + 1)}
              className="page-btn"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {modalType && (
        <EmailTemplateModal
          open={isModalOpen}
          type={modalType}
          onClose={() => {
            setIsModalOpen(false);
            setModalType(null);
          }}
          onConfirm={async (formData) => {
            const selectedApplicationIds = selectedRows.map((rowIndex) =>
              parseInt(applications[rowIndex].applicationId, 10)
            );

            try {
              await applicantService.modifyApplicationStatus(jobPostingId, {
                applicationIds: selectedApplicationIds,
                applicationStatus:
                  modalType === "pass" ? "ACCEPTED" : "REJECTED",
                sendEmail: formData.sendEmail,
                emailContent: formData.content,
              });

              alert("지원자 상태가 성공적으로 변경되었습니다.");
              fetchApplications();
            } catch (error) {
              console.error("지원자 상태 변경 실패:", error);
              alert("상태 변경 중 오류가 발생했습니다.");
            }
          }}
        />
      )}

      <ResumePreviewModal
        open={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        resumeUrl={resumeUrl}
        applicantName={resumeApplicationName}
      />
    </div>
  );
};

export default ApplicantList;
