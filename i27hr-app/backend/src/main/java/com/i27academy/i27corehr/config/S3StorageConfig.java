package com.i27academy.i27corehr.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * Provides the {@link S3Client} used by {@code S3DocumentStorageService}, active only when
 * {@code app.documents.storage-type=s3}. Credentials always come from the AWS SDK's default
 * credential provider chain (EC2 instance role, ECS task role, or the caller's local AWS CLI
 * profile/env vars) — this application never reads or stores AWS access keys itself.
 */
@Configuration
@ConditionalOnProperty(prefix = "app.documents", name = "storage-type", havingValue = "s3")
public class S3StorageConfig {

    @Bean
    public S3Client s3Client(@Value("${app.documents.s3-region:}") String region) {
        if (region == null || region.isBlank()) {
            throw new IllegalStateException(
                    "DOCUMENT_STORAGE_TYPE=s3 requires DOCUMENT_S3_REGION to be set.");
        }
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .build();
    }
}
