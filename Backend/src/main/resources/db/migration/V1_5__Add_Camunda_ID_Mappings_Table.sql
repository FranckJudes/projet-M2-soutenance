-- Création de la table pour stocker les mappings entre identifiants originaux et identifiants Camunda
CREATE TABLE camunda_id_mappings (
    id BIGSERIAL PRIMARY KEY,
    original_id VARCHAR(255) NOT NULL,
    camunda_id VARCHAR(64) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_camunda_id_mappings_original_id UNIQUE (original_id),
    CONSTRAINT uk_camunda_id_mappings_camunda_id UNIQUE (camunda_id)
);
