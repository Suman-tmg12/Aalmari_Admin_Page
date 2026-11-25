package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.dto.AdminModerationProductResponse;
import com.example.aalmariadminportal.model.AdminModerationProduct;
import com.example.aalmariadminportal.repository.AdminModerationProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminModerationProductService {

    private final AdminModerationProductRepository productRepository;

    public AdminModerationProductService(AdminModerationProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminModerationProductResponse> getProducts() {
        return productRepository.findAllForModeration().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminModerationProductResponse setActive(Long productId, boolean active) {
        AdminModerationProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        product.setActive(active);
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public AdminModerationProductResponse setApprovalStatus(Long productId, String approvalStatus) {
        AdminModerationProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        product.setApprovalStatus(approvalStatus);
        return toResponse(productRepository.save(product));
    }

    private AdminModerationProductResponse toResponse(AdminModerationProduct product) {
        String store = "Unknown seller";
        if (product.getSeller() != null) {
            String fullName = ((product.getSeller().getFirstName() == null ? "" : product.getSeller().getFirstName())
                    + " " + (product.getSeller().getLastName() == null ? "" : product.getSeller().getLastName()))
                    .trim();
            store = fullName.isEmpty() ? "Seller #" + product.getSeller().getId() : fullName;
        }

        return new AdminModerationProductResponse(
                product.getId(),
                product.getName(),
                store,
                product.getCategory(),
                product.getPrice(),
                product.getStock(),
                Boolean.TRUE.equals(product.getActive()),
                product.getApprovalStatus());
    }
}
