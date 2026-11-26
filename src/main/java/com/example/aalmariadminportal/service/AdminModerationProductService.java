package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.dto.AdminModerationProductResponse;
import com.example.aalmariadminportal.dto.AdminModerationProductPageResponse;
import com.example.aalmariadminportal.model.AdminModerationProduct;
import com.example.aalmariadminportal.repository.AdminModerationProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
public class AdminModerationProductService {

    private final AdminModerationProductRepository productRepository;

    public AdminModerationProductService(AdminModerationProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public AdminModerationProductPageResponse getProducts(int page, int size) {
        Page<AdminModerationProductResponse> products = productRepository.findAllForModeration(
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))
                .map(this::toResponse);
        return new AdminModerationProductPageResponse(
                products.getContent(),
                products.getNumber(),
                products.getSize(),
                products.getTotalElements(),
                products.getTotalPages(),
                productRepository.countByApprovalStatus("PENDING"),
                products.isFirst(),
                products.isLast());
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
