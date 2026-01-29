package com.orion.alnilam.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.orion.alnilam.dto.request.ApplicationCreateRequest;
import com.orion.alnilam.dto.request.ApplicationDeleteRequest;
import com.orion.alnilam.dto.request.ApplicationStatusRequest;
import com.orion.alnilam.dto.request.ApplicationUpdateRequest;
import com.orion.alnilam.dto.response.ApplicationResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.service.application.ApplicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/applications")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class ApplicationController {
    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ApplicationResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int pageSize,
            @RequestParam(defaultValue = "displayName,asc") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(applicationService.list(page, pageSize, sort, search, isActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> details(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> create(@Valid @RequestBody ApplicationCreateRequest request) {
        return ResponseEntity.ok(applicationService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationUpdateRequest request) {
        return ResponseEntity.ok(applicationService.update(id, request));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@Valid @RequestBody ApplicationDeleteRequest request) {
        applicationService.deleteBulk(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/status")
    public ResponseEntity<List<ApplicationResponse>> updateStatus(
            @Valid @RequestBody ApplicationStatusRequest request) {
        return ResponseEntity.ok(applicationService.updateStatusBulk(request));
    }
}
