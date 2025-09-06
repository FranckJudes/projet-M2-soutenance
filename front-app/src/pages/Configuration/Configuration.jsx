import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import Main from "../../layout/Main";
import { Card, Button, Table, Spin, Tabs, message, Alert, Breadcrumb, theme, Input, Select, Space, Drawer, Carousel, Modal } from 'antd';
import { PlusOutlined, EditOutlined, PlayCircleOutlined, ReloadOutlined, HomeOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import Acteur from "./Tabs/Acteur";
import General from "./Tabs/General";
import Parametres from "./Tabs/Parametres";
import Model from "./Tabs/Model";
import Taches from "./Tabs/Taches";
import { styles } from "../../utils/styles";
import BpmnModelService from "../../services/BpmnModelService";
import ProcessEngineService from "../../services/ProcessEngineService";

const API_URL = import.meta.env.VITE_BASE_SERVICE_HARMONI;

const Configuration = () => {
    const { t } = useTranslation();
    const [showList, setShowList] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [deployedProcesses, setDeployedProcesses] = useState([]);
    const [myProcessInstances, setMyProcessInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processesLoading, setProcessesLoading] = useState(false);
    const [instancesLoading, setInstancesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBpmnId, setSelectedBpmnId] = useState(null);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [startingProcess, setStartingProcess] = useState(null);
    const [deletingProcess, setDeletingProcess] = useState(null);
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
    
    // États pour le drawer (sidebar)
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    
    // États pour le filtrage et la recherche
    const [processSearchText, setProcessSearchText] = useState('');
    const [processStatusFilter, setProcessStatusFilter] = useState('all');
    const [processSortField, setProcessSortField] = useState('name');
    const [processSortOrder, setProcessSortOrder] = useState('asc');
    
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
       

        setSharedData(prev => {
            const newSharedData = {
                ...prev,
                processData: {
                    ...prev.processData,
                    ...processData
                }
            };
            return newSharedData;
        });

    };

    const handleSaveSuccess = (data) => {
        fetchDeployedProcesses();
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


    const fetchDeployedProcesses = async () => {
        try {
            setProcessesLoading(true);
            const response = await BpmnModelService.getMyDeployedProcesses();
            setDeployedProcesses(response.data);
            setError(null);
        } catch (err) {
            setError("Failed to load deployed processes. Please try again later.");
        } finally {
            setProcessesLoading(false);
            setLoading(false); // Set main loading to false after processes are loaded
        }
    };
    
    const fetchMyProcessInstances = async () => {
        try {
            setInstancesLoading(true);
            const response = await BpmnModelService.getMyProcessInstances();
            setMyProcessInstances(response.data);
            setError(null);
        } catch (err) {
            setError("Failed to load process instances. Please try again later.");
        } finally {
            setInstancesLoading(false);
        }
    };

    useEffect(() => {
        fetchDeployedProcesses();
        fetchMyProcessInstances();
    }, []);
    
    const startProcessInstance = async (processDefinitionKey) => {
        try {
            setStartingProcess(processDefinitionKey);
            const response = await ProcessEngineService.startProcess(processDefinitionKey);
            message.success(`Instance du processus ${processDefinitionKey} démarrée avec succès`);
            fetchMyProcessInstances();
        } catch (error) {
            message.error(`Erreur lors du démarrage: ${error.response?.data?.message || error.message}`);
        } finally {
            setStartingProcess(null);
        }
    };

    // Fonction pour supprimer un processus
    const deleteProcess = async (processId) => {
        if (!processId) return;
        
        try {
            setDeletingProcess(processId);
            // Appel à l'API pour supprimer le processus
            await ProcessEngineService.deleteProcess(processId);
            message.success('Processus supprimé avec succès');
            
            // Fermer le drawer et recharger la liste des processus
            setDrawerVisible(false);
            setSelectedProcess(null);
            fetchDeployedProcesses();
        } catch (error) {
            message.error(`Erreur lors de la suppression: ${error.response?.data?.message || error.message}`);
        } finally {
            setDeletingProcess(null);
            setDeleteConfirmVisible(false);
        }
    };

    // Afficher la confirmation de suppression
    const showDeleteConfirm = () => {
        setDeleteConfirmVisible(true);
    };

    // Fonctions pour la sidebar
    const showDrawer = (process) => {
        setSelectedProcess(process);
        setDrawerVisible(true);
    };
    
    const closeDrawer = () => {
        setDrawerVisible(false);
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
    
    const handleEditBpmn = (bpmnId) => {
        setLoading(true);
        setSelectedBpmnId(bpmnId);
        setIsUpdateMode(true);
        
        BpmnModelService.getBpmnModel(bpmnId)
            .then(response => {
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
            title: 'N°',
            key: 'index',
            render: (text, record, index) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {index + 1}
                </span>
            ),
            width: '5%'
        },
        {
            title: 'Nom du processus',
            dataIndex: 'processName',
            key: 'processName',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {text || record.processDefinitionKey || 'Non défini'}
                    </div>
                  
                </div>
            ),
            width: '22%'
        },
        {
            title: 'Description',
            dataIndex: 'processDescription',
            key: 'processDescription',
            render: (text) => (
                <div style={{ maxWidth: '180px' }}>
                    {text ? (
                        <span title={text}>
                            {text.length > 45 ? `${text.substring(0, 45)}...` : text}
                        </span>
                    ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>Pas de description</span>
                    )}
                </div>
            ),
            width: '18%'
        },
        {
            title: 'Date de création',
            key: 'deployment',
            render: (_, record) => (
                <div>
                    {/* <div style={{ fontSize: '12px' }}>
                        Version: {record.version || record.camundaVersion || 'N/A'}
                    </div> */}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.deployedAt ? new Date(record.deployedAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </div>
                </div>
            ),
            width: '13%'
        },
        {
            title: 'Instances',
            key: 'instances',
            render: (_, record) => (
                <div>
                    <div style={{ fontSize: '12px' }}>
                        Actives: <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                            {record.activeInstanceCount || 0}
                        </span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                        Total: <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                            {record.instanceCount || 0}
                        </span>
                    </div>
                </div>
            ),
            width: '10%'
        },
        {
            title: 'Statut',
            dataIndex: 'suspended',
            key: 'suspended',
            render: (suspended, record) => (
                <div>
                    {suspended ? 
                        <span style={{ color: 'red' }}><CloseCircleOutlined /> Suspendu</span> : 
                        <span style={{ color: 'green' }}><CheckCircleOutlined /> Actif</span>
                    }
                    {record.isActive === false && (
                        <div style={{ fontSize: '11px', color: '#ff7875' }}>
                            (Inactif en base)
                        </div>
                    )}
                </div>
            ),
            width: '12%'
        },
        {
            title: 'Mots-clés',
            dataIndex: 'processTags',
            key: 'processTags',
            render: (tags) => (
                <div style={{ maxWidth: '100px' }}>
                    {tags && tags.length > 0 ? (
                        <div>
                            {tags.slice(0, 2).map((tag, index) => (
                                <span 
                                    key={index}
                                    style={{
                                        display: 'inline-block',
                                        background: '#f0f0f0',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        margin: '1px',
                                        maxWidth: '50px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title={tag}
                                >
                                    {tag}
                                </span>
                            ))}
                            {tags.length > 2 && (
                                <span style={{ fontSize: '11px', color: '#666' }}>
                                    +{tags.length - 2}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span style={{ color: '#999', fontStyle: 'italic', fontSize: '11px' }}>
                            Aucun
                        </span>
                    )}
                </div>
            ),
            width: '10%'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />} 
                        onClick={() => startProcessInstance(record.processDefinitionKey)}
                        loading={startingProcess === record.processDefinitionKey}
                        disabled={record.suspended}
                        size="small"
                    >
                        Démarrer
                    </Button>
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditBpmn(record.id)}
                        size="small"
                        type="default"
                    >
                        Modifier
                    </Button>
                </div>
            ),
            width: '10%'
        }
    ];

    // Fonction pour filtrer les processus déployés
    const filteredProcesses = () => {
        let filtered = deployedProcesses;

        // Filtrer par statut
        if (processStatusFilter !== 'all') {
            filtered = filtered.filter(process => process.suspended === (processStatusFilter === 'suspended'));
        }

        // Filtrer par recherche
        if (processSearchText) {
            filtered = filtered.filter(process =>
                (process.processName || '').toLowerCase().includes(processSearchText.toLowerCase()) ||
                (process.processDescription || '').toLowerCase().includes(processSearchText.toLowerCase()) ||
                (process.processDefinitionKey || '').toLowerCase().includes(processSearchText.toLowerCase())
            );
        }

        // Trier les processus
        if (processSortField && processSortOrder) {
            filtered.sort((a, b) => {
                if (processSortField === 'name') {
                    const nameA = a.name || a.processDefinitionKey || '';
                    const nameB = b.name || b.processDefinitionKey || '';
                    return processSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                } else if (processSortField === 'instances') {
                    return processSortOrder === 'asc' ? (a.instanceCount || 0) - (b.instanceCount || 0) : (b.instanceCount || 0) - (a.instanceCount || 0);
                } else if (processSortField === 'deployment') {
                    const dateA = a.deployedAt ? new Date(a.deployedAt) : new Date(0);
                    const dateB = b.deployedAt ? new Date(b.deployedAt) : new Date(0);
                    return processSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                }
                return 0;
            });
        }

        return filtered;
    };

    return (
        <Main>
            <div className="p-4">
                <Breadcrumb style={breadcrumbStyle}>
                    <Breadcrumb.Item href="/dashboard" style={breadcrumbItemStyle}>
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
                                    title={`Processus déployés (${deployedProcesses.length})`}
                                    extra={
                                        <Space>
                                            <Button 
                                                type="primary" 
                                                icon={<PlusOutlined />} 
                                                onClick={handleAddClick}
                                            >
                                                Ajouter un nouveau processus
                                            </Button>
                                            <Input 
                                                placeholder="Rechercher un processus" 
                                                value={processSearchText} 
                                                onChange={(e) => setProcessSearchText(e.target.value)} 
                                                style={{ width: '200px' }}
                                            />
                                            <Select 
                                                value={processStatusFilter} 
                                                onChange={(value) => setProcessStatusFilter(value)} 
                                                style={{ width: '150px' }}
                                            >
                                                <Select.Option value="all">Tous les statuts</Select.Option>
                                                <Select.Option value="suspended">Suspendus</Select.Option>
                                                <Select.Option value="active">Actifs</Select.Option>
                                            </Select>
                                            <Select 
                                                value={processSortField} 
                                                onChange={(value) => setProcessSortField(value)} 
                                                style={{ width: '150px' }}
                                            >
                                                <Select.Option value="name">Nom</Select.Option>
                                                <Select.Option value="instances">Instances</Select.Option>
                                                <Select.Option value="deployment">Déploiement</Select.Option>
                                            </Select>
                                            <Select 
                                                value={processSortOrder} 
                                                onChange={(value) => setProcessSortOrder(value)} 
                                                style={{ width: '100px' }}
                                            >
                                                <Select.Option value="asc">Croissant</Select.Option>
                                                <Select.Option value="desc">Décroissant</Select.Option>
                                            </Select>
                                            <Button 
                                                icon={<ReloadOutlined />} 
                                                onClick={fetchDeployedProcesses}
                                                loading={processesLoading}
                                            >
                                                Actualiser
                                            </Button>
                                        </Space>
                                    }
                                    className="mb-4"
                                >
                                    {error ? (
                                        <Alert message={error} type="error" showIcon />
                                    ) : (
                                        <Spin spinning={processesLoading}>
                                            {filteredProcesses().length === 0 ? (
                                                <Alert 
                                                    message="Aucun processus déployé" 
                                                    type="info" 
                                                    showIcon 
                                                />
                                            ) : (
                                                <Table 
                                                    dataSource={filteredProcesses()} 
                                                    columns={processColumns}
                                                    rowKey="id"
                                                    pagination={{ pageSize: 10 }}
                                                    onRow={(record) => ({
                                                        onClick: () => showDrawer(record),
                                                        style: { cursor: 'pointer' }
                                                    })}
                                                />
                                            )}
                                        </Spin>
                                    )}
                                </Card>
                                
                                {/* Drawer pour afficher les détails du processus sélectionné */}
                                <Drawer
                                    title={
                                        <Space>
                                            <SettingOutlined />
                                            {selectedProcess ? 
                                                <span style={{ fontWeight: 500 }}>{selectedProcess.processName || selectedProcess.processDefinitionKey}</span> : 
                                                "Détails du processus"
                                            }
                                        </Space>
                                    }
                                    placement="right"
                                    closable={true}
                                    onClose={closeDrawer}
                                    open={drawerVisible}
                                    width={520}
                                    headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
                                    bodyStyle={{ padding: '24px', overflowY: 'auto' }}
                                    footer={
                                        selectedProcess && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                                <div>
                                                    <Button 
                                                        type="primary" 
                                                        icon={<PlayCircleOutlined />} 
                                                        onClick={() => startProcessInstance(selectedProcess.processDefinitionKey)}
                                                        loading={startingProcess === selectedProcess.processDefinitionKey}
                                                        disabled={selectedProcess.suspended}
                                                        size="middle"
                                                    >
                                                        Démarrer une instance
                                                    </Button>
                                                </div>
                                                <div>
                                                    <Button 
                                                        icon={<EditOutlined />} 
                                                        onClick={() => handleEditBpmn(selectedProcess.id)}
                                                        size="middle"
                                                        style={{ marginRight: '8px' }}
                                                    >
                                                        Modifier
                                                    </Button>
                                                    <Button 
                                                        danger
                                                        icon={<DeleteOutlined />} 
                                                        onClick={showDeleteConfirm}
                                                        loading={deletingProcess === selectedProcess.id}
                                                        size="middle"
                                                    >
                                                        Supprimer
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    }
                                >
                                    {selectedProcess && (
                                        <div>
                                            {/* Statut du processus */}
                                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    {selectedProcess.suspended ? (
                                                        <Alert
                                                            message="Processus suspendu"
                                                            type="warning"
                                                            showIcon
                                                            icon={<CloseCircleOutlined />}
                                                            style={{ width: '100%' }}
                                                        />
                                                    ) : (
                                                        <Alert
                                                            message="Processus actif"
                                                            type="success"
                                                            showIcon
                                                            icon={<CheckCircleOutlined />}
                                                            style={{ width: '100%' }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Images en carousel */}
                                            {selectedProcess.images && selectedProcess.images.length > 0 && (
                                                <div style={{ marginBottom: '24px' }}>
                                                    <Carousel autoplay style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                                        {selectedProcess.images.map((image, index) => (
                                                            <div key={index}>
                                                                <img
                                                                    src={
                                                                        image?.url
                                                                            ? `${API_URL}${image.url}`
                                                                            : (image?.base64
                                                                                ? `data:${image.contentType || 'image/*'};base64,${image.base64}`
                                                                                : (image?.filePath
                                                                                    ? `${API_URL}/api/process-engine/files/${encodeURIComponent(image.filePath)}`
                                                                                    : 'default-image-path'))
                                                                    }
                                                                    alt={image.description || 'Process image'}
                                                                    style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </Carousel>
                                                </div>
                                            )}

                                            {/* Informations générales */}
                                            <Card 
                                                title={<Space><InfoCircleOutlined /> Informations générales</Space>}
                                                size="small"
                                                style={{ marginBottom: '16px' }}
                                                bordered={false}
                                                headStyle={{ padding: '0 0 12px 0' }}
                                                bodyStyle={{ padding: '0' }}
                                            >
                                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '12px' }}>
                                                    <div style={{ color: '#8c8c8c' }}>Nom:</div>
                                                    <div style={{ fontWeight: 500 }}>{selectedProcess.processName || "Non défini"}</div>
                                                    
                                                    <div style={{ color: '#8c8c8c' }}>Description:</div>
                                                    <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{selectedProcess.processDescription || "Pas de description"}</div>
                                                    
                                                    <div style={{ color: '#8c8c8c' }}>Version:</div>
                                                    <div>{selectedProcess.version || selectedProcess.camundaVersion || "N/A"}</div>
                                                    
                                                    <div style={{ color: '#8c8c8c' }}>Créé le:</div>
                                                    <div>{selectedProcess.deployedAt ? new Date(selectedProcess.deployedAt).toLocaleDateString('fr-FR') : "Date inconnue"}</div>
                                                </div>
                                            </Card>

                                            {/* Statistiques */}
                                            <Card 
                                                title={<Space><PlayCircleOutlined /> Instances</Space>}
                                                size="small"
                                                style={{ marginBottom: '16px' }}
                                                bordered={false}
                                                headStyle={{ padding: '0 0 12px 0' }}
                                                bodyStyle={{ padding: '0' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                                                            {selectedProcess.activeInstanceCount || 0}
                                                        </div>
                                                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Instances actives</div>
                                                    </div>
                                                    <div style={{ width: '16px' }}></div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                                                            {selectedProcess.instanceCount || 0}
                                                        </div>
                                                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Total des instances</div>
                                                    </div>
                                                </div>
                                            </Card>
                                            
                                            {/* Mots-clés */}
                                            {selectedProcess.tags && selectedProcess.tags.length > 0 && (
                                                <Card 
                                                    title="Mots-clés"
                                                    size="small"
                                                    style={{ marginBottom: '16px' }}
                                                    bordered={false}
                                                    headStyle={{ padding: '0 0 12px 0' }}
                                                    bodyStyle={{ padding: '0' }}
                                                >
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                        {selectedProcess.tags.map((tag, index) => (
                                                            <span 
                                                                key={index}
                                                                style={{
                                                                    background: token.colorPrimaryBg,
                                                                    color: token.colorPrimary,
                                                                    padding: '4px 10px',
                                                                    borderRadius: '16px',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </Card>
                                            )}
                                            
                                            {/* Message si pas d'images */}
                                            {(!selectedProcess.images || selectedProcess.images.length === 0) && (
                                                <Alert
                                                    message="Information"
                                                    description="Aucune image disponible pour ce processus."
                                                    type="info"
                                                    showIcon
                                                    style={{ marginTop: '16px' }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </Drawer>
                                
                                {/* Modal de confirmation de suppression */}
                                <Modal
                                    title="Confirmer la suppression"
                                    open={deleteConfirmVisible}
                                    onOk={() => deleteProcess(selectedProcess?.id)}
                                    onCancel={() => setDeleteConfirmVisible(false)}
                                    okText="Supprimer"
                                    cancelText="Annuler"
                                    okButtonProps={{ danger: true, loading: deletingProcess === selectedProcess?.id }}
                                >
                                    <p>Êtes-vous sûr de vouloir supprimer ce processus ?</p>
                                    {selectedProcess && (
                                        <p>
                                            <strong>Nom:</strong> {selectedProcess.processName || selectedProcess.processDefinitionKey}
                                            <br />
                                            <strong>Version:</strong> {selectedProcess.version || selectedProcess.camundaVersion || "N/A"}
                                        </p>
                                    )}
                                    <Alert
                                        message="Attention"
                                        description="Cette action est irréversible. Toutes les données associées à ce processus seront supprimées."
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: '16px' }}
                                    />
                                </Modal>
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
                                                // Si on est sur l'onglet General, sauvegarder les données
                                                if (activeTabIndex === 0) {
                                                    if (sharedData.saveGeneralData) {
                                                        const success = sharedData.saveGeneralData();
                                                        if (!success) {
                                                            message.error("Veuillez remplir tous les champs obligatoires");
                                                            return;
                                                        }
                                                    }
                                                }
                                                
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
