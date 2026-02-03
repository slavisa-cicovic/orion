package com.orion.alnilam.repository;

import com.orion.alnilam.domain.application.CompanyUserApplicationAccess;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompanyUserApplicationAccessRepository extends JpaRepository<CompanyUserApplicationAccess, Long> {
    boolean existsByCompanyIdAndApplicationVersion_Id(Long companyId, Long applicationVersionId);
    boolean existsByCompanyIdAndApplicationVersion_IdAndUserIdIsNull(Long companyId, Long applicationVersionId);
    boolean existsByCompanyIdAndApplicationVersion_IdAndUserId(
        Long companyId,
        Long applicationVersionId,
        Long userId
    );

    List<CompanyUserApplicationAccess> findByCompanyIdAndApplicationVersion_Id(Long companyId, Long applicationVersionId);

    @Query("""
        select access
        from CompanyUserApplicationAccess access
        join fetch access.applicationVersion version
        join fetch version.application app
        where access.companyId = :companyId
        """)
    List<CompanyUserApplicationAccess> findByCompanyIdWithApplication(@Param("companyId") Long companyId);
}
