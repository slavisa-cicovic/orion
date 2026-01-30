package com.orion.alnilam.dto.response;

import java.time.Instant;

public record ErrorResponse(
    int status,
    String error,
    String reason,
    String path,
    Instant timestamp
) {}
