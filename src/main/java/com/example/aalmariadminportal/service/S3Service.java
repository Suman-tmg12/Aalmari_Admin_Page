package com.example.aalmariadminportal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.core.exception.SdkException;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.access-key-id}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Value("${aws.s3.bucket.url}")
    private String bucketUrl;

    @Value("${aws.s3.bucket.url1}")
    private String bucketUrl1;

    private S3Client s3Client;

    private S3Client getS3Client() {
        if (this.s3Client == null) {
            S3ClientBuilder builder = S3Client.builder()
                    .region(Region.of(region));

            if (hasText(accessKeyId) && hasText(secretAccessKey)) {
                builder.credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)));
            } else {
                builder.credentialsProvider(DefaultCredentialsProvider.create());
            }

            this.s3Client = builder.build();
        }
        return this.s3Client;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            String key = folder + "/" + filename;

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            getS3Client().putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Return the S3 URL
            return bucketUrl1 + key;

        } catch (S3Exception e) {
            throw new IOException("Failed to upload file to S3: " + e.getMessage());
        } catch (SdkException e) {
            throw new IOException("AWS credentials or S3 configuration is invalid: " + e.getMessage());
        }
    }

    public String uploadAdminAvatar(MultipartFile file, String imageFormat) throws IOException {
        String extension;
        String contentType;
        if ("png".equals(imageFormat)) {
            extension = ".png";
            contentType = "image/png";
        } else if ("jpeg".equals(imageFormat)) {
            extension = ".jpg";
            contentType = "image/jpeg";
        } else {
            throw new IllegalArgumentException("Only PNG and JPEG profile pictures are supported.");
        }

        String key = "admin-profile/" + UUID.randomUUID() + extension;
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            getS3Client().putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return bucketUrl1 + key;
        } catch (S3Exception e) {
            throw new IOException("Failed to upload admin profile picture to S3: " + e.getMessage(), e);
        } catch (SdkException e) {
            throw new IOException("AWS credentials or S3 configuration is invalid.", e);
        }
    }
}