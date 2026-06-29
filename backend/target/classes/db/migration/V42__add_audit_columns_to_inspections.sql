-- V42__add_audit_columns_to_inspections.sql

ALTER TABLE inspections_aud
ADD COLUMN created_at TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP,
ADD COLUMN created_by VARCHAR(255),
ADD COLUMN updated_by VARCHAR(255);

ALTER TABLE inspection_irregularities_aud
ADD COLUMN created_at TIMESTAMP,
ADD COLUMN created_by VARCHAR(255);

ALTER TABLE inspection_opinions_aud
ADD COLUMN created_at TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP,
ADD COLUMN created_by VARCHAR(255),
ADD COLUMN updated_by VARCHAR(255);
