package com.orion.alnilam.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record MobileInstallationReportRequest(
    @Valid @NotNull List<Item> items
) {
    public record Item(
        @NotNull Long appId,
        @NotBlank String packageName,
        String versionName,
        @NotNull Boolean installed,
        @NotBlank String platform,
        @NotBlank String deviceId
    ) {
    }
}
