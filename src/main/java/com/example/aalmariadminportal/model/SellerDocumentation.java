package com.example.aalmariadminportal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "seller_documentation")
public class SellerDocumentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "store_banner_path")
    private String storeBannerPath;

    @Column(name = "store_logo_path")
    private String storeLogoPath;

    @Column(name = "store_name")
    private String storeName;

    @Column(name = "store_tagline")
    private String storeTagline;

    @Column(name = "primary_category")
    private String primaryCategory;

    @Column(name = "business_email")
    private String businessEmail;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "business_registration_number")
    private String businessRegistrationNumber;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "doc_gov_id_path")
    private String docGovIdPath;

    @Column(name = "doc_biz_cert_path")
    private String docBizCertPath;

    @Column(name = "doc_address_proof_path")
    private String docAddressProofPath;

    @Column(name = "account_holder")
    private String accountHolder;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_iban")
    private String accountIban;

    @Column(name = "agree_terms")
    private Boolean agreeTerms;

    @Column(name = "status")
    private String status; // pending, approved, rejected

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}