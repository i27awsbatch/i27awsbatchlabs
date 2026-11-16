package com.i27academy.i27corehr.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentStorageService {

    /**
     * Persists the file under the employee's business ID (e.g. {@code i27-0023}) and returns an
     * opaque storage key that {@link #load} can resolve later.
     */
    String store(MultipartFile file, String employeeCode) throws java.io.IOException;

    Resource load(String storageKey);

    String type();
}
