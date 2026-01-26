package com.orion.alnilam.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orion.alnilam.domain.company.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCodeIgnoreCase(String code);
}
