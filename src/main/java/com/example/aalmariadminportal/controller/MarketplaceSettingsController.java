package com.example.aalmariadminportal.controller;

import com.example.aalmariadminportal.service.MarketplaceSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings/marketplace")
public class MarketplaceSettingsController {

    private final MarketplaceSettingsService settingsService;

    public MarketplaceSettingsController(MarketplaceSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getSettings() {
        return ResponseEntity.ok(Map.of("platformName", settingsService.getPlatformName()));
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, String> request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Platform name is required."));
        }

        try {
            String platformName = settingsService.updatePlatformName(request.get("platformName"));
            return ResponseEntity.ok(Map.of("platformName", platformName));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
