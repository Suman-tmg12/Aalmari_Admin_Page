package com.example.aalmariadminportal.dto;

public record AdminModerationProductResponse(
        Long id,
        String title,
        String store,
        String category,
        Integer price,
        Integer stock,
        boolean active,
        String approvalStatus
) {
}
