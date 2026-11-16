package com.i27academy.i27corehr.repository;

import com.i27academy.i27corehr.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {
    List<EmployeeDocument> findByEmployeeIdOrderByUploadedAtDesc(Long employeeId);

    List<EmployeeDocument> findAllByOrderByUploadedAtDesc();

    List<EmployeeDocument> findByEmployeeIdInOrderByUploadedAtDesc(List<Long> employeeIds);
}
