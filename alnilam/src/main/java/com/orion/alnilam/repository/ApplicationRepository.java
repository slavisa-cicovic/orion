package com.orion.alnilam.repository;

import com.orion.alnilam.domain.application.Application;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByPackageNameIgnoreCase(String packageName);
    boolean existsByPackageNameIgnoreCase(String packageName);
}
