ALTER TABLE accountabilities_aud ADD COLUMN created_at TIMESTAMP;
ALTER TABLE accountabilities_aud ADD COLUMN updated_at TIMESTAMP;

ALTER TABLE accountability_submissions_aud ADD COLUMN created_at TIMESTAMP;
ALTER TABLE accountability_submissions_aud ADD COLUMN updated_at TIMESTAMP;

CREATE TABLE accountability_fiscal_documents_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL,
    REVTYPE SMALLINT,
    submission_id UUID,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    access_key VARCHAR(100),
    issue_date DATE,
    issuer_cnpj VARCHAR(14),
    issuer_name VARCHAR(200),
    value NUMERIC(10, 2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, REV)
);

CREATE TABLE accountability_attachments_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL,
    REVTYPE SMALLINT,
    fiscal_document_id UUID,
    submission_id UUID,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    content_type VARCHAR(100),
    file_size BIGINT,
    retention_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, REV)
);

CREATE TABLE accountability_reviews_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL,
    REVTYPE SMALLINT,
    submission_id UUID,
    reviewer_id UUID,
    status VARCHAR(50),
    comments TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, REV)
);
