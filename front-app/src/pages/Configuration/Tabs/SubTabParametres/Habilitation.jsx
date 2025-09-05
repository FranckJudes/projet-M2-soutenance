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
    
    // Valider les données (validation stricte)
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
      else if (data.assignedGroup) data.assigneeType = 'group';
      else if (data.assignedEntity) data.assigneeType = 'entity';
      
      const errors = [];
      // Validation stricte: exactement une assignation principale parmi user/entity/group
      const choices = [!!data.assignedUser, !!data.assignedEntity, !!data.assignedGroup].filter(Boolean).length;
      if (choices === 0) {
        errors.push('Veuillez sélectionner un assigné: utilisateur OU entité OU groupe');
      } else if (choices > 1) {
        errors.push('Sélection invalide: choisissez uniquement un type d\'assignation (utilisateur, entité ou groupe)');
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
        console.log(groupsResponse);
        
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
    let isCurrent = true;
    
    const loadConfig = async () => {
      if (!selectedTask) {
        if (isCurrent) setTaskConfig(null);
        return;
      }
      
      // Petit délai pour éviter les conflits
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isCurrent) return;
      
      console.log('Tâche sélectionnée dans Habilitation:', selectedTask);
      
      // Charger la configuration existante depuis le localStorage
      const savedConfig = localStorage.getItem(`task_habilitation_config_${selectedTask.id}`);
      
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (isCurrent) setTaskConfig(config);
        } catch (error) {
          console.error('Erreur lors du parsing de la configuration:', error);
          if (isCurrent) initializeNewConfig();
        }
      } else if (isCurrent) {
        initializeNewConfig();
      }
    };
    
    loadConfig();
    
    return () => {
      isCurrent = false;
    };
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
      let updatedConfig = {
        ...taskConfig,
        [field]: value
      };

      // Enforcer l'exclusivité entre user / entity / group
      if (field === 'entity') {
        if (value) {
          // Si on active entité, désactiver user et group et nettoyer leurs valeurs
          updatedConfig = {
            ...updatedConfig,
            isChecked: false,
            groupUser: false,
            selectedUser: null,
            selectedGroup: null
          };
        }
      } else if (field === 'groupUser') {
        if (value) {
          // Si on active groupe, désactiver user et entité et nettoyer leurs valeurs
          updatedConfig = {
            ...updatedConfig,
            isChecked: false,
            entity: false,
            selectedUser: null,
            selectedEntity: null
          };
        }
      } else if (field === 'selectedUser') {
        if (value) {
          // Si on choisit un user, forcer isChecked et désactiver entité/groupe
          updatedConfig = {
            ...updatedConfig,
            isChecked: true,
            entity: false,
            groupUser: false,
            selectedEntity: null,
            selectedGroup: null
          };
        }
      } else if (field === 'selectedEntity') {
        if (value) {
          // Si on choisit une entité, forcer entity et désactiver user/groupe
          updatedConfig = {
            ...updatedConfig,
            entity: true,
            isChecked: false,
            groupUser: false,
            selectedUser: null,
            selectedGroup: null
          };
        }
      } else if (field === 'selectedGroup') {
        if (value) {
          // Si on choisit un groupe, forcer groupUser et désactiver user/entité
          updatedConfig = {
            ...updatedConfig,
            groupUser: true,
            isChecked: false,
            entity: false,
            selectedUser: null,
            selectedEntity: null
          };
        }
      }

      setTaskConfig(updatedConfig);
      saveTaskConfig(updatedConfig);
    }
  };

  const handleCheckboxChange = (event) => {
    const newValue = event.target.checked;
    setIsChecked(newValue);
    
    if (taskConfig) {
      let updatedConfig = {
        ...taskConfig,
        isChecked: newValue
      };
      if (newValue) {
        // Si on active user, désactiver entité et groupe et nettoyer leurs sélections
        updatedConfig = {
          ...updatedConfig,
          entity: false,
          groupUser: false,
          selectedEntity: null,
          selectedGroup: null
        };
      } else {
        // Si on désactive, nettoyer l'utilisateur sélectionné
        updatedConfig = {
          ...updatedConfig,
          selectedUser: null
        };
      }
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
                  disabled={!selectedTask || loading || isChecked || (taskConfig && taskConfig.groupUser)}
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
                disabled={!selectedTask || loading || isChecked || (taskConfig && taskConfig.entity)}
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
                disabled={!selectedTask || (taskConfig && (taskConfig.entity || taskConfig.groupUser))}
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
                    value={taskConfig && taskConfig.selectedUser ? 
                        users.find(opt => opt.value === taskConfig.selectedUser) : 
                        null}
                    onChange={(option) => handleConfigChange('selectedUser', option ? option.value : null)}
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