package com.resourceleave.controller;

import com.resourceleave.dto.ProjectDTO;
import com.resourceleave.model.*;
import com.resourceleave.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class EmployeeProjectController {

    @Autowired private EmployeeProjectRepository employeeProjectRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;

    @PostMapping("/assign-project")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> assignProject(@Valid @RequestBody ProjectDTO.AssignRequest req) {
        User emp = userRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (employeeProjectRepository.existsByEmployeeAndProject(emp, project)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Employee already assigned to this project"));
        }
        EmployeeProject ep = new EmployeeProject();
        ep.setEmployee(emp);
        ep.setProject(project);
        employeeProjectRepository.save(ep);
        return ResponseEntity.ok(new ProjectDTO.AssignmentResponse(ep));
    }

    @GetMapping("/employee-projects")
    public ResponseEntity<?> getAssignments() {
        List<ProjectDTO.AssignmentResponse> list = employeeProjectRepository
                .findAllWithDetails()
                .stream()
                .map(ProjectDTO.AssignmentResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    record MessageResponse(String message) {}
}
