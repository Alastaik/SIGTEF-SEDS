-- V34__seed_test_entity_user.sql

-- 1. Create Legal Entity if not exists
INSERT INTO legal_entities (id, cnpj, corporate_name, trade_name, status, created_at, updated_at) 
VALUES ('22222222-2222-2222-2222-222222222222', '00000000000191', 'Entidade de Teste SEDS', 'Entidade Teste', 'ATIVA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2. Create User for the Entity
INSERT INTO users (id, name, email, password, user_type, active, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Representante Teste', 'entidade@teste.com', '$2a$10$7ltpvyYpS6iEpe2gBrcaUOp5L.cXV/ltuF9n1GWCEIVQktmPJCLF2', 'EXTERNO', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2.5 Link User to Role REPRESENTANTE
INSERT INTO user_roles (user_id, role_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM roles WHERE name = 'ROLE_REPRESENTANTE'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 3. Link the user to the entity
INSERT INTO legal_entity_representatives (id, legal_entity_id, user_id, role, status, start_date, created_at, updated_at) 
VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'PRESIDENTE', 'ATIVO', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
