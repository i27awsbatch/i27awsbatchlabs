package com.i27academy.i27corehr.repository;

import com.i27academy.i27corehr.entity.Employee;
import com.i27academy.i27corehr.entity.EmploymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<Employee> findByManagerIdOrderByFirstNameAsc(Long managerId);

    long countByEmploymentStatus(EmploymentStatus status);

    List<Employee> findTop5ByOrderByCreatedAtDesc();

    @Query("""
            select e from Employee e
            where (:dept = 'All' or e.department = :dept)
              and (:search = '' or lower(e.firstName) like %:search%
                   or lower(e.lastName) like %:search%
                   or lower(e.email) like %:search%)
            order by e.firstName asc
            """)
    Page<Employee> search(@Param("search") String search, @Param("dept") String dept, Pageable pageable);

    @Query("select distinct e.department from Employee e order by e.department asc")
    List<String> findDistinctDepartments();
}
