package com.example.demo.domain.application.repository;

import com.example.demo.domain.application.dto.ApplicationDto;
import com.example.demo.domain.application.enums.ApplicationStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;
import java.util.Objects;

@Repository
public class ApplicationRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int countApplicantsByJobPostingId(Long jobPostingId, String applicationStatus) {
        String sql;
        Object[] params;

        if (applicationStatus == null || applicationStatus.isBlank()) {
            sql = "SELECT COUNT(*) FROM job_applications WHERE job_posting_id = ?";
            params = new Object[]{jobPostingId};
        } else {
            sql = "SELECT COUNT(*) FROM job_applications WHERE job_posting_id = ? AND application_status = ?";
            params = new Object[]{jobPostingId, applicationStatus};
        }

        return jdbcTemplate.queryForObject(sql, Integer.class, params);
    }

    public List<String> findTechStacksByBaseUserId(Long baseUserId) {
        String sql = """
        SELECT t.tech_stack_name
        FROM base_user_tech_stacks b JOIN tech_stacks t 
        ON b.tech_stack_id = t.tech_stack_id
        WHERE b.base_user_id = ?
    """;

        return jdbcTemplate.query(
                sql,
                new Object[]{baseUserId},
                (rs, rowNum) -> rs.getString("tech_stack_name")
        );
    }

    public List<ApplicationDto> findApplicantsByJobPostingId(Long jobPostingId, int page, int pageSize, String status) {
        String sql = "CALL GetApplicationList(?, ?, ?, ?)";

        return jdbcTemplate.query(
                sql,
                new Object[]{jobPostingId, page, pageSize, status},
                (ResultSet rs, int rowNum) -> {
                    Long baseUserId = rs.getLong("base_user_id");
                    List<String> stacks = findTechStacksByBaseUserId(baseUserId);

                    return ApplicationDto.builder()
                            .name(rs.getString("name"))
                            .email(rs.getString("email"))
                            .career(Objects.toString(rs.getString("career"), "없음"))
                            .currentPosition(Objects.toString(rs.getString("current_position"), "없음"))
                            .typeCode(Objects.toString(rs.getString("type_code"), "없음"))
                            .applicationStatus(ApplicationStatus.from(rs.getString("application_status")).getLabel())
                            .stacks(stacks)
                            .applicationId(rs.getInt("application_id"))
                            .resumeFileName(rs.getString("resume_file_name"))
                            .userId(rs.getString("base_user_id"))
                            .build();
                }
        );
    }

    public int countScoutListByJobPostingId(  Long jobPostingId,
                                              String scoutFilter,
                                              String mbtiFilters,
                                              int mbtiCount,
                                              String techStackFilter) {
        String sql = "CALL GetScoutTotalCount(?, ?, ?, ?, ?)";
        return jdbcTemplate.queryForObject(sql, Integer.class, jobPostingId, scoutFilter, mbtiFilters, mbtiCount, techStackFilter);
    }

    public List<ApplicationDto> findUnappliedUsersByJobPostingId(
            Long jobPostingId,
            int page,
            int pageSize,
            String scoutFilter,
            String mbtiFilters,
            int mbtiCount,
            String techStackFilter
    ) {
        String sql = "CALL GetScoutList(?, ?, ?, ?, ?, ?, ?)";

        return jdbcTemplate.query(
                sql,
                new Object[]{jobPostingId, page, pageSize, scoutFilter, mbtiFilters, mbtiCount, techStackFilter},
                (ResultSet rs, int rowNum) -> {
                    Long baseUserId = rs.getLong("base_user_id");
                    List<String> stacks = findTechStacksByBaseUserId(baseUserId);

                    return ApplicationDto.builder()
                            .name(rs.getString("name"))
                            .email(rs.getString("email"))
                            .career(Objects.toString(rs.getString("career"), "없음"))
                            .currentPosition(Objects.toString(rs.getString("current_position"), "없음"))
                            .typeCode(Objects.toString(rs.getString("type_code"), "없음"))
                            .stacks(stacks)
                            .applicationId(rs.getInt("row_num"))
                            .resumeFileName(rs.getString("resume_file_name"))
                            .userId(rs.getString("base_user_id"))
                            .build();
                }
        );
    }






}
