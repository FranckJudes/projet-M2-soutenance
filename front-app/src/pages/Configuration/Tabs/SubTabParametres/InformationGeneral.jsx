import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Textarea, InputAdd } from '../../../../components/Input.jsx';
import Select from 'react-select';
import { getAllPlanClassement } from '../../../../services/PlanClassementService';


const InformationGeneral = forwardRef(({ selectedTask }, ref) => {
  const { t } = useTranslation();
  const [taskConfig, setTaskConfig] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  // Exposer les méthodes au composant parent via ref
  useImperativeHandle(ref, () => ({
    // Récupérer les données avec la structure demandée
    getInformationData: () => {
      if (!taskConfig) return null;
      
      return {
        board: taskConfig.board || '',
        workInstructions: taskConfig.instructions || '',
        expectedDeliverable: taskConfig.results || '',
        category: taskConfig.category || null
      };
    },
    
    // Valider les données
    validateData: () => {
      const data = {
        board: taskConfig?.board || '',
        workInstructions: taskConfig?.instructions || '',
        expectedDeliverable: taskConfig?.results || '',
        category: taskConfig?.category || null
      };
      
      const errors = [];
      
      if (!data.board.trim()) errors.push('Board is required');
      if (!data.workInstructions.trim()) errors.push('Work instructions are required');
      if (!data.expectedDeliverable.trim()) errors.push('Expected deliverable is required');
      if (!data.category) errors.push('Category is required');
      
      return {
        isValid: errors.length === 0,
        errors,
        data
      };
    },

    // Réinitialiser le composant
    reset: () => {
      setTaskConfig(null);
    }
  }));
  
  // Effet pour charger ou initialiser la configuration de la tâche sélectionnée
  useEffect(() => {
    let isCurrent = true;
    
    const loadConfig = async () => {
      if (!selectedTask) {
        setTaskConfig(null);
        return;
      }
      
      // Petit délai pour éviter les conflits de changement rapide
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isCurrent) return;
      
      console.log('Tâche sélectionnée dans InformationGeneral:', selectedTask);
      
      // Charger la configuration existante depuis le localStorage
      const savedConfig = localStorage.getItem(`task_information_config_${selectedTask.id}`);
      
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
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const planClassements = await getAllPlanClassement();
        const options = planClassements.map(pc => ({
          value: pc.id,
          label: pc.libellePlanClassement
        }));
        setCategoryOptions(options);
      } catch (error) {
        console.error('Failed to load plan classement categories', error);
      }
    };
    
    loadCategories();
  }, []);

  // useEffect(() => {
  //   const loadCategories = async () => {
  //     try {
  //       const planClassements = await getAllPlanClassement();
  //       const options = planClassements.map(pc => ({
  //         value: pc.id,
  //         label: pc.libellePlanClassement
  //       }));
  //       setCategoryOptions(options);
  //     } catch (error) {
  //       console.error('Failed to load plan classement categories', error);
  //     }
  //   };
    
  //   loadCategories();
  // }, []);
  
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
  
  return (
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
              <Textarea 
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
              <Textarea 
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
  );
});

export default InformationGeneral;