-- V48__add_user_permissions.sql

-- Insere as permissões de inativar e excluir se não existirem
INSERT INTO permissions (name, description) 
VALUES ('usuarios:inativar', 'Inativar e reativar usuários') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description) 
VALUES ('usuarios:excluir', 'Excluir usuários permanentemente') 
ON CONFLICT (name) DO NOTHING;

-- Atribui automaticamente essas permissões ao ROLE_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ROLE_ADMIN' 
  AND p.name IN ('usuarios:inativar', 'usuarios:excluir')
ON CONFLICT DO NOTHING;
