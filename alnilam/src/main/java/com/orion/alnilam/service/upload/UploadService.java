package com.orion.alnilam.service.upload;

import com.orion.alnilam.config.UploadProperties;
import com.orion.alnilam.domain.enums.UploadType;
import com.orion.alnilam.dto.response.UploadResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UploadService {
    private final UploadProperties uploadProperties;

    public UploadService(UploadProperties uploadProperties) {
        this.uploadProperties = uploadProperties;
    }

    public UploadResponse upload(MultipartFile file, UploadType type) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (!StringUtils.hasText(uploadProperties.getDir())) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload dir not configured");
        }

        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String extension = extractExtension(originalName);
        if (!type.getAllowedExtensions().contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type");
        }

        String contentType = file.getContentType();
        if (StringUtils.hasText(contentType) && !type.getAllowedContentTypes().contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid content type");
        }

        if (file.getSize() > type.getMaxBytes()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File too large");
        }

        String fileName = UUID.randomUUID() + "." + extension;
        Path baseDir = Paths.get(uploadProperties.getDir());
        Path targetDir = baseDir.resolve(type.getFolder());
        Path targetPath = targetDir.resolve(fileName);

        try {
            Files.createDirectories(targetDir);
            file.transferTo(targetPath);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }

        String relativePath = type.getFolder() + "/" + fileName;
        return new UploadResponse(relativePath, fileName, originalName, contentType, file.getSize());
    }

    private String extractExtension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index == -1 || index == filename.length() - 1) {
            return "";
        }
        return filename.substring(index + 1).toLowerCase();
    }
}
