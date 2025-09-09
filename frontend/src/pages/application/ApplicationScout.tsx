import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./ApplicationScout.css";
import Header from "../../components/Header/Header.tsx";
import EmailTemplateModal from "./EmailTemplateModal.tsx";
import ResumePreviewModal from "./ResumePreviewModal.tsx";
import ApplicationService, {
  ScoutDto,
  TechStackDto,
  ScoutRequestDto,
} from "../../services/applicationService.ts";
import AuthService from "../../services/authService.tsx";

type ExtendedScoutDto = ScoutDto & {
  chk?: boolean;
  stacks?: string[];
};

const ApplicantScout: React.FC = () => {
  const { jobPostingId } = useParams<{ jobPostingId: string }>();

  const [scouts, setScouts] = useState<ExtendedScoutDto[]>([]);
  const [techStacks, setTechStacks] = useState<TechStackDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<"unscouted" | "scouted">(
    "unscouted"
  );
  const [mbtiCount, setMbtiCount] = useState(0);
  const [techStackFilter, setTechStackFilter] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  //이력서 PDF
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string>("");
  const [selectedApplicantName, setSelectedApplicantName] =
    useState<string>("");

  const [showScoutModal, setShowScoutModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // 데이터 조회
  const fetchScouts = async () => {
    const requestDto: ScoutRequestDto = {
      page: pageIndex,
      pageSize,
      scoutFilter: statusFilter,
      mbtiFilters: [],
      mbtiCount,
      techStackFilter,
    };
    try {
      const data = await ApplicationService.getScoutsByJobPostingId(
        Number(jobPostingId),
        requestDto
      );
      setScouts((prev) => {
        const prevMap = new Map(prev.map((s) => [s.applicationId, s.chk]));
        return data.result.map((s) => ({
          ...s,
          chk: prevMap.get(s.applicationId) ?? false,
        }));
      });
      setTotalPage(data.totalPage);
      setSelectAll(false);
    } catch (err) {
      console.error("스카웃 대상자 조회 실패:", err);
    }
  };

  const fetchTechStacks = async () => {
    try {
      const data = await ApplicationService.getTechStacks();
      setTechStacks(data);
    } catch (err) {
      console.error("기술 스택 조회 실패:", err);
    }
  };

  useEffect(() => {
    fetchTechStacks();
  }, []);

  useEffect(() => {
    checkAccess();
    fetchScouts();
  }, [statusFilter, mbtiCount, techStackFilter, pageIndex]);

  useEffect(() => {
    setScouts((prev) => prev.map((s) => ({ ...s, chk: false })));
    setSelectAll(false);
  }, [statusFilter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openResume = (scout: ExtendedScoutDto) => {
    if (!scout.resumeFileName) return;
    setSelectedResumeUrl(scout.resumeFileName);
    setSelectedApplicantName(scout.name);
    setShowResumeModal(true);
  };

  const handleScoutAll = () => {
    const selected = scouts.filter((s) => s.chk);
    if (selected.length === 0) {
      alert("스카웃할 개발자를 선택해주세요.");
      return;
    }
    setShowScoutModal(true);
  };
  const handleConfirmScout = async (formData: {
    date?: string;
    content: string;
    sendEmail: boolean;
  }) => {
    const selected = scouts.filter((s) => s.chk);

    try {
      await fetch(`/api/scout/${jobPostingId}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIdList: selected.map((s) => Number(s.userId)),
          emailList: selected.map((s) => s.email),
          emailContent: formData.content,
          sendEmail: formData.sendEmail,
        }),
      });

      alert("스카웃 추천 전송 완료");
      fetchScouts();
    } catch (err) {
      console.error("스카웃 추천 실패:", err);
    }
  };

  const onPageChange = (newPage: number) => {
    setPageIndex(newPage);
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setScouts((prev) => prev.map((s) => ({ ...s, chk: newValue })));
  };

  const toggleTechStack = (value: string) => {
    setTechStackFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPageIndex(1);
  };

  return (
    <>
      <Header />
      <div className="scout-page">
        <div className="header">
          <h2>개발자 매칭</h2>
        </div>

        {/* Filters */}
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "unscouted" | "scouted");
              setPageIndex(1);
            }}
          >
            <option value="unscouted">매칭가능한 유저</option>
            <option value="scouted">매칭을 제안한 유저</option>
          </select>

          <select
            value={mbtiCount.toString()}
            onChange={(e) => {
              setMbtiCount(Number(e.target.value));
              setPageIndex(1);
            }}
          >
            <option value="0">모든 MBTI</option>
            <option value="4">4개 이상만 보기</option>
            <option value="3">3개 이상만 보기</option>
            <option value="2">2개 이상만 보기</option>
            <option value="1">1개 이상만 보기</option>
          </select>

          {/* TechStack Multi Select */}
          <div className="multi-select" ref={dropdownRef}>
            <div
              className="multi-select-toggle"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {techStackFilter.length > 0
                ? techStackFilter.join(", ").length > 20
                  ? techStackFilter.join(", ").slice(0, 20) + "..."
                  : techStackFilter.join(", ")
                : "기술스택 선택"}
              <span className="arrow">▾</span>
            </div>
            {dropdownOpen && (
              <div className="multi-select-menu">
                {techStacks.map((stack) => (
                  <label key={stack.techStackId} className="techstack-checkbox">
                    <input
                      type="checkbox"
                      value={stack.techStackName}
                      checked={techStackFilter.includes(stack.techStackName)}
                      onChange={() => toggleTechStack(stack.techStackName)}
                    />
                    <span>{stack.techStackName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            className="btn-scout-all"
            onClick={handleScoutAll}
            disabled={statusFilter !== "unscouted"}
          >
            일괄 매칭 제안
          </button>
        </div>

        {/* Table */}
        <table className="scout-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
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
            </tr>
          </thead>
          <tbody>
            {scouts.map((s) => (
              <tr key={s.applicationId} className={s.chk ? "selected-row" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!s.chk}
                    onChange={(e) => {
                      const updatedScouts = scouts.map((p) =>
                        p.applicationId === s.applicationId
                          ? { ...p, chk: e.target.checked }
                          : p
                      );
                      setScouts(updatedScouts);
                      const allChecked = updatedScouts.every(
                        (item) => item.chk
                      );
                      setSelectAll(allChecked);
                    }}
                  />
                </td>
                <td>{s.applicationId}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.career}</td>
                <td>{s.currentPosition}</td>
                <td
                  className={`resume-link ${
                    !s.resumeFileName ? "disabled" : ""
                  }`}
                  onClick={() => openResume(s)}
                >
                  {s.resumeFileName ? "이력서 보기" : "이력서 없음"}
                </td>
                <td>{s.typeCode}</td>
                <td>{s.stacks?.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="page-btn"
            disabled={pageIndex === 1}
            onClick={() => onPageChange(pageIndex - 1)}
          >
            <FaChevronLeft />
          </button>
          <span>
            {pageIndex} / {totalPage}
          </span>
          <button
            className="page-btn"
            disabled={pageIndex >= totalPage}
            onClick={() => onPageChange(pageIndex + 1)}
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Resume Modal */}
        <ResumePreviewModal
          open={showResumeModal}
          onClose={() => setShowResumeModal(false)}
          resumeUrl={selectedResumeUrl}
          applicantName={selectedApplicantName}
        />

        {/* 스카웃 모달 */}
        {showScoutModal && (
          <EmailTemplateModal
            open={true}
            onClose={() => setShowScoutModal(false)}
            type="scout"
            onConfirm={handleConfirmScout}
          />
        )}
      </div>
    </>
  );
};

export default ApplicantScout;
