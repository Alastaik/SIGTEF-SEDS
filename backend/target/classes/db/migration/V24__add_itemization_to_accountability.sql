ALTER TABLE programs ADD COLUMN requires_itemization BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE programs_aud ADD COLUMN requires_itemization BOOLEAN;

CREATE TABLE item_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE item_categories_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL REFERENCES revinfo(rev),
    REVTYPE SMALLINT,
    name VARCHAR(100),
    active BOOLEAN,
    PRIMARY KEY (id, REV)
);

CREATE TABLE items (
    id UUID PRIMARY KEY,
    item_category_id UUID NOT NULL REFERENCES item_categories(id),
    name VARCHAR(100) NOT NULL,
    unit_of_measurement VARCHAR(50),
    created_in_accountability_id UUID REFERENCES accountabilities(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE items_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL REFERENCES revinfo(rev),
    REVTYPE SMALLINT,
    item_category_id UUID,
    name VARCHAR(100),
    unit_of_measurement VARCHAR(50),
    created_in_accountability_id UUID,
    active BOOLEAN,
    PRIMARY KEY (id, REV)
);

CREATE TABLE accountability_fiscal_document_items (
    id UUID PRIMARY KEY,
    fiscal_document_id UUID NOT NULL REFERENCES accountability_fiscal_documents(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(15,2) NOT NULL,
    total_price NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE accountability_fiscal_document_items_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL REFERENCES revinfo(rev),
    REVTYPE SMALLINT,
    fiscal_document_id UUID,
    item_id UUID,
    quantity NUMERIC(10,2),
    unit_price NUMERIC(15,2),
    total_price NUMERIC(15,2),
    PRIMARY KEY (id, REV)
);
