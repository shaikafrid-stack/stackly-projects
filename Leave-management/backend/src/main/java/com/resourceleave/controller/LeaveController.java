package com.resourceleave.controller;

import com.resourceleave.dto.LeaveDTO;
import com.resourceleave.model.*;
import com.resourceleave.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leave")
public class LeaveController {

    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@Valid @RequestBody LeaveDTO.ApplyRequest req) {
        if (req.getEndDate().isBefore(req.getStartDate())) {
            return ResponseEntity.badRequest().body(new MessageResponse("End date must be after start date"));
        }
        User emp = getCurrentUser();
        LeaveRequest lr = new LeaveRequest();
        lr.setEmployee(emp);
        lr.setLeaveType(req.getLeaveType());
        lr.setStartDate(req.getStartDate());
        lr.setEndDate(req.getEndDate());
        lr.setReason(req.getReason());
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(new LeaveDTO.LeaveResponse(lr));
    }

    @GetMapping("/my")
    public ResponseEntity<?> myLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User emp = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<LeaveDTO.LeaveResponse> result = leaveRequestRepository
                .findByEmployee(emp, pageable)
                .map(LeaveDTO.LeaveResponse::new);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> allLeaves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<LeaveDTO.LeaveResponse> result;
        if (status != null && !status.isEmpty()) {
            LeaveRequest.Status s = LeaveRequest.Status.valueOf(status.toUpperCase());
            result = leaveRequestRepository.findByStatus(s, pageable).map(LeaveDTO.LeaveResponse::new);
        } else {
            result = leaveRequestRepository.findAll(pageable).map(LeaveDTO.LeaveResponse::new);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        if (lr.getStatus() != LeaveRequest.Status.PENDING) {
            return ResponseEntity.badRequest().body(new MessageResponse("Leave already processed"));
        }
        lr.setStatus(LeaveRequest.Status.APPROVED);
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(new LeaveDTO.LeaveResponse(lr));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
        if (lr.getStatus() != LeaveRequest.Status.PENDING) {
            return ResponseEntity.badRequest().body(new MessageResponse("Leave already processed"));
        }
        lr.setStatus(LeaveRequest.Status.REJECTED);
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(new LeaveDTO.LeaveResponse(lr));
    }

    record MessageResponse(String message) {}
}
