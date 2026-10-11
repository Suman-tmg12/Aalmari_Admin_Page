package com.example.aalmariadminportal.controller;

import com.example.aalmariadminportal.dto.SellerDocumentationResponseDTO;
import com.example.aalmariadminportal.model.HeroSlide;
import com.example.aalmariadminportal.service.HeroSlideService;
import com.example.aalmariadminportal.service.S3Service;
import com.example.aalmariadminportal.service.SellerDocumentationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private SellerDocumentationService documentationService;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private HeroSlideService heroSlideService;

    // ============================================
    // SELLER DOCUMENTATION ENDPOINTS
    // ============================================

    // Get all seller documentation applications
    @GetMapping("/seller-documentation")
    public ResponseEntity<List<SellerDocumentationResponseDTO>> getAllSellerDocumentation() {
        List<SellerDocumentationResponseDTO> applications = documentationService.getAllApplications();
        return ResponseEntity.ok(applications);
    }

    // Get applications by status (pending, approved, rejected)
    @GetMapping("/seller-documentation/status/{status}")
    public ResponseEntity<List<SellerDocumentationResponseDTO>> getSellerDocumentationByStatus(@PathVariable String status) {
        List<SellerDocumentationResponseDTO> applications = documentationService.getApplicationsByStatus(status);
        return ResponseEntity.ok(applications);
    }

    // Approve application
    @PostMapping("/seller-documentation/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveSellerApplication(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        boolean success = documentationService.approveApplication(id);

        if (success) {
            response.put("success", true);
            response.put("message", "Application approved successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Failed to approve application");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Reject application
    @PostMapping("/seller-documentation/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectSellerApplication(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody) {

        Map<String, Object> response = new HashMap<>();
        String reason = requestBody.getOrDefault("reason", "No reason provided");
        boolean success = documentationService.rejectApplication(id, reason);

        if (success) {
            response.put("success", true);
            response.put("message", "Application rejected successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Failed to reject application");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Get pending count for dashboard badges
    @GetMapping("/seller-documentation/pending-count")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        Map<String, Long> response = new HashMap<>();
        long count = documentationService.getPendingCount();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // HERO SLIDE / BANNER CMS ENDPOINTS
    // ============================================

    // Upload image to S3
    @PostMapping("/upload-slide-image")
    public ResponseEntity<Map<String, Object>> uploadSlideImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validate file
            if (file.isEmpty() || file.getOriginalFilename() == null || file.getOriginalFilename().isEmpty()) {
                response.put("success", false);
                response.put("message", "No file provided");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "Invalid file type. Only images are allowed.");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size exceeds 5MB limit");
                return ResponseEntity.badRequest().body(response);
            }

            // Upload to S3
            String s3Url = s3Service.uploadFile(file, "hero-slides");

            response.put("success", true);
            response.put("imageUrl", s3Url);
            response.put("message", "Image uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get all hero slides
    @GetMapping("/hero-slides")
    public ResponseEntity<Map<String, Object>> getAllHeroSlides() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<HeroSlide> slides = heroSlideService.getAllSlides();

            // Convert to simple format for frontend
            List<Map<String, Object>> slideList = slides.stream().map(s -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", s.getId());
                map.put("title", s.getTitle());
                map.put("subtitle", s.getSubtitle());
                map.put("ctaText", s.getCtaText());
                map.put("ctaUrl", s.getCtaUrl());
                map.put("imageUrl", s.getImageUrl());
                map.put("priority", s.getPriority());
                map.put("active", s.getActive());
                return map;
            }).collect(Collectors.toList());

            response.put("success", true);
            response.put("slides", slideList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch slides: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Create or update hero slide
    @PostMapping("/hero-slides")
    public ResponseEntity<Map<String, Object>> saveHeroSlide(@RequestBody Map<String, Object> slideData) {
        Map<String, Object> response = new HashMap<>();

        try {
            HeroSlide slide = new HeroSlide();

            // Check if it's an update
            if (slideData.containsKey("id") && slideData.get("id") != null && !slideData.get("id").toString().isEmpty()) {
                Long id = Long.valueOf(slideData.get("id").toString());
                Optional<HeroSlide> existing = heroSlideService.getSlideById(id);
                if (existing.isPresent()) {
                    slide = existing.get();
                }
            }

            // Set fields
            slide.setTitle((String) slideData.get("title"));
            slide.setSubtitle((String) slideData.get("subtitle"));
            slide.setCtaText((String) slideData.get("ctaText"));
            slide.setCtaUrl((String) slideData.get("ctaUrl"));
            slide.setImageUrl((String) slideData.get("imageUrl"));
            slide.setPriority(Integer.valueOf(slideData.get("priority").toString()));
            slide.setActive(Boolean.valueOf(slideData.get("active").toString()));

            HeroSlide saved = heroSlideService.createSlide(slide);

            response.put("success", true);
            response.put("message", slide.getId() != null ? "Slide updated successfully" : "Slide created successfully");
            response.put("slideId", saved.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to save slide: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Delete hero slide
    @DeleteMapping("/hero-slides/{id}")
    public ResponseEntity<Map<String, Object>> deleteHeroSlide(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            heroSlideService.deleteSlide(id);
            response.put("success", true);
            response.put("message", "Slide deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete slide: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Toggle slide active status
    @PostMapping("/hero-slides/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleSlideStatus(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<HeroSlide> optional = heroSlideService.getSlideById(id);
            if (optional.isPresent()) {
                HeroSlide slide = optional.get();
                slide.setActive(!slide.getActive());
                heroSlideService.createSlide(slide);

                response.put("success", true);
                response.put("message", "Slide status updated");
                response.put("active", slide.getActive());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Slide not found");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to toggle slide: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}