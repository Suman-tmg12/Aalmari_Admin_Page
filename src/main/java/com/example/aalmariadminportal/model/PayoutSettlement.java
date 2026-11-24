package com.example.aalmariadminportal.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payout_settlements")
public class PayoutSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "period", nullable = false, length = 20)
    private String period;

    @Column(name = "gross_amount", nullable = false)
    private Long grossAmount;

    @Column(name = "commission_percent", nullable = false)
    private Double commissionPercent;

    @Column(name = "commission_amount", nullable = false)
    private Long commissionAmount;

    @Column(name = "net_amount", nullable = false)
    private Long netAmount;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "reference", length = 100)
    private String reference;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public Long getGrossAmount() { return grossAmount; }
    public void setGrossAmount(Long grossAmount) { this.grossAmount = grossAmount; }

    public Double getCommissionPercent() { return commissionPercent; }
    public void setCommissionPercent(Double commissionPercent) { this.commissionPercent = commissionPercent; }

    public Long getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(Long commissionAmount) { this.commissionAmount = commissionAmount; }

    public Long getNetAmount() { return netAmount; }
    public void setNetAmount(Long netAmount) { this.netAmount = netAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

