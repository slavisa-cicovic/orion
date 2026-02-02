package com.orion.alnilam.dto.response;

import lombok.Getter;

@Getter
public class MyProfileResponse {
    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phone;

    public MyProfileResponse(Long id, String firstName, String lastName, String email, String phone) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }
}
