package com.resourceleave.repository;

import com.resourceleave.model.EmployeeProject;
import com.resourceleave.model.User;
import com.resourceleave.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeProjectRepository extends JpaRepository<EmployeeProject, Long> {
    List<EmployeeProject> findByEmployee(User employee);
    List<EmployeeProject> findByProject(Project project);
    boolean existsByEmployeeAndProject(User employee, Project project);

    @Query("SELECT ep FROM EmployeeProject ep JOIN FETCH ep.employee JOIN FETCH ep.project")
    List<EmployeeProject> findAllWithDetails();

    @Query("SELECT COUNT(DISTINCT ep.employee) FROM EmployeeProject ep WHERE ep.project.id = :projectId")
    long countEmployeesByProject(Long projectId);
}
