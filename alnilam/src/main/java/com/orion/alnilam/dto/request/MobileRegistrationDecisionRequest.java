package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.NotNull;

public record MobileRegistrationDecisionRequest(
    @NotNull Boolean approve,
    Boolean pilotUser
) {
}
