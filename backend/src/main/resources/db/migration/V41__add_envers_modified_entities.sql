-- V41__add_envers_modified_entities.sql

CREATE TABLE revchanges (
    rev INTEGER NOT NULL,
    entityname VARCHAR(255),
    CONSTRAINT fk_revchanges_revinfo FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
