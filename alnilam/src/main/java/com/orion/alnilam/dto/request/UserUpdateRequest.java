package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    private String password;

    private String firstName;
    private String lastName;
    private String phone;

    private Long companyId;

    private boolean active;

    @NotBlank
    private String reason;
}
