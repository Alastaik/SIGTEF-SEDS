-- V50__add_requires_accountability_to_programs.sql
-- Adiciona flag requires_accountability a programs

ALTER TABLE programs ADD COLUMN requires_accountability BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE programs_aud ADD COLUMN requires_accountability BOOLEAN;
