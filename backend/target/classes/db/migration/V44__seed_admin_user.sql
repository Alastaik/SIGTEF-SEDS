-- V44__seed_admin_user.sql

INSERT INTO users (id, name, email, password, user_type, active, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'Administrador do Sistema', 'admin@sigtef.com.br', '$2a$10$7ltpvyYpS6iEpe2gBrcaUOp5L.cXV/ltuF9n1GWCEIVQktmPJCLF2', 'INTERNO', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@sigtef.com.br' AND r.name = 'ROLE_ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;
