-- Add reopened_until to accountabilities
ALTER TABLE accountabilities 
ADD COLUMN reopened_until TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE accountabilities_aud 
ADD COLUMN reopened_until TIMESTAMP WITHOUT TIME ZONE;

-- Add status to partnership_agreement_programs
ALTER TABLE partnership_agreement_programs 
ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL;

-- Migrate existing 'active' column data to 'status'
UPDATE partnership_agreement_programs SET status = 'ACTIVE' WHERE active = true;
UPDATE partnership_agreement_programs SET status = 'SUSPENDED' WHERE active = false;

ALTER TABLE partnership_agreement_programs DROP COLUMN active;

ALTER TABLE partnership_agreement_programs_aud 
ADD COLUMN status VARCHAR(50);
ALTER TABLE partnership_agreement_programs_aud DROP COLUMN active;
