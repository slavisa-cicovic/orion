package com.orion.alnilam.dto.response;

import lombok.Getter;

@Getter
public class UserDeviceResponse {
    private final Long id;
    private final String deviceType;
    private final String platform;

    public UserDeviceResponse(Long id, String deviceType, String platform) {
        this.id = id;
        this.deviceType = deviceType;
        this.platform = platform;
    }
}
