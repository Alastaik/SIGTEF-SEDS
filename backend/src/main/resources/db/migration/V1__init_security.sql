-- V1__init_security.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- INTERNO, EXTERNO, SISTEMA
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- ROLE_ADMIN, ROLE_GESTOR, etc.
    description VARCHAR(255)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- usuarios:criar, entidades:visualizar
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Inserindo Permissões Básicas
INSERT INTO permissions (name, description) VALUES
('usuarios:visualizar', 'Ver usuários'),
('usuarios:criar', 'Criar usuários'),
('usuarios:editar', 'Editar usuários'),
('usuarios:desativar', 'Desativar usuários'),
('entidades:visualizar', 'Ver entidades'),
('entidades:criar', 'Criar entidades'),
('termos:visualizar', 'Ver termos');

-- Inserindo Perfis Básicos
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrador do Sistema'),
('ROLE_GESTOR', 'Gestor Interno'),
('ROLE_ANALISTA', 'Analista Interno'),
('ROLE_REPRESENTANTE', 'Representante da Entidade');

-- Vinculando permissões ao ADMIN (apenas exemplo inicial)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ROLE_ADMIN';
