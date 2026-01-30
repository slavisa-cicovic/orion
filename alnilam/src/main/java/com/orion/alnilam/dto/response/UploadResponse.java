package com.orion.alnilam.dto.response;

import lombok.Getter;

@Getter
public class UploadResponse {
    private final String path;
    private final String fileName;
    private final String originalFileName;
    private final String contentType;
    private final long size;

    public UploadResponse(String path, String fileName, String originalFileName, String contentType, long size) {
        this.path = path;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.size = size;
    }
}
