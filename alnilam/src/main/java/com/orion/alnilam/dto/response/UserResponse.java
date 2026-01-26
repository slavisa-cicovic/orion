package com.orion.alnilam.dto.response;

import com.orion.alnilam.domain.enums.Role;
import java.util.Set;
import lombok.Getter;

@Getter
public class UserResponse {
    private final Long id;
    private final Long companyId;
    private final String companyName;
    private final String username;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String phone;
    private final Set<Role> roles;
    private final boolean active;

    public UserResponse(
        Long id,
        Long companyId,
        String companyName,
        String username,
        String email,
        String firstName,
        String lastName,
        String phone,
        Set<Role> roles,
        boolean active
    ) {
        this.id = id;
        this.companyId = companyId;
        this.companyName = companyName;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.roles = roles;
        this.active = active;
    }
}
