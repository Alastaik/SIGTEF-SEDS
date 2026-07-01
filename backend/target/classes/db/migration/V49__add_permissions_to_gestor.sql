-- V49__add_permissions_to_gestor.sql
-- Adiciona permissões de gerenciar usuários ao ROLE_GESTOR

INSERT INTO role_permissions (role_name, permission_name) VALUES ('ROLE_GESTOR', 'usuarios:visualizar') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_name, permission_name) VALUES ('ROLE_GESTOR', 'usuarios:criar') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_name, permission_name) VALUES ('ROLE_GESTOR', 'usuarios:editar') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_name, permission_name) VALUES ('ROLE_GESTOR', 'usuarios:inativar') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_name, permission_name) VALUES ('ROLE_GESTOR', 'usuarios:excluir') ON CONFLICT DO NOTHING;
