package com.orion.alnilam.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStatusRequest {
    private boolean active;

    @NotEmpty
    private List<Long> userIds;

    @NotBlank
    private String reason;
}
