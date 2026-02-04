package com.orion.alnilam.dto.response;

import java.time.Instant;

public record MobileRegistrationRequestResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String phone,
    Instant requestedAt
) {
}
