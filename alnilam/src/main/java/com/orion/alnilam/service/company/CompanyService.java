package com.orion.alnilam.service.company;

import com.orion.alnilam.domain.company.Company;
import com.orion.alnilam.dto.request.CompanyCreateRequest;
import com.orion.alnilam.dto.request.CompanyDeleteRequest;
import com.orion.alnilam.dto.request.CompanyStatusRequest;
import com.orion.alnilam.dto.request.CompanyUpdateRequest;
import com.orion.alnilam.dto.response.CompanyResponse;
import com.orion.alnilam.repository.CompanyRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    public CompanyService(CompanyRepository companyRepository, AuditLogService auditLogService) {
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
    }

    public List<CompanyResponse> list() {
        return companyRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
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
            company.isActive()
        );
    }
}
