CREATE TABLE company_user_application_access (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    application_version_id BIGINT NOT NULL REFERENCES application_version(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_id BIGINT,
    CONSTRAINT uq_company_user_app_access UNIQUE (company_id, application_version_id)
);

CREATE INDEX idx_company_user_app_access_company ON company_user_application_access(company_id);
