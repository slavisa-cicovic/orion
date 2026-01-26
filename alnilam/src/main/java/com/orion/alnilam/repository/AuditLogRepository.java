package com.orion.alnilam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.orion.alnilam.domain.audit.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
