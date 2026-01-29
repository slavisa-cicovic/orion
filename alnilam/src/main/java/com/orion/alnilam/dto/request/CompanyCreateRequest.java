package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class CompanyCreateRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private boolean active = true;

    private String address;
    private String city;
    private String zip;
    private String iconUrl;
}
