-- Create join table for complementary documents
CREATE TABLE accountability_submission_documents (
    submission_id UUID NOT NULL,
    document_id UUID NOT NULL,
    PRIMARY KEY (submission_id, document_id),
    CONSTRAINT fk_acc_sub_doc_sub FOREIGN KEY (submission_id) REFERENCES accountability_submissions (id) ON DELETE CASCADE,
    CONSTRAINT fk_acc_sub_doc_doc FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- Create auditing table for the relationship
CREATE TABLE accountability_submission_documents_aud (
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    submission_id UUID NOT NULL,
    document_id UUID NOT NULL,
    PRIMARY KEY (rev, submission_id, document_id),
    CONSTRAINT fk_acc_sub_doc_aud_rev FOREIGN KEY (rev) REFERENCES revinfo (rev)
);
