package com.orion.alnilam.dto.response;

import lombok.Getter;

@Getter
public class ApplicationResponse {
    private final Long id;
    private final String packageName;
    private final String displayName;
    private final String description;
    private final String iconUrl;
    private final boolean active;

    public ApplicationResponse(
        Long id,
        String packageName,
        String displayName,
        String description,
        String iconUrl,
        boolean active
    ) {
        this.id = id;
        this.packageName = packageName;
        this.displayName = displayName;
        this.description = description;
        this.iconUrl = iconUrl;
        this.active = active;
    }
}
