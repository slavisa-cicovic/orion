package com.orion.alnilam.controller;

import com.orion.alnilam.domain.enums.UploadType;
import com.orion.alnilam.dto.response.UploadResponse;
import com.orion.alnilam.service.upload.UploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/uploads")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UploadController {
    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping
    public ResponseEntity<UploadResponse> upload(
        @RequestParam("type") UploadType type,
        @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(uploadService.upload(file, type));
    }
}
