package com.orion.alnilam.service.company;

import com.orion.alnilam.domain.company.Company;
import com.orion.alnilam.dto.request.CompanyCreateRequest;
import com.orion.alnilam.dto.request.CompanyDeleteRequest;
import com.orion.alnilam.dto.request.CompanyStatusRequest;
import com.orion.alnilam.dto.request.CompanyUpdateRequest;
import com.orion.alnilam.dto.response.CompanyResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.repository.CompanyRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    public CompanyService(CompanyRepository companyRepository, AuditLogService auditLogService) {
        this.companyRepository = companyRepository;
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
}
