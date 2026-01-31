package com.orion.alnilam.dto.response;

import lombok.Getter;

@Getter
public class UserAppSummaryResponse {
    private final Long appId;
    private final String appName;
    private final String versionName;
    private final String status;

    public UserAppSummaryResponse(Long appId, String appName, String versionName, String status) {
        this.appId = appId;
        this.appName = appName;
        this.versionName = versionName;
        this.status = status;
    }
}
