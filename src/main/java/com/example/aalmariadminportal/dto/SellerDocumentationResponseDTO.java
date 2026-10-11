package com.example.aalmariadminportal.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerDocumentationResponseDTO {
    private Long id;
    private Long userId;
    private String storeName;
    private String storeTagline;
    private String primaryCategory;
    private String businessEmail;
    private String phoneNumber;
    private String businessRegistrationNumber;
    private String taxId;
    private String accountHolder;
    private String bankName;
    private String accountIban;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private DocumentsDTO documents;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentsDTO {
        private String govId;
        private String bizCert;
        private String addressProof;
    }

    // Helper method to convert Entity to DTO
    public static SellerDocumentationResponseDTO fromEntity(com.example.aalmariadminportal.model.SellerDocumentation doc) {
        SellerDocumentationResponseDTO dto = new SellerDocumentationResponseDTO();
        dto.setId(doc.getId());
        dto.setUserId(doc.getUserId());
        dto.setStoreName(doc.getStoreName());
        dto.setStoreTagline(doc.getStoreTagline());
        dto.setPrimaryCategory(doc.getPrimaryCategory());
        dto.setBusinessEmail(doc.getBusinessEmail());
        dto.setPhoneNumber(doc.getPhoneNumber());
        dto.setBusinessRegistrationNumber(doc.getBusinessRegistrationNumber());
        dto.setTaxId(doc.getTaxId());
        dto.setAccountHolder(doc.getAccountHolder());
        dto.setBankName(doc.getBankName());
        dto.setAccountIban(doc.getAccountIban());
        dto.setStatus(doc.getStatus());
        dto.setRejectionReason(doc.getRejectionReason());
        dto.setCreatedAt(doc.getCreatedAt());

        DocumentsDTO docs = new DocumentsDTO(
                doc.getDocGovIdPath(),
                doc.getDocBizCertPath(),
                doc.getDocAddressProofPath()
        );
        dto.setDocuments(docs);

        return dto;
    }
}