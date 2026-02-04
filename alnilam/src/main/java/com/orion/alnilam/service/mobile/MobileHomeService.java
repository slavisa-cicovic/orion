package com.orion.alnilam.service.mobile;

import com.orion.alnilam.domain.application.ApplicationVersion;
import com.orion.alnilam.domain.application.CompanyApplicationAccess;
import com.orion.alnilam.domain.application.CompanyUserApplicationAccess;
import com.orion.alnilam.domain.enums.Role;
import com.orion.alnilam.domain.mobile.UserAppInstallation;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.dto.request.MobilePublishUsersRequest;
import com.orion.alnilam.dto.response.MobileHomeAppResponse;
import com.orion.alnilam.dto.response.MobilePublishUserResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.repository.CompanyApplicationAccessRepository;
import com.orion.alnilam.repository.CompanyUserApplicationAccessRepository;
import com.orion.alnilam.repository.UserAppInstallationRepository;
import com.orion.alnilam.repository.UserRepository;
import java.util.HashMap;
import java.util.HashSet;
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
    private final UserAppInstallationRepository userAppInstallationRepository;

    public MobileHomeService(
        UserRepository userRepository,
        CompanyApplicationAccessRepository companyAccessRepository,
        CompanyUserApplicationAccessRepository companyUserAccessRepository,
        UserAppInstallationRepository userAppInstallationRepository
    ) {
        this.userRepository = userRepository;
        this.companyAccessRepository = companyAccessRepository;
        this.companyUserAccessRepository = companyUserAccessRepository;
        this.userAppInstallationRepository = userAppInstallationRepository;
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
            return listForCompanyUser(companyId, actor.getId());
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unsupported role for mobile home");
    }

    public PagedResponse<MobilePublishUserResponse> listPublishUsers(
        Long appId,
        int page,
        int pageSize,
        String search,
        Authentication authentication
    ) {
        User actor = getAuthenticatedUser(authentication);
        Long companyId = actor.getCompanyId();
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not assigned to company");
        }

        if (!currentRoles(authentication).contains(Role.COMPANY_ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only COMPANY_ADMIN can manage app publish users");
        }

        ApplicationVersion targetVersion = resolveCompanyVersion(appId, companyId);
        List<User> companyUsers = listCompanyUsers(companyId, search);
        PublishedVersionSnapshot publishedSnapshot = resolveLatestPublishedVersions(companyId, appId);
        Map<Long, Boolean> installedByUserId = resolveInstalledStatusByUserId(companyUsers, appId, publishedSnapshot);

        boolean publishedToAll = companyUserAccessRepository.existsByCompanyIdAndApplicationVersion_IdAndUserIdIsNull(
            companyId,
            targetVersion.getId()
        );
        Set<Long> publishedUserIds = publishedToAll
            ? Set.of()
            : loadPublishedUserIds(companyId, targetVersion.getId());

        int safePage = Math.max(0, page);
        int safePageSize = Math.min(200, Math.max(1, pageSize));
        int fromIndex = safePage * safePageSize;
        if (fromIndex >= companyUsers.size()) {
            return new PagedResponse<>(List.of(), safePage, safePageSize, companyUsers.size());
        }
        int toIndex = Math.min(companyUsers.size(), fromIndex + safePageSize);

        List<MobilePublishUserResponse> items = companyUsers.subList(fromIndex, toIndex).stream()
            .map(user -> {
                String latestPublishedVersionName = publishedSnapshot.latestVersionByUserId().get(user.getId());
                String latestPublishedToAll = publishedSnapshot.latestPublishedToAllVersionName();
                if (latestPublishedToAll != null
                    && (latestPublishedVersionName == null
                        || compareVersionName(latestPublishedToAll, latestPublishedVersionName) > 0)) {
                    latestPublishedVersionName = latestPublishedToAll;
                }

                return new MobilePublishUserResponse(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRoles().contains(Role.COMPANY_PILOT_USER),
                    publishedToAll || publishedUserIds.contains(user.getId()),
                    latestPublishedVersionName,
                    installedByUserId.get(user.getId())
                );
            })
            .toList();

        return new PagedResponse<>(items, safePage, safePageSize, companyUsers.size());
    }

    public MobileHomeAppResponse publishToSelectedUsers(
        Long appId,
        MobilePublishUsersRequest request,
        Authentication authentication
    ) {
        User actor = getAuthenticatedUser(authentication);
        Long companyId = actor.getCompanyId();
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not assigned to company");
        }

        if (!currentRoles(authentication).contains(Role.COMPANY_ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only COMPANY_ADMIN can publish to company users");
        }

        ApplicationVersion targetVersion = resolveCompanyVersion(appId, companyId);

        if (companyUserAccessRepository.existsByCompanyIdAndApplicationVersion_IdAndUserIdIsNull(
            companyId,
            targetVersion.getId()
        )) {
            long totalCompanyUsers = countCompanyUsers(companyId);
            return toResponse(targetVersion, "PUBLISHED_TO_USERS", true, totalCompanyUsers, totalCompanyUsers);
        }

        Set<Long> allowedUserIds = listCompanyUsers(companyId, null).stream()
            .map(User::getId)
            .collect(java.util.stream.Collectors.toSet());

        Set<Long> requestedUserIds = new HashSet<>(request.userIds());
        if (requestedUserIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No users selected");
        }

        for (Long userId : requestedUserIds) {
            if (!allowedUserIds.contains(userId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected users must belong to your company");
            }
        }

        for (Long userId : requestedUserIds) {
            boolean exists = companyUserAccessRepository.existsByCompanyIdAndApplicationVersion_IdAndUserId(
                companyId,
                targetVersion.getId(),
                userId
            );
            if (!exists) {
                CompanyUserApplicationAccess access = new CompanyUserApplicationAccess();
                access.setCompanyId(companyId);
                access.setUserId(userId);
                access.setApplicationVersion(targetVersion);
                access.setCreatedById(actor.getId());
                companyUserAccessRepository.save(access);
            }
        }

        long totalCompanyUsers = countCompanyUsers(companyId);
        long publishedUsersCount = countPublishedUsers(companyId, targetVersion.getId(), totalCompanyUsers);
        return toResponse(targetVersion, "PUBLISHED_TO_USERS", true, publishedUsersCount, totalCompanyUsers);
    }

    public MobileHomeAppResponse publishToCompanyUsers(Long appId, Authentication authentication) {
        User actor = getAuthenticatedUser(authentication);
        Long companyId = actor.getCompanyId();
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not assigned to company");
        }

        if (!currentRoles(authentication).contains(Role.COMPANY_ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only COMPANY_ADMIN can publish to company users");
        }

        ApplicationVersion targetVersion = resolveCompanyVersion(appId, companyId);
        List<User> allUsers = listCompanyUsers(companyId, null);
        Set<Long> allUserIds = allUsers.stream().map(User::getId).collect(java.util.stream.Collectors.toSet());

        for (Long userId : allUserIds) {
            boolean exists = companyUserAccessRepository.existsByCompanyIdAndApplicationVersion_IdAndUserId(
                companyId,
                targetVersion.getId(),
                userId
            );
            if (!exists) {
                CompanyUserApplicationAccess access = new CompanyUserApplicationAccess();
                access.setCompanyId(companyId);
                access.setUserId(userId);
                access.setApplicationVersion(targetVersion);
                access.setCreatedById(actor.getId());
                companyUserAccessRepository.save(access);
            }
        }

        long totalCompanyUsers = allUserIds.size();
        return toResponse(targetVersion, "PUBLISHED_TO_USERS", true, totalCompanyUsers, totalCompanyUsers);
    }

    private List<MobileHomeAppResponse> listForCompanyAdmin(Long companyId) {
        Map<Long, ApplicationVersion> latestCompanyVersions = latestByAppFromCompanyAccess(companyId);
        Map<Long, ApplicationVersion> latestPublishedToUsers = latestByAppFromUserPublish(companyId, null);
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
                    publishedToUsersCount = countPublishedUsers(companyId, version.getId(), totalCompanyUsers);
                }
                return toResponse(version, status, true, publishedToUsersCount, totalCompanyUsers);
            })
            .toList();
    }

    private List<MobileHomeAppResponse> listForCompanyUser(Long companyId, Long userId) {
        Map<Long, ApplicationVersion> latestByApp = latestByAppFromUserPublish(companyId, userId);
        long totalCompanyUsers = countCompanyUsers(companyId);
        return latestByApp.values().stream()
            .sorted((left, right) -> left.getApplication().getDisplayName()
                .compareToIgnoreCase(right.getApplication().getDisplayName()))
            .map(version -> toResponse(version, "PUBLISHED_TO_USERS", false, totalCompanyUsers, totalCompanyUsers))
            .toList();
    }

    private ApplicationVersion resolveCompanyVersion(Long appId, Long companyId) {
        Map<Long, ApplicationVersion> latestCompanyVersions = latestByAppFromCompanyAccess(companyId);
        ApplicationVersion version = latestCompanyVersions.get(appId);
        if (version == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application is not available for this company");
        }
        return version;
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

    private Map<Long, ApplicationVersion> latestByAppFromUserPublish(Long companyId, Long userId) {
        List<CompanyUserApplicationAccess> accesses = companyUserAccessRepository.findByCompanyIdWithApplication(companyId);
        Map<Long, ApplicationVersion> latestByApp = new HashMap<>();
        for (CompanyUserApplicationAccess access : accesses) {
            if (userId != null && access.getUserId() != null && !access.getUserId().equals(userId)) {
                continue;
            }
            if (userId != null && access.getUserId() == null) {
                // Published to all users.
            }
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

    private Set<Long> loadPublishedUserIds(Long companyId, Long versionId) {
        return companyUserAccessRepository.findByCompanyIdAndApplicationVersion_Id(companyId, versionId).stream()
            .map(CompanyUserApplicationAccess::getUserId)
            .filter(java.util.Objects::nonNull)
            .collect(java.util.stream.Collectors.toSet());
    }

    private PublishedVersionSnapshot resolveLatestPublishedVersions(Long companyId, Long appId) {
        String latestPublishedToAllVersionName = null;
        Map<Long, String> latestByUser = new HashMap<>();

        for (CompanyUserApplicationAccess access : companyUserAccessRepository.findByCompanyIdWithApplication(companyId)) {
            ApplicationVersion version = access.getApplicationVersion();
            if (!version.getApplication().getId().equals(appId)) {
                continue;
            }

            String versionName = version.getVersionName();
            if (access.getUserId() == null) {
                if (latestPublishedToAllVersionName == null
                    || compareVersionName(versionName, latestPublishedToAllVersionName) > 0) {
                    latestPublishedToAllVersionName = versionName;
                }
                continue;
            }

            String existing = latestByUser.get(access.getUserId());
            if (existing == null || compareVersionName(versionName, existing) > 0) {
                latestByUser.put(access.getUserId(), versionName);
            }
        }

        return new PublishedVersionSnapshot(latestPublishedToAllVersionName, latestByUser);
    }

    private Map<Long, Boolean> resolveInstalledStatusByUserId(
        List<User> users,
        Long appId,
        PublishedVersionSnapshot publishedSnapshot
    ) {
        if (users.isEmpty()) {
            return Map.of();
        }

        List<Long> userIds = users.stream().map(User::getId).toList();
        List<UserAppInstallation> installations = userAppInstallationRepository.findByUserIdInAndApplicationId(userIds, appId);

        Map<Long, Boolean> output = new HashMap<>();
        for (User user : users) {
            String expectedVersion = publishedSnapshot.latestVersionByUserId().get(user.getId());
            if (publishedSnapshot.latestPublishedToAllVersionName() != null
                && (expectedVersion == null
                    || compareVersionName(publishedSnapshot.latestPublishedToAllVersionName(), expectedVersion) > 0)) {
                expectedVersion = publishedSnapshot.latestPublishedToAllVersionName();
            }

            if (!StringUtils.hasText(expectedVersion)) {
                output.put(user.getId(), null);
                continue;
            }

            List<UserAppInstallation> userInstallations = installations.stream()
                .filter(installation -> installation.getUserId().equals(user.getId()))
                .toList();
            if (userInstallations.isEmpty()) {
                output.put(user.getId(), null);
                continue;
            }

            final String expectedVersionFinal = expectedVersion;
            boolean installed = userInstallations.stream().anyMatch(installation ->
                installation.isInstalled()
                    && StringUtils.hasText(installation.getVersionName())
                    && installation.getVersionName().trim().equalsIgnoreCase(expectedVersionFinal.trim())
            );
            output.put(user.getId(), installed);
        }

        return output;
    }

    private long countPublishedUsers(Long companyId, Long versionId, long totalCompanyUsers) {
        boolean publishedToAll = companyUserAccessRepository.existsByCompanyIdAndApplicationVersion_IdAndUserIdIsNull(
            companyId,
            versionId
        );
        if (publishedToAll) {
            return totalCompanyUsers;
        }
        return loadPublishedUserIds(companyId, versionId).size();
    }

    private List<User> listCompanyUsers(Long companyId, String search) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();

        return userRepository.findByCompanyId(companyId).stream()
            .filter(User::isActive)
            .filter(user ->
                user.getRoles().contains(Role.COMPANY_USER) || user.getRoles().contains(Role.COMPANY_PILOT_USER))
            .filter(user -> {
                if (normalizedSearch.isEmpty()) {
                    return true;
                }
                String haystack = ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
                    + (user.getLastName() == null ? "" : user.getLastName()) + " "
                    + (user.getEmail() == null ? "" : user.getEmail()) + " "
                    + (user.getUsername() == null ? "" : user.getUsername())).toLowerCase();
                return haystack.contains(normalizedSearch);
            })
            .sorted((left, right) -> {
                boolean leftPilot = left.getRoles().contains(Role.COMPANY_PILOT_USER);
                boolean rightPilot = right.getRoles().contains(Role.COMPANY_PILOT_USER);
                if (leftPilot != rightPilot) {
                    return leftPilot ? -1 : 1;
                }
                String leftName = ((left.getFirstName() == null ? "" : left.getFirstName()) + " "
                    + (left.getLastName() == null ? "" : left.getLastName())).trim();
                String rightName = ((right.getFirstName() == null ? "" : right.getFirstName()) + " "
                    + (right.getLastName() == null ? "" : right.getLastName())).trim();
                int byName = leftName.compareToIgnoreCase(rightName);
                if (byName != 0) {
                    return byName;
                }
                String leftEmail = left.getEmail() == null ? "" : left.getEmail();
                String rightEmail = right.getEmail() == null ? "" : right.getEmail();
                return leftEmail.compareToIgnoreCase(rightEmail);
            })
            .toList();
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

    private record PublishedVersionSnapshot(
        String latestPublishedToAllVersionName,
        Map<Long, String> latestVersionByUserId
    ) {
    }
}
