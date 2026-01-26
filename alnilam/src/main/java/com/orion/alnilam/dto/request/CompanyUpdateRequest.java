package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class CompanyUpdateRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @NotBlank
    private String reason;

    private boolean active;

    private String address;
    private String city;
    private String zip;
}