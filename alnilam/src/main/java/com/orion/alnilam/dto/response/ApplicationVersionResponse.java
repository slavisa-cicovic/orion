package com.orion.alnilam.dto.response;

import com.orion.alnilam.domain.enums.ApplicationVersionStatus;
import com.orion.alnilam.domain.enums.Platform;
import lombok.Getter;

@Getter
public class ApplicationVersionResponse {
    private final Long id;
    private final Long applicationId;
    private final String applicationName;
    private final String versionName;
    private final Integer versionCode;
    private final Platform platform;
    private final Integer minSdk;
    private final Integer targetSdk;
    private final String fileUrl;
    private final String originalFileName;
    private final String checksum;
    private final ApplicationVersionStatus status;
    private final boolean active;

    public ApplicationVersionResponse(
        Long id,
        Long applicationId,
        String applicationName,
        String versionName,
        Integer versionCode,
        Platform platform,
        Integer minSdk,
        Integer targetSdk,
        String fileUrl,
        String originalFileName,
        String checksum,
        ApplicationVersionStatus status,
        boolean active
    ) {
        this.id = id;
        this.applicationId = applicationId;
        this.applicationName = applicationName;
        this.versionName = versionName;
        this.versionCode = versionCode;
        this.platform = platform;
        this.minSdk = minSdk;
        this.targetSdk = targetSdk;
        this.fileUrl = fileUrl;
        this.originalFileName = originalFileName;
        this.checksum = checksum;
        this.status = status;
        this.active = active;
    }
}
