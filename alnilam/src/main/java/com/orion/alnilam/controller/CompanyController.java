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

import com.orion.alnilam.dto.request.CompanyCreateRequest;
import com.orion.alnilam.dto.request.CompanyDeleteRequest;
import com.orion.alnilam.dto.request.CompanyStatusRequest;
import com.orion.alnilam.dto.request.CompanyUpdateRequest;
import com.orion.alnilam.dto.response.CompanyResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.service.company.CompanyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/companies")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class CompanyController {
    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<CompanyResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int pageSize,
            @RequestParam(defaultValue = "name,asc") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(companyService.list(page, pageSize, sort, search, isActive));
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CompanyCreateRequest request) {
        return ResponseEntity.ok(companyService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CompanyUpdateRequest request) {
        return ResponseEntity.ok(companyService.update(id, request));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@Valid @RequestBody CompanyDeleteRequest request) {
        companyService.deleteBulk(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/status")
    public ResponseEntity<List<CompanyResponse>> updateStatus(
            @Valid @RequestBody CompanyStatusRequest request) {
        return ResponseEntity.ok(companyService.updateStatusBulk(request));
    }
}
