-- Criar tabela de Monthly Executions
CREATE TABLE monthly_executions (
    id UUID PRIMARY KEY,
    partnership_agreement_program_id UUID NOT NULL REFERENCES partnership_agreement_programs(id),
    competence VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    expected_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    transferred_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    expected_goal INTEGER,
    expected_service_days INTEGER,
    consumer_unit_id UUID REFERENCES legal_entity_consumer_units(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    block_reason TEXT,
    blocked_by UUID REFERENCES users(id),
    blocked_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Para evitar duplicidade do mesmo programa no mesmo termo e na mesma competência
ALTER TABLE monthly_executions
ADD CONSTRAINT uk_monthly_exec_prog_comp UNIQUE (partnership_agreement_program_id, competence);

-- Criar tabela de auditoria (Envers)
CREATE TABLE monthly_executions_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    partnership_agreement_program_id UUID,
    competence VARCHAR(7),
    expected_value DECIMAL(15, 2),
    transferred_value DECIMAL(15, 2),
    expected_goal INTEGER,
    expected_service_days INTEGER,
    consumer_unit_id UUID,
    status VARCHAR(20),
    blocked BOOLEAN,
    block_reason TEXT,
    blocked_by UUID,
    blocked_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    PRIMARY KEY (id, rev)
);
