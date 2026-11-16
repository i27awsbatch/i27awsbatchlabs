package com.i27academy.i27corehr.storage;

import com.i27academy.i27corehr.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Stores each employee's documents in a private S3 bucket under {@code <employeeCode>/<original-file-name>}
 * — the same human-readable key layout used by {@link LocalDocumentStorageService} — so document
 * metadata and authorization in {@code DocumentService}/{@code DocumentController} stay unaware of
 * which physical backend is in use.
 *
 * <p>Active only when {@code app.documents.storage-type=s3}. Credentials come from the AWS SDK's
 * default credential provider chain (EC2/ECS task role in AWS, the developer's local AWS profile
 * when testing S3 mode locally) — never from application configuration.
 */
@Service
@ConditionalOnProperty(prefix = "app.documents", name = "storage-type", havingValue = "s3")
public class S3DocumentStorageService implements DocumentStorageService {

    private final S3Client s3Client;
    private final String bucket;

    public S3DocumentStorageService(S3Client s3Client, @Value("${app.documents.s3-bucket:}") String bucket) {
        if (bucket == null || bucket.isBlank()) {
            throw new IllegalStateException(
                    "DOCUMENT_STORAGE_TYPE=s3 requires DOCUMENT_S3_BUCKET to be set.");
        }
        this.s3Client = s3Client;
        this.bucket = bucket;
    }

    @Override
    public String store(MultipartFile file, String employeeCode) throws IOException {
        String safeEmployeeCode = sanitizeSegment(employeeCode);

        String original = Path.of(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file")
                .getFileName()
                .toString();
        String safeFileName = sanitizeFileName(original);

        try {
            String storedName = uniqueFileName(safeEmployeeCode, safeFileName);
            String key = safeEmployeeCode + "/" + storedName;
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .contentLength(file.getSize())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return key;
        } catch (SdkException e) {
            throw new IOException("Could not upload file to S3: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource load(String storageKey) {
        try {
            var response = s3Client.getObject(
                    GetObjectRequest.builder().bucket(bucket).key(storageKey).build());
            return new InputStreamResource(response);
        } catch (NoSuchKeyException e) {
            throw new ApiException("Document file is missing from storage.", HttpStatus.NOT_FOUND);
        } catch (SdkException e) {
            throw new ApiException("Could not retrieve the document.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public String type() {
        return "s3";
    }

    private boolean exists(String key) {
        try {
            s3Client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    /** Keeps only safe path-segment characters, blocking traversal ("..") and separators. */
    private String sanitizeSegment(String value) {
        String cleaned = value == null ? "" : value.trim().replaceAll("[^A-Za-z0-9_-]", "");
        if (cleaned.isEmpty()) {
            throw new ApiException("Invalid employee identifier.", HttpStatus.BAD_REQUEST);
        }
        return cleaned;
    }

    /** Strips any directory component from the uploaded name and blanks out unsafe characters. */
    private String sanitizeFileName(String original) {
        String name = original.replace('\\', '/');
        int slash = name.lastIndexOf('/');
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        name = name.replaceAll("[^A-Za-z0-9._()\\- ]", "_");
        name = name.replaceAll("^\\.+", "");
        name = name.trim();
        return name.isEmpty() ? "file" : name;
    }

    private String uniqueFileName(String employeeCode, String fileName) {
        int dot = fileName.lastIndexOf('.');
        String base = dot > 0 ? fileName.substring(0, dot) : fileName;
        String extension = dot > 0 ? fileName.substring(dot) : "";

        String candidate = fileName;
        int counter = 1;
        while (exists(employeeCode + "/" + candidate)) {
            candidate = base + "_" + counter + extension;
            counter++;
        }
        return candidate;
    }
}
