package com.orion.alnilam.controller;

import com.orion.alnilam.dto.request.MobilePublishUsersRequest;
import com.orion.alnilam.dto.response.MobileHomeAppResponse;
import com.orion.alnilam.dto.response.MobilePublishUserResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import jakarta.validation.Valid;
import com.orion.alnilam.service.mobile.MobileHomeService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/{appId}/users")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<PagedResponse<MobilePublishUserResponse>> listUsers(
        @PathVariable Long appId,
        @RequestParam(name = "page", defaultValue = "0") int page,
        @RequestParam(name = "pageSize", defaultValue = "50") int pageSize,
        @RequestParam(name = "search", required = false) String search,
        Authentication authentication
    ) {
        return ResponseEntity.ok(mobileHomeService.listPublishUsers(appId, page, pageSize, search, authentication));
    }

    @PostMapping("/{appId}/publish/users")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<MobileHomeAppResponse> publishToSelectedUsers(
        @PathVariable Long appId,
        @Valid @RequestBody MobilePublishUsersRequest request,
        Authentication authentication
    ) {
        return ResponseEntity.ok(mobileHomeService.publishToSelectedUsers(appId, request, authentication));
    }
}
