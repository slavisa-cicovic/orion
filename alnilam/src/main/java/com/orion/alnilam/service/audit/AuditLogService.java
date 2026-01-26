package com.orion.alnilam.service.audit;

import com.orion.alnilam.domain.audit.AuditLog;
import com.orion.alnilam.repository.AuditLogRepository;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String entityType, Long entityId, String action, String reason) {
        AuditLog log = new AuditLog();
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setReason(reason);
        log.setActorUserId(currentUserId().orElse(null));
        log.setActorRole(currentRole().orElse(null));
        auditLogRepository.save(log);
    }

    private Optional<Long> currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long id) {
            return Optional.of(id);
        }
        if (principal instanceof String value) {
            try {
                return Optional.of(Long.parseLong(value));
            } catch (NumberFormatException ignored) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    private Optional<String> currentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Optional.empty();
        }
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(value -> value.startsWith("ROLE_"))
            .map(value -> value.substring("ROLE_".length()))
            .findFirst();
    }
}
