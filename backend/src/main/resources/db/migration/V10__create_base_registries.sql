-- V10__create_base_registries.sql
-- Migrations para o Módulo 03 (Cadastros Base)

-- 1. Regiões
CREATE TABLE regions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE regions_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    name VARCHAR(100),
    description TEXT,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_regions_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- 2. Municípios
CREATE TABLE cities (
    id UUID PRIMARY KEY,
    ibge_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    region_id UUID,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_cities_region FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE cities_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    ibge_code VARCHAR(20),
    name VARCHAR(100),
    uf VARCHAR(2),
    region_id UUID,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_cities_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- 3. Feriados
CREATE TABLE holidays (
    id UUID PRIMARY KEY,
    holiday_date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    holiday_type VARCHAR(50) NOT NULL, -- NACIONAL, ESTADUAL, MUNICIPAL
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE holidays_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    holiday_date DATE,
    name VARCHAR(100),
    holiday_type VARCHAR(50),
    recurring BOOLEAN,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_holidays_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- 4. Programas
CREATE TABLE programs (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    requires_goal BOOLEAN NOT NULL DEFAULT FALSE,
    requires_service_days BOOLEAN NOT NULL DEFAULT FALSE,
    requires_consumer_unit BOOLEAN NOT NULL DEFAULT FALSE,
    requires_invoice BOOLEAN NOT NULL DEFAULT FALSE,
    requires_receipt BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE programs_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    name VARCHAR(100),
    type VARCHAR(50),
    code VARCHAR(50),
    description TEXT,
    requires_goal BOOLEAN,
    requires_service_days BOOLEAN,
    requires_consumer_unit BOOLEAN,
    requires_invoice BOOLEAN,
    requires_receipt BOOLEAN,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_programs_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- 5. Valores de Programa (Tabelas de Vigência)
CREATE TABLE program_value_tables (
    id UUID PRIMARY KEY,
    program_id UUID NOT NULL,
    per_capita_value DECIMAL(10,2),
    standard_monthly_value DECIMAL(10,2),
    unit VARCHAR(50),
    valid_from DATE NOT NULL,
    valid_to DATE,
    publication_date DATE,
    observation TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT fk_program_values_program FOREIGN KEY (program_id) REFERENCES programs(id)
);

CREATE TABLE program_value_tables_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    program_id UUID,
    per_capita_value DECIMAL(10,2),
    standard_monthly_value DECIMAL(10,2),
    unit VARCHAR(50),
    valid_from DATE,
    valid_to DATE,
    publication_date DATE,
    observation TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_program_values_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- 6. Tipos de Documento
CREATE TABLE document_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    context VARCHAR(50),
    requires_expiration BOOLEAN NOT NULL DEFAULT FALSE,
    requires_sei BOOLEAN NOT NULL DEFAULT FALSE,
    requires_signature BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE document_types_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    name VARCHAR(100),
    code VARCHAR(50),
    description TEXT,
    context VARCHAR(50),
    requires_expiration BOOLEAN,
    requires_sei BOOLEAN,
    requires_signature BOOLEAN,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_document_types_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- 7. Tipos de Pendência
CREATE TABLE issue_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    category VARCHAR(50),
    description TEXT,
    standard_deadline_days INT,
    requires_entity_reply BOOLEAN NOT NULL DEFAULT FALSE,
    requires_attachment BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE issue_types_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    name VARCHAR(100),
    code VARCHAR(50),
    category VARCHAR(50),
    description TEXT,
    standard_deadline_days INT,
    requires_entity_reply BOOLEAN,
    requires_attachment BOOLEAN,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_issue_types_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- 8. Domain Data (Tabela Genérica para Cadastros Simples: Naturezas, Termos, Fiscalização, Bancos)
CREATE TABLE domain_data (
    id UUID PRIMARY KEY,
    domain_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    extra_info VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE domain_data_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    domain_type VARCHAR(50),
    name VARCHAR(100),
    code VARCHAR(50),
    description TEXT,
    extra_info VARCHAR(255),
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_domain_data_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
