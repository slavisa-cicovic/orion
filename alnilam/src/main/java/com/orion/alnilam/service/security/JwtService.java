package com.orion.alnilam.service.security;

import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

public class JwtService {
    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.getAccessTokenTtlMinutes(), ChronoUnit.MINUTES);
        return Jwts.builder()
            .setIssuer(properties.getIssuer())
            .setSubject(String.valueOf(user.getId()))
            .claim("uid", user.getId())
            .claim("email", user.getEmail())
            .claim("username", user.getUsername())
            .claim("roles", user.getRoles().stream().map(Enum::name).toList())
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiresAt))
            .signWith(signingKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public RefreshTokenPayload createRefreshTokenPayload(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(properties.getRefreshTokenTtlDays(), ChronoUnit.DAYS);
        return new RefreshTokenPayload(UUID.randomUUID().toString(), expiresAt);
    }

    public Claims parseAccessToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(signingKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key signingKey() {
        byte[] secret = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }
        return Keys.hmacShaKeyFor(secret);
    }

    public record RefreshTokenPayload(String token, Instant expiresAt) {
    }
}
