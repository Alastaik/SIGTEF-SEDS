-- V8__create_competences_table.sql

CREATE TABLE competences (
    id UUID PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- FUTURA, ABERTA_LANCAMENTO, ABERTA_PRESTACAO, EM_ANALISE, FECHADA, BLOQUEADA
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT uk_competences_month_year UNIQUE (month, year)
);

CREATE TABLE competence_reopenings (
    id UUID PRIMARY KEY,
    competence_id UUID NOT NULL,
    reopened_by UUID NOT NULL,
    reason TEXT NOT NULL,
    reopened_at TIMESTAMP NOT NULL,
    closed_at TIMESTAMP,
    CONSTRAINT fk_competence_reopenings_competence FOREIGN KEY (competence_id) REFERENCES competences(id),
    CONSTRAINT fk_competence_reopenings_user FOREIGN KEY (reopened_by) REFERENCES users(id)
);

-- Tabela de auditoria para competences
CREATE TABLE competences_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    month INTEGER,
    year INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_competences_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);

-- Tabela de auditoria para competence_reopenings
CREATE TABLE competence_reopenings_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    competence_id UUID,
    reopened_by UUID,
    reason TEXT,
    reopened_at TIMESTAMP,
    closed_at TIMESTAMP,
    PRIMARY KEY (id, rev),
    CONSTRAINT fk_competence_reopenings_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
