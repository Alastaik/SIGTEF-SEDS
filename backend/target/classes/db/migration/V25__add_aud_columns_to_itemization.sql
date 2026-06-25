ALTER TABLE item_categories_aud ADD COLUMN created_at TIMESTAMP;
ALTER TABLE item_categories_aud ADD COLUMN updated_at TIMESTAMP;

ALTER TABLE items_aud ADD COLUMN created_at TIMESTAMP;
ALTER TABLE items_aud ADD COLUMN updated_at TIMESTAMP;

ALTER TABLE accountability_fiscal_document_items_aud ADD COLUMN created_at TIMESTAMP;
ALTER TABLE accountability_fiscal_document_items_aud ADD COLUMN updated_at TIMESTAMP;
