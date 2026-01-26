CREATE TABLE application (
    id BIGSERIAL PRIMARY KEY,
    package_name VARCHAR(150) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_id BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by_id BIGINT
);

CREATE TABLE application_version (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES application(id) ON DELETE CASCADE,
    version_name VARCHAR(50) NOT NULL,
    version_code INTEGER NOT NULL,
    platform VARCHAR(20) NOT NULL,
    min_sdk INTEGER,
    target_sdk INTEGER,
    file_url VARCHAR(1000),
    checksum VARCHAR(255),
    status VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_id BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by_id BIGINT,
    CONSTRAINT uq_app_version UNIQUE (application_id, platform, version_code)
);

CREATE TABLE company_application_access (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    application_version_id BIGINT NOT NULL REFERENCES application_version(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_id BIGINT
);
