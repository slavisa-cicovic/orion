package com.orion.alnilam.domain.enums;

import java.util.Set;

public enum UploadType {
    ICON(
        "icons",
        300 * 1024L,
        Set.of("png", "jpg", "jpeg"),
        Set.of("image/png", "image/jpeg")
    ),
    APK(
        "apk",
        300L * 1024 * 1024,
        Set.of("apk"),
        Set.of("application/vnd.android.package-archive", "application/octet-stream")
    ),
    IPA(
        "ipa",
        300L * 1024 * 1024,
        Set.of("ipa"),
        Set.of("application/octet-stream", "application/x-itunes-ipa", "application/zip")
    );

    private final String folder;
    private final long maxBytes;
    private final Set<String> allowedExtensions;
    private final Set<String> allowedContentTypes;

    UploadType(String folder, long maxBytes, Set<String> allowedExtensions, Set<String> allowedContentTypes) {
        this.folder = folder;
        this.maxBytes = maxBytes;
        this.allowedExtensions = allowedExtensions;
        this.allowedContentTypes = allowedContentTypes;
    }

    public String getFolder() {
        return folder;
    }

    public long getMaxBytes() {
        return maxBytes;
    }

    public Set<String> getAllowedExtensions() {
        return allowedExtensions;
    }

    public Set<String> getAllowedContentTypes() {
        return allowedContentTypes;
    }
}
