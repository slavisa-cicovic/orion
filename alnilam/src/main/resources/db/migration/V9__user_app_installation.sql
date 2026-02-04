CREATE TABLE user_app_installation (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
    package_name VARCHAR(255) NOT NULL,
    version_name VARCHAR(50),
    installed BOOLEAN NOT NULL DEFAULT FALSE,
    platform VARCHAR(20) NOT NULL,
    device_id VARCHAR(128) NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_app_installation UNIQUE (user_id, application_id, device_id)
);

CREATE INDEX idx_user_app_installation_user_app ON user_app_installation(user_id, application_id);
