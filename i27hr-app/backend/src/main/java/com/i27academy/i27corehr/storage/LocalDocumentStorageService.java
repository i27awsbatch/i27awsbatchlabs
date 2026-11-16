package com.i27academy.i27corehr.storage;

import com.i27academy.i27corehr.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Stores each employee's documents under {@code <local-path>/<employeeCode>/<original-file-name>},
 * so folders are human-readable (e.g. {@code i27-0023}) and files keep their uploaded name instead
 * of a random UUID. Filenames are sanitized to a safe character set and de-duplicated with a
 * {@code _1}, {@code _2}, ... suffix rather than silently overwriting an existing file.
 *
 * <p>Active whenever {@code app.documents.storage-type} is {@code local} or unset (the default),
 * so plain local disk, an EBS-mounted path, or a shared EFS mount all work unchanged — they all
 * look like a filesystem path to this class. See {@link S3DocumentStorageService} for the
 * {@code s3} alternative.
 */
@Service
@ConditionalOnProperty(prefix = "app.documents", name = "storage-type", havingValue = "local", matchIfMissing = true)
public class LocalDocumentStorageService implements DocumentStorageService {

    private final Path root;

    public LocalDocumentStorageService(@Value("${app.documents.local-path}") String localPath) throws IOException {
        this.root = Paths.get(localPath).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    @Override
    public String store(MultipartFile file, String employeeCode) throws IOException {
        String safeEmployeeCode = sanitizeSegment(employeeCode);
        Path employeeDir = root.resolve(safeEmployeeCode).normalize();
        if (!employeeDir.startsWith(root)) {
            throw new ApiException("Invalid storage path.", HttpStatus.BAD_REQUEST);
        }
        Files.createDirectories(employeeDir);

        String original = Path.of(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file")
                .getFileName()
                .toString();
        String safeFileName = sanitizeFileName(original);
        String storedName = uniqueFileName(employeeDir, safeFileName);

        Path target = employeeDir.resolve(storedName).normalize();
        if (!target.startsWith(employeeDir)) {
            throw new ApiException("Invalid file name.", HttpStatus.BAD_REQUEST);
        }
        file.transferTo(target);

        return safeEmployeeCode + "/" + storedName;
    }

    @Override
    public Resource load(String storageKey) {
        try {
            Path file = root.resolve(storageKey).normalize();
            if (!file.startsWith(root)) {
                throw new ApiException("Invalid document reference.", HttpStatus.BAD_REQUEST);
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ApiException("Document file is missing from storage.", HttpStatus.NOT_FOUND);
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ApiException("Invalid document reference.", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public String type() {
        return "local";
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

    private String uniqueFileName(Path dir, String fileName) {
        int dot = fileName.lastIndexOf('.');
        String base = dot > 0 ? fileName.substring(0, dot) : fileName;
        String extension = dot > 0 ? fileName.substring(dot) : "";

        String candidate = fileName;
        int counter = 1;
        while (Files.exists(dir.resolve(candidate))) {
            candidate = base + "_" + counter + extension;
            counter++;
        }
        return candidate;
    }
}
