package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.model.MarketplaceSetting;
import com.example.aalmariadminportal.repository.MarketplaceSettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarketplaceSettingsServiceTests {

    @Mock
    private MarketplaceSettingRepository settingRepository;

    @InjectMocks
    private MarketplaceSettingsService settingsService;

    @Test
    void getPlatformNameUsesTheDefaultUntilOneIsSaved() {
        when(settingRepository.findById(MarketplaceSettingsService.PLATFORM_NAME_KEY))
                .thenReturn(Optional.empty());

        assertEquals(MarketplaceSettingsService.DEFAULT_PLATFORM_NAME, settingsService.getPlatformName());
    }

    @Test
    void updatePlatformNameTrimsAndPersistsTheValue() {
        assertEquals("My Marketplace", settingsService.updatePlatformName("  My Marketplace  "));

        ArgumentCaptor<MarketplaceSetting> settingCaptor = ArgumentCaptor.forClass(MarketplaceSetting.class);
        verify(settingRepository).save(settingCaptor.capture());
        assertEquals(MarketplaceSettingsService.PLATFORM_NAME_KEY, settingCaptor.getValue().getKey());
        assertEquals("My Marketplace", settingCaptor.getValue().getValue());
    }

    @Test
    void updatePlatformNameRejectsBlankAndOverlongValues() {
        assertThrows(IllegalArgumentException.class, () -> settingsService.updatePlatformName("  "));
        assertThrows(IllegalArgumentException.class,
                () -> settingsService.updatePlatformName("a".repeat(MarketplaceSettingsService.MAX_PLATFORM_NAME_LENGTH + 1)));
    }
}
