package com.orion.alnilam.service.auth;

import com.orion.alnilam.dto.request.LoginRequest;
import com.orion.alnilam.dto.response.LoginResponse;
import com.orion.alnilam.dto.request.RefreshRequest;
import com.orion.alnilam.dto.response.RefreshResponse;
import com.orion.alnilam.domain.RefreshToken;
import com.orion.alnilam.service.security.JwtService;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.repository.RefreshTokenRepository;
import com.orion.alnilam.repository.UserRepository;
import java.time.Instant;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        RefreshTokenRepository refreshTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        String accessToken = jwtService.createAccessToken(user);
        JwtService.RefreshTokenPayload refreshPayload = jwtService.createRefreshTokenPayload(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshPayload.token());
        refreshToken.setExpiresAt(refreshPayload.expiresAt());
        refreshTokenRepository.save(refreshToken);

        return new LoginResponse(accessToken, refreshPayload.token());
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
}
