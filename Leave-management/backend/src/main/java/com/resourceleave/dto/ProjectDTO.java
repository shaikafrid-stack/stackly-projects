package com.resourceleave.dto;

import com.resourceleave.model.EmployeeProject;
import com.resourceleave.model.Project;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class ProjectDTO {

    public static class CreateRequest {
        @NotBlank(message = "Project name is required")
        private String projectName;
        private String description;
        @NotNull(message = "Start date is required")
        private LocalDate startDate;
        private LocalDate endDate;
        private Project.Status status = Project.Status.ACTIVE;

        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
        public Project.Status getStatus() { return status; }
        public void setStatus(Project.Status status) { this.status = status; }
    }

    public static class ProjectResponse {
        private Long id;
        private String projectName;
        private String description;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private long employeeCount;

        public ProjectResponse(Project p, long employeeCount) {
            this.id = p.getId();
            this.projectName = p.getProjectName();
            this.description = p.getDescription();
            this.startDate = p.getStartDate();
            this.endDate = p.getEndDate();
            this.status = p.getStatus().name();
            this.employeeCount = employeeCount;
        }

        public Long getId() { return id; }
        public String getProjectName() { return projectName; }
        public String getDescription() { return description; }
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public String getStatus() { return status; }
        public long getEmployeeCount() { return employeeCount; }
    }

    public static class AssignRequest {
        @NotNull
        private Long employeeId;
        @NotNull
        private Long projectId;

        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
    }

    public static class AssignmentResponse {
        private Long id;
        private Long employeeId;
        private String employeeName;
        private Long projectId;
        private String projectName;
        private String assignedDate;

        public AssignmentResponse(EmployeeProject ep) {
            this.id = ep.getId();
            this.employeeId = ep.getEmployee().getId();
            this.employeeName = ep.getEmployee().getName();
            this.projectId = ep.getProject().getId();
            this.projectName = ep.getProject().getProjectName();
            this.assignedDate = ep.getAssignedDate() != null ? ep.getAssignedDate().toString() : null;
        }

        public Long getId() { return id; }
        public Long getEmployeeId() { return employeeId; }
        public String getEmployeeName() { return employeeName; }
        public Long getProjectId() { return projectId; }
        public String getProjectName() { return projectName; }
        public String getAssignedDate() { return assignedDate; }
    }
}
