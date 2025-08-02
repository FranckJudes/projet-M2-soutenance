-- Create ProcessDefinition table
CREATE TABLE IF NOT EXISTS process_definitions (
    id BIGSERIAL PRIMARY KEY,
    process_definition_key VARCHAR(255) UNIQUE NOT NULL,
    process_definition_id VARCHAR(255),
    name VARCHAR(255),
    description TEXT,
    version INTEGER,
    deployment_id VARCHAR(255),
    bpmn_xml TEXT,
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deployed_by VARCHAR(255),
    active BOOLEAN DEFAULT true
);

-- Create ProcessInstance table
CREATE TABLE IF NOT EXISTS process_instances (
    id BIGSERIAL PRIMARY KEY,
    process_instance_id VARCHAR(255) UNIQUE NOT NULL,
    process_definition_key VARCHAR(255),
    process_definition_id VARCHAR(255),
    business_key VARCHAR(255),
    process_id VARCHAR(255),
    start_user_id VARCHAR(255),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    state VARCHAR(50) DEFAULT 'ACTIVE',
    variables TEXT,
    suspension_reason TEXT
);

-- Create TaskConfiguration table (if not exists)-- Table task_configuration sera créée automatiquement par Hibernate à partir de l'entité TaskConfiguration

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_process_definitions_key ON process_definitions(process_definition_key);
CREATE INDEX IF NOT EXISTS idx_process_definitions_active ON process_definitions(active);
CREATE INDEX IF NOT EXISTS idx_process_instances_key ON process_instances(process_definition_key);
CREATE INDEX IF NOT EXISTS idx_process_instances_state ON process_instances(state);
CREATE INDEX IF NOT EXISTS idx_process_instances_start_user ON process_instances(start_user_id);
CREATE INDEX IF NOT EXISTS idx_task_config_process_key ON task_configuration(process_definition_key);
CREATE INDEX IF NOT EXISTS idx_task_config_task_id ON task_configuration(task_id);
CREATE INDEX IF NOT EXISTS idx_task_config_assignee_user ON task_configuration(assignee_user);
CREATE INDEX IF NOT EXISTS idx_task_config_assignee_group ON task_configuration(assignee_group);
CREATE INDEX IF NOT EXISTS idx_task_config_assignee_entity ON task_configuration(assignee_entity);

-- Add foreign key constraints (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_process_instances_definition_key') THEN
        ALTER TABLE process_instances 
        ADD CONSTRAINT fk_process_instances_definition_key 
        FOREIGN KEY (process_definition_key) REFERENCES process_definitions(process_definition_key);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_task_config_process_definition_key') THEN
        ALTER TABLE task_configuration 
        ADD CONSTRAINT fk_task_config_process_definition_key 
        FOREIGN KEY (process_definition_key) REFERENCES process_definitions(process_definition_key);
    END IF;
END $$;
