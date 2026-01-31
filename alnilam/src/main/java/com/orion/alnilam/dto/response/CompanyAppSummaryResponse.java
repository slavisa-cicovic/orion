package com.orion.alnilam.dto.response;

import lombok.Getter;

@Getter
public class CompanyAppSummaryResponse {
    private final Long appId;
    private final String appName;
    private final String latestPublishedVersionName;
    private final int publishedUsersCount;

    public CompanyAppSummaryResponse(
            Long appId,
            String appName,
            String latestPublishedVersionName,
            int publishedUsersCount
    ) {
        this.appId = appId;
        this.appName = appName;
        this.latestPublishedVersionName = latestPublishedVersionName;
        this.publishedUsersCount = publishedUsersCount;
    }
}
