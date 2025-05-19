CREATE TABLE IF NOT EXISTS article (
    id uuid NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS domain_event (
    event_id uuid NOT NULL,
    event_name VARCHAR(50) NOT NULL,
    event_at TIMESTAMP NOT NULL,
    payload JSONB NOT NULL,
    aggregate JSONB NOT NULL,
    PRIMARY KEY (event_id)
);