package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.model.AdminProfile;
import com.example.aalmariadminportal.repository.AdminProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Iterator;

@Service
public class AdminProfileService {

    private static final long MAX_AVATAR_BYTES = 5L * 1024 * 1024;
    private static final int MAX_IMAGE_DIMENSION = 6000;
    private static final long MAX_IMAGE_PIXELS = 25_000_000L;

    private final AdminProfileRepository profileRepository;
    private final S3Service s3Service;

    public AdminProfileService(AdminProfileRepository profileRepository, S3Service s3Service) {
        this.profileRepository = profileRepository;
        this.s3Service = s3Service;
    }

    @Transactional(readOnly = true)
    public String getAvatarUrl(String username) {
        return profileRepository.findById(username)
                .map(AdminProfile::getAvatarUrl)
                .orElse(null);
    }

    @Transactional
    public String uploadAvatar(String username, MultipartFile file) throws IOException {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("The signed-in admin account could not be identified.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Choose a profile picture to upload.");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new IllegalArgumentException("Profile pictures must be 5 MB or smaller.");
        }

        byte[] imageBytes = file.getBytes();
        String format = validateImage(imageBytes);
        String avatarUrl = s3Service.uploadAdminAvatar(file, format);

        AdminProfile profile = profileRepository.findById(username)
                .orElseGet(() -> new AdminProfile(username, avatarUrl));
        profile.setAvatarUrl(avatarUrl);
        profileRepository.save(profile);
        return avatarUrl;
    }

    private String validateImage(byte[] imageBytes) throws IOException {
        try (ImageInputStream imageInput = ImageIO.createImageInputStream(new ByteArrayInputStream(imageBytes))) {
            if (imageInput == null) {
                throw new IllegalArgumentException("Upload a valid PNG or JPEG image.");
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageInput);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException("Upload a valid PNG or JPEG image.");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(imageInput, true, true);
                String format = reader.getFormatName().toLowerCase(java.util.Locale.ROOT);
                if (!format.equals("png") && !format.equals("jpeg")) {
                    throw new IllegalArgumentException("Only PNG and JPEG profile pictures are supported.");
                }

                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width < 1 || height < 1
                        || width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION
                        || (long) width * height > MAX_IMAGE_PIXELS) {
                    throw new IllegalArgumentException("The image dimensions are too large.");
                }
                return format;
            } finally {
                reader.dispose();
            }
        }
    }
}
