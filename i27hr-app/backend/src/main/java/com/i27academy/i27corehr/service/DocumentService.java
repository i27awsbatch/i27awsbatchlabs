package com.i27academy.i27corehr.service;

import com.i27academy.i27corehr.dto.document.DocumentDto;
import com.i27academy.i27corehr.entity.*;
import com.i27academy.i27corehr.exception.ApiException;
import com.i27academy.i27corehr.exception.ResourceNotFoundException;
import com.i27academy.i27corehr.repository.ActivityLogRepository;
import com.i27academy.i27corehr.repository.EmployeeDocumentRepository;
import com.i27academy.i27corehr.repository.EmployeeRepository;
import com.i27academy.i27corehr.storage.DocumentStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class DocumentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "png");
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "OFFER_LETTER", "PAYSLIP", "ID_PROOF", "APPRAISAL", "POLICY_DOCUMENT", "HR_LETTER", "OTHER");

    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final ActivityLogRepository activityLogRepository;
    private final DocumentStorageService storageService;

    public DocumentService(
            EmployeeDocumentRepository documentRepository,
            EmployeeRepository employeeRepository,
            ActivityLogRepository activityLogRepository,
            DocumentStorageService storageService) {
        this.documentRepository = documentRepository;
        this.employeeRepository = employeeRepository;
        this.activityLogRepository = activityLogRepository;
        this.storageService = storageService;
    }

    public List<DocumentDto> forEmployee(Long employeeId) {
        return documentRepository.findByEmployeeIdOrderByUploadedAtDesc(employeeId).stream().map(this::toDto).toList();
    }

    public List<DocumentDto> all() {
        return documentRepository.findAllByOrderByUploadedAtDesc().stream().map(this::toDto).toList();
    }

    public List<DocumentDto> recentForEmployee(Long employeeId, int limit) {
        return documentRepository.findByEmployeeIdOrderByUploadedAtDesc(employeeId).stream()
                .limit(limit)
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public DocumentDto upload(
            Long employeeId, String documentType, String notes, MultipartFile file, Long uploadedByEmployeeId) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Choose a file to upload.", HttpStatus.BAD_REQUEST);
        }
        if (!ALLOWED_TYPES.contains(documentType)) {
            throw new ApiException("Unsupported document category.", HttpStatus.BAD_REQUEST);
        }

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String extension = original.contains(".")
                ? original.substring(original.lastIndexOf('.') + 1).toLowerCase()
                : "";
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ApiException("Only PDF, DOCX and PNG files are supported.", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > 10L * 1024 * 1024) {
            throw new ApiException("File exceeds the 10 MB limit. Try compressing it.", HttpStatus.PAYLOAD_TOO_LARGE);
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));
        Employee uploadedBy = employeeRepository.findById(uploadedByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader not found: " + uploadedByEmployeeId));

        String storageKey;
        try {
            storageKey = storageService.store(file, employee.getEmployeeCode());
        } catch (IOException e) {
            throw new ApiException("Could not save the file. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        // Display name always mirrors the sanitized, on-disk name (last segment of the storage
        // key) so the DB metadata can never show a raw/unsafe filename that differs from what was
        // actually written to disk.
        String storedFileName = storageKey.substring(storageKey.lastIndexOf('/') + 1);

        EmployeeDocument document = EmployeeDocument.builder()
                .employee(employee)
                .documentType(documentType)
                .fileName(storedFileName)
                .fileSize(file.getSize())
                .storageType(storageService.type())
                .storageKey(storageKey)
                .notes(notes)
                .uploadedBy(uploadedBy)
                .build();
        document = documentRepository.save(document);

        activityLogRepository.save(ActivityLog.builder()
                .actorEmployee(uploadedBy)
                .actorName(uploadedBy.getFullName())
                .message("uploaded " + document.getFileName() + " for " + employee.getFullName() + ".")
                .kind(ActivityKind.SYSTEM)
                .build());

        return toDto(document);
    }

    public Resource download(Long documentId) {
        EmployeeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        return storageService.load(document.getStorageKey());
    }

    public EmployeeDocument find(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
    }

    DocumentDto toDto(EmployeeDocument d) {
        return new DocumentDto(
                d.getId(),
                d.getEmployee().getId(),
                d.getEmployee().getFullName(),
                d.getDocumentType(),
                d.getFileName(),
                d.getFileSize(),
                d.getUploadedBy().getFullName(),
                d.getUploadedAt(),
                d.getNotes());
    }
}
