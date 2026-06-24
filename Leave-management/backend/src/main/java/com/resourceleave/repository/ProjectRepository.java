package com.resourceleave.repository;

import com.resourceleave.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(Project.Status status);
    Page<Project> findByProjectNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Project> findAll(Pageable pageable);
}
