import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {Checkbox } from '../../../../components/Input';

// Utiliser un composant wrapper pour forcer le remontage quand selectedTask change
const PlanificationWrapper = ({ selectedTask }) => {
  // Si aucune tâche n'est sélectionnée, afficher un message
  if (!selectedTask) {
    return (
      <div className="alert alert-info">
        Veuillez sélectionner une tâche pour configurer sa planification.
      </div>
    );
  }
  
  // Utiliser la key pour forcer le remontage du composant quand la tâche change
  return <Planification key={`planification-${selectedTask.id}`} selectedTask={selectedTask} />;
};

function Planification({ selectedTask }) {
  const { t } = useTranslation();
  const [taskConfig, setTaskConfig] = useState(null);
  
  // Fonction pour charger la configuration depuis le localStorage
  const loadConfig = useCallback(() => {
    if (!selectedTask) return null;
    
    const savedConfig = localStorage.getItem(`task_planification_config_${selectedTask.id}`);
    if (!savedConfig) return null;
    
    try {
      const config = JSON.parse(savedConfig);
      console.log('Configuration chargée pour tâche', selectedTask.id, ':', config);
      return config;
    } catch (error) {
      console.error('Erreur lors du parsing de la configuration:', error);
      return null;
    }
  }, [selectedTask]);
  
  // Initialisation du composant
  useEffect(() => {
    if (!selectedTask) return;
    
    console.log('Initialisation du composant Planification pour la tâche:', selectedTask.id);
    
    const config = loadConfig();
    if (config) {
      setTaskConfig(config);
    } else {
      initializeNewConfig();
    }
    
    // Fonction de nettoyage pour le debugging
    return () => {
      console.log('Démontage du composant Planification pour la tâche:', selectedTask.id);
    };
  }, [selectedTask, loadConfig]);
  
  // Fonction pour initialiser une nouvelle configuration
  const initializeNewConfig = () => {
    if (!selectedTask) return;
    
    const newConfig = {
      taskId: selectedTask.id,
      taskName: selectedTask.name,
      taskType: selectedTask.type,
      toutJournee: false,
      delayValue: '',
      delayUnit: 'Minutes',
      criticite: '1',
      priority: '1',
      // Autres options par défaut
      consultationHistorique: false,
      // KPIs
      nombreTachesTraitees: false,
      tauxRetourTachesTraitees: false,
      nombreInteractionsMoyensTachesTraitees: false,
      respectDelais: false,
      tempsAttenteValidation: false,
      respectPriorites: false,
      gestionUrgences: false,
      // Actions
      notifier_superviseur: false,
      reassigner_tache: false,
      envoyerRappel: false,
      escaladeHierarchique: false,
      changementPriorite: false,
      bloquerWorkflow: false,
      genererAlerteEquipe: false,
      demanderJustification: false,
      activerActionCorrective: false,
      escaladeExterne: false,
      cloturerDefaut: false,
      suiviParKpi: false,
      planBOuTacheAlternative: false
    };
    
    setTaskConfig(newConfig);
    // Sauvegarder la nouvelle configuration dans le localStorage
    saveTaskConfig(newConfig);
    console.log('Nouvelle configuration créée:', newConfig);
  };
  
  // Fonction pour sauvegarder la configuration de la tâche
  const saveTaskConfig = (config) => {
    if (selectedTask && config) {
      localStorage.setItem(`task_planification_config_${selectedTask.id}`, JSON.stringify(config));
      console.log('Configuration sauvegardée pour la tâche:', selectedTask.id, config);
    }
  };
  
  // Fonction pour gérer les changements dans les champs
  const handleConfigChange = (field, value) => {
    if (taskConfig) {
      const updatedConfig = {
        ...taskConfig,
        [field]: value
      };
      setTaskConfig(updatedConfig);
      saveTaskConfig(updatedConfig);
      console.log(`Champ modifié: ${field} = ${value}`, updatedConfig);
    }
  };
  
  // Fonction pour gérer les changements pour les Checkboxes
  const handleCheckboxChange = (field, checked) => {
    handleConfigChange(field, checked);
  };
  
  // Si taskConfig n'est pas encore chargé, afficher un loader
  if (!taskConfig) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Chargement...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="row" data-task-id={selectedTask.id}>
      <div className="col-md-12">
        {/* Informations sur la tâche sélectionnée pour le debugging */}
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t('__delay_execution')}</label>
          </div>
          <div className="col-8">
            <div className="form-group">
              <div className="custom-control custom-checkbox">
                <input 
                  type="checkbox" 
                  className="custom-control-input" 
                  id="customCheck4" 
                  checked={taskConfig.toutJournee || false}
                  onChange={(e) => handleConfigChange('toutJournee', e.target.checked)}
                />
                <label className="custom-control-label" htmlFor="customCheck4">{t('__tout_journee__')}</label>
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  value={taskConfig.delayValue || ''}
                  onChange={(e) => handleConfigChange('delayValue', e.target.value)}
                  disabled={taskConfig.toutJournee}
                />
                <select 
                  className="form-control"
                  value={taskConfig.delayUnit || 'Minutes'}
                  onChange={(e) => handleConfigChange('delayUnit', e.target.value)}
                  disabled={taskConfig.toutJournee}
                >
                  <option value="Minutes">{t('Minutes')}</option>
                  <option value="Days">{t('Days')}</option>
                  <option value="Weeks">{t('Weeks')}</option>
                  <option value="Months">{t('Months')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t('__criticite__')} :</label>
          </div>
          <div className="col-8">
            <div className="form-group custom-switches-stacked mt-2">
              <div className="row">
                <div className="col-md-6 d-flex flex-column">
                  <label className="custom-switch mb-2">
                    <input
                      type="radio"
                      name="criticite"
                      value="1"
                      className="custom-switch-input"
                      checked={taskConfig.criticite === '1'}
                      onChange={(e) => handleConfigChange('criticite', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('__critiq__')}</span>
                  </label>

                  <label className="custom-switch">
                    <input
                      type="radio"
                      name="criticite"
                      value="3"
                      className="custom-switch-input"
                      checked={taskConfig.criticite === '3'}
                      onChange={(e) => handleConfigChange('criticite', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('__high__')}</span>
                  </label>
                </div>

                <div className="col-md-6 d-flex flex-column">
                  <label className="custom-switch mb-2">
                    <input
                      type="radio"
                      name="criticite"
                      value="2"
                      className="custom-switch-input"
                      checked={taskConfig.criticite === '2'}
                      onChange={(e) => handleConfigChange('criticite', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('__normal__')}</span>
                  </label>

                  <label className="custom-switch">
                    <input
                      type="radio"
                      name="criticite"
                      value="4"
                      className="custom-switch-input"
                      checked={taskConfig.criticite === '4'}
                      onChange={(e) => handleConfigChange('criticite', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('__low__')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t('__prior_ty_')} :</label>
          </div>
          <div className="col-8">
            <div className="form-group custom-switches-stacked mt-2">
              <div className="row">
                <div className="col-md-6 d-flex flex-column">
                  <label className="custom-switch mb-2">
                    <input
                      type="radio"
                      name="priority"
                      value="1"
                      className="custom-switch-input"
                      checked={taskConfig.priority === '1'}
                      onChange={(e) => handleConfigChange('priority', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('__too_urgent__')}</span>
                  </label>

                  <label className="custom-switch">
                    <input
                      type="radio"
                      name="priority"
                      value="2"
                      className="custom-switch-input"
                      checked={taskConfig.priority === '2'}
                      onChange={(e) => handleConfigChange('priority', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('___urgent__')}</span>
                  </label>
                </div>

                <div className="col-md-6 d-flex flex-column">
                  <label className="custom-switch mb-2">
                    <input
                      type="radio"
                      name="priority"
                      value="3"
                      className="custom-switch-input"
                      checked={taskConfig.priority === '3'}
                      onChange={(e) => handleConfigChange('priority', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('__normal__')}</span>
                  </label>

                  <label className="custom-switch">
                    <input
                      type="radio"
                      name="priority"
                      value="4"
                      className="custom-switch-input"
                      checked={taskConfig.priority === '4'}
                      onChange={(e) => handleConfigChange('priority', e.target.value)}
                    />
                    <span className="custom-switch-indicator"></span>
                    <span className="custom-switch-description">{t('__low__')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t('__rule_altern_tive__')} : </label>
          </div>
          <div className="col-8">
            <div className="row">
              <div className="col-md-6">
                <Checkbox 
                  label={t('notifier_superviseur')} 
                  id="notifier_superviseur" 
                  checked={taskConfig.notifier_superviseur || false}
                  onChange={(e) => handleCheckboxChange('notifier_superviseur', e.target.checked)}
                />
                <Checkbox 
                  label={t('reassigner_tache')} 
                  id="reassigner_tache" 
                  checked={taskConfig.reassigner_tache || false}
                  onChange={(e) => handleCheckboxChange('reassigner_tache', e.target.checked)}
                />
                <Checkbox 
                  label={t('envoyer_rappel')} 
                  id="envoyer_rappel"
                  checked={taskConfig.envoyerRappel || false}
                  onChange={(e) => handleCheckboxChange('envoyerRappel', e.target.checked)}
                />
                <Checkbox 
                  label={t('escalade_hierarchique')} 
                  id="escalade_hierarchique" 
                  checked={taskConfig.escaladeHierarchique || false}
                  onChange={(e) => handleCheckboxChange('escaladeHierarchique', e.target.checked)}
                />
                <Checkbox 
                  label={t('changement_priorite')} 
                  id="changement_priorite" 
                  checked={taskConfig.changementPriorite || false}
                  onChange={(e) => handleCheckboxChange('changementPriorite', e.target.checked)}
                />
                <Checkbox 
                  label={t('bloquer_workflow')} 
                  id="bloquer_workflow" 
                  checked={taskConfig.bloquerWorkflow || false}
                  onChange={(e) => handleCheckboxChange('bloquerWorkflow', e.target.checked)}
                />
                <Checkbox 
                  label={t('generer_alerte_equipe')} 
                  id="generer_alerte_equipe" 
                  checked={taskConfig.genererAlerteEquipe || false}
                  onChange={(e) => handleCheckboxChange('genererAlerteEquipe', e.target.checked)}
                />
              </div>

              <div className="col-md-6">
                <Checkbox 
                  label={t('demander_justification')} 
                  id="demander_justification" 
                  checked={taskConfig.demanderJustification || false}
                  onChange={(e) => handleCheckboxChange('demanderJustification', e.target.checked)}
                />
                <Checkbox 
                  label={t('activer_action_corrective')} 
                  id="activer_action_corrective" 
                  checked={taskConfig.activerActionCorrective || false}
                  onChange={(e) => handleCheckboxChange('activerActionCorrective', e.target.checked)}
                />
                <Checkbox 
                  label={t('escalade_externe')} 
                  id="escalade_externe" 
                  checked={taskConfig.escaladeExterne || false}
                  onChange={(e) => handleCheckboxChange('escaladeExterne', e.target.checked)}
                />
                <Checkbox 
                  label={t('cloturer_defaut')} 
                  id="cloturer_defaut" 
                  checked={taskConfig.cloturerDefaut || false}
                  onChange={(e) => handleCheckboxChange('cloturerDefaut', e.target.checked)}
                />
                <Checkbox 
                  label={t('suivi_par_kpi')} 
                  id="suivi_par_kpi" 
                  checked={taskConfig.suiviParKpi || false}
                  onChange={(e) => handleCheckboxChange('suiviParKpi', e.target.checked)}
                />
                <Checkbox 
                  label={t('plan_b_ou_tache_alternative')} 
                  id="plan_b_ou_tache_alternative" 
                  checked={taskConfig.planBOuTacheAlternative || false}
                  onChange={(e) => handleCheckboxChange('planBOuTacheAlternative', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t('consultation_historiq')} :</label>
          </div>
          <div className="col-8">
            <div className="form-group">
              <Checkbox  
                id="consultation" 
                name="consultation_historiq"
                checked={taskConfig.consultationHistorique || false}
                onChange={(e) => handleCheckboxChange('consultationHistorique', e.target.checked)}
              />
            </div>
          </div>
        </div>
        
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t('__kpt__')} : </label>
          </div>
          <div className="col-8">
            <div className="form-group">
              <div className="row">
                <div className="col-md-6">
                  <Checkbox 
                    label={t('nombre_taches_traitees')} 
                    name="nombre_taches_traitees"  
                    id="nombre_taches_traitees" 
                    checked={taskConfig.nombreTachesTraitees || false}
                    onChange={(e) => handleCheckboxChange('nombreTachesTraitees', e.target.checked)}
                  />
                  <Checkbox 
                    label={t('taux_retour_taches_traitees')} 
                    name="taux_retour_taches_traitees"  
                    id="taux_retour_taches_traitees" 
                    checked={taskConfig.tauxRetourTachesTraitees || false}
                    onChange={(e) => handleCheckboxChange('tauxRetourTachesTraitees', e.target.checked)}
                  />
                  <Checkbox 
                    label={t('nombre_interactions_moyens_taches_traitees')} 
                    name="nombre_interactions_moyens_taches_traitees"  
                    id="nombre_interactions_moyens_taches_traitees" 
                    checked={taskConfig.nombreInteractionsMoyensTachesTraitees || false}
                    onChange={(e) => handleCheckboxChange('nombreInteractionsMoyensTachesTraitees', e.target.checked)}
                  />
                  <Checkbox 
                    label={t('respect_delais')} 
                    name="respect_delais"  
                    id="respect_delais" 
                    checked={taskConfig.respectDelais || false}
                    onChange={(e) => handleCheckboxChange('respectDelais', e.target.checked)}
                  />
                </div>
                <div className="col-md-6">
                  <Checkbox 
                    label={t('temps_attente_validation')} 
                    name="temps_attente_validation" 
                    id="temps_attente_validation" 
                    checked={taskConfig.tempsAttenteValidation || false}
                    onChange={(e) => handleCheckboxChange('tempsAttenteValidation', e.target.checked)}
                  />
                  <Checkbox 
                    label={t('respect_priorites')} 
                    name="respect_priorites"  
                    id="respect_priorites" 
                    checked={taskConfig.respectPriorites || false}
                    onChange={(e) => handleCheckboxChange('respectPriorites', e.target.checked)}
                  />
                  <Checkbox 
                    label={t('gestion_urgences')} 
                    name="gestion_urgences"  
                    id="gestion_urgences" 
                    checked={taskConfig.gestionUrgences || false}
                    onChange={(e) => handleCheckboxChange('gestionUrgences', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanificationWrapper;