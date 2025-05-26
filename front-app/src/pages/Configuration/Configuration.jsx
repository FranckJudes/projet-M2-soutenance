import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import Main from "../../layout/Main";
import Breadcrumb from "../../components/Breadcrumb";
import Tabs from "../../components/Tabs";
import Acteur from "./Tabs/Acteur";
import General from "./Tabs/General";
import Parametres from "./Tabs/Parametres";
import Model from "./Tabs/Model";
import Taches from "./Tabs/Taches";
import { ListConfig } from "../../components/List";
import { Card } from "../../components/Card";
import { ButtonWithIcon } from "../../components/Button";
import { styles } from "../../utils/styles";
import { getAllProcessBpmns } from "../../api/processBpmnApi.jsx";
import BpmnModelService from "../../services/BpmnModelService";
import toast from 'react-hot-toast';

function Configuration() {
    const { t } = useTranslation();
    const [showList, setShowList] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [bpmnItems, setBpmnItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBpmnId, setSelectedBpmnId] = useState(null);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [sharedData, setSharedData] = useState({
        processData: {
            processName: "",
            processDescription: "",
            processTags: [],
            processImage: null,
            processId: null
        }
    });
    const modelerRef = useRef(null);
    
    const clearTaskConfigurationsFromLocalStorage = () => {
        
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        
        const taskConfigKeys = keys.filter(key => 
            key.startsWith('task_information_config_') ||
            key.startsWith('task_resource_config_') ||
            key.startsWith('task_habilitation_config_') ||
            key.startsWith('task_planification_config_') ||
            key.startsWith('task_condition_config_') ||
            key.startsWith('task_notification_config_')
        );
        
        taskConfigKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
    };
    
    useEffect(() => {
        return () => {
            clearTaskConfigurationsFromLocalStorage();
        };
    }, []);

    const handleUpdateProcessData = (processData) => {
        console.log('Mise à jour des données du processus:', processData);
        setSharedData(prev => ({
            ...prev,
            processData: {
                ...prev.processData,
                ...processData
            }
        }));
    };

    const handleSaveSuccess = (data) => {
        fetchBpmnItems();
        setTimeout(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setShowList(true);
                setIsUpdateMode(false);
                setSelectedBpmnId(null);
                setIsTransitioning(false);
            }, 300);
        }, 1000);
    };

    const tabItems = [
        { id: "General", title: t("_general_config"), content: <General sharedData={sharedData} onSaveGeneral={handleUpdateProcessData} /> },
        { id: "Model", title: t("__Conception_config_"), content: <Model sharedData={sharedData} setSharedData={setSharedData} /> },
        { id: "Parametres", title: t("setting_sidebar_title"), content: <Parametres 
            sharedData={sharedData} 
            bpmnId={selectedBpmnId} 
            isUpdateMode={isUpdateMode} 
            onSaveSuccess={handleSaveSuccess} 
        /> },
        // { id: "Taches", title: t("__task_bord_"), content: <Taches /> },
        // { id: "Acteur", title: t("_actor_"), content: <Acteur /> }
    ];


    const fetchBpmnItems = async () => {
        setLoading(true);
        try {
            const data = await getAllProcessBpmns();
            setBpmnItems(data);
        } catch (error) {
            setError("Impossible de charger les BPMN. Veuillez réessayer.");
            console.error("Erreur :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBpmnItems();
    }, []);

    const handleUpdateItems = (updatedItems) => {
        setBpmnItems(updatedItems);
    };

    const handleAddClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setShowList(false);
            setIsUpdateMode(false);
            setSelectedBpmnId(null);
            setIsTransitioning(false);
        }, 300);
    };
    
    const handleEditClick = (bpmnId) => {
        setLoading(true);
        setSelectedBpmnId(bpmnId);
        setIsUpdateMode(true);
        
        BpmnModelService.getBpmnModel(bpmnId)
            .then(response => {
                const bpmnData = response.data;
                setSharedData(prev => ({
                    ...prev,
                    loadedBpmnXml: bpmnData.bpmnXml,
                    loadedTaskConfigurations: bpmnData.taskConfigurations
                }));
                
                setIsTransitioning(true);
                setTimeout(() => {
                    setShowList(false);
                    setIsTransitioning(false);
                }, 300);
            })
            .catch(error => {
                toast.error(t("Erreur lors du chargement du modèle BPMN"));
                setIsUpdateMode(false);
                setSelectedBpmnId(null);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Main>
            <Breadcrumb
                items={[
                    { label: t("welcome_dashboard"), link: "#", icon: "fas fa-tachometer-alt", active: false },
                    { label: t("configuration_sidebar_title"), icon: "fas fa-list", active: true }
                ]}
            />

            {loading ? (
                <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <div className="spinner-border text-primary" role="status" aria-label="Chargement">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : (
                <div style={{
                    ...styles.transitionContainer,
                    ...(isTransitioning ? styles.fadeOut : {})
                }}>
                    {showList ? (
                        <Card
                            title={`Processus (${bpmnItems.length})`}
                            titleAction={
                                <ButtonWithIcon
                                    className="btn btn-icon icon-left btn-success"
                                    label="Ajouter un nouveau processus"
                                    onClick={handleAddClick}
                                    iconClass="fas fa-plus"
                                />
                            }
                        >
                            {error ? (
                                <div className="alert alert-danger">{error}</div>
                            ) : (
                                <ListConfig
                                    items={bpmnItems.map((item) => ({
                                        label: item.name,
                                        id: item.id,
                                        actions: [
                                            {
                                                icon: "fas fa-edit",
                                                label: t("Modifier"),
                                                onClick: () => handleEditClick(item.id)
                                            }
                                        ]
                                    }))}    
                                    onUpdateItems={handleUpdateItems}  
                                />
                            )}
                        </Card>
                    ) : (
                        <Tabs items={tabItems} 
                              title={t("configuration_sidebar_title")} 
                              footer={true}
                              
                         />

                    )}
                </div>
            )}
        </Main>
    );
}

export default Configuration;
