package com.orion.alnilam.repository;

import com.orion.alnilam.domain.application.Application;
import com.orion.alnilam.domain.application.ApplicationVersion;
import com.orion.alnilam.domain.enums.ApplicationVersionStatus;
import com.orion.alnilam.domain.enums.Platform;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationVersionRepository extends JpaRepository<ApplicationVersion, Long> {
    List<ApplicationVersion> findByApplicationId(Long applicationId);
    Optional<ApplicationVersion> findTopByApplicationOrderByVersionCodeDesc(Application application);
    boolean existsByApplicationIdAndPlatformAndVersionCode(Long applicationId, Platform platform, Integer versionCode);
    boolean existsByApplicationIdAndStatus(Long applicationId, ApplicationVersionStatus status);
}
