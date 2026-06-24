-- V6__fix_user_entities_scope_aud.sql
-- Drop the incorrectly named table from V4 and create the correct one matching UserEntityScope

DROP TABLE IF EXISTS user_entity_scopes_aud;

CREATE TABLE user_entities_scope_aud (
    user_id UUID NOT NULL,
    entity_id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    PRIMARY KEY (user_id, entity_id, rev),
    CONSTRAINT fk_user_entities_scope_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
