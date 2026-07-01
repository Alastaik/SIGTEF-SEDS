-- V49__add_permissions_to_gestor.sql
-- Adiciona permissões de gerenciar usuários ao ROLE_GESTOR

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ROLE_GESTOR' 
  AND p.name IN ('usuarios:visualizar', 'usuarios:criar', 'usuarios:editar', 'usuarios:inativar', 'usuarios:excluir')
ON CONFLICT DO NOTHING;
