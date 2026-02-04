package com.orion.alnilam.dto.response;

public record MobilePublishUserResponse(
    Long userId,
    String firstName,
    String lastName,
    String email,
    boolean pilotUser,
    boolean published,
    String latestPublishedVersionName,
    Boolean installed
) {
}
