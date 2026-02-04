package com.orion.alnilam.controller;

import com.orion.alnilam.dto.request.MobileInstallationReportRequest;
import com.orion.alnilam.service.mobile.MobileInstallationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mobile/installations")
@PreAuthorize("hasRole('COMPANY_ADMIN') or hasRole('COMPANY_USER') or hasRole('COMPANY_PILOT_USER')")
public class MobileInstallationController {
    private final MobileInstallationService mobileInstallationService;

    public MobileInstallationController(MobileInstallationService mobileInstallationService) {
        this.mobileInstallationService = mobileInstallationService;
    }

    @PostMapping("/report")
    public ResponseEntity<Void> report(
        @Valid @RequestBody MobileInstallationReportRequest request,
        Authentication authentication
    ) {
        mobileInstallationService.report(request, authentication);
        return ResponseEntity.noContent().build();
    }
}
