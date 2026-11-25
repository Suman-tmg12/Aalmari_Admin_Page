package com.example.aalmariadminportal.controller;

import com.example.aalmariadminportal.dto.AdminModerationProductResponse;
import com.example.aalmariadminportal.service.AdminModerationProductService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductModerationController {

    private final AdminModerationProductService productService;

    public AdminProductModerationController(AdminModerationProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<AdminModerationProductResponse> getProducts() {
        return productService.getProducts();
    }

    @PostMapping("/{id}/active")
    public ResponseEntity<?> setProductActive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        Boolean active = request.get("active");
        if (active == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "The active field must be true or false."));
        }

        try {
            return ResponseEntity.ok(productService.setActive(id, active));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approval")
    public ResponseEntity<?> setProductApprovalStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        if (status == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "The status must be APPROVED or REJECTED."));
        }

        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
        if (!normalizedStatus.equals("APPROVED") && !normalizedStatus.equals("REJECTED")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "The status must be APPROVED or REJECTED."));
        }

        try {
            return ResponseEntity.ok(productService.setApprovalStatus(id, normalizedStatus));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
