import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import Main from "../../layout/Main";
import { Card, Button, Table, Spin, Tabs, message, Alert, Breadcrumb, theme } from 'antd';
import { PlusOutlined, EditOutlined, PlayCircleOutlined, ReloadOutlined, HomeOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Acteur from "./Tabs/Acteur";
import General from "./Tabs/General";
import Parametres from "./Tabs/Parametres";
import Model from "./Tabs/Model";
import Taches from "./Tabs/Taches";
import { styles } from "../../utils/styles";
import BpmnModelService from "../../services/BpmnModelService";

const Configuration = () => {
    const { t } = useTranslation();
    const [showList, setShowList] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [bpmnItems, setBpmnItems] = useState([]);
    const [deployedProcesses, setDeployedProcesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processesLoading, setProcessesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBpmnId, setSelectedBpmnId] = useState(null);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [startingProcess, setStartingProcess] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
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
    const { token } = theme.useToken();
    
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
            const response = await BpmnModelService.getAllBpmnModels();
            console.log('Réponse API getAllBpmnModels:', response);
            // Accéder à response.data car Axios encapsule la réponse dans un objet avec une propriété data
            // S'assurer que bpmnItems est toujours un tableau
            const items = response.data;
            setBpmnItems(Array.isArray(items) ? items : []);
        } catch (error) {
            setError("Impossible de charger les BPMN. Veuillez réessayer.");
            console.error("Erreur :", error);
            message.error("Impossible de charger les BPMN. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchDeployedProcesses = async () => {
        setProcessesLoading(true);
        try {
            const response = await BpmnModelService.getDeployedProcesses();
            const processesArray = Array.isArray(response) ? response : [];
            setDeployedProcesses(processesArray);
        } catch (err) {
            console.error("Erreur lors de la récupération des processus déployés:", err);
            message.error("Erreur lors de la récupération des processus déployés");
        } finally {
            setProcessesLoading(false);
        }
    };

    useEffect(() => {
        fetchBpmnItems();
        fetchDeployedProcesses();
    }, []);
    
    const startProcessInstance = async (processKey) => {
        setStartingProcess(processKey);
        try {
            const response = await BpmnModelService.startProcessInstance(processKey);
            message.success(`Instance de processus démarrée: ${response.instanceId}`);
        } catch (err) {
            message.error("Erreur lors du démarrage du processus: " + (err.response?.data || err.message));
        } finally {
            setStartingProcess(null);
        }
    };

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
        console.log("handleEditClick appelé avec ID:", bpmnId); // Debug
        setLoading(true);
        setSelectedBpmnId(bpmnId);
        setIsUpdateMode(true);
        
        BpmnModelService.getBpmnModel(bpmnId)
            .then(response => {
                console.log("Données BPMN reçues:", response.data); // Debug
                const bpmnData = response.data;
                setSharedData(prev => ({
                    ...prev,
                    loadedBpmnXml: bpmnData.bpmnXml,
                    loadedTaskConfigurations: bpmnData.taskConfigurations,
                    processData: {
                        ...prev.processData,
                        processName: bpmnData.name || "",
                        processDescription: bpmnData.description || "",
                        processTags: bpmnData.tags || [],
                        processId: bpmnId
                    }
                }));
                
                // Forcer la transition vers la vue d'édition
                setIsTransitioning(true);
                setTimeout(() => {
                    setShowList(false);
                    setActiveTabIndex(0); // Commencer par le premier onglet
                    setIsTransitioning(false);
                }, 300);
            })
            .catch(error => {
                console.error("Erreur lors du chargement du modèle BPMN:", error);
                message.error(t("Erreur lors du chargement du modèle BPMN"));
                setIsUpdateMode(false);
                setSelectedBpmnId(null);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    // Style pour le breadcrumb
    const breadcrumbStyle = {
        margin: '0 0 16px',
        padding: '8px 16px',
        borderRadius: '4px',
        backgroundColor: token.colorPrimaryBg,
    };

    const breadcrumbItemStyle = {
        color: token.colorPrimaryActive,
    };
    
    // Colonnes pour le tableau des processus déployés
    const processColumns = [
        {
            title: 'Clé',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Nom',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text || 'Non défini'
        },
        {
            title: 'Version',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: 'Statut',
            dataIndex: 'suspended',
            key: 'suspended',
            render: (suspended) => (
                suspended ? 
                <span style={{ color: 'red' }}><CloseCircleOutlined /> Suspendu</span> : 
                <span style={{ color: 'green' }}><CheckCircleOutlined /> Actif</span>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />} 
                    onClick={() => startProcessInstance(record.key)}
                    loading={startingProcess === record.key}
                    disabled={record.suspended}
                >
                    Démarrer
                </Button>
            )
        }
    ];

    return (
        <Main>
            <div className="p-4">
                <Breadcrumb style={breadcrumbStyle}>
                    <Breadcrumb.Item href="/" style={breadcrumbItemStyle}>
                        <HomeOutlined /> {t("welcome_dashboard")}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item style={breadcrumbItemStyle}>
                        <SettingOutlined /> {t("configuration_sidebar_title")}
                    </Breadcrumb.Item>
                </Breadcrumb>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                        <Spin size="large" tip="Chargement..." />
                    </div>
                ) : (
                    <div style={{
                        ...styles.transitionContainer,
                        ...(isTransitioning ? styles.fadeOut : {})
                    }}>
                        {showList ? (
                            <>
                                <Card
                                    title={`Processus (${bpmnItems.length})`}
                                    extra={
                                        <Button 
                                            type="primary" 
                                            icon={<PlusOutlined />} 
                                            onClick={handleAddClick}
                                        >
                                            Ajouter un nouveau processus
                                        </Button>
                                    }
                                    className="mb-4"
                                >
                                    {error ? (
                                        <Alert message={error} type="error" showIcon />
                                    ) : (
                                        <Table
                                            dataSource={(Array.isArray(bpmnItems) ? bpmnItems : []).map(item => ({
                                                ...item,
                                                key: item.id
                                            }))}
                                            columns={[
                                                {
                                                    title: 'Nom',
                                                    dataIndex: 'name',
                                                    key: 'name',
                                                },
                                                {
                                                    title: 'Actions',
                                                    key: 'actions',
                                                    render: (_, record) => (
                                                        <Button 
                                                            type="primary" 
                                                            icon={<EditOutlined />} 
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Empêcher la propagation du clic
                                                                handleEditClick(record.id);
                                                            }}
                                                        >
                                                            {t("Modifier")}
                                                        </Button>
                                                    )
                                                }
                                            ]}
                                            rowKey="id"
                                            pagination={{ pageSize: 10 }}
                                            onRow={(record) => ({
                                                onClick: () => {
                                                    console.log("Clic sur la ligne avec ID:", record.id);
                                                    handleEditClick(record.id);
                                                },
                                                style: { cursor: 'pointer' } // Ajouter un curseur pointer pour indiquer que la ligne est cliquable
                                            })}
                                        />
                                    )}
                                </Card>

                                <Card
                                    title="Processus déployés"
                                    extra={
                                        <Button 
                                            icon={<ReloadOutlined />} 
                                            onClick={fetchDeployedProcesses}
                                            loading={processesLoading}
                                        >
                                            Actualiser
                                        </Button>
                                    }
                                >
                                    <Spin spinning={processesLoading}>
                                        {deployedProcesses.length === 0 ? (
                                            <Alert 
                                                message="Aucun processus déployé" 
                                                type="info" 
                                                showIcon 
                                            />
                                        ) : (
                                            <Table 
                                                dataSource={deployedProcesses} 
                                                columns={processColumns}
                                                rowKey="id"
                                                pagination={{ pageSize: 10 }}
                                            />
                                        )}
                                    </Spin>
                                </Card>
                            </>
                        ) : (
                            <Card
                                title={t("configuration_sidebar_title")}
                                extra={
                                    <div>
                                        <Button 
                                            type="default" 
                                            disabled={activeTabIndex === 0}
                                            onClick={() => setActiveTabIndex(prev => prev - 1)}
                                            style={{ marginRight: 8 }}
                                        >
                                            Précédent
                                        </Button>
                                        <Button 
                                            type="primary" 
                                            disabled={activeTabIndex === tabItems.length - 1}
                                            onClick={async () => {
                                                // Si on passe de l'onglet Model à l'onglet Parametres
                                                if (activeTabIndex === 1) {
                                                    try {
                                                        // Récupérer le XML du modèle BPMN
                                                        const xml = await sharedData.modelerRef.current?.saveXML({ format: true });
                                                        
                                                        if (!xml || !xml.xml) {
                                                            message.error("Erreur lors de la récupération du modèle BPMN");
                                                            return;
                                                        }
                                                        
                                                        // Créer un blob et un FormData
                                                        const xmlBlob = new Blob([xml.xml], { type: "application/xml" });
                                                        const formData = new FormData();
                                                        formData.append("file", xmlBlob, "diagram.bpmn");
                                                        
                                                        // Envoyer le XML au serveur pour analyse
                                                        const processElements = await BpmnModelService.uploadBpmnModel(formData);
                                                        
                                                        // Stocker les éléments du processus dans le state partagé
                                                        setSharedData(prev => ({
                                                            ...prev,
                                                            processElements: processElements,
                                                        }));
                                                        
                                                        message.success("Modèle BPMN analysé avec succès");
                                                    } catch (error) {
                                                        console.error("Erreur lors de l'analyse du modèle BPMN:", error);
                                                        message.error("Erreur lors de l'analyse du modèle BPMN");
                                                        return;
                                                    }
                                                }
                                                
                                                // Passer à l'onglet suivant
                                                setActiveTabIndex(prev => prev + 1);
                                            }}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                }
                            >
                                <Tabs 
                                    activeKey={tabItems[activeTabIndex].id}
                                    onChange={(key) => {
                                        const index = tabItems.findIndex(item => item.id === key);
                                        if (index !== -1) setActiveTabIndex(index);
                                    }}
                                    items={tabItems.map(item => ({
                                        key: item.id,
                                        label: item.title,
                                        children: item.content
                                    }))} 
                                />
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </Main>
    );
};

export default Configuration;
