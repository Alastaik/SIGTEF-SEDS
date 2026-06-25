CREATE TABLE accountabilities (
    id UUID PRIMARY KEY,
    monthly_execution_id UUID NOT NULL REFERENCES monthly_executions(id),
    status VARCHAR(50) NOT NULL,
    proven_value NUMERIC(10, 2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE accountabilities_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL,
    REVTYPE SMALLINT,
    monthly_execution_id UUID,
    status VARCHAR(50),
    proven_value NUMERIC(10, 2),
    PRIMARY KEY (id, REV)
);

CREATE TABLE accountability_submissions (
    id UUID PRIMARY KEY,
    accountability_id UUID NOT NULL REFERENCES accountabilities(id),
    version_number INTEGER NOT NULL,
    notes TEXT,
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE accountability_submissions_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL,
    REVTYPE SMALLINT,
    accountability_id UUID,
    version_number INTEGER,
    notes TEXT,
    submitted_by UUID,
    submitted_at TIMESTAMP,
    PRIMARY KEY (id, REV)
);

CREATE TABLE accountability_fiscal_documents (
    id UUID PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES accountability_submissions(id),
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    access_key VARCHAR(100),
    issue_date DATE,
    issuer_cnpj VARCHAR(14),
    issuer_name VARCHAR(200),
    value NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE accountability_attachments (
    id UUID PRIMARY KEY,
    fiscal_document_id UUID REFERENCES accountability_fiscal_documents(id),
    submission_id UUID REFERENCES accountability_submissions(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    retention_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE accountability_reviews (
    id UUID PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES accountability_submissions(id),
    reviewer_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    comments TEXT,
    reviewed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);
