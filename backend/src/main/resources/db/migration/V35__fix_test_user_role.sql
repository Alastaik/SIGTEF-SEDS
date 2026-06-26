-- V35__fix_test_user_role.sql

UPDATE legal_entity_representatives 
SET role = 'ADMINISTRADOR' 
WHERE role = 'PRESIDENTE';
