ALTER TABLE company_user_application_access
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES app_user(id) ON DELETE CASCADE;

ALTER TABLE company_user_application_access
    DROP CONSTRAINT IF EXISTS uq_company_user_app_access;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_user_app_access_user
    ON company_user_application_access(company_id, application_version_id, user_id)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_user_app_access_all
    ON company_user_application_access(company_id, application_version_id)
    WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_company_user_app_access_user
    ON company_user_application_access(user_id);
