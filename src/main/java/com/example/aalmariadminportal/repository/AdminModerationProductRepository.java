package com.example.aalmariadminportal.repository;

import com.example.aalmariadminportal.model.AdminModerationProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

public interface AdminModerationProductRepository extends JpaRepository<AdminModerationProduct, Long> {

    @Query(value = "SELECT p FROM AdminModerationProduct p LEFT JOIN FETCH p.seller",
            countQuery = "SELECT COUNT(p) FROM AdminModerationProduct p")
    Page<AdminModerationProduct> findAllForModeration(Pageable pageable);

    long countByApprovalStatus(String approvalStatus);
}
