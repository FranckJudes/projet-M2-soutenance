import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Textarea ,InputAdd} from '../../../../components/Input.jsx';
import Select from 'react-select'
                    

export default function InformationGeneral({ selectedTask }) {
  const { t } = useTranslation();
  const [taskConfig, setTaskConfig] = useState(null);
  
  // Effet pour charger ou initialiser la configuration de la tâche sélectionnée
  useEffect(() => {
    if (selectedTask) {
      console.log('Tâche sélectionnée dans InformationGeneral:', selectedTask);
      
      // Charger la configuration existante depuis le localStorage
      const savedConfig = localStorage.getItem(`task_information_config_${selectedTask.id}`);
      
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setTaskConfig(config);
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
      category: null,
      board: '',
      instructions: '',
      results: ''
    };
    setTaskConfig(newConfig);
    // Sauvegarder la nouvelle configuration dans le localStorage
    saveTaskConfig(newConfig);
  };
  
  // Fonction pour sauvegarder la configuration de la tâche
  const saveTaskConfig = (config) => {
    if (selectedTask && config) {
      localStorage.setItem(`task_information_config_${selectedTask.id}`, JSON.stringify(config));
      console.log('Configuration sauvegardée pour la tâche:', selectedTask.id);
    }
  };
  
  // Fonction pour gérer les changements dans les champs de texte
  const handleInputChange = (field, value) => {
    if (taskConfig) {
      const updatedConfig = {
        ...taskConfig,
        [field]: value
      };
      setTaskConfig(updatedConfig);
      saveTaskConfig(updatedConfig);
    }
  };
  
  // Options pour le Select (exemple)
  const categoryOptions = [
    { value: 'administrative', label: t('Administrative') },
    { value: 'technical', label: t('Technical') },
    { value: 'financial', label: t('Financial') },
    { value: 'hr', label: t('Human Resources') },
  ];

    return <>
        <div className="row">
            <div className="col-md-12">
            <div className="d-flex py-2">
                <div className="col-4">
                  <label>Category :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">

                    <Select
                      options={categoryOptions}
                      value={taskConfig && taskConfig.category ? categoryOptions.find(opt => opt.value === taskConfig.category) : null}
                      onChange={(option) => handleInputChange('category', option ? option.value : null)}
                      isDisabled={!selectedTask}
                      placeholder={t('Select a category')}
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex py-2">
                <div className="col-4">
                    <label>Board :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      name="board" 
                      value={taskConfig ? taskConfig.board : ''}
                      onChange={(e) => handleInputChange('board', e.target.value)}
                      disabled={!selectedTask}
                    />
                  </div>
                </div>
              </div>
            <div className="d-flex py-2">
                <div className="col-4">
                <label>{t('__inst_work_')}:</label>
                </div>
                <div className="col-8">
                        <div className="form-group">
                          <textarea 
                            className="form-control" 
                            placeholder={t('__detail_work_inst')}
                            value={taskConfig ? taskConfig.instructions : ''}
                            onChange={(e) => handleInputChange('instructions', e.target.value)}
                            disabled={!selectedTask}
                          />
                        </div>
                </div>
            </div>
            <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('__result_livrab__')} :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">
                    {/* <input type="text" className="form-control" name="board" /> */}
                    <textarea 
                      className="form-control" 
                      name="results" 
                      placeholder={t('__inf_result_livrab__')} 
                      value={taskConfig ? taskConfig.results : ''}
                      onChange={(e) => handleInputChange('results', e.target.value)}
                      disabled={!selectedTask}
                    />
                  </div>
                </div>
              </div>
            </div>
        </div>
    </>
}