package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.dto.SellerDocumentationResponseDTO;
import com.example.aalmariadminportal.model.SellerDocumentation;
import com.example.aalmariadminportal.repository.SellerDocumentationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerDocumentationService {

    @Autowired
    private SellerDocumentationRepository documentationRepository;

    // Inject the S3 base URL from properties
    @Value("${aws.s3.bucket.url}")
    private String s3BaseUrl;

    public List<SellerDocumentationResponseDTO> getAllApplications() {
        List<SellerDocumentation> applications = documentationRepository.findAllByOrderByCreatedAtDesc();
        return applications.stream()
                .map(this::convertToDTOWithS3Urls) // Use custom converter
                .collect(Collectors.toList());
    }

    public List<SellerDocumentationResponseDTO> getApplicationsByStatus(String status) {
        List<SellerDocumentation> applications = documentationRepository.findByStatus(status);
        return applications.stream()
                .map(this::convertToDTOWithS3Urls) // Use custom converter
                .collect(Collectors.toList());
    }

    // Custom converter that builds full S3 URLs for documents
    private SellerDocumentationResponseDTO convertToDTOWithS3Urls(SellerDocumentation doc) {
        // Use the existing fromEntity method to map basic fields
        SellerDocumentationResponseDTO dto = SellerDocumentationResponseDTO.fromEntity(doc);

        // Override document paths with full S3 URLs
        if (dto.getDocuments() != null) {
            dto.getDocuments().setGovId(buildS3Url(doc.getDocGovIdPath()));
            dto.getDocuments().setBizCert(buildS3Url(doc.getDocBizCertPath()));
            dto.getDocuments().setAddressProof(buildS3Url(doc.getDocAddressProofPath()));
        }

        return dto;
    }

    // Helper to build full URL from path
    private String buildS3Url(String path) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        // If it's already a full URL, return as is
        if (path.startsWith("http")) {
            return path;
        }
        // Remove leading slash if present
        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return s3BaseUrl + cleanPath;
    }

    public boolean approveApplication(Long id) {
        try {
            // FIXED SYNTAX ERROR HERE: Changed '() to' to '() ->'
            SellerDocumentation application = documentationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            application.setStatus("approved");
            documentationRepository.save(application);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean rejectApplication(Long id, String reason) {
        try {
            // FIXED SYNTAX ERROR HERE: Changed '() to' to '() ->'
            SellerDocumentation application = documentationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            application.setStatus("rejected");
            application.setRejectionReason(reason);
            documentationRepository.save(application);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public long getPendingCount() {
        return documentationRepository.countByStatus("pending");
    }
}