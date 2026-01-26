package com.orion.alnilam.dto.request;

import com.orion.alnilam.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;
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

    private Set<Role> roles;

    private boolean active;

    @NotBlank
    private String reason;
}
