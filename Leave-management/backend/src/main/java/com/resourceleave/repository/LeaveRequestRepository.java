package com.resourceleave.repository;

import com.resourceleave.model.LeaveRequest;
import com.resourceleave.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee(User employee);
    Page<LeaveRequest> findByEmployee(User employee, Pageable pageable);
    Page<LeaveRequest> findAll(Pageable pageable);
    Page<LeaveRequest> findByStatus(LeaveRequest.Status status, Pageable pageable);
    List<LeaveRequest> findByStatus(LeaveRequest.Status status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = :status")
    long countByStatus(LeaveRequest.Status status);

    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :empId AND l.status = 'APPROVED' AND l.startDate <= :date AND l.endDate >= :date")
    List<LeaveRequest> findApprovedLeaveForEmployeeOnDate(Long empId, LocalDate date);

    @Query("SELECT MONTH(l.startDate) as month, COUNT(l) as count FROM LeaveRequest l WHERE YEAR(l.startDate) = :year GROUP BY MONTH(l.startDate)")
    List<Object[]> countLeavesByMonth(int year);
}
