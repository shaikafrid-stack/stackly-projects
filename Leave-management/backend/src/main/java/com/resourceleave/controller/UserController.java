package com.resourceleave.controller;

import com.resourceleave.dto.AuthDTO;
import com.resourceleave.model.User;
import com.resourceleave.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        List<User> users;
        if (search != null && !search.isEmpty()) {
            users = userRepository.findByNameContainingIgnoreCase(search);
        } else if (role != null && !role.isEmpty()) {
            users = userRepository.findByRole(User.Role.valueOf(role.toUpperCase()));
        } else {
            users = userRepository.findAll();
        }
        return ResponseEntity.ok(users.stream().map(AuthDTO.UserDTO::new).collect(Collectors.toList()));
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> getEmployees() {
        List<AuthDTO.UserDTO> employees = userRepository.findByRole(User.Role.EMPLOYEE)
                .stream().map(AuthDTO.UserDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(employees);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted"));
    }

    record MessageResponse(String message) {}
}
