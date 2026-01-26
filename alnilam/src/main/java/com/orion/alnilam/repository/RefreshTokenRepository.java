package com.orion.alnilam.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orion.alnilam.domain.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
}
