CREATE TABLE accountability_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accountability_id UUID NOT NULL REFERENCES accountabilities(id),
    created_by UUID NOT NULL REFERENCES app_users(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    issue_type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    cancellation_reason TEXT,
    resolved_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE accountability_issues_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    accountability_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    issue_type VARCHAR(50),
    priority VARCHAR(50),
    description TEXT,
    deadline DATE,
    status VARCHAR(50),
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    cancellation_reason TEXT,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);

CREATE TABLE accountability_issue_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES accountability_issues(id),
    version_number INTEGER NOT NULL,
    submitted_by UUID NOT NULL REFERENCES app_users(id),
    submitted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    response_text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    reviewed_by UUID REFERENCES app_users(id),
    reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE accountability_issue_responses_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    issue_id UUID,
    version_number INTEGER,
    submitted_by UUID,
    submitted_at TIMESTAMP WITHOUT TIME ZONE,
    response_text TEXT,
    status VARCHAR(50),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITHOUT TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);

CREATE TABLE accountability_issue_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES accountability_issue_responses(id),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(1024) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE accountability_issue_attachments_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL REFERENCES revinfo(rev),
    revtype SMALLINT,
    response_id UUID,
    file_name VARCHAR(255),
    file_url VARCHAR(1024),
    content_type VARCHAR(100),
    file_size BIGINT,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id, rev)
);
