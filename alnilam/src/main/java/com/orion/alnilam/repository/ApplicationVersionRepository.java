package com.orion.alnilam.repository;

import com.orion.alnilam.domain.application.ApplicationVersion;
import com.orion.alnilam.domain.enums.ApplicationVersionStatus;
import com.orion.alnilam.domain.enums.Platform;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationVersionRepository extends JpaRepository<ApplicationVersion, Long> {
    List<ApplicationVersion> findByApplicationId(Long applicationId);
    boolean existsByApplicationIdAndPlatformAndVersionName(Long applicationId, Platform platform, String versionName);
    boolean existsByApplicationIdAndStatus(Long applicationId, ApplicationVersionStatus status);

    @Query("""
        select v
        from ApplicationVersion v
        join fetch v.application
        where v.id = :id
        """)
    Optional<ApplicationVersion> findByIdWithApplication(@Param("id") Long id);

    @Query("""
        select v
        from ApplicationVersion v
        join fetch v.application
        where v.application.id = :applicationId
        """)
    List<ApplicationVersion> findByApplicationIdWithApplication(@Param("applicationId") Long applicationId);
}
