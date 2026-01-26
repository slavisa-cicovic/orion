package com.orion.alnilam.repository;

import com.orion.alnilam.domain.application.CompanyApplicationAccess;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyApplicationAccessRepository extends JpaRepository<CompanyApplicationAccess, Long> {
    List<CompanyApplicationAccess> findByApplicationVersionId(Long applicationVersionId);
}
