package com.orion.alnilam.service.mobile;

import com.orion.alnilam.domain.application.ApplicationVersion;
import com.orion.alnilam.domain.application.CompanyApplicationAccess;
import com.orion.alnilam.domain.application.CompanyUserApplicationAccess;
import com.orion.alnilam.domain.enums.Role;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.dto.response.MobileHomeAppResponse;
import com.orion.alnilam.repository.CompanyApplicationAccessRepository;
import com.orion.alnilam.repository.CompanyUserApplicationAccessRepository;
import com.orion.alnilam.repository.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MobileHomeService {
    private final UserRepository userRepository;
    private final CompanyApplicationAccessRepository companyAccessRepository;
    private final CompanyUserApplicationAccessRepository companyUserAccessRepository;

    public MobileHomeService(
        UserRepository userRepository,
        CompanyApplicationAccessRepository companyAccessRepository,
        CompanyUserApplicationAccessRepository companyUserAccessRepository
    ) {
        this.userRepository = userRepository;
        this.companyAccessRepository = companyAccessRepository;
        this.companyUserAccessRepository = companyUserAccessRepository;
    }

    public List<MobileHomeAppResponse> listApps(Authentication authentication) {
        User actor = getAuthenticatedUser(authentication);
        Long companyId = actor.getCompanyId();
        if (companyId == null) {
            return List.of();
        }

        Set<Role> roles = currentRoles(authentication);
        if (roles.contains(Role.COMPANY_ADMIN)) {
            return listForCompanyAdmin(companyId);
        }

        if (roles.contains(Role.COMPANY_USER) || roles.contains(Role.COMPANY_PILOT_USER)) {
            return listForCompanyUser(companyId);
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unsupported role for mobile home");
    }

    public MobileHomeAppResponse publishToCompanyUsers(Long appId, Authentication authentication) {
        User actor = getAuthenticatedUser(authentication);
        Long companyId = actor.getCompanyId();
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not assigned to company");
        }

        Set<Role> roles = currentRoles(authentication);
        if (!roles.contains(Role.COMPANY_ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only COMPANY_ADMIN can publish to company users");
        }

        Map<Long, ApplicationVersion> latestCompanyVersions = latestByAppFromCompanyAccess(companyId);
        ApplicationVersion version = latestCompanyVersions.get(appId);
        if (version == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application is not available for this company");
        }

        boolean exists = companyUserAccessRepository.existsByCompanyIdAndApplicationVersionId(companyId, version.getId());
        if (!exists) {
            CompanyUserApplicationAccess access = new CompanyUserApplicationAccess();
            access.setCompanyId(companyId);
            access.setApplicationVersion(version);
            access.setCreatedById(actor.getId());
            companyUserAccessRepository.save(access);
        }

        long totalCompanyUsers = countCompanyUsers(companyId);
        return toResponse(version, "PUBLISHED_TO_USERS", true, totalCompanyUsers, totalCompanyUsers);
    }

    private List<MobileHomeAppResponse> listForCompanyAdmin(Long companyId) {
        Map<Long, ApplicationVersion> latestCompanyVersions = latestByAppFromCompanyAccess(companyId);
        Map<Long, ApplicationVersion> latestPublishedToUsers = latestByAppFromUserPublish(companyId);
        long totalCompanyUsers = countCompanyUsers(companyId);

        return latestCompanyVersions.values().stream()
            .sorted((left, right) -> left.getApplication().getDisplayName()
                .compareToIgnoreCase(right.getApplication().getDisplayName()))
            .map(version -> {
                ApplicationVersion publishedToUsers = latestPublishedToUsers.get(version.getApplication().getId());
                String status = "PUBLISHED_TO_COMPANY";
                long publishedToUsersCount = 0;
                if (publishedToUsers != null
                    && compareVersionName(publishedToUsers.getVersionName(), version.getVersionName()) >= 0) {
                    status = "PUBLISHED_TO_USERS";
                    publishedToUsersCount = totalCompanyUsers;
                }
                return toResponse(version, status, true, publishedToUsersCount, totalCompanyUsers);
            })
            .toList();
    }

    private List<MobileHomeAppResponse> listForCompanyUser(Long companyId) {
        Map<Long, ApplicationVersion> latestByApp = latestByAppFromUserPublish(companyId);
        long totalCompanyUsers = countCompanyUsers(companyId);
        return latestByApp.values().stream()
            .sorted((left, right) -> left.getApplication().getDisplayName()
                .compareToIgnoreCase(right.getApplication().getDisplayName()))
            .map(version -> toResponse(version, "PUBLISHED_TO_USERS", false, totalCompanyUsers, totalCompanyUsers))
            .toList();
    }

    private Map<Long, ApplicationVersion> latestByAppFromCompanyAccess(Long companyId) {
        List<CompanyApplicationAccess> accesses = companyAccessRepository.findByCompanyIdWithApplication(companyId);
        Map<Long, ApplicationVersion> latestByApp = new HashMap<>();
        for (CompanyApplicationAccess access : accesses) {
            ApplicationVersion version = access.getApplicationVersion();
            Long appId = version.getApplication().getId();
            ApplicationVersion existing = latestByApp.get(appId);
            if (existing == null
                || compareVersionName(version.getVersionName(), existing.getVersionName()) > 0) {
                latestByApp.put(appId, version);
            }
        }
        return latestByApp;
    }

    private Map<Long, ApplicationVersion> latestByAppFromUserPublish(Long companyId) {
        List<CompanyUserApplicationAccess> accesses = companyUserAccessRepository.findByCompanyIdWithApplication(companyId);
        Map<Long, ApplicationVersion> latestByApp = new HashMap<>();
        for (CompanyUserApplicationAccess access : accesses) {
            ApplicationVersion version = access.getApplicationVersion();
            Long appId = version.getApplication().getId();
            ApplicationVersion existing = latestByApp.get(appId);
            if (existing == null
                || compareVersionName(version.getVersionName(), existing.getVersionName()) > 0) {
                latestByApp.put(appId, version);
            }
        }
        return latestByApp;
    }

    private MobileHomeAppResponse toResponse(
        ApplicationVersion version,
        String status,
        boolean canPublishToCompanyUsers,
        long publishedToUsersCount,
        long totalCompanyUsers
    ) {
        return new MobileHomeAppResponse(
            version.getApplication().getId(),
            version.getApplication().getDisplayName(),
            version.getApplication().getPackageName(),
            version.getApplication().getDescription(),
            version.getApplication().getIconUrl(),
            version.getVersionName(),
            version.getFileUrl(),
            status,
            canPublishToCompanyUsers,
            publishedToUsersCount,
            totalCompanyUsers
        );
    }

    private long countCompanyUsers(Long companyId) {
        return userRepository.findByCompanyId(companyId).stream()
            .filter(User::isActive)
            .filter(user ->
                user.getRoles().contains(Role.COMPANY_USER) || user.getRoles().contains(Role.COMPANY_PILOT_USER))
            .count();
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        Long userId;
        Object principal = authentication.getPrincipal();
        if (principal instanceof Number number) {
            userId = number.longValue();
        } else {
            try {
                userId = Long.valueOf(principal.toString());
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
            }
        }

        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private Set<Role> currentRoles(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(authority -> authority.startsWith("ROLE_") ? authority.substring(5) : authority)
            .map(Role::valueOf)
            .collect(java.util.stream.Collectors.toSet());
    }

    private int compareVersionName(String left, String right) {
        if (!StringUtils.hasText(left) || !StringUtils.hasText(right)) {
            return 0;
        }
        String[] leftParts = left.split("\\.");
        String[] rightParts = right.split("\\.");
        boolean numericOnly = true;
        for (String part : leftParts) {
            if (!part.matches("\\d+")) {
                numericOnly = false;
                break;
            }
        }
        if (numericOnly) {
            for (String part : rightParts) {
                if (!part.matches("\\d+")) {
                    numericOnly = false;
                    break;
                }
            }
        }

        if (numericOnly) {
            int max = Math.max(leftParts.length, rightParts.length);
            for (int i = 0; i < max; i++) {
                int l = i < leftParts.length ? Integer.parseInt(leftParts[i]) : 0;
                int r = i < rightParts.length ? Integer.parseInt(rightParts[i]) : 0;
                if (l != r) {
                    return Integer.compare(l, r);
                }
            }
            return 0;
        }

        return left.compareToIgnoreCase(right);
    }
}
