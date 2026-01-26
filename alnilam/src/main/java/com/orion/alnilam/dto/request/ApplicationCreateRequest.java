package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationCreateRequest {
    @NotBlank
    private String packageName;

    @NotBlank
    private String displayName;

    private String description;
    private String iconUrl;
    private boolean active = true;
}
