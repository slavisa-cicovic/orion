package com.orion.alnilam.dto.response;

import lombok.Getter;
@Getter
public class RefreshResponse {
    private final String accessToken;
    private final String refreshToken;

    public RefreshResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}