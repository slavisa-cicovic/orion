package com.orion.alnilam.domain.mobile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_app_installation")
@Getter
@Setter
@NoArgsConstructor
public class UserAppInstallation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(name = "version_name")
    private String versionName;

    @Column(name = "installed", nullable = false)
    private boolean installed;

    @Column(name = "platform", nullable = false)
    private String platform;

    @Column(name = "device_id", nullable = false)
    private String deviceId;

    @Column(name = "reported_at", nullable = false)
    private Instant reportedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        reportedAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
