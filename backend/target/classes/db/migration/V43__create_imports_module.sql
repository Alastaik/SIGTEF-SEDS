-- V43__create_imports_module.sql

CREATE TABLE import_batches (
    id UUID PRIMARY KEY,
    import_type VARCHAR(100) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    file_url VARCHAR(255),
    original_file_name VARCHAR(255),
    total_rows INT DEFAULT 0,
    valid_rows INT DEFAULT 0,
    error_rows INT DEFAULT 0,
    applied_rows INT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE import_rows (
    id UUID PRIMARY KEY,
    batch_id UUID NOT NULL,
    row_number INT NOT NULL,
    raw_data JSONB,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    CONSTRAINT fk_import_rows_batch FOREIGN KEY (batch_id) REFERENCES import_batches (id) ON DELETE CASCADE
);

CREATE INDEX idx_import_batches_status ON import_batches (status);
CREATE INDEX idx_import_rows_batch_id ON import_rows (batch_id);
CREATE INDEX idx_import_rows_status ON import_rows (status);
