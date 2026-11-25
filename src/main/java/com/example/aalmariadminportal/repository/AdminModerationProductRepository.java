package com.example.aalmariadminportal.repository;

import com.example.aalmariadminportal.model.AdminModerationProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdminModerationProductRepository extends JpaRepository<AdminModerationProduct, Long> {

    @Query("SELECT p FROM AdminModerationProduct p LEFT JOIN FETCH p.seller ORDER BY p.id DESC")
    List<AdminModerationProduct> findAllForModeration();
}
