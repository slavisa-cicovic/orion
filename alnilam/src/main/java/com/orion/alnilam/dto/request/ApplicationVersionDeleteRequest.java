package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationVersionDeleteRequest {
    @NotEmpty
    private List<Long> versionIds;

    @NotBlank
    private String reason;
}
