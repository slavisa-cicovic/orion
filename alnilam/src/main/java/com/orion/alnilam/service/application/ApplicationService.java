package com.orion.alnilam.service.application;

import com.orion.alnilam.domain.application.Application;
import com.orion.alnilam.domain.enums.ApplicationVersionStatus;
import com.orion.alnilam.dto.request.ApplicationCreateRequest;
import com.orion.alnilam.dto.request.ApplicationDeleteRequest;
import com.orion.alnilam.dto.request.ApplicationStatusRequest;
import com.orion.alnilam.dto.request.ApplicationUpdateRequest;
import com.orion.alnilam.dto.response.ApplicationResponse;
import com.orion.alnilam.repository.ApplicationRepository;
import com.orion.alnilam.repository.ApplicationVersionRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final ApplicationVersionRepository applicationVersionRepository;
    private final AuditLogService auditLogService;

    public ApplicationService(
        ApplicationRepository applicationRepository,
        ApplicationVersionRepository applicationVersionRepository,
        AuditLogService auditLogService
    ) {
        this.applicationRepository = applicationRepository;
        this.applicationVersionRepository = applicationVersionRepository;
        this.auditLogService = auditLogService;
    }

    public List<ApplicationResponse> list() {
        return applicationRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ApplicationResponse create(ApplicationCreateRequest request) {
        if (applicationRepository.existsByPackageNameIgnoreCase(request.getPackageName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Package name already exists");
        }

        Application app = new Application();
        app.setPackageName(request.getPackageName());
        app.setDisplayName(request.getDisplayName());
        app.setDescription(request.getDescription());
        app.setIconUrl(request.getIconUrl());
        app.setActive(request.isActive());
        Application saved = applicationRepository.save(app);
        return toResponse(saved);
    }

    public ApplicationResponse update(Long id, ApplicationUpdateRequest request) {
        Application app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!app.getPackageName().equalsIgnoreCase(request.getPackageName())
            && applicationRepository.existsByPackageNameIgnoreCase(request.getPackageName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Package name already exists");
        }

        app.setPackageName(request.getPackageName());
        app.setDisplayName(request.getDisplayName());
        app.setDescription(request.getDescription());
        app.setIconUrl(request.getIconUrl());
        app.setActive(request.isActive());
        Application saved = applicationRepository.save(app);
        auditLogService.log("APPLICATION", saved.getId(), "UPDATE", request.getReason());
        return toResponse(saved);
    }

    public void deleteBulk(ApplicationDeleteRequest request) {
        List<Application> apps = applicationRepository.findAllById(request.getApplicationIds());
        if (apps.size() != request.getApplicationIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more applications not found");
        }
        for (Application app : apps) {
            boolean publishedToCompanies = applicationVersionRepository.existsByApplicationIdAndStatus(
                app.getId(),
                ApplicationVersionStatus.PUBLISHED_TO_COMPANIES
            );
            boolean publishedToUsers = applicationVersionRepository.existsByApplicationIdAndStatus(
                app.getId(),
                ApplicationVersionStatus.PUBLISHED_TO_USERS
            );
            if (publishedToCompanies || publishedToUsers) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Application has published versions");
            }
        }
        applicationRepository.deleteAll(apps);
        for (Application app : apps) {
            auditLogService.log("APPLICATION", app.getId(), "DELETE", request.getReason());
        }
    }

    public List<ApplicationResponse> updateStatusBulk(ApplicationStatusRequest request) {
        List<Application> apps = applicationRepository.findAllById(request.getApplicationIds());
        if (apps.size() != request.getApplicationIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more applications not found");
        }
        for (Application app : apps) {
            app.setActive(request.isActive());
        }
        List<Application> saved = applicationRepository.saveAll(apps);
        String action = request.isActive() ? "ACTIVATE" : "DEACTIVATE";
        for (Application app : saved) {
            auditLogService.log("APPLICATION", app.getId(), action, request.getReason());
        }
        return saved.stream().map(this::toResponse).toList();
    }

    private ApplicationResponse toResponse(Application app) {
        return new ApplicationResponse(
            app.getId(),
            app.getPackageName(),
            app.getDisplayName(),
            app.getDescription(),
            app.getIconUrl(),
            app.isActive()
        );
    }
}
