package com.orion.alnilam.dto.request;

import com.orion.alnilam.domain.enums.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationVersionUpdateRequest {
    @NotBlank
    private String versionName;

    @NotNull
    private Platform platform;

    private Integer minSdk;
    private Integer targetSdk;
    private String fileUrl;
    private String originalFileName;
    private String checksum;
    private boolean active;

    @NotBlank
    private String reason;
}
