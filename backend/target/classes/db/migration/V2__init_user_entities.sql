-- V2__init_user_entities.sql

-- Esta tabela define a qual(is) entidade(s) um usuário (geralmente EXTERNO/Representante) tem acesso.
-- Como uma entidade física ainda será criada no Módulo 3/4, faremos um mock de sua chave primária como UUID.
CREATE TABLE user_entities_scope (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL, -- O UUID virá da tabela de Entidades que será criada no Módulo 03
    PRIMARY KEY (user_id, entity_id)
);

CREATE INDEX idx_user_entities_scope_user ON user_entities_scope(user_id);
CREATE INDEX idx_user_entities_scope_entity ON user_entities_scope(entity_id);
