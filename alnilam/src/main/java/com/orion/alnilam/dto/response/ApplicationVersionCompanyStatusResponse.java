package com.orion.alnilam.dto.response;

public record ApplicationVersionCompanyStatusResponse(
    Long companyId,
    String companyName,
    String address,
    String city,
    String zip,
    String latestPublishedVersionName,
    boolean publishedToCompany,
    boolean publishedToUsers,
    boolean selectable,
    String selectableReason
) {}
