package com.orion.alnilam.dto.response;

import lombok.Getter;
@Getter
public class CompanyResponse {
    private final Long id;
    private final String code;
    private final String name;
    private final String address;
    private final String city;
    private final String zip;
    private final boolean active;

    public CompanyResponse(
        Long id,
        String code,
        String name,
        String address,
        String city,
        String zip,
        boolean active
    ) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.address = address;
        this.city = city;
        this.zip = zip;
        this.active = active;
    }
}