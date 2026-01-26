package com.orion.alnilam.controller;

import com.orion.alnilam.dto.request.ApplicationVersionCreateRequest;
import com.orion.alnilam.dto.request.ApplicationVersionDeleteRequest;
import com.orion.alnilam.dto.request.ApplicationVersionPublishRequest;
import com.orion.alnilam.dto.request.ApplicationVersionStatusRequest;
import com.orion.alnilam.dto.request.ApplicationVersionUpdateRequest;
import com.orion.alnilam.dto.response.ApplicationVersionResponse;
import com.orion.alnilam.service.application.ApplicationVersionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/app-versions")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class ApplicationVersionController {
    private final ApplicationVersionService applicationVersionService;

    public ApplicationVersionController(ApplicationVersionService applicationVersionService) {
        this.applicationVersionService = applicationVersionService;
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<ApplicationVersionResponse>> list(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationVersionService.listByApplication(applicationId));
    }

    @PostMapping
    public ResponseEntity<ApplicationVersionResponse> create(
        @Valid @RequestBody ApplicationVersionCreateRequest request
    ) {
        return ResponseEntity.ok(applicationVersionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationVersionResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody ApplicationVersionUpdateRequest request
    ) {
        return ResponseEntity.ok(applicationVersionService.update(id, request));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@Valid @RequestBody ApplicationVersionDeleteRequest request) {
        applicationVersionService.deleteBulk(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/status")
    public ResponseEntity<List<ApplicationVersionResponse>> updateStatus(
        @Valid @RequestBody ApplicationVersionStatusRequest request
    ) {
        return ResponseEntity.ok(applicationVersionService.updateStatusBulk(request));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApplicationVersionResponse> publish(
        @PathVariable Long id,
        @Valid @RequestBody ApplicationVersionPublishRequest request
    ) {
        return ResponseEntity.ok(applicationVersionService.publish(id, request));
    }
}
