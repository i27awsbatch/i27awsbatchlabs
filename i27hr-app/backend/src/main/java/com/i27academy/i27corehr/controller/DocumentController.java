package com.i27academy.i27corehr.controller;

import com.i27academy.i27corehr.dto.document.DocumentDto;
import com.i27academy.i27corehr.entity.EmployeeDocument;
import com.i27academy.i27corehr.entity.Role;
import com.i27academy.i27corehr.entity.User;
import com.i27academy.i27corehr.exception.ApiException;
import com.i27academy.i27corehr.security.CurrentUser;
import com.i27academy.i27corehr.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class DocumentController {

    private final DocumentService documentService;
    private final CurrentUser currentUser;

    public DocumentController(DocumentService documentService, CurrentUser currentUser) {
        this.documentService = documentService;
        this.currentUser = currentUser;
    }

    @GetMapping("/api/documents")
    public List<DocumentDto> list(@RequestParam(required = false) Long employeeId) {
        User me = currentUser.get();
        if (employeeId != null) {
            if (me.getRole() != Role.HR_ADMIN && !employeeId.equals(selfId(me))) {
                throw new ApiException("You can only view your own documents.", HttpStatus.FORBIDDEN);
            }
            return documentService.forEmployee(employeeId);
        }
        if (me.getRole() != Role.HR_ADMIN) {
            return documentService.forEmployee(requireSelfId(me));
        }
        return documentService.all();
    }

    @PostMapping(value = "/api/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HR_ADMIN')")
    public DocumentDto upload(
            @RequestParam Long employeeId,
            @RequestParam String documentType,
            @RequestParam(required = false) String notes,
            @RequestParam("file") MultipartFile file) {
        return documentService.upload(employeeId, documentType, notes, file, requireSelfId(currentUser.get()));
    }

    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        User me = currentUser.get();
        EmployeeDocument document = documentService.find(id);
        if (me.getRole() != Role.HR_ADMIN && !document.getEmployee().getId().equals(selfId(me))) {
            throw new ApiException("You can only download your own documents.", HttpStatus.FORBIDDEN);
        }
        Resource resource = documentService.download(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(document.getFileName()).build().toString())
                .body(resource);
    }

    private Long selfId(User user) {
        return user.getEmployee() != null ? user.getEmployee().getId() : null;
    }

    private Long requireSelfId(User user) {
        Long id = selfId(user);
        if (id == null) {
            throw new ApiException("This account is not linked to an employee record.", HttpStatus.CONFLICT);
        }
        return id;
    }
}
