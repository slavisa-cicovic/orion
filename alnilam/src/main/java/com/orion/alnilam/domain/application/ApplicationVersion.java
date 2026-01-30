package com.orion.alnilam.domain.application;

import com.orion.alnilam.domain.enums.ApplicationVersionStatus;
import com.orion.alnilam.domain.enums.Platform;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "application_version")
@Getter
@Setter
@NoArgsConstructor
public class ApplicationVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "version_name", nullable = false)
    private String versionName;

    @Column(name = "version_code", nullable = false)
    private Integer versionCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(name = "min_sdk")
    private Integer minSdk;

    @Column(name = "target_sdk")
    private Integer targetSdk;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "original_file_name")
    private String originalFileName;

    private String checksum;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationVersionStatus status = ApplicationVersionStatus.DRAFT;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by_id")
    private Long createdById;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by_id")
    private Long updatedById;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
