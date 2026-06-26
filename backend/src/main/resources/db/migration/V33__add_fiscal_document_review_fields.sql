ALTER TABLE accountability_fiscal_documents
ADD COLUMN review_status VARCHAR(50),
ADD COLUMN review_comments TEXT;

ALTER TABLE accountability_fiscal_documents_aud
ADD COLUMN review_status VARCHAR(50),
ADD COLUMN review_comments TEXT;
