package com.orion.alnilam.repository;

import com.orion.alnilam.domain.application.CompanyApplicationAccess;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompanyApplicationAccessRepository extends JpaRepository<CompanyApplicationAccess, Long> {
    List<CompanyApplicationAccess> findByApplicationVersionId(Long applicationVersionId);

    @Query("""
        select access
        from CompanyApplicationAccess access
        join fetch access.applicationVersion version
        where version.application.id = :applicationId
        """)
    List<CompanyApplicationAccess> findByApplicationId(@Param("applicationId") Long applicationId);
}
