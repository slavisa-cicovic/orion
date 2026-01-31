package com.orion.alnilam.service.company;

import com.orion.alnilam.domain.company.Company;
import com.orion.alnilam.dto.request.CompanyCreateRequest;
import com.orion.alnilam.dto.request.CompanyDeleteRequest;
import com.orion.alnilam.dto.request.CompanyStatusRequest;
import com.orion.alnilam.dto.request.CompanyUpdateRequest;
import com.orion.alnilam.domain.application.ApplicationVersion;
import com.orion.alnilam.domain.application.CompanyApplicationAccess;
import com.orion.alnilam.domain.enums.CompanyUserStatus;
import com.orion.alnilam.domain.enums.RegistrationStatus;
import com.orion.alnilam.domain.registration.RegistrationRequest;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.dto.response.CompanyAppSummaryResponse;
import com.orion.alnilam.dto.response.CompanyResponse;
import com.orion.alnilam.dto.response.CompanyUserStatusResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.repository.CompanyRepository;
import com.orion.alnilam.repository.CompanyApplicationAccessRepository;
import com.orion.alnilam.repository.RegistrationRequestRepository;
import com.orion.alnilam.repository.UserRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final CompanyApplicationAccessRepository accessRepository;
    private final RegistrationRequestRepository registrationRequestRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public CompanyService(
        CompanyRepository companyRepository,
        CompanyApplicationAccessRepository accessRepository,
        RegistrationRequestRepository registrationRequestRepository,
        UserRepository userRepository,
        AuditLogService auditLogService
    ) {
        this.companyRepository = companyRepository;
        this.accessRepository = accessRepository;
        this.registrationRequestRepository = registrationRequestRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public PagedResponse<CompanyResponse> list(
        int page,
        int pageSize,
        String sort,
        String search,
        Boolean isActive
    ) {
        int safePage = Math.max(page, 0);
        int safePageSize = Math.max(pageSize, 1);

        List<CompanyResponse> responses = companyRepository.findAll().stream()
            .map(this::toResponse)
            .filter(company -> isActive == null || company.isActive() == isActive)
            .filter(company -> matchesSearch(company, search))
            .sorted(buildCompanyComparator(sort))
            .toList();

        long total = responses.size();
        int fromIndex = safePage * safePageSize;
        if (fromIndex >= total) {
            return new PagedResponse<>(List.of(), safePage, safePageSize, total);
        }
        int toIndex = Math.min(fromIndex + safePageSize, responses.size());
        List<CompanyResponse> items = responses.subList(fromIndex, toIndex);
        return new PagedResponse<>(items, safePage, safePageSize, total);
    }

    public CompanyResponse create(CompanyCreateRequest request) {
        companyRepository.findByCodeIgnoreCase(request.getCode()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Company code already exists");
        });

        Company company = new Company();
        company.setCode(request.getCode());
        company.setName(request.getName());
        company.setActive(request.isActive());
        company.setAddress(request.getAddress());
        company.setCity(request.getCity());
        company.setZip(request.getZip());
        company.setIconUrl(request.getIconUrl());
        Company saved = companyRepository.save(company);
        return toResponse(saved);
    }

    public CompanyResponse update(Long id, CompanyUpdateRequest request) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));

        if (!company.getCode().equalsIgnoreCase(request.getCode())) {
            companyRepository.findByCodeIgnoreCase(request.getCode()).ifPresent(existing -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Company code already exists");
            });
        }

        company.setCode(request.getCode());
        company.setName(request.getName());
        company.setActive(request.isActive());
        company.setAddress(request.getAddress());
        company.setCity(request.getCity());
        company.setZip(request.getZip());
        company.setIconUrl(request.getIconUrl());
        Company saved = companyRepository.save(company);
        auditLogService.log("COMPANY", saved.getId(), "UPDATE", request.getReason());
        return toResponse(saved);
    }

    public CompanyResponse getById(Long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        return toResponse(company);
    }

    public List<CompanyAppSummaryResponse> listCompanyApps(Long companyId) {
        requireCompany(companyId);
        List<CompanyApplicationAccess> accesses = accessRepository.findByCompanyIdWithApplication(companyId);
        Map<Long, ApplicationVersion> latestByApp = new HashMap<>();

        for (CompanyApplicationAccess access : accesses) {
            ApplicationVersion version = access.getApplicationVersion();
            Long appId = version.getApplication().getId();
            ApplicationVersion existing = latestByApp.get(appId);
            if (existing == null || compareVersionName(version.getVersionName(), existing.getVersionName()) > 0) {
                latestByApp.put(appId, version);
            }
        }

        return latestByApp.values().stream().map(version ->
            new CompanyAppSummaryResponse(
                version.getApplication().getId(),
                version.getApplication().getDisplayName(),
                version.getVersionName(),
                0
            )
        ).toList();
    }

    public List<CompanyUserStatusResponse> listCompanyUsers(Long companyId) {
        requireCompany(companyId);
        List<User> users = userRepository.findByCompanyId(companyId);
        List<RegistrationRequest> requests = registrationRequestRepository.findByCompanyId(companyId);
        Map<String, RegistrationRequest> latestByEmail = new HashMap<>();

        for (RegistrationRequest request : requests) {
            if (!StringUtils.hasText(request.getEmail())) {
                continue;
            }
            String key = request.getEmail().toLowerCase();
            RegistrationRequest existing = latestByEmail.get(key);
            if (existing == null || request.getRequestedAt().isAfter(existing.getRequestedAt())) {
                latestByEmail.put(key, request);
            }
        }

        return users.stream().map(user -> {
            CompanyUserStatus status = resolveUserStatus(user, latestByEmail);
            return new CompanyUserStatusResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                status,
                user.isActive(),
                user.getLastLoggedInAt()
            );
        }).toList();
    }

    public void deleteBulk(CompanyDeleteRequest request) {
        List<Company> companies = companyRepository.findAllById(request.getCompanyIds());
        if (companies.size() != request.getCompanyIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more companies not found");
        }
        companyRepository.deleteAll(companies);
        for (Company company : companies) {
            auditLogService.log("COMPANY", company.getId(), "DELETE", request.getReason());
        }
    }

    public List<CompanyResponse> updateStatusBulk(CompanyStatusRequest request) {
        List<Company> companies = companyRepository.findAllById(request.getCompanyIds());
        if (companies.size() != request.getCompanyIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more companies not found");
        }
        for (Company company : companies) {
            company.setActive(request.isActive());
        }
        List<Company> saved = companyRepository.saveAll(companies);
        String action = request.isActive() ? "ACTIVATE" : "DEACTIVATE";
        for (Company company : saved) {
            auditLogService.log("COMPANY", company.getId(), action, request.getReason());
        }
        return saved.stream().map(this::toResponse).toList();
    }

    private CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
            company.getId(),
            company.getCode(),
            company.getName(),
            company.getAddress(),
            company.getCity(),
            company.getZip(),
            company.getIconUrl(),
            company.isActive()
        );
    }

    private Comparator<CompanyResponse> buildCompanyComparator(String sort) {
        String[] parts = sort == null ? new String[0] : sort.split(",", 2);
        String field = parts.length > 0 ? parts[0].trim() : "name";
        String direction = parts.length > 1 ? parts[1].trim().toLowerCase() : "asc";

        Comparator<String> textComparator = Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER);
        Comparator<CompanyResponse> comparator;

        switch (field) {
            case "code":
                comparator = Comparator.comparing(CompanyResponse::getCode, textComparator);
                break;
            case "city":
                comparator = Comparator.comparing(CompanyResponse::getCity, textComparator);
                break;
            case "zip":
                comparator = Comparator.comparing(CompanyResponse::getZip, textComparator);
                break;
            case "active":
                comparator = Comparator.comparing(CompanyResponse::isActive);
                break;
            case "name":
            default:
                comparator = Comparator.comparing(CompanyResponse::getName, textComparator);
                break;
        }

        if ("desc".equals(direction)) {
            comparator = comparator.reversed();
        }
        return comparator;
    }

    private boolean matchesSearch(CompanyResponse company, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }
        String needle = search.trim().toLowerCase();
        return containsIgnoreCase(company.getCode(), needle)
            || containsIgnoreCase(company.getName(), needle)
            || containsIgnoreCase(company.getAddress(), needle)
            || containsIgnoreCase(company.getCity(), needle)
            || containsIgnoreCase(company.getZip(), needle);
    }

    private boolean containsIgnoreCase(String value, String needle) {
        if (value == null) {
            return false;
        }
        return value.toLowerCase().contains(needle);
    }

    private CompanyUserStatus resolveUserStatus(User user, Map<String, RegistrationRequest> latestByEmail) {
        if (!StringUtils.hasText(user.getEmail())) {
            return CompanyUserStatus.VERIFIED;
        }
        RegistrationRequest request = latestByEmail.get(user.getEmail().toLowerCase());
        if (request == null) {
            return CompanyUserStatus.VERIFIED;
        }
        RegistrationStatus status = request.getStatus();
        if (status == RegistrationStatus.PENDING) {
            return CompanyUserStatus.REGISTERED;
        }
        if (status == RegistrationStatus.REJECTED) {
            return CompanyUserStatus.REJECTED;
        }
        return CompanyUserStatus.VERIFIED;
    }

    private void requireCompany(Long companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found");
        }
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
}
