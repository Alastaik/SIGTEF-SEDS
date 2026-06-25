CREATE TABLE partnership_agreement_addendums (
    id UUID PRIMARY KEY,
    partnership_agreement_id UUID NOT NULL REFERENCES partnership_agreements(id),
    addendum_number VARCHAR(100),
    addendum_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    signature_date DATE,
    start_date DATE,
    new_end_date DATE,
    value_addition NUMERIC(15, 2),
    justification TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE TABLE partnership_agreement_addendums_aud (
    id UUID NOT NULL,
    REV INTEGER NOT NULL REFERENCES revinfo(rev),
    REVTYPE SMALLINT,
    partnership_agreement_id UUID,
    addendum_number VARCHAR(100),
    addendum_type VARCHAR(50),
    status VARCHAR(50),
    signature_date DATE,
    start_date DATE,
    new_end_date DATE,
    value_addition NUMERIC(15, 2),
    justification TEXT,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    PRIMARY KEY (id, REV)
);
