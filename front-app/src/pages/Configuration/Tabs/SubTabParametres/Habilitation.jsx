import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdd } from '../../../../components/Input';
import Select from 'react-select';
import UserService from '../../../../services/UserService';
import GroupeService from '../../../../services/GroupeService';
import EntiteOrganisationService from '../../../../services/EntiteOrganisationService';
import toast from 'react-hot-toast';

const Habilitation = forwardRef(({ selectedTask }, ref) => {
  const { t } = useTranslation();

  const [isChecked, setIsChecked] = useState(false);
  const [selectPointControl, setselectPointControl] = useState(false);
  const [taskConfig, setTaskConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour stocker les données réelles
  const [users, setUsers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [groups, setGroups] = useState([]);

  // Exposer les méthodes au composant parent via ref
  useImperativeHandle(ref, () => ({
    // Récupérer les données avec la structure demandée
    getHabilitationData: () => {
      if (!taskConfig) {
        // Retourner des valeurs par défaut si pas de configuration
        return {
          assignedEntity: null,
          returnAllowed: false,
          assignedUser: null,
          assignedGroup: null,
          responsibleUser: null,
          interestedUser: null,
          assigneeType: null
        };
      }
      
      // Déterminer le type d'assigné avec priorité explicite
      let assigneeType = null;
      let assignedUser = null;
      let assignedEntity = null;
      let assignedGroup = null;
      let interestedUser = null;
      let responsibleUser = null;

      // Priorité 1: Assignation utilisateur principal
      if (taskConfig.isChecked && taskConfig.selectedUser) {
        assignedUser = taskConfig.selectedUser.value || taskConfig.selectedUser;
        assigneeType = 'user';
        console.log('Assignation utilisateur détectée:', assignedUser);
      }
      // Priorité 2: Assignation groupe (si pas d'utilisateur)
      else if (taskConfig.groupUser && taskConfig.selectedGroup) {
        assignedGroup = taskConfig.selectedGroup.value || taskConfig.selectedGroup;
        assigneeType = 'group';
        console.log('Assignation groupe détectée:', assignedGroup);
      }
      // Priorité 3: Assignation entité (si pas d'utilisateur ni groupe)
      else if (taskConfig.entity && taskConfig.selectedEntity) {
        assignedEntity = taskConfig.selectedEntity.value || taskConfig.selectedEntity;
        assigneeType = 'entity';
        console.log('Assignation entité détectée:', assignedEntity);
      }

      // Personne intéressée (indépendante de l'assignation principale)
      if (taskConfig.persInteress && taskConfig.selectedInterestedUser) {
        interestedUser = taskConfig.selectedInterestedUser.value || taskConfig.selectedInterestedUser;
        console.log('Utilisateur intéressé détecté:', interestedUser);
      }

      // Responsable pour point de contrôle (indépendant de l'assignation principale)
      if (taskConfig.selectPointControl && taskConfig.checkPointDetails) {
        responsibleUser = taskConfig.checkPointDetails.value || taskConfig.checkPointDetails;
        console.log('Utilisateur responsable détecté:', responsibleUser);
      }

      return {
        assignedEntity: assignedEntity,
        returnAllowed: taskConfig.possReturn || false,
        assignedUser: assignedUser,
        assignedGroup: assignedGroup,
        responsibleUser: responsibleUser,
        interestedUser: interestedUser,
        assigneeType: assigneeType
      };
    },
    
    // Valider les données (VALIDATION OPTIONNELLE)
    validateData: () => {
      const data = {
        assignedEntity: taskConfig?.entity && taskConfig?.selectedEntity ? taskConfig.selectedEntity : null,
        returnAllowed: taskConfig?.possReturn || false,
        assignedUser: taskConfig?.isChecked && taskConfig?.selectedUser ? taskConfig.selectedUser : null,
        assignedGroup: taskConfig?.groupUser && taskConfig?.selectedGroup ? taskConfig.selectedGroup : null,
        responsibleUser: taskConfig?.selectPointControl && taskConfig?.checkPointDetails ? taskConfig.checkPointDetails : null,
        interestedUser: taskConfig?.persInteress && taskConfig?.selectedInterestedUser ? taskConfig.selectedInterestedUser : null,
        assigneeType: null
      };

      // Déterminer le type d'assigné
      if (data.assignedUser) data.assigneeType = 'user';
      else if (data.assignedEntity) data.assigneeType = 'entity';
      else if (data.assignedGroup) data.assigneeType = 'group';
      
      const errors = [];
      
      // Tous les champs sont optionnels, aucune validation obligatoire n'est nécessaire
      // Seule validation conditionnelle: si la case à cocher est activée, il faut sélectionner un utilisateur responsable
      if (taskConfig?.isChecked && !data.responsibleUser) {
        errors.push('Un utilisateur responsable doit être sélectionné quand la case est cochée');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        data
      };
    },

    // Réinitialiser le composant
    reset: () => {
      setTaskConfig(null);
      setIsChecked(false);
      setselectPointControl(false);
    }
  }));
  
  // Chargement des données réelles depuis les services
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer les utilisateurs
        const usersResponse = await UserService.getAllUsers();
        const usersData = usersResponse.data.data || [];
        const formattedUsers = usersData.map(user => ({
          value: user.id.toString(),
          label: `${user.firstName} ${user.lastName}`,
          userData: user
        }));
        setUsers(formattedUsers);
        
        // Récupérer les entités
        const entitiesResponse = await EntiteOrganisationService.getAllEntites();
        const entitiesData = entitiesResponse.data.data || [];
        const formattedEntities = entitiesData.map(entity => ({
          value: entity.id.toString(),
          label: entity.libele,
          entityData: entity
        }));
        setEntities(formattedEntities);
        
        // Récupérer les groupes
        const groupsResponse = await GroupeService.getAllGroups();
        const groupsData = groupsResponse.data || [];
        const formattedGroups = groupsData.map(group => ({
          value: group.id.toString(),
          label: group.libeleGroupeUtilisateur,
          groupData: group
        }));
        setGroups(formattedGroups);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Effet pour charger ou initialiser la configuration de la tâche sélectionnée
  useEffect(() => {
    // Réinitialiser les états locaux à chaque changement de tâche
    setIsChecked(false);
    setselectPointControl(false);
    
    if (selectedTask) {
      console.log('Tâche sélectionnée dans Habilitation:', selectedTask);
      
      // Charger la configuration existante depuis le localStorage
      const savedConfig = localStorage.getItem(`task_habilitation_config_${selectedTask.id}`);
      
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          // Mettre à jour l'état de la configuration
          setTaskConfig(config);
          // Synchroniser les états locaux avec les valeurs de la configuration
          setIsChecked(config.isChecked || false);
          setselectPointControl(config.selectPointControl || false);
        } catch (error) {
          console.error('Erreur lors du parsing de la configuration:', error);
          initializeNewConfig();
        }
      } else {
        // Initialiser une nouvelle configuration
        initializeNewConfig();
      }
    } else {
      // Réinitialiser l'état si aucune tâche n'est sélectionnée
      setTaskConfig(null);
    }
  }, [selectedTask]);
  
  // Fonction pour initialiser une nouvelle configuration
  const initializeNewConfig = () => {
    const newConfig = {
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
      selectedInterestedUser: null,
      selectedEntity: null,
      selectedGroup: null,
      checkPointDetails: ''
    };
    setTaskConfig(newConfig);
    setIsChecked(false);
    setselectPointControl(false);
    // Sauvegarder la nouvelle configuration dans le localStorage
    saveTaskConfig(newConfig);
  };
  
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

  return (
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
                    options={users} 
                    value={taskConfig && taskConfig.selectedInterestedUser ? 
                        users.find(opt => opt.value === taskConfig.selectedInterestedUser) : 
                        null}
                    onChange={(option) => handleConfigChange('selectedInterestedUser', option ? option.value : null)}
                    isDisabled={!selectedTask || loading}
                    placeholder="Une personne intéressée"
                    isLoading={loading}
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
                      options={entities} 
                      value={taskConfig.selectedEntity ? 
                          entities.find(opt => opt.value === taskConfig.selectedEntity) : 
                          null}
                      onChange={(option) => handleConfigChange('selectedEntity', option ? option.value : null)}
                      isDisabled={!selectedTask || loading}
                      placeholder="Une entité"
                      isLoading={loading}
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
                    options={groups} 
                    value={taskConfig.selectedGroup ? 
                        groups.find(opt => opt.value === taskConfig.selectedGroup) : 
                        null}
                    onChange={(option) => handleConfigChange('selectedGroup', option ? option.value : null)}
                    isDisabled={!selectedTask || loading}
                    placeholder="Un groupe d'utilisateurs"
                    isLoading={loading}
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
                    options={users} 
                    value={taskConfig && taskConfig.checkPointDetails ? 
                        users.find(opt => opt.value === taskConfig.checkPointDetails) : 
                        null}
                    onChange={(option) => handleConfigChange('checkPointDetails', option ? option.value : null)}
                    isDisabled={!selectedTask || loading}
                    placeholder="Sélectionner un utilisateur responsable"
                    isLoading={loading}
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
        
        {selectPointControl && (
          <div className="d-flex py-2">
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
          </div>
        )}
        
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
  );
});

export default Habilitation;