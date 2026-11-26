package com.example.aalmariadminportal.dto;

import java.util.List;

public record AdminModerationProductPageResponse(
        List<AdminModerationProductResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        long pendingCount,
        boolean first,
        boolean last
) {
}
