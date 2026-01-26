package com.orion.alnilam.service.application;

import com.orion.alnilam.domain.application.Application;
import com.orion.alnilam.domain.application.ApplicationVersion;
import com.orion.alnilam.domain.application.CompanyApplicationAccess;
import com.orion.alnilam.domain.enums.ApplicationVersionStatus;
import com.orion.alnilam.dto.request.ApplicationVersionCreateRequest;
import com.orion.alnilam.dto.request.ApplicationVersionDeleteRequest;
import com.orion.alnilam.dto.request.ApplicationVersionPublishRequest;
import com.orion.alnilam.dto.request.ApplicationVersionStatusRequest;
import com.orion.alnilam.dto.request.ApplicationVersionUpdateRequest;
import com.orion.alnilam.dto.response.ApplicationVersionResponse;
import com.orion.alnilam.repository.ApplicationRepository;
import com.orion.alnilam.repository.ApplicationVersionRepository;
import com.orion.alnilam.repository.CompanyApplicationAccessRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ApplicationVersionService {
    private final ApplicationRepository applicationRepository;
    private final ApplicationVersionRepository versionRepository;
    private final CompanyApplicationAccessRepository accessRepository;
    private final AuditLogService auditLogService;

    public ApplicationVersionService(
        ApplicationRepository applicationRepository,
        ApplicationVersionRepository versionRepository,
        CompanyApplicationAccessRepository accessRepository,
        AuditLogService auditLogService
    ) {
        this.applicationRepository = applicationRepository;
        this.versionRepository = versionRepository;
        this.accessRepository = accessRepository;
        this.auditLogService = auditLogService;
    }

    public List<ApplicationVersionResponse> listByApplication(Long applicationId) {
        return versionRepository.findByApplicationId(applicationId).stream()
            .map(this::toResponse)
            .toList();
    }

    public ApplicationVersionResponse create(ApplicationVersionCreateRequest request) {
        Application app = applicationRepository.findById(request.getApplicationId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (versionRepository.existsByApplicationIdAndPlatformAndVersionCode(
            app.getId(),
            request.getPlatform(),
            request.getVersionCode()
        )) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Version already exists");
        }

        ApplicationVersion version = new ApplicationVersion();
        version.setApplication(app);
        version.setVersionName(request.getVersionName());
        version.setVersionCode(request.getVersionCode());
        version.setPlatform(request.getPlatform());
        version.setMinSdk(request.getMinSdk());
        version.setTargetSdk(request.getTargetSdk());
        version.setFileUrl(request.getFileUrl());
        version.setChecksum(request.getChecksum());
        version.setActive(request.isActive());
        ApplicationVersion saved = versionRepository.save(version);
        return toResponse(saved);
    }

    public ApplicationVersionResponse update(Long id, ApplicationVersionUpdateRequest request) {
        ApplicationVersion version = versionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));

        Application application = version.getApplication();
        ApplicationVersion latest = versionRepository.findTopByApplicationOrderByVersionCodeDesc(application)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Latest version not found"));
        if (!latest.getId().equals(version.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only the latest version can be updated");
        }

        if (!version.getVersionCode().equals(request.getVersionCode())
            || version.getPlatform() != request.getPlatform()) {
            if (versionRepository.existsByApplicationIdAndPlatformAndVersionCode(
                application.getId(),
                request.getPlatform(),
                request.getVersionCode()
            )) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Version already exists");
            }
        }

        version.setVersionName(request.getVersionName());
        version.setVersionCode(request.getVersionCode());
        version.setPlatform(request.getPlatform());
        version.setMinSdk(request.getMinSdk());
        version.setTargetSdk(request.getTargetSdk());
        version.setFileUrl(request.getFileUrl());
        version.setChecksum(request.getChecksum());
        version.setActive(request.isActive());
        ApplicationVersion saved = versionRepository.save(version);
        auditLogService.log("APPLICATION_VERSION", saved.getId(), "UPDATE", request.getReason());
        return toResponse(saved);
    }

    public void deleteBulk(ApplicationVersionDeleteRequest request) {
        List<ApplicationVersion> versions = versionRepository.findAllById(request.getVersionIds());
        if (versions.size() != request.getVersionIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more versions not found");
        }
        versionRepository.deleteAll(versions);
        for (ApplicationVersion version : versions) {
            auditLogService.log("APPLICATION_VERSION", version.getId(), "DELETE", request.getReason());
        }
    }

    public List<ApplicationVersionResponse> updateStatusBulk(ApplicationVersionStatusRequest request) {
        List<ApplicationVersion> versions = versionRepository.findAllById(request.getVersionIds());
        if (versions.size() != request.getVersionIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more versions not found");
        }
        for (ApplicationVersion version : versions) {
            version.setActive(request.isActive());
        }
        List<ApplicationVersion> saved = versionRepository.saveAll(versions);
        String action = request.isActive() ? "ACTIVATE" : "DEACTIVATE";
        for (ApplicationVersion version : saved) {
            auditLogService.log("APPLICATION_VERSION", version.getId(), action, request.getReason());
        }
        return saved.stream().map(this::toResponse).toList();
    }

    public ApplicationVersionResponse publish(Long id, ApplicationVersionPublishRequest request) {
        ApplicationVersion version = versionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
        version.setStatus(ApplicationVersionStatus.PUBLISHED_TO_COMPANIES);
        ApplicationVersion saved = versionRepository.save(version);

        List<CompanyApplicationAccess> accesses = request.getCompanyIds().stream().map(companyId -> {
            CompanyApplicationAccess access = new CompanyApplicationAccess();
            access.setCompanyId(companyId);
            access.setApplicationVersion(saved);
            return access;
        }).toList();
        accessRepository.saveAll(accesses);
        auditLogService.log("APPLICATION_VERSION", saved.getId(), "PUBLISH", request.getReason());
        return toResponse(saved);
    }

    private ApplicationVersionResponse toResponse(ApplicationVersion version) {
        return new ApplicationVersionResponse(
            version.getId(),
            version.getApplication().getId(),
            version.getVersionName(),
            version.getVersionCode(),
            version.getPlatform(),
            version.getMinSdk(),
            version.getTargetSdk(),
            version.getFileUrl(),
            version.getChecksum(),
            version.getStatus(),
            version.isActive()
        );
    }
}
