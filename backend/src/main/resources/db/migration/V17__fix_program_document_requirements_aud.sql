ALTER TABLE program_document_requirements_aud ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE program_document_requirements_aud ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;
