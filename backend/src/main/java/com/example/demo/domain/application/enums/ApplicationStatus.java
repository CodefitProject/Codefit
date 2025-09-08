package com.example.demo.domain.application.enums;

public enum ApplicationStatus {
    PENDING("서류검토"),
    ACCEPTED("서류합격"),
    REJECTED("서류탈락");

    private final String label;

    ApplicationStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static ApplicationStatus from(String status) {
        for (ApplicationStatus s : values()) {
            if (s.name().equalsIgnoreCase(status)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + status);
    }
}
