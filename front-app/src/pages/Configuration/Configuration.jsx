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
    const [sharedData, setSharedData] = useState({});
    const modelerRef = useRef(null);
    
    // Fonction pour vider le localStorage des configurations de tâches
    const clearTaskConfigurationsFromLocalStorage = () => {
        console.log('Nettoyage du localStorage des configurations de tâches');
        
        // Récupérer toutes les clés du localStorage
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        
        // Filtrer les clés liées aux configurations de tâches
        const taskConfigKeys = keys.filter(key => 
            key.startsWith('task_information_config_') ||
            key.startsWith('task_resource_config_') ||
            key.startsWith('task_habilitation_config_') ||
            key.startsWith('task_planification_config_') ||
            key.startsWith('task_condition_config_') ||
            key.startsWith('task_notification_config_')
        );
        
        // Supprimer toutes les configurations de tâches
        taskConfigKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log(`${taskConfigKeys.length} configurations de tâches supprimées du localStorage`);
    };
    
    // Nettoyer le localStorage lorsque l'utilisateur quitte la page
    useEffect(() => {
        return () => {
            clearTaskConfigurationsFromLocalStorage();
        };
    }, []);

    // Fonction pour gérer la sauvegarde réussie du modèle BPMN
    const handleSaveSuccess = (data) => {
        console.log('Modèle BPMN sauvegardé avec succès:', data);
        // Rafraîchir la liste des modèles BPMN
        fetchBpmnItems();
        // Revenir à la liste des modèles
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
        { id: "General", title: t("_general_config"), content: <General /> },
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
        
        // Charger le modèle BPMN existant
        BpmnModelService.getBpmnModel(bpmnId)
            .then(response => {
                const bpmnData = response.data;
                console.log('Modèle BPMN chargé:', bpmnData);
                
                // Mettre à jour les données partagées
                setSharedData(prev => ({
                    ...prev,
                    loadedBpmnXml: bpmnData.bpmnXml,
                    loadedTaskConfigurations: bpmnData.taskConfigurations
                }));
                
                // Transition vers l'écran d'édition
                setIsTransitioning(true);
                setTimeout(() => {
                    setShowList(false);
                    setIsTransitioning(false);
                }, 300);
            })
            .catch(error => {
                console.error('Erreur lors du chargement du modèle BPMN:', error);
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
                            title={`Processus (${bpmnItems.length})`} // Mise à jour dynamique
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
                                    onUpdateItems={handleUpdateItems} // Transmet la fonction de mise à jour
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
