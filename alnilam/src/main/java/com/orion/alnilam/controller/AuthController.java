package com.orion.alnilam.controller;

import com.orion.alnilam.dto.request.ChangePasswordRequest;
import com.orion.alnilam.dto.request.LoginRequest;
import com.orion.alnilam.dto.request.RegisterRequest;
import com.orion.alnilam.dto.request.UpdateMyProfileRequest;
import com.orion.alnilam.dto.response.LoginResponse;
import com.orion.alnilam.dto.response.MyProfileResponse;
import com.orion.alnilam.dto.request.RefreshRequest;
import com.orion.alnilam.dto.response.RefreshResponse;
import com.orion.alnilam.service.auth.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<MyProfileResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getMyProfile(authentication));
    }

    @PutMapping("/me")
    public ResponseEntity<MyProfileResponse> updateMe(
        Authentication authentication,
        @Valid @RequestBody UpdateMyProfileRequest request
    ) {
        return ResponseEntity.ok(authService.updateMyProfile(authentication, request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
        Authentication authentication,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(authentication, request);
        return ResponseEntity.noContent().build();
    }
}
