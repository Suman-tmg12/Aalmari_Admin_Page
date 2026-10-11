package com.example.aalmariadminportal.repository;

import com.example.aalmariadminportal.model.SellerDocumentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SellerDocumentationRepository extends JpaRepository<SellerDocumentation, Long> {

    // Find all by status (pending, approved, rejected)
    List<SellerDocumentation> findByStatus(String status);

    // Find all ordered by creation date
    List<SellerDocumentation> findAllByOrderByCreatedAtDesc();

    // Count by status
    long countByStatus(String status);
}