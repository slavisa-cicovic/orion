package com.orion.alnilam.dto.response;

import lombok.Getter;

@Getter
public class UploadResponse {
    private final String path;
    private final String fileName;
    private final String contentType;
    private final long size;

    public UploadResponse(String path, String fileName, String contentType, long size) {
        this.path = path;
        this.fileName = fileName;
        this.contentType = contentType;
        this.size = size;
    }
}
