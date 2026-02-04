package com.orion.alnilam.service.mobile;

import com.orion.alnilam.domain.mobile.UserAppInstallation;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.dto.request.MobileInstallationReportRequest;
import com.orion.alnilam.repository.UserAppInstallationRepository;
import com.orion.alnilam.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MobileInstallationService {
    private final UserRepository userRepository;
    private final UserAppInstallationRepository userAppInstallationRepository;

    public MobileInstallationService(
        UserRepository userRepository,
        UserAppInstallationRepository userAppInstallationRepository
    ) {
        this.userRepository = userRepository;
        this.userAppInstallationRepository = userAppInstallationRepository;
    }

    @Transactional
    public void report(MobileInstallationReportRequest request, org.springframework.security.core.Authentication authentication) {
        User actor = getAuthenticatedUser(authentication);

        for (MobileInstallationReportRequest.Item item : request.items()) {
            if (!StringUtils.hasText(item.deviceId()) || !StringUtils.hasText(item.packageName())) {
                continue;
            }

            UserAppInstallation installation = userAppInstallationRepository
                .findByUserIdAndApplicationIdAndDeviceId(actor.getId(), item.appId(), item.deviceId().trim())
                .orElseGet(UserAppInstallation::new);

            installation.setUserId(actor.getId());
            installation.setApplicationId(item.appId());
            installation.setDeviceId(item.deviceId().trim());
            installation.setPackageName(item.packageName().trim());
            installation.setPlatform(item.platform().trim().toUpperCase());
            installation.setInstalled(Boolean.TRUE.equals(item.installed()));
            installation.setVersionName(StringUtils.hasText(item.versionName()) ? item.versionName().trim() : null);

            userAppInstallationRepository.save(installation);
        }
    }

    private User getAuthenticatedUser(org.springframework.security.core.Authentication authentication) {
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
}
