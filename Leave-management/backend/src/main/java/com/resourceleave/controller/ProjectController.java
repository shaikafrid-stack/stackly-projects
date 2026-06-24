package com.resourceleave.controller;

import com.resourceleave.dto.ProjectDTO;
import com.resourceleave.model.*;
import com.resourceleave.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private EmployeeProjectRepository employeeProjectRepository;

    @GetMapping
    public ResponseEntity<?> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Project> projects;
        if (search != null && !search.isEmpty()) {
            projects = projectRepository.findByProjectNameContainingIgnoreCase(search, pageable);
        } else {
            projects = projectRepository.findAll(pageable);
        }
        Page<ProjectDTO.ProjectResponse> response = projects.map(p -> {
            long count = employeeProjectRepository.countEmployeesByProject(p.getId());
            return new ProjectDTO.ProjectResponse(p, count);
        });
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectDTO.CreateRequest req) {
        Project p = new Project();
        p.setProjectName(req.getProjectName());
        p.setDescription(req.getDescription());
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
        p.setStatus(req.getStatus() != null ? req.getStatus() : Project.Status.ACTIVE);
        projectRepository.save(p);
        return ResponseEntity.ok(new ProjectDTO.ProjectResponse(p, 0));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDTO.CreateRequest req) {
        Project p = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        p.setProjectName(req.getProjectName());
        p.setDescription(req.getDescription());
        p.setStartDate(req.getStartDate());
        p.setEndDate(req.getEndDate());
        p.setStatus(req.getStatus());
        projectRepository.save(p);
        long count = employeeProjectRepository.countEmployeesByProject(p.getId());
        return ResponseEntity.ok(new ProjectDTO.ProjectResponse(p, count));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Project deleted"));
    }

    record MessageResponse(String message) {}
}
