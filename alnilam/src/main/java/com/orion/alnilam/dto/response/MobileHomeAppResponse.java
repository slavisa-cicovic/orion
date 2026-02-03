package com.orion.alnilam.dto.response;

public record MobileHomeAppResponse(
    Long appId,
    String appName,
    String appPackageName,
    String appDescription,
    String appIconUrl,
    String versionName,
    String downloadUrl,
    String status,
    boolean canPublishToCompanyUsers,
    long publishedToUsersCount,
    long totalCompanyUsers
) {
}
