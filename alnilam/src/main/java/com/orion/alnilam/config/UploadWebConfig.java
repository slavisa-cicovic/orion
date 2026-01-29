package com.orion.alnilam.config;

import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadWebConfig implements WebMvcConfigurer {
    private final UploadProperties uploadProperties;

    public UploadWebConfig(UploadProperties uploadProperties) {
        this.uploadProperties = uploadProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = uploadProperties.getDir();
        if (uploadDir == null || uploadDir.isBlank()) {
            return;
        }

        String location = Paths.get(uploadDir).toUri().toString();
        registry.addResourceHandler("/api/uploads/**")
            .addResourceLocations(location);
    }
}
