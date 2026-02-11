CREATE TABLE IF NOT EXISTS sensor_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    length DECIMAL(4,2) NOT NULL,
    frequency INTEGER NOT NULL,
    sensitivity INTEGER NOT NULL,
    nonlinearity DECIMAL(4,2) NOT NULL,
    temp_coefficient DECIMAL(5,3) NOT NULL,
    mechanical_load INTEGER NOT NULL,
    material_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensor_projects_created ON sensor_projects(created_at DESC);
CREATE INDEX idx_sensor_projects_name ON sensor_projects(name);