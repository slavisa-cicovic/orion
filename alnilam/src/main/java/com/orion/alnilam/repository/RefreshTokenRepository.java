package com.orion.alnilam.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orion.alnilam.domain.RefreshToken;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Query("select rt from RefreshToken rt join fetch rt.user where rt.token = :token")
    Optional<RefreshToken> findByTokenWithUser(@Param("token") String token);
}
