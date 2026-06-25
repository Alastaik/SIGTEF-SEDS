-- V13__create_legal_entities.sql

CREATE TABLE legal_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    corporate_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    entity_type_id UUID REFERENCES domain_data(id), -- Tipo da entidade
    attendance_nature_id UUID REFERENCES domain_data(id), -- Natureza de atendimento
    main_city_id UUID REFERENCES cities(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE_VALIDACAO',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE legal_entities_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    cnpj VARCHAR(14),
    corporate_name VARCHAR(255),
    trade_name VARCHAR(255),
    entity_type_id UUID,
    attendance_nature_id UUID,
    main_city_id UUID,
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE legal_entity_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    address_type VARCHAR(50) NOT NULL, -- EXECUCAO, ADMINISTRATIVO, CORRESPONDENCIA, OUTROS
    city_id UUID REFERENCES cities(id),
    street VARCHAR(255) NOT NULL,
    number VARCHAR(50),
    complement VARCHAR(255),
    neighborhood VARCHAR(255),
    zip_code VARCHAR(20),
    is_main BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE legal_entity_addresses_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    address_type VARCHAR(50),
    city_id UUID,
    street VARCHAR(255),
    number VARCHAR(50),
    complement VARCHAR(255),
    neighborhood VARCHAR(255),
    zip_code VARCHAR(20),
    is_main BOOLEAN,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE legal_entity_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    is_main BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE legal_entity_contacts_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    contact_type VARCHAR(50),
    value VARCHAR(255),
    description VARCHAR(255),
    is_main BOOLEAN,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE legal_entity_responsibles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11),
    role VARCHAR(255), -- Cargo
    responsible_type_id UUID REFERENCES domain_data(id), -- Tipo (Presidente, Contador, etc)
    email VARCHAR(255),
    phone VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_main BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE legal_entity_responsibles_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    name VARCHAR(255),
    cpf VARCHAR(11),
    role VARCHAR(255),
    responsible_type_id UUID,
    email VARCHAR(255),
    phone VARCHAR(50),
    start_date DATE,
    end_date DATE,
    is_main BOOLEAN,
    active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE legal_entity_consumer_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    address_id UUID REFERENCES legal_entity_addresses(id),
    utility_type VARCHAR(50) NOT NULL, -- ENERGIA, AGUA_ESGOTO
    provider_id UUID REFERENCES domain_data(id), -- Concessionária
    unit_number VARCHAR(100) NOT NULL, -- Matrícula / Unidade
    titular_name VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE legal_entity_consumer_units_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    address_id UUID,
    utility_type VARCHAR(50),
    provider_id UUID,
    unit_number VARCHAR(100),
    titular_name VARCHAR(255),
    active BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE legal_entity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Como histórico não precisa de alteração, podemos optar por não criar tabela _aud para ela, 
-- ou criar se quisermos garantir que ninguém modificou o histórico
CREATE TABLE legal_entity_history_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    action VARCHAR(255),
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);

CREATE TABLE legal_entity_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE legal_entity_notes_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    legal_entity_id UUID,
    note TEXT,
    created_by UUID,
    created_at TIMESTAMP,
    PRIMARY KEY (id, rev)
);

-- Modificar a tabela user_entities_scope para de fato referenciar legal_entities (se estiver usando FK real)
-- Como criamos como UUID mockado antes, agora podemos adicionar a FK (se houver conflito, ignoraremos, mas como o banco está vazio, deve funcionar)
ALTER TABLE user_entities_scope ADD CONSTRAINT fk_user_entities_scope_entity FOREIGN KEY (entity_id) REFERENCES legal_entities(id) ON DELETE CASCADE;
