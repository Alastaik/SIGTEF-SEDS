-- V40__create_inspections_module.sql

CREATE TABLE inspections (
    id UUID PRIMARY KEY,
    legal_entity_id UUID NOT NULL,
    agreement_id UUID,
    inspector_id UUID,
    inspection_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_inspections_entity FOREIGN KEY (legal_entity_id) REFERENCES legal_entities (id),
    CONSTRAINT fk_inspections_agreement FOREIGN KEY (agreement_id) REFERENCES partnership_agreements (id),
    CONSTRAINT fk_inspections_inspector FOREIGN KEY (inspector_id) REFERENCES users (id)
);

CREATE TABLE inspections_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    legal_entity_id UUID,
    agreement_id UUID,
    inspector_id UUID,
    inspection_date DATE,
    status VARCHAR(50),
    notes TEXT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_inspections_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

CREATE TABLE inspection_checklist_items (
    id UUID PRIMARY KEY,
    inspection_id UUID NOT NULL,
    category VARCHAR(255) NOT NULL,
    question VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    observations TEXT,
    CONSTRAINT fk_checklist_inspection FOREIGN KEY (inspection_id) REFERENCES inspections (id)
);

CREATE TABLE inspection_checklist_items_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    inspection_id UUID,
    category VARCHAR(255),
    question VARCHAR(500),
    status VARCHAR(50),
    observations TEXT,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_checklist_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

CREATE TABLE inspection_irregularities (
    id UUID PRIMARY KEY,
    inspection_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    created_by VARCHAR(255),
    CONSTRAINT fk_irregularity_inspection FOREIGN KEY (inspection_id) REFERENCES inspections (id)
);

CREATE TABLE inspection_irregularities_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    inspection_id UUID,
    title VARCHAR(200),
    description TEXT,
    severity VARCHAR(50),
    resolved BOOLEAN,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_irregularity_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

CREATE TABLE inspection_opinions (
    id UUID PRIMARY KEY,
    inspection_id UUID NOT NULL,
    content TEXT NOT NULL,
    conclusion_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_opinion_inspection FOREIGN KEY (inspection_id) REFERENCES inspections (id)
);

CREATE TABLE inspection_opinions_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    inspection_id UUID,
    content TEXT,
    conclusion_status VARCHAR(50),
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_opinion_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
