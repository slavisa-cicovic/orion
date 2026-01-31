package com.orion.alnilam.dto.response;

import java.time.Instant;
import lombok.Getter;
import com.orion.alnilam.domain.enums.CompanyUserStatus;

@Getter
public class CompanyUserStatusResponse {
    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final CompanyUserStatus status;
    private final boolean active;
    private final Instant lastLoggedInAt;

    public CompanyUserStatusResponse(
            Long id,
            String firstName,
            String lastName,
            String email,
            CompanyUserStatus status,
            boolean active,
            Instant lastLoggedInAt
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.status = status;
        this.active = active;
        this.lastLoggedInAt = lastLoggedInAt;
    }
}
