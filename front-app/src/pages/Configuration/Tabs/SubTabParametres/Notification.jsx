import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Radio, RadioButton } from '../../../../components/Input';

const Notifications = forwardRef(({ selectedTask }, ref) => {
  const { t } = useTranslation();
  const [selectedPriority, setSelectedPriority] = useState(1);
  const [taskConfig, setTaskConfig] = useState(null);
  const [selectedReminders, setSelectedReminders] = useState([]);

  // Exposer les méthodes au composant parent via ref
  useImperativeHandle(ref, () => ({
    // Récupérer les données avec la structure demandée
    getNotificationData: () => {
      if (!taskConfig) {
        // Retourner des valeurs par défaut si pas de configuration
        return {
          notifyOnCreation: false,
          notifyOnDeadline: false,
          reminderBeforeDeadline: null,
          notificationSensitivity: 'public',
          selectedReminders: []
        };
      }

      // Mapper les données vers le format backend
      let sensitivity = 'public';
      switch (taskConfig.selectedPriority) {
        case 1:
          sensitivity = 'public';
          break;
        case 2:
          sensitivity = 'confidential';
          break;
        default:
          sensitivity = 'public';
      }

      // Extraire le premier rappel comme reminderBeforeDeadline (pour compatibilité)
      let reminderBeforeDeadline = null;
      if (taskConfig.selectedReminders && taskConfig.selectedReminders.length > 0) {
        // Extraire le nombre de minutes du premier rappel
        const firstReminder = taskConfig.selectedReminders[0];
        reminderBeforeDeadline = extractMinutesFromReminder(firstReminder.value);
      }

      return {
        notifyOnCreation: taskConfig.notificationByAttribution || false,
        notifyOnDeadline: taskConfig.alertEscalade || false,
        reminderBeforeDeadline: reminderBeforeDeadline,
        notificationSensitivity: sensitivity,
        selectedReminders: taskConfig.selectedReminders || []
      };
    },
    
    // Valider les données (VALIDATION OPTIONNELLE)
    validateData: () => {
      const data = {
        notifyOnCreation: taskConfig?.notificationByAttribution || false,
        notifyOnDeadline: taskConfig?.alertEscalade || false,
        reminderBeforeDeadline: null,
        notificationSensitivity: taskConfig?.selectedPriority === 2 ? 'confidential' : 'public',
        selectedReminders: taskConfig?.selectedReminders || []
      };
      
      const errors = [];
      
      // Validation optionnelle - tous les champs sont optionnels
      // Pas de validation spécifique nécessaire pour les notifications
      
      return {
        isValid: errors.length === 0,
        errors,
        data
      };
    },

    // Réinitialiser le composant
    reset: () => {
      setTaskConfig(null);
      setSelectedPriority(1);
      setSelectedReminders([]);
    }
  }));

  // Fonction utilitaire pour extraire les minutes d'un rappel
  const extractMinutesFromReminder = (reminderValue) => {
    if (!reminderValue) return null;
    
    // Mapping des valeurs vers des minutes
    const reminderMapping = {
      [t("minutesBefore")]: 15,
      [t("oneHourBefore")]: 60,
      [t("hoursBefore.2")]: 120,
      [t("hoursBefore.3")]: 180,
      [t("hoursBefore.4")]: 240,
      [t("oneDayBefore")]: 1440,
      [t("daysBefore.2")]: 2880,
      [t("daysBefore.3")]: 4320,
      [t("oneWeekBefore")]: 10080,
      [t("weeksBefore.2")]: 20160,
      [t("oneMonthBefore")]: 43200
    };

    return reminderMapping[reminderValue] || null;
  };
  
  // Effet pour charger ou initialiser la configuration de la tâche sélectionnée
  useEffect(() => {
    // Réinitialiser les états locaux à chaque changement de tâche
    setSelectedPriority(1);
    setSelectedReminders([]);
    
    if (selectedTask) {
      console.log('Tâche sélectionnée dans Notifications:', selectedTask);
      
      // Charger la configuration existante depuis le localStorage
      const savedConfig = localStorage.getItem(`task_notification_config_${selectedTask.id}`);
      
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setTaskConfig(config);
          // Synchroniser les états locaux avec les valeurs de la configuration
          setSelectedPriority(config.selectedPriority || 1);
          setSelectedReminders(config.selectedReminders || []);
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
      notificationByAttribution: false,
      alertEscalade: false,
      selectedReminders: [],
      selectedPriority: 1
    };
    setTaskConfig(newConfig);
    setSelectedPriority(1);
    setSelectedReminders([]);
    // Sauvegarder la nouvelle configuration dans le localStorage
    saveTaskConfig(newConfig);
  };
  
  // Fonction pour sauvegarder la configuration de la tâche
  const saveTaskConfig = (config) => {
    if (selectedTask && config) {
      localStorage.setItem(`task_notification_config_${selectedTask.id}`, JSON.stringify(config));
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
  
  const optionsRappel = [
    { value: t("minutesBefore"), label: t("minutesBefore") },
    { value: t("oneHourBefore"), label: t("oneHourBefore") },
    { value: t("hoursBefore.2"), label: t("hoursBefore.2") },
    { value: t("hoursBefore.3"), label: t("hoursBefore.3") },
    { value: t("hoursBefore.4"), label: t("hoursBefore.4") },
    { value: t("oneDayBefore"), label: t("oneDayBefore") },
    { value: t("daysBefore.2"), label: t("daysBefore.2") },
    { value: t("daysBefore.3"), label: t("daysBefore.3") },
    { value: t("oneWeekBefore"), label: t("oneWeekBefore") },
    { value: t("weeksBefore.2"), label: t("weeksBefore.2") },
    { value: t("oneMonthBefore"), label: t("oneMonthBefore") },
  ];

  const handlePriorityChange = (event) => {
    const newValue = parseInt(event.target.value);
    setSelectedPriority(newValue);
    
    if (taskConfig) {
      const updatedConfig = {
        ...taskConfig,
        selectedPriority: newValue
      };
      setTaskConfig(updatedConfig);
      saveTaskConfig(updatedConfig);
    }
  };

  // Si aucune tâche n'est sélectionnée, afficher un message
  if (!selectedTask) {
    return (
      <div className="alert alert-info">
        Veuillez sélectionner une tâche pour configurer ses notifications.
      </div>
    );
  }

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
    <>
      <div className="d-flex py-2">
        <div className="col-4">
          <label>{t('__notf_par_attrib__')} :</label>
        </div>
        <div className="col-8">
          <div className="form-group">
            <Radio  
              name="script_regle_metier" 
              label={t('__notf_par_attrib_details_')} 
              checked={taskConfig && taskConfig.notificationByAttribution || false}
              onChange={(e) => handleConfigChange('notificationByAttribution', e.target.checked)}
              disabled={!selectedTask}
            />
          </div>
        </div>
      </div>
      
      <div className="d-flex py-2">
        <div className="col-4">
          <label>{t('__alert_escal_')} :</label>
        </div>
        <div className="col-8">
          <div className="form-group">
            <Radio  
              name="alert_escalade" 
              label={t('__detail_messag_alert__')} 
              checked={taskConfig && taskConfig.alertEscalade || false}
              onChange={(e) => handleConfigChange('alertEscalade', e.target.checked)}
              disabled={!selectedTask}
            />
          </div>
        </div>
      </div>
      
      <div className="d-flex py-2 mb-2">
        <div className="col-4">
          <label>{t('Reminder')} :</label>
        </div>
        <div className="col-8">
          <Select 
            options={optionsRappel} 
            isMulti 
            value={taskConfig && taskConfig.selectedReminders ? taskConfig.selectedReminders : []}
            onChange={(options) => {
              setSelectedReminders(options);
              handleConfigChange('selectedReminders', options);
            }}
            isDisabled={!selectedTask}
          />
        </div>
      </div>
      
      <div className="d-flex py-2">
        <div className="col-4">
          <label>{t('__sensibl_t_')} :</label>
        </div>
        <div className="col-8">
          <div className="form-group">
            <div className="col-md-6 d-flex flex-column">
              <RadioButton
                label={t('__public__')}
                value={1}
                name="sensibilite"
                checked={selectedPriority === 1}
                onChange={handlePriorityChange}
                disabled={!selectedTask}
              />
              <RadioButton
                label={t('__confidentitial__')}
                value={2}
                name="sensibilite"
                checked={selectedPriority === 2}
                onChange={handlePriorityChange}
                disabled={!selectedTask}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default Notifications;