package com.orion.alnilam.controller;

import com.orion.alnilam.dto.response.MobileHomeAppResponse;
import com.orion.alnilam.service.mobile.MobileHomeService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mobile/home/apps")
@PreAuthorize("hasRole('COMPANY_ADMIN') or hasRole('COMPANY_USER') or hasRole('COMPANY_PILOT_USER')")
public class MobileHomeController {
    private final MobileHomeService mobileHomeService;

    public MobileHomeController(MobileHomeService mobileHomeService) {
        this.mobileHomeService = mobileHomeService;
    }

    @GetMapping
    public ResponseEntity<List<MobileHomeAppResponse>> list(Authentication authentication) {
        return ResponseEntity.ok(mobileHomeService.listApps(authentication));
    }

    @PostMapping("/{appId}/publish")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<MobileHomeAppResponse> publishToCompanyUsers(
        @PathVariable Long appId,
        Authentication authentication
    ) {
        return ResponseEntity.ok(mobileHomeService.publishToCompanyUsers(appId, authentication));
    }
}
