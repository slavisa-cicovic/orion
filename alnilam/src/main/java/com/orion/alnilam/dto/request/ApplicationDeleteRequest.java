package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicationDeleteRequest {
    @NotEmpty
    private List<Long> applicationIds;

    @NotBlank
    private String reason;
}
