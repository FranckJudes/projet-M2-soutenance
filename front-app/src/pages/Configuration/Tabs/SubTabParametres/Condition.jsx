import React, { useState, useEffect } from 'react';
import {Radio} from '../../../../components/Input';
import { useTranslation } from 'react-i18next';
import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";

export default function Condition({ selectedTask }){
  
    const { t } = useTranslation();
    const [showEntryTable, setShowEntryTable] = useState(false);
    const [showOutputTable, setShowOutputTable] = useState(false);
    const [taskConfig, setTaskConfig] = useState(null);
    
    // Effet pour charger ou initialiser la configuration de la tâche sélectionnée
    useEffect(() => {
      // Réinitialiser les états locaux à chaque changement de tâche
      setShowEntryTable(false);
      setShowOutputTable(false);
      
      if (selectedTask) {
        console.log('Tâche sélectionnée dans Condition:', selectedTask);
        
        // Charger la configuration existante depuis le localStorage
        const savedConfig = localStorage.getItem(`task_condition_config_${selectedTask.id}`);
        
        if (savedConfig) {
          try {
            const config = JSON.parse(savedConfig);
            setTaskConfig(config);
            // Synchroniser les états locaux avec les valeurs de la configuration
            setShowEntryTable(config.showEntryTable || false);
            setShowOutputTable(config.showOutputTable || false);
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
        showEntryTable: false,
        showOutputTable: false,
        entryConditions: [],
        outputConditions: []
      };
      setTaskConfig(newConfig);
      setShowEntryTable(false);
      setShowOutputTable(false);
      // Sauvegarder la nouvelle configuration dans le localStorage
      saveTaskConfig(newConfig);
    };
    
    // Fonction pour sauvegarder la configuration de la tâche
    const saveTaskConfig = (config) => {
      if (selectedTask && config) {
        localStorage.setItem(`task_condition_config_${selectedTask.id}`, JSON.stringify(config));
        console.log('Configuration sauvegardée pour la tâche:', selectedTask.id);
      }
    };
  
    const [tableData] = useState([
      { id: 1, name: "Type", position: "Condition", value: "Definir resultat" },
      { id: 2, name: "Garrett Winters", position: "Accountant", value: "troisieme22" },
    ]);
  
    const handlePriorityChange = (event) => {
      const newValue = event.target.checked;
      setShowEntryTable(newValue);
      
      if (taskConfig) {
        const updatedConfig = {
          ...taskConfig,
          showEntryTable: newValue
        };
        setTaskConfig(updatedConfig);
        saveTaskConfig(updatedConfig);
      }
    };
  
    const handlePriorityOutput = (event) => {
      const newValue = event.target.checked;
      setShowOutputTable(newValue);
      
      if (taskConfig) {
        const updatedConfig = {
          ...taskConfig,
          showOutputTable: newValue
        };
        setTaskConfig(updatedConfig);
        saveTaskConfig(updatedConfig);
      }
    };
  
    const columns = [
      { data: "name", title: "Type" },
      { data: "position", title: "Condition" },
      { data: "value", title: "Definir resultat" },
    ];
  
    return (
      <>
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t("__condit_entry__")} :</label>
          </div>
          <div className="col-8">
            <div className="form-group">
              <div className="col-md-6 d-flex flex-column">
                <Radio
                  name="entry_condition"
                  onChange={handlePriorityChange}
                  checked={showEntryTable}
                  disabled={!selectedTask}
                />
              </div>
            </div>
          </div>
        </div>
        {showEntryTable && (
          <div className="d-flex py-2">
            <div className="col-12">
              <DataTable
                data={tableData}
                columns={columns}
                className="display"
                options={{
                  responsive: true,
                  searching: false,
                  paging: false,
                  lengthChange: false,
                  info: false,
                }}
              />
            </div>
          </div>
        )}
          
  
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t("__condit_output__")} :</label>
          </div>
          <div className="col-8">
            <div className="form-group">
              <div className="col-md-6 d-flex flex-column">
              <Radio
                  name="output_condition"
                  onChange={handlePriorityOutput}
                  checked={showOutputTable}
                  disabled={!selectedTask}
                />
              </div>
            </div>
          </div>
        </div>
        {showOutputTable && (
          <div className="d-flex py-2">
            <div className="col-12">
              <DataTable
                data={tableData}
                columns={columns}
                className="display"
                options={{
                  responsive: true,
                  searching: false,
                  paging: false,
                  lengthChange: false,
                  info: false,
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  };
  