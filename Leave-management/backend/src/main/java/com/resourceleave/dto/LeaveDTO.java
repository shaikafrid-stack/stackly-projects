package com.resourceleave.dto;

import com.resourceleave.model.LeaveRequest;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class LeaveDTO {

    public static class ApplyRequest {
        @NotNull(message = "Leave type is required")
        private LeaveRequest.LeaveType leaveType;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        @NotBlank(message = "Reason is required")
        private String reason;

        public LeaveRequest.LeaveType getLeaveType() { return leaveType; }
        public void setLeaveType(LeaveRequest.LeaveType leaveType) { this.leaveType = leaveType; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class LeaveResponse {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private String employeeEmail;
        private String leaveType;
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;
        private String status;
        private String appliedAt;

        public LeaveResponse(LeaveRequest lr) {
            this.id = lr.getId();
            this.employeeId = lr.getEmployee().getId();
            this.employeeName = lr.getEmployee().getName();
            this.employeeEmail = lr.getEmployee().getEmail();
            this.leaveType = lr.getLeaveType().name();
            this.startDate = lr.getStartDate();
            this.endDate = lr.getEndDate();
            this.reason = lr.getReason();
            this.status = lr.getStatus().name();
            this.appliedAt = lr.getAppliedAt() != null ? lr.getAppliedAt().toString() : null;
        }

        public Long getId() { return id; }
        public Long getEmployeeId() { return employeeId; }
        public String getEmployeeName() { return employeeName; }
        public String getEmployeeEmail() { return employeeEmail; }
        public String getLeaveType() { return leaveType; }
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public String getReason() { return reason; }
        public String getStatus() { return status; }
        public String getAppliedAt() { return appliedAt; }
    }
}
