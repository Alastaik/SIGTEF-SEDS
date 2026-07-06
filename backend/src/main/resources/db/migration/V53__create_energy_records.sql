CREATE TABLE global_energy_tariff_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competence_id UUID NOT NULL REFERENCES competences(id) UNIQUE,
    tariff_flag VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE energy_consumption_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    consumer_unit_id UUID REFERENCES legal_entity_consumer_units(id) ON DELETE SET NULL,
    competence_id   UUID NOT NULL REFERENCES competences(id),
    kwh_amount      NUMERIC(12,3) NOT NULL,
    tariff_flag     VARCHAR(30) NOT NULL,
    total_value     NUMERIC(14,2) NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

-- Unicidade por entidade + competência se a UC for nula
CREATE UNIQUE INDEX uk_energy_record_entity_competence 
    ON energy_consumption_records (legal_entity_id, competence_id) 
    WHERE consumer_unit_id IS NULL;

-- Unicidade por UC + competência se a UC não for nula
CREATE UNIQUE INDEX uk_energy_record_unit_competence 
    ON energy_consumption_records (consumer_unit_id, competence_id) 
    WHERE consumer_unit_id IS NOT NULL;

-- Tabela de auditoria
CREATE TABLE energy_consumption_records_aud (
    id              UUID NOT NULL,
    rev             INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype         SMALLINT,
    legal_entity_id UUID,
    consumer_unit_id UUID,
    competence_id   UUID,
    kwh_amount      NUMERIC(12,3),
    tariff_flag     VARCHAR(30),
    total_value     NUMERIC(14,2),
    notes           TEXT,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP,
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    PRIMARY KEY (id, rev)
);
