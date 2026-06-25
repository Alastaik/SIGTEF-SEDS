-- Remove a tabela antiga
DROP TABLE IF EXISTS user_entities_scope_aud;
DROP TABLE IF EXISTS user_entities_scope;

-- Tabela de representantes
CREATE TABLE legal_entity_representatives (
    id UUID PRIMARY KEY,
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    status VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE legal_entity_representatives_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    user_id UUID,
    role VARCHAR(50),
    permissions JSONB,
    status VARCHAR(50),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);

-- Tabela de convites
CREATE TABLE representative_invitations (
    id UUID PRIMARY KEY,
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    status VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE representative_invitations_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    name VARCHAR(255),
    email VARCHAR(255),
    token VARCHAR(255),
    role VARCHAR(50),
    permissions JSONB,
    status VARCHAR(50),
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);
