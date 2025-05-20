import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {InputAdd} from '../../../../components/Input';
import Select from 'react-select'

export default function Habilitation ({ selectedTask })  {
  const { t } = useTranslation();

  const [isChecked, setIsChecked] = useState(false);
  const [selectPointControl, setselectPointControl] = useState(false);
  const [taskConfig, setTaskConfig] = useState(null);
  
  // Données factices pour les utilisateurs, entités et groupes
  const fakeUsers = [
    { value: "Gallagher", label: "Gallagher" },
    { value: "Franck", label: "Franck" },
    { value: "Judes", label: "Judes" },
    { value: "User", label: "User" },
  ];
  
  const fakeEntities = [
    { value: "entity1", label: "Direction Générale" },
    { value: "entity2", label: "Département IT" },
    { value: "entity3", label: "Ressources Humaines" },
    { value: "entity4", label: "Comptabilité" },
    { value: "entity5", label: "Service Client" },
  ];
  
  const fakeGroups = [
    { value: "group1", label: "Administrateurs" },
    { value: "group2", label: "Développeurs" },
    { value: "group3", label: "Gestionnaires" },
    { value: "group4", label: "Support Technique" },
    { value: "group5", label: "Management" },
  ];
  
  // Effet pour charger ou initialiser la configuration de la tâche sélectionnée
  useEffect(() => {
    if (selectedTask) {
      console.log('Tâche sélectionnée dans Habilitation:', selectedTask);
      
      // Charger la configuration existante depuis le localStorage
      const savedConfig = localStorage.getItem(`task_habilitation_config_${selectedTask.id}`);
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setTaskConfig(config);
        setIsChecked(config.isChecked || false);
        setselectPointControl(config.selectPointControl || false);
      } else {
        // Initialiser une nouvelle configuration
        setTaskConfig({
          taskId: selectedTask.id,
          taskName: selectedTask.name,
          taskType: selectedTask.type,
          isChecked: false,
          selectPointControl: false,
          persInteress: false,
          entity: false,
          groupUser: false,
          possReturn: false,
          selectedUser: null,
          selectedEntity: null,
          selectedGroup: null
        });
      }
    } else {
      // Réinitialiser l'état si aucune tâche n'est sélectionnée
      setTaskConfig(null);
      setIsChecked(false);
      setselectPointControl(false);
    }
  }, [selectedTask]);
  
  // Fonction pour sauvegarder la configuration de la tâche
  const saveTaskConfig = (config) => {
    if (selectedTask && config) {
      localStorage.setItem(`task_habilitation_config_${selectedTask.id}`, JSON.stringify(config));
      console.log('Configuration sauvegardée pour la tâche:', selectedTask.id);
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
    }
  };

  const handleCheckboxChange = (event) => {
    const newValue = event.target.checked;
    setIsChecked(newValue);
    
    if (taskConfig) {
      const updatedConfig = {
        ...taskConfig,
        isChecked: newValue
      };
      setTaskConfig(updatedConfig);
      saveTaskConfig(updatedConfig);
    }
  };

  const handleDisplay = (event) => {
    const newValue = event.target.checked;
    setselectPointControl(newValue);
    
    if (taskConfig) {
      const updatedConfig = {
        ...taskConfig,
        selectPointControl: newValue
      };
      setTaskConfig(updatedConfig);
      saveTaskConfig(updatedConfig);
    }
  }

    return <>
        <div className="row">
        <div className="col-md-12">
              
              <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('AssignedPersons')}</label>
                </div>
                <div className="col-8 d-flex align-items-center">
                  <div>
                   
                    <div className="d-flex align-items-center" style={{ width: "100%" }}>
                      <div className="custom-control custom-checkbox mr-3">
                        <input 
                          type="checkbox" 
                          className="custom-control-input" 
                          id="customCheck1" 
                          checked={taskConfig && taskConfig.persInteress || false}
                          onChange={(e) => handleConfigChange('persInteress', e.target.checked)}
                          disabled={!selectedTask}
                        />
                        <label className="custom-control-label" htmlFor="customCheck1">{t('__pers_interess_')}</label>
                      </div>
                      {taskConfig && taskConfig.persInteress && (
                        <div style={{ width: "100%" }}>
                          <Select 
                            options={fakeUsers} 
                            value={taskConfig.selectedPersons ? 
                                fakeUsers.find(opt => opt.value === taskConfig.selectedPersons) : 
                                null}
                            onChange={(option) => handleConfigChange('selectedPersons', option ? option.value : null)}
                            isDisabled={!selectedTask}
                            placeholder="Une personne intéressée"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="d-flex align-items-center mb-2" style={{ width: "100%" }}>
                      <div className="custom-control custom-checkbox mr-3">
                        <input 
                          type="checkbox" 
                          className="custom-control-input" 
                          id="customCheck2" 
                          checked={taskConfig && taskConfig.entity || false}
                          onChange={(e) => handleConfigChange('entity', e.target.checked)}
                          disabled={!selectedTask}
                        />
                        <label className="custom-control-label" htmlFor="customCheck2">{t('__entity__')}</label>
                      </div>
                      {taskConfig && taskConfig.entity && (
                        <div style={{ width: "1000%" }}>
                          <Select 
                            options={fakeEntities} 
                            value={taskConfig.selectedEntity ? 
                                fakeEntities.find(opt => opt.value === taskConfig.selectedEntity) : 
                                null}
                            onChange={(option) => handleConfigChange('selectedEntity', option ? option.value : null)}
                            isDisabled={!selectedTask}
                            placeholder="une entité"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="custom-control custom-checkbox">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="customCheck3" 
                        checked={taskConfig && taskConfig.groupUser || false}
                        onChange={(e) => handleConfigChange('groupUser', e.target.checked)}
                        disabled={!selectedTask}
                      />
                      <label className="custom-control-label" htmlFor="customCheck3">{t('__group_user_')}</label>
                    </div>
                    {taskConfig && taskConfig.groupUser && (
                      <div className="ml-4 mt-2" style={{ width: "100%" }}>
                        <Select 
                          options={fakeGroups} 
                          value={taskConfig.selectedGroup ? 
                              fakeGroups.find(opt => opt.value === taskConfig.selectedGroup) : 
                              null}
                          onChange={(option) => handleConfigChange('selectedGroup', option ? option.value : null)}
                          isDisabled={!selectedTask}
                          placeholder="Un groupe d'utilisateurs"
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>
              <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('__assign_to_p_t_')}:</label>
                </div>
                <div className="col-8">
                  <div className="form-group d-flex align-items-center mb-1" style={{ gap: "50px" }}>
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customCheck10"
                        onChange={handleCheckboxChange}
                        checked={isChecked}
                        disabled={!selectedTask}
                      />

                      <label
                        className="custom-control-label"
                        htmlFor="customCheck10"
                        style={{ marginBottom: "0" }}
                      ></label>
                    </div>
                    {isChecked && (
                      <div style={{ width: "100%" }}>
                        <Select 
                          options={fakeUsers} 
                          value={taskConfig && taskConfig.selectedUser ? 
                              fakeUsers.find(opt => opt.value === taskConfig.selectedUser) : 
                              null}
                          onChange={(option) => handleConfigChange('selectedUser', option ? option.value : null)}
                          isDisabled={!selectedTask}
                          placeholder="Sélectionner un utilisateur"
                        />
                      </div>
                    )}
                  </div>
                  <p>{t('__msg_for_resp_')}</p>

                  <div className="custom-control custom-checkbox">
                    <input 
                      type="checkbox" 
                      className="custom-control-input" 
                      id="customCheck30" 
                      onChange={handleDisplay} 
                      checked={selectPointControl}
                      disabled={!selectedTask}
                    />
                    <label className="custom-control-label" htmlFor="customCheck30">{t('__require_resp_ex')}</label>
                  </div>



                </div>
              </div>
              {selectPointControl && (<div className="d-flex py-2">
                    <div className="col-4">
                    <label> {t('__check_point_')}</label>
                    </div>
                    <div className="col-8">
                    <InputAdd 
                      details={t('__detail_dyn_form__')} 
                      value={taskConfig ? taskConfig.checkPointDetails || '' : ''}
                      onChange={(e) => handleConfigChange('checkPointDetails', e.target.value)}
                      disabled={!selectedTask}
                    />
                    </div>
              </div>)}
              <div className="d-flex py-2">
                <div className="col-4">
                <label>{t('__poss_return_')} :</label>
                </div>
                <div className="col-8 d-flex justify-content-start" >
                    <div className="custom-control custom-checkbox">
                      <input 
                        type="checkbox" 
                        className="custom-control-input" 
                        id="customCheck33" 
                        checked={taskConfig && taskConfig.possReturn || false}
                        onChange={(e) => handleConfigChange('possReturn', e.target.checked)}
                        disabled={!selectedTask}
                      />
                      <label className="custom-control-label" htmlFor="customCheck33"></label>
                    </div>
                </div>
              </div>
        </div>
        </div>
    </>
}