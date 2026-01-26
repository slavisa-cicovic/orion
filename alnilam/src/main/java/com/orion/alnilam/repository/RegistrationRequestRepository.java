package com.orion.alnilam.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orion.alnilam.domain.registration.RegistrationRequest;

public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    List<RegistrationRequest> findByCompanyId(Long companyId);
}
