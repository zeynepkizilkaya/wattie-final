CREATE TABLE IF NOT EXISTS homes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    contact_email VARCHAR(150) NOT NULL,
    power_quota_kwh NUMERIC(10,2) NOT NULL,
    financial_quota NUMERIC(10,2) NOT NULL,
    normal_tariff_rate NUMERIC(10,4) NOT NULL,
    penalty_tariff_rate NUMERIC(10,4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appliances (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    safe_limit_watts NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_logs (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    details TEXT,
    ai_recommendation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consumption_snapshots (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_kwh NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);