-- 1. Add calculation_type to programs
ALTER TABLE programs ADD COLUMN calculation_type VARCHAR(30);

-- 2. Add to programs_aud
ALTER TABLE programs_aud ADD COLUMN calculation_type VARCHAR(30);

-- 3. Create program_document_requirements table
CREATE TABLE program_document_requirements (
    id UUID PRIMARY KEY,
    program_id UUID NOT NULL REFERENCES programs(id),
    document_type_id UUID NOT NULL REFERENCES domain_data(id),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 4. Create program_document_requirements_aud
CREATE TABLE program_document_requirements_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    program_id UUID,
    document_type_id UUID,
    is_required BOOLEAN,
    is_recommended BOOLEAN,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);
