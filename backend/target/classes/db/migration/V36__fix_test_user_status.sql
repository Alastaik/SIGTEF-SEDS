-- V36__fix_test_user_status.sql

UPDATE legal_entity_representatives 
SET status = 'ACTIVE' 
WHERE status = 'ATIVO';
