-- Drop tabelas antigas (conforme instrução para apagar dados de teste)
DROP TABLE IF EXISTS accountability_issue_attachments_aud CASCADE;
DROP TABLE IF EXISTS accountability_issue_attachments CASCADE;
DROP TABLE IF EXISTS accountability_attachments_aud CASCADE;
DROP TABLE IF EXISTS accountability_attachments CASCADE;

-- Tabela documents
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type_id UUID REFERENCES document_types(id),
    owner_module VARCHAR(50) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE documents_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    title VARCHAR(255),
    description TEXT,
    document_type_id UUID,
    owner_module VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);

-- Tabela document_files
CREATE TABLE document_files (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    stored_file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    sha256_hash VARCHAR(64),
    version_number INTEGER NOT NULL DEFAULT 1,
    is_current_version BOOLEAN NOT NULL DEFAULT TRUE,
    retention_policy VARCHAR(50) NOT NULL,
    expired_at TIMESTAMP WITHOUT TIME ZONE,
    blocked_for_audit BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_files_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    document_id UUID,
    stored_file_name VARCHAR(255),
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    sha256_hash VARCHAR(64),
    version_number INTEGER,
    is_current_version BOOLEAN,
    retention_policy VARCHAR(50),
    expired_at TIMESTAMP WITHOUT TIME ZONE,
    blocked_for_audit BOOLEAN,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);

-- Tabela document_links
CREATE TABLE document_links (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    linked_entity_type VARCHAR(100) NOT NULL,
    linked_entity_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_links_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    document_id UUID,
    linked_entity_type VARCHAR(100),
    linked_entity_id UUID,
    role VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);

-- Tabela document_events
CREATE TABLE document_events (
    id UUID PRIMARY KEY,
    document_file_id UUID NOT NULL REFERENCES document_files(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE document_events_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    document_file_id UUID,
    event_type VARCHAR(50),
    performed_by UUID,
    performed_at TIMESTAMP WITHOUT TIME ZONE,
    notes TEXT,
    PRIMARY KEY (id, rev)
);
