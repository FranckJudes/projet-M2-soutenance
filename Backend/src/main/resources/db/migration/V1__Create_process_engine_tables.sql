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
    start_user_id VARCHAR(255),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    state VARCHAR(50) DEFAULT 'ACTIVE',
    variables TEXT,
    suspension_reason TEXT
);

-- Create TaskConfiguration table (if not exists)
CREATE TABLE IF NOT EXISTS task_configuration (
    id BIGSERIAL PRIMARY KEY,
    process_definition_key VARCHAR(255),
    task_id VARCHAR(255),
    task_name VARCHAR(255),
    task_type VARCHAR(255),
    
    -- Assignation
    assignee_user VARCHAR(255),
    assignee_group VARCHAR(255),
    assignee_entity VARCHAR(255),
    assignee_type VARCHAR(255),
    return_allowed BOOLEAN,
    responsible_user VARCHAR(255),
    interested_user VARCHAR(255),
    
    -- Information générale
    board TEXT,
    work_instructions TEXT,
    expected_deliverable TEXT,
    category VARCHAR(255),
    
    -- Planification
    all_day BOOLEAN,
    duration_value INTEGER,
    duration_unit VARCHAR(50),
    criticality VARCHAR(50),
    priority VARCHAR(50),
    view_history_enabled BOOLEAN,
    kpi_tasks_processed BOOLEAN,
    kpi_return_rate BOOLEAN,
    kpi_avg_interactions BOOLEAN,
    kpi_deadline_compliance BOOLEAN,
    kpi_validation_wait_time BOOLEAN,
    kpi_priority_compliance BOOLEAN,
    kpi_emergency_management BOOLEAN,
    notifier_superviseur BOOLEAN,
    reassigner_tache BOOLEAN,
    envoyer_rappel BOOLEAN,
    escalade_hierarchique BOOLEAN,
    changement_priorite BOOLEAN,
    bloquer_workflow BOOLEAN,
    generer_alerte_equipe BOOLEAN,
    demander_justification BOOLEAN,
    activer_action_corrective BOOLEAN,
    escalade_externe BOOLEAN,
    cloturer_defaut BOOLEAN,
    suivi_par_kpi BOOLEAN,
    plan_b_ou_tache_alternative BOOLEAN,
    
    -- Ressources
    attachments_enabled BOOLEAN,
    attachment_type VARCHAR(255),
    security_level VARCHAR(255),
    external_tools TEXT,
    link_to_other_task VARCHAR(255),
    script_business_rule BOOLEAN,
    add_form_resource BOOLEAN,
    archive_attachment BOOLEAN,
    share_archive_pdf BOOLEAN,
    describe_folder_doc BOOLEAN,
    delete_attachment_doc BOOLEAN,
    consult_attachment_doc BOOLEAN,
    download_zip BOOLEAN,
    import_attachment BOOLEAN,
    edit_attachment BOOLEAN,
    annotate_document BOOLEAN,
    verify_attachment_doc BOOLEAN,
    search_in_document BOOLEAN,
    remove_document BOOLEAN,
    add_new_attachment BOOLEAN,
    convert_attachment_pdf BOOLEAN,
    download_attachment_pdf BOOLEAN,
    download_original_format BOOLEAN,
    
    -- Notifications
    notify_on_creation BOOLEAN,
    notify_on_deadline BOOLEAN,
    reminder_before_deadline INTEGER,
    notification_sensitivity VARCHAR(255),
    notification_type VARCHAR(255),
    selected_reminders TEXT,
    
    -- Condition et extension
    condition_config TEXT,
    extra_config TEXT
);

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
