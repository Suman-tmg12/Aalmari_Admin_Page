package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.model.AdminProfile;
import com.example.aalmariadminportal.repository.AdminProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminProfileServiceTests {

    @Mock
    private AdminProfileRepository profileRepository;

    @Mock
    private S3Service s3Service;

    @InjectMocks
    private AdminProfileService profileService;

    @Test
    void uploadAvatarStoresTheS3UrlForTheSignedInAdmin() throws Exception {
        when(profileRepository.findById("admin")).thenReturn(Optional.empty());
        when(s3Service.uploadAdminAvatar(any(), eq("png"))).thenReturn("https://images.example/admin.png");

        String avatarUrl = profileService.uploadAvatar("admin", pngFile());

        assertEquals("https://images.example/admin.png", avatarUrl);
        ArgumentCaptor<AdminProfile> profileCaptor = ArgumentCaptor.forClass(AdminProfile.class);
        verify(profileRepository).save(profileCaptor.capture());
        assertEquals("admin", profileCaptor.getValue().getUsername());
        assertEquals(avatarUrl, profileCaptor.getValue().getAvatarUrl());
    }

    @Test
    void uploadAvatarRejectsInvalidImageDataBeforeCallingS3() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", "not an image".getBytes(java.nio.charset.StandardCharsets.UTF_8));

        assertThrows(IllegalArgumentException.class, () -> profileService.uploadAvatar("admin", file));
        verifyNoInteractions(s3Service);
    }

    private MockMultipartFile pngFile() throws Exception {
        BufferedImage image = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return new MockMultipartFile("file", "avatar.png", "image/png", output.toByteArray());
    }
}
