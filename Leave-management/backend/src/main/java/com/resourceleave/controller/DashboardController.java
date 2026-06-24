package com.resourceleave.controller;

import com.resourceleave.model.*;
import com.resourceleave.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private UserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private EmployeeProjectRepository employeeProjectRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", userRepository.count());
        data.put("totalProjects", projectRepository.count());
        data.put("totalLeaveRequests", leaveRequestRepository.count());
        data.put("pendingLeaves", leaveRequestRepository.countByStatus(LeaveRequest.Status.PENDING));
        data.put("approvedLeaves", leaveRequestRepository.countByStatus(LeaveRequest.Status.APPROVED));
        data.put("rejectedLeaves", leaveRequestRepository.countByStatus(LeaveRequest.Status.REJECTED));
        data.put("activeProjects", projectRepository.findByStatus(Project.Status.ACTIVE).size());
        data.put("employees", userRepository.findByRole(User.Role.EMPLOYEE).size());
        data.put("managers", userRepository.findByRole(User.Role.MANAGER).size());

        // Monthly leave trends
        int year = LocalDate.now().getYear();
        List<Object[]> monthly = leaveRequestRepository.countLeavesByMonth(year);
        List<Map<String, Object>> trends = new ArrayList<>();
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        Map<Integer, Long> monthMap = new HashMap<>();
        for (Object[] row : monthly) {
            monthMap.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        for (int i = 1; i <= 12; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", months[i - 1]);
            m.put("count", monthMap.getOrDefault(i, 0L));
            trends.add(m);
        }
        data.put("monthlyTrends", trends);

        // Leave by status for chart
        List<Map<String, Object>> leaveByStatus = new ArrayList<>();
        leaveByStatus.add(Map.of("name", "Pending", "value", leaveRequestRepository.countByStatus(LeaveRequest.Status.PENDING)));
        leaveByStatus.add(Map.of("name", "Approved", "value", leaveRequestRepository.countByStatus(LeaveRequest.Status.APPROVED)));
        leaveByStatus.add(Map.of("name", "Rejected", "value", leaveRequestRepository.countByStatus(LeaveRequest.Status.REJECTED)));
        data.put("leaveByStatus", leaveByStatus);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/manager")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> managerDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalEmployees", userRepository.findByRole(User.Role.EMPLOYEE).size());
        data.put("activeProjects", projectRepository.findByStatus(Project.Status.ACTIVE).size());
        data.put("pendingLeaves", leaveRequestRepository.countByStatus(LeaveRequest.Status.PENDING));
        data.put("totalAssignments", employeeProjectRepository.count());
        data.put("recentLeaves", leaveRequestRepository.findByStatus(LeaveRequest.Status.PENDING)
                .stream().limit(5)
                .map(lr -> Map.of(
                        "id", lr.getId(),
                        "employeeName", lr.getEmployee().getName(),
                        "leaveType", lr.getLeaveType().name(),
                        "startDate", lr.getStartDate().toString(),
                        "endDate", lr.getEndDate().toString(),
                        "status", lr.getStatus().name()
                )).toList());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/employee")
    public ResponseEntity<?> employeeDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Map<String, Object> data = new HashMap<>();
        List<LeaveRequest> myLeaves = leaveRequestRepository.findByEmployee(user);
        data.put("totalLeaves", myLeaves.size());
        data.put("pendingLeaves", myLeaves.stream().filter(l -> l.getStatus() == LeaveRequest.Status.PENDING).count());
        data.put("approvedLeaves", myLeaves.stream().filter(l -> l.getStatus() == LeaveRequest.Status.APPROVED).count());
        data.put("assignedProjects", employeeProjectRepository.findByEmployee(user).size());
        data.put("recentLeaves", myLeaves.stream().limit(5).map(lr -> Map.of(
                "id", lr.getId(),
                "leaveType", lr.getLeaveType().name(),
                "startDate", lr.getStartDate().toString(),
                "endDate", lr.getEndDate().toString(),
                "status", lr.getStatus().name()
        )).toList());
        return ResponseEntity.ok(data);
    }
}
