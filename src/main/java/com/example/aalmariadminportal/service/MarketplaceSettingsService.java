package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.model.MarketplaceSetting;
import com.example.aalmariadminportal.repository.MarketplaceSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MarketplaceSettingsService {

    public static final String PLATFORM_NAME_KEY = "platformName";
    public static final String DEFAULT_PLATFORM_NAME = "Aalmari Multi-Vendor Online";
    public static final int MAX_PLATFORM_NAME_LENGTH = 80;

    private final MarketplaceSettingRepository settingRepository;

    public MarketplaceSettingsService(MarketplaceSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Transactional(readOnly = true)
    public String getPlatformName() {
        return settingRepository.findById(PLATFORM_NAME_KEY)
                .map(MarketplaceSetting::getValue)
                .orElse(DEFAULT_PLATFORM_NAME);
    }

    @Transactional
    public String updatePlatformName(String platformName) {
        if (platformName == null) {
            throw new IllegalArgumentException("Platform name is required.");
        }

        String normalizedName = platformName.trim();
        if (normalizedName.isEmpty()) {
            throw new IllegalArgumentException("Platform name cannot be blank.");
        }
        if (normalizedName.length() > MAX_PLATFORM_NAME_LENGTH) {
            throw new IllegalArgumentException(
                    "Platform name must be " + MAX_PLATFORM_NAME_LENGTH + " characters or fewer.");
        }

        settingRepository.save(new MarketplaceSetting(PLATFORM_NAME_KEY, normalizedName));
        return normalizedName;
    }
}
