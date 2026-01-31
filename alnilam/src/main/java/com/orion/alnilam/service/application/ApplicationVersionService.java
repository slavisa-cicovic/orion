package com.orion.alnilam.service.application;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.orion.alnilam.domain.application.Application;
import com.orion.alnilam.domain.application.ApplicationVersion;
import com.orion.alnilam.domain.application.CompanyApplicationAccess;
import com.orion.alnilam.domain.enums.ApplicationVersionStatus;
import com.orion.alnilam.domain.enums.Platform;
import com.orion.alnilam.domain.company.Company;
import com.orion.alnilam.dto.request.ApplicationVersionCreateRequest;
import com.orion.alnilam.dto.request.ApplicationVersionDeleteRequest;
import com.orion.alnilam.dto.request.ApplicationVersionPublishRequest;
import com.orion.alnilam.dto.request.ApplicationVersionStatusRequest;
import com.orion.alnilam.dto.request.ApplicationVersionUpdateRequest;
import com.orion.alnilam.dto.response.ApplicationVersionCompanyStatusResponse;
import com.orion.alnilam.dto.response.ApplicationVersionResponse;
import com.orion.alnilam.repository.ApplicationRepository;
import com.orion.alnilam.repository.ApplicationVersionRepository;
import com.orion.alnilam.repository.CompanyApplicationAccessRepository;
import com.orion.alnilam.repository.CompanyRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import org.springframework.util.StringUtils;
import java.util.Objects;

@Service
public class ApplicationVersionService {
    private final ApplicationRepository applicationRepository;
    private final ApplicationVersionRepository versionRepository;
    private final CompanyApplicationAccessRepository accessRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    public ApplicationVersionService(
            ApplicationRepository applicationRepository,
            ApplicationVersionRepository versionRepository,
            CompanyApplicationAccessRepository accessRepository,
            CompanyRepository companyRepository,
            AuditLogService auditLogService) {
        this.applicationRepository = applicationRepository;
        this.versionRepository = versionRepository;
        this.accessRepository = accessRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
    }

    public List<ApplicationVersionResponse> listByApplication(Long applicationId) {
        return versionRepository.findByApplicationIdWithApplication(applicationId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ApplicationVersionResponse getById(Long id) {
        ApplicationVersion version = versionRepository.findByIdWithApplication(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
        return toResponse(version);
    }

    public ApplicationVersionResponse create(ApplicationVersionCreateRequest request) {
        Application app = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!StringUtils.hasText(request.getFileUrl())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (!isValidVersionName(request.getVersionName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Version name must be in format x.y.z");
        }

        if (versionRepository.existsByApplicationIdAndPlatformAndVersionName(
                app.getId(),
                request.getPlatform(),
                request.getVersionName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Version already exists");
        }

        findLatestByVersionName(app.getId(), request.getPlatform())
                .ifPresent(latest -> {
                    if (compareVersionName(request.getVersionName(), latest.getVersionName()) <= 0) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Version name must be greater than latest");
                    }
                });

        ApplicationVersion version = new ApplicationVersion();
        version.setApplication(app);
        version.setVersionName(request.getVersionName());
        version.setPlatform(request.getPlatform());
        version.setMinSdk(request.getMinSdk());
        version.setTargetSdk(request.getTargetSdk());
        version.setFileUrl(request.getFileUrl());
        version.setOriginalFileName(request.getOriginalFileName());
        version.setChecksum(request.getChecksum());
        version.setActive(request.isActive());
        ApplicationVersion saved = versionRepository.save(version);
        return toResponse(saved);
    }

    public ApplicationVersionResponse update(Long id, ApplicationVersionUpdateRequest request) {
        ApplicationVersion version = versionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));

        Application application = version.getApplication();
        if (!isValidVersionName(request.getVersionName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Version name must be in format x.y.z");
        }
        ApplicationVersion latest = findLatestByVersionName(application.getId(), request.getPlatform())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Latest version not found"));
        if (!latest.getId().equals(version.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only the latest version can be updated");
        }

        boolean publishedToAnyCompany = !accessRepository.findByApplicationVersionId(version.getId()).isEmpty();
        boolean versionChanged = !Objects.equals(version.getVersionName(), request.getVersionName())
                || version.getPlatform() != request.getPlatform();
        boolean fileChanged = !Objects.equals(version.getFileUrl(), request.getFileUrl())
                || !Objects.equals(version.getOriginalFileName(), request.getOriginalFileName())
                || !Objects.equals(version.getChecksum(), request.getChecksum());

        if (publishedToAnyCompany && (versionChanged || fileChanged)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Published version cannot change name, platform, file, or checksum"
            );
        }

        if (!version.getVersionName().equals(request.getVersionName())
                || version.getPlatform() != request.getPlatform()) {
            if (versionRepository.existsByApplicationIdAndPlatformAndVersionName(
                    application.getId(),
                    request.getPlatform(),
                    request.getVersionName())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Version already exists");
            }
        }

        version.setVersionName(request.getVersionName());
        version.setPlatform(request.getPlatform());
        version.setMinSdk(request.getMinSdk());
        version.setTargetSdk(request.getTargetSdk());
        version.setFileUrl(request.getFileUrl());
        version.setOriginalFileName(request.getOriginalFileName());
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
        ApplicationVersion version = versionRepository.findByIdWithApplication(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));
        version.setStatus(ApplicationVersionStatus.PUBLISHED_TO_COMPANIES);
        ApplicationVersion saved = versionRepository.save(version);

        List<CompanyApplicationAccess> allAccesses = accessRepository.findByApplicationId(
                version.getApplication().getId()
        );
        Set<Long> alreadyPublished = new HashSet<>();
        HashMap<Long, String> latestByCompany = new HashMap<>();
        for (CompanyApplicationAccess access : allAccesses) {
            ApplicationVersion accessVersion = access.getApplicationVersion();
            if (accessVersion.getPlatform() != version.getPlatform()) {
                continue;
            }
            Long companyId = access.getCompanyId();
            if (accessVersion.getId().equals(version.getId())) {
                alreadyPublished.add(companyId);
            }
            String existing = latestByCompany.get(companyId);
            if (existing == null || compareVersionName(accessVersion.getVersionName(), existing) > 0) {
                latestByCompany.put(companyId, accessVersion.getVersionName());
            }
        }

        for (Long companyId : request.getCompanyIds()) {
            if (alreadyPublished.contains(companyId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Version already published to company");
            }
            String latestVersion = latestByCompany.get(companyId);
            if (latestVersion != null && compareVersionName(version.getVersionName(), latestVersion) <= 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Only newer versions can be published");
            }
        }

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

    public List<ApplicationVersionCompanyStatusResponse> listCompanyStatuses(Long versionId) {
        ApplicationVersion version = versionRepository.findByIdWithApplication(versionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Version not found"));

        Long applicationId = version.getApplication().getId();

        List<CompanyApplicationAccess> allAccesses = accessRepository.findByApplicationId(applicationId);
        List<CompanyApplicationAccess> versionAccesses = accessRepository.findByApplicationVersionId(versionId);

        Set<Long> publishedCompanyIds = new HashSet<>();
        for (CompanyApplicationAccess access : versionAccesses) {
            publishedCompanyIds.add(access.getCompanyId());
        }

        HashMap<Long, CompanyApplicationAccess> latestAccessByCompany = new HashMap<>();
        for (CompanyApplicationAccess access : allAccesses) {
            ApplicationVersion accessVersion = access.getApplicationVersion();
            if (accessVersion.getPlatform() != version.getPlatform()) {
                continue;
            }
            Long companyId = access.getCompanyId();
            CompanyApplicationAccess existing = latestAccessByCompany.get(companyId);
            if (existing == null
                    || compareVersionName(accessVersion.getVersionName(),
                    existing.getApplicationVersion().getVersionName()) > 0) {
                latestAccessByCompany.put(companyId, access);
            }
        }

        List<Company> companies = companyRepository.findAll();
        return companies.stream().map(company -> {
            CompanyApplicationAccess latestAccess = latestAccessByCompany.get(company.getId());
            String latestName = latestAccess != null ? latestAccess.getApplicationVersion().getVersionName() : null;
            boolean publishedToCompany = publishedCompanyIds.contains(company.getId());
            boolean selectable;
            String selectableReason = null;

            if (publishedToCompany) {
                selectable = false;
                selectableReason = "Already published";
            } else if (latestName != null && compareVersionName(version.getVersionName(), latestName) <= 0) {
                selectable = false;
                selectableReason = "Older than latest published version";
            } else {
                selectable = true;
            }

            boolean publishedToUsers = false;

            return new ApplicationVersionCompanyStatusResponse(
                    company.getId(),
                    company.getName(),
                    company.getAddress(),
                    company.getCity(),
                    company.getZip(),
                    latestName,
                    publishedToCompany,
                    publishedToUsers,
                    selectable,
                    selectableReason
            );
        }).toList();
    }

    private ApplicationVersionResponse toResponse(ApplicationVersion version) {
        return new ApplicationVersionResponse(
                version.getId(),
                version.getApplication().getId(),
                version.getApplication().getDisplayName(),
                version.getVersionName(),
                version.getPlatform(),
                version.getMinSdk(),
                version.getTargetSdk(),
                version.getFileUrl(),
                version.getOriginalFileName(),
                version.getChecksum(),
                version.getStatus(),
                version.isActive());
    }

    private Optional<ApplicationVersion> findLatestByVersionName(Long applicationId, Platform platform) {
        List<ApplicationVersion> versions = versionRepository.findByApplicationIdWithApplication(applicationId).stream()
                .filter(version -> version.getPlatform() == platform)
                .toList();
        if (versions.isEmpty()) {
            return Optional.empty();
        }
        ApplicationVersion latest = versions.get(0);
        for (ApplicationVersion version : versions) {
            if (compareVersionName(version.getVersionName(), latest.getVersionName()) > 0) {
                latest = version;
            }
        }
        return Optional.of(latest);
    }

    private int compareVersionName(String left, String right) {
        if (!StringUtils.hasText(left) || !StringUtils.hasText(right)) {
            return 0;
        }
        String[] leftParts = left.split("\\.");
        String[] rightParts = right.split("\\.");
        boolean numericOnly = true;
        for (String part : leftParts) {
            if (!part.matches("\\d+")) {
                numericOnly = false;
                break;
            }
        }
        if (numericOnly) {
            for (String part : rightParts) {
                if (!part.matches("\\d+")) {
                    numericOnly = false;
                    break;
                }
            }
        }

        if (numericOnly) {
            int max = Math.max(leftParts.length, rightParts.length);
            for (int i = 0; i < max; i++) {
                int l = i < leftParts.length ? Integer.parseInt(leftParts[i]) : 0;
                int r = i < rightParts.length ? Integer.parseInt(rightParts[i]) : 0;
                if (l != r) {
                    return Integer.compare(l, r);
                }
            }
            return 0;
        }

        return left.compareToIgnoreCase(right);
    }

    private boolean isValidVersionName(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        return value.matches("^[1-9]\\d*\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$");
    }
}
