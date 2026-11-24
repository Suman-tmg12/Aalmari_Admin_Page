package com.example.aalmariadminportal.repository;

import com.example.aalmariadminportal.model.PayoutSettlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayoutSettlementRepository extends JpaRepository<PayoutSettlement, Long> {
    Optional<PayoutSettlement> findBySellerIdAndPeriod(Long sellerId, String period);
    List<PayoutSettlement> findAllByOrderByCreatedAtDesc();
}

