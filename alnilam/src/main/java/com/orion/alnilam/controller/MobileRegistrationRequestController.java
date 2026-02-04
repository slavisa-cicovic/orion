package com.orion.alnilam.controller;

import com.orion.alnilam.dto.request.MobileRegistrationDecisionRequest;
import com.orion.alnilam.dto.response.MobileRegistrationRequestResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.service.mobile.MobileRegistrationRequestService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/mobile/registration-requests")
@PreAuthorize("hasRole('COMPANY_ADMIN')")
public class MobileRegistrationRequestController {
    private final MobileRegistrationRequestService mobileRegistrationRequestService;

    public MobileRegistrationRequestController(MobileRegistrationRequestService mobileRegistrationRequestService) {
        this.mobileRegistrationRequestService = mobileRegistrationRequestService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<MobileRegistrationRequestResponse>> listPending(
        @RequestParam(name = "page", defaultValue = "0") int page,
        @RequestParam(name = "pageSize", defaultValue = "50") int pageSize,
        @RequestParam(name = "search", required = false) String search,
        Authentication authentication
    ) {
        return ResponseEntity.ok(mobileRegistrationRequestService.listPending(page, pageSize, search, authentication));
    }

    @PostMapping("/{requestId}/decision")
    public ResponseEntity<Void> processDecision(
        @PathVariable(name = "requestId") Long requestId,
        @Valid @RequestBody MobileRegistrationDecisionRequest request,
        Authentication authentication
    ) {
        mobileRegistrationRequestService.process(requestId, request, authentication);
        return ResponseEntity.noContent().build();
    }
}
