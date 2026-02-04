package com.orion.alnilam.repository;

import com.orion.alnilam.domain.mobile.UserAppInstallation;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAppInstallationRepository extends JpaRepository<UserAppInstallation, Long> {
    Optional<UserAppInstallation> findByUserIdAndApplicationIdAndDeviceId(Long userId, Long applicationId, String deviceId);

    List<UserAppInstallation> findByUserIdInAndApplicationId(Collection<Long> userIds, Long applicationId);
}
