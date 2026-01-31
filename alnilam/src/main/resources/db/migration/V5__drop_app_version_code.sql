ALTER TABLE application_version DROP CONSTRAINT uq_app_version;
ALTER TABLE application_version DROP COLUMN version_code;
ALTER TABLE application_version ADD CONSTRAINT uq_app_version UNIQUE (application_id, platform, version_name);
