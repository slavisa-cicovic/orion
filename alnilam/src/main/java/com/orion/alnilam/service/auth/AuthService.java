package com.orion.alnilam.service.auth;

import com.orion.alnilam.dto.request.ChangePasswordRequest;
import com.orion.alnilam.dto.request.LoginRequest;
import com.orion.alnilam.dto.request.RegisterRequest;
import com.orion.alnilam.dto.request.UpdateMyProfileRequest;
import com.orion.alnilam.dto.response.MyProfileResponse;
import com.orion.alnilam.dto.response.LoginResponse;
import com.orion.alnilam.dto.request.RefreshRequest;
import com.orion.alnilam.dto.response.RefreshResponse;
import com.orion.alnilam.domain.company.Company;
import com.orion.alnilam.domain.RefreshToken;
import com.orion.alnilam.domain.registration.RegistrationRequest;
import com.orion.alnilam.service.security.JwtService;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.repository.CompanyRepository;
import com.orion.alnilam.repository.RefreshTokenRepository;
import com.orion.alnilam.repository.RegistrationRequestRepository;
import com.orion.alnilam.repository.UserRepository;
import java.time.Instant;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RegistrationRequestRepository registrationRequestRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        CompanyRepository companyRepository,
        RegistrationRequestRepository registrationRequestRepository,
        RefreshTokenRepository refreshTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.registrationRequestRepository = registrationRequestRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        Company company = companyRepository.findByCodeIgnoreCase(request.getCompanyCode().trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid company code"));

        if (!company.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company is inactive");
        }

        String normalizedEmail = request.getEmail().trim();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User with this email already exists");
        }

        RegistrationRequest registrationRequest = new RegistrationRequest();
        registrationRequest.setCompanyId(company.getId());
        registrationRequest.setCompanyCode(company.getCode());
        registrationRequest.setFirstName(request.getFirstName().trim());
        registrationRequest.setLastName(request.getLastName().trim());
        registrationRequest.setEmail(normalizedEmail);
        registrationRequest.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        registrationRequestRepository.save(registrationRequest);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository
            .findByUsernameIgnoreCaseOrEmailIgnoreCase(request.getUsernameOrEmail(), request.getUsernameOrEmail())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        user.setLastLoggedInAt(Instant.now());
        userRepository.save(user);

        String accessToken = jwtService.createAccessToken(user);
        JwtService.RefreshTokenPayload refreshPayload = jwtService.createRefreshTokenPayload(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshPayload.token());
        refreshToken.setExpiresAt(refreshPayload.expiresAt());
        refreshTokenRepository.save(refreshToken);

        return new LoginResponse(accessToken, refreshPayload.token());
    }

    @Transactional(readOnly = true)
    public MyProfileResponse getMyProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return toMyProfileResponse(user);
    }

    @Transactional
    public MyProfileResponse updateMyProfile(Authentication authentication, UpdateMyProfileRequest request) {
        User user = getAuthenticatedUser(authentication);

        String normalizedEmail = request.getEmail().trim();
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(request.getPhone() == null ? null : request.getPhone().trim());
        userRepository.save(user);

        return toMyProfileResponse(user);
    }

    @Transactional
    public void changePassword(Authentication authentication, ChangePasswordRequest request) {
        User user = getAuthenticatedUser(authentication);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is invalid");
        }

        if (request.getNewPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public RefreshResponse refresh(RefreshRequest request) {
        RefreshToken current = refreshTokenRepository.findByTokenWithUser(request.getRefreshToken())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (current.getRevokedAt() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token revoked");
        }

        if (current.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        User user = current.getUser();
        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User inactive");
        }

        user.setLastLoggedInAt(Instant.now());
        userRepository.save(user);

        current.setRevokedAt(Instant.now());
        refreshTokenRepository.save(current);

        String accessToken = jwtService.createAccessToken(user);
        JwtService.RefreshTokenPayload refreshPayload = jwtService.createRefreshTokenPayload(user);
        RefreshToken nextToken = new RefreshToken();
        nextToken.setUser(user);
        nextToken.setToken(refreshPayload.token());
        nextToken.setExpiresAt(refreshPayload.expiresAt());
        refreshTokenRepository.save(nextToken);

        return new RefreshResponse(accessToken, refreshPayload.token());
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Long userId;
        Object principal = authentication.getPrincipal();
        if (principal instanceof Number number) {
            userId = number.longValue();
        } else {
            try {
                userId = Long.valueOf(principal.toString());
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
            }
        }

        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private MyProfileResponse toMyProfileResponse(User user) {
        return new MyProfileResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getPhone()
        );
    }
}
