import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
    getAllFileSchemes,
    deleteFileScheme,
    updateFileScheme,
    createFileScheme,
} from "../../../api/FileSchemeApi.jsx";
import { showAlert } from "../../../components/SweetAlert.jsx";
import { useToast } from "../../../components/Toast";
import { 
    Card, 
    Button, 
    Modal, 
    Form, 
    Input, 
    Typography, 
    Space, 
    Spin, 
    Tooltip, 
    Divider,
    message,
    Tree,
    Dropdown,
    Empty,
    Row,
    Col,
    Descriptions,
    Tag,
    Menu,
    Select,
    Table,
    Breadcrumb,
    Layout,
    List,
    Avatar,
    Badge
} from 'antd';
import { 
    FolderOutlined, 
    FileOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined, 
    InfoCircleOutlined,
    ReloadOutlined,
    MoreOutlined,
    FolderOpenOutlined,
    EyeOutlined,
    FolderAddOutlined,
    FileAddOutlined,
    SearchOutlined,
    DownloadOutlined,
    HomeOutlined,
    FileTextOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    FileImageOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Sider, Content } = Layout;

const AssistanceClassement = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumb, setBreadcrumb] = useState([{ name: 'Racine', id: null }]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('folder'); // 'folder' ou 'document'
    const [formData, setFormData] = useState({
        label: "",
        description: "",
        type: "DOSSIER",
        colorSeries: "#1890ff",
        iconSeries: "folder"
    });
    const [editingItem, setEditingItem] = useState(null);
    const [searchText, setSearchText] = useState("");
    
    // Types de documents supportés
    const documentTypes = [
        { value: 'DOCUMENT', label: 'Document général', icon: <FileTextOutlined /> },
        { value: 'PDF', label: 'Document PDF', icon: <FilePdfOutlined /> },
        { value: 'WORD', label: 'Document Word', icon: <FileWordOutlined /> },
        { value: 'EXCEL', label: 'Tableur Excel', icon: <FileExcelOutlined /> },
        { value: 'POWERPOINT', label: 'Présentation PowerPoint', icon: <FilePptOutlined /> },
        { value: 'IMAGE', label: 'Image', icon: <FileImageOutlined /> }
    ];
    
    // Couleurs disponibles
    const colors = [
        '#1890ff', '#52c41a', '#fa8c16', '#f5222d', 
        '#722ed1', '#13c2c2', '#eb2f96', '#faad14'
    ];
    
    // Fonction pour transformer les données plates en structure arborescente
    const transformToTreeData = (flatData) => {
        const idMapping = flatData.reduce((acc, el) => {
            acc[el.id] = el;
            return acc;
        }, {});
        
        const root = [];
        
        flatData.forEach(el => {
            if (el.parentId && el.parentId !== 0) {
                const parent = idMapping[el.parentId];
                if (parent) {
                    if (!parent.children) parent.children = [];
                    parent.children.push(el);
                } else {
                    root.push(el);
                }
            } else {
                root.push(el);
            }
        });
        
        return root;
    };
    
    // Charger les données
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAllFileSchemes();
            if (response && response.data) {
                const treeData = transformToTreeData(response.data);
                setFiles(treeData);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des données", error);
            message.error("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };
    
    // Obtenir les éléments du dossier actuel
    const getCurrentItems = () => {
        if (!currentFolder) {
            return files.filter(item => 
                searchText === "" || 
                item.label.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        
        const folder = findItemById(files, currentFolder.id);
        return folder && folder.children ? 
            folder.children.filter(item => 
                searchText === "" || 
                item.label.toLowerCase().includes(searchText.toLowerCase())
            ) : [];
    };
    
    // Trouver un élément par ID
    const findItemById = (items, id) => {
        for (const item of items) {
            if (item.id === id) return item;
            if (item.children) {
                const found = findItemById(item.children, id);
                if (found) return found;
            }
        }
        return null;
    };
    
    // Navigation dans les dossiers
    const navigateToFolder = (folder) => {
        setCurrentFolder(folder);
        
        // Construire le breadcrumb
        const newBreadcrumb = [{ name: 'Racine', id: null }];
        if (folder) {
            // Ici vous pourriez construire le chemin complet si nécessaire
            newBreadcrumb.push({ name: folder.label, id: folder.id });
        }
        setBreadcrumb(newBreadcrumb);
    };
    
    // Navigation breadcrumb
    const navigateToBreadcrumb = (item) => {
        if (item.id === null) {
            setCurrentFolder(null);
            setBreadcrumb([{ name: 'Racine', id: null }]);
        } else {
            const folder = findItemById(files, item.id);
            navigateToFolder(folder);
        }
    };
    
    // Obtenir l'icône selon le type
    const getItemIcon = (item) => {
        if (item.type === 'DOSSIER' || item.iconSeries === 'folder') {
            return <FolderOutlined style={{ fontSize: '24px', color: item.colorSeries || '#1890ff' }} />;
        }
        
        const docType = documentTypes.find(type => type.value === item.type);
        return docType ? 
            React.cloneElement(docType.icon, { style: { fontSize: '24px', color: item.colorSeries || '#52c41a' } }) :
            <FileTextOutlined style={{ fontSize: '24px', color: item.colorSeries || '#52c41a' }} />;
    };
    
    // Ouvrir le modal pour créer un dossier
    const handleCreateFolder = () => {
        setModalType('folder');
        setEditingItem(null);
        setFormData({
            label: "",
            description: "",
            type: "DOSSIER",
            colorSeries: "#1890ff",
            iconSeries: "folder"
        });
        setShowModal(true);
    };
    
    // Ouvrir le modal pour créer un document
    const handleCreateDocument = () => {
        setModalType('document');
        setEditingItem(null);
        setFormData({
            label: "",
            description: "",
            type: "DOCUMENT",
            colorSeries: "#52c41a",
            iconSeries: "file"
        });
        setShowModal(true);
    };
    
    // Modifier un élément
    const handleEdit = (item) => {
        setModalType(item.type === 'DOSSIER' ? 'folder' : 'document');
        setEditingItem(item);
        setFormData({
            label: item.label,
            description: item.description,
            type: item.type,
            colorSeries: item.colorSeries,
            iconSeries: item.iconSeries
        });
        setShowModal(true);
    };
    
    // Supprimer un élément
    const handleDelete = (item) => {
        Modal.confirm({
            title: `Supprimer ${item.type === 'DOSSIER' ? 'le dossier' : 'le document'}`,
            content: `Êtes-vous sûr de vouloir supprimer "${item.label}" ?`,
            okText: "Supprimer",
            cancelText: "Annuler",
            okType: "danger",
            onOk: async () => {
                try {
                    setLoading(true);
                    const response = await deleteFileScheme(item.id);
                    if (response && response.success) {
                        message.success(`${item.type === 'DOSSIER' ? 'Dossier' : 'Document'} supprimé avec succès`);
                        await fetchData();
                        showToast({
                            title: "Succès",
                            message: `${item.type === 'DOSSIER' ? 'Dossier' : 'Document'} supprimé avec succès.`,
                            color: "green",
                            position: "topRight",
                        });
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression", error);
                    message.error("Erreur lors de la suppression");
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    
    // Soumettre le formulaire
    const handleSubmit = (values) => {
        setLoading(true);
        
        const apiData = {
            label: values.label,
            description: values.description,
            type: values.type,
            colorSeries: values.colorSeries,
            iconSeries: modalType === 'folder' ? 'folder' : 'file',
            parentId: currentFolder ? currentFolder.id : 0,
            planClassementId: null,
            typeDocumentId: modalType === 'document' ? 1 : null,
            workflowId: null
        };
        
        const isUpdate = editingItem && editingItem.id;
        const apiCall = isUpdate
            ? updateFileScheme(editingItem.id, apiData)
            : createFileScheme(apiData);
        
        apiCall.then(async (response) => {
            if (response && response.success) {
                message.success(isUpdate ? 
                    `${modalType === 'folder' ? 'Dossier' : 'Document'} mis à jour avec succès` : 
                    `${modalType === 'folder' ? 'Dossier' : 'Document'} créé avec succès`
                );
                
                await fetchData();
                setShowModal(false);
                setEditingItem(null);
            }
        }).catch(error => {
            console.error("Erreur lors de la soumission", error);
            message.error("Erreur lors de la soumission du formulaire");
        }).finally(() => {
            setLoading(false);
        });
    };
    
    // Menu d'actions pour chaque élément
    const getActionMenu = (item) => {
        const menuItems = [
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Modifier',
                onClick: () => handleEdit(item)
            },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Supprimer',
                danger: true,
                onClick: () => handleDelete(item)
            }
        ];

        if (item.type === 'DOSSIER') {
            menuItems.unshift({
                key: 'open',
                icon: <FolderOpenOutlined />,
                label: 'Ouvrir',
                onClick: () => navigateToFolder(item)
            });
        } else {
            menuItems.unshift({
                key: 'download',
                icon: <DownloadOutlined />,
                label: 'Télécharger',
                onClick: () => console.log('Télécharger', item)
            });
        }

        return <Menu items={menuItems} />;
    };
    
    const currentItems = getCurrentItems();
    
    return (
        <Spin spinning={loading} tip="Chargement...">
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                {/* En-tête */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '16px 24px', 
                    borderBottom: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                <FolderOpenOutlined style={{ marginRight: 8 }} />
                                Assistance au classement
                            </Title>
                        </Col>
                        <Col>
                            <Space>
                                <Button 
                                    type="primary" 
                                    icon={<FolderAddOutlined />}
                                    onClick={handleCreateFolder}
                                >
                                    Nouveau dossier
                                </Button>
                                <Button 
                                    type="default" 
                                    icon={<FileAddOutlined />}
                                    onClick={handleCreateDocument}
                                >
                                    Nouveau document
                                </Button>
                                <Button 
                                    icon={<ReloadOutlined />}
                                    onClick={fetchData}
                                >
                                    Rafraîchir
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>
                
                <Content style={{ padding: '24px' }}>
                    {/* Breadcrumb et recherche */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                        <Col>
                            <Breadcrumb>
                                <Breadcrumb.Item>
                                    <HomeOutlined />
                                </Breadcrumb.Item>
                                {breadcrumb.map((item, index) => (
                                    <Breadcrumb.Item 
                                        key={index}
                                        onClick={() => navigateToBreadcrumb(item)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {item.name}
                                    </Breadcrumb.Item>
                                ))}
                            </Breadcrumb>
                        </Col>
                        <Col>
                            <Input
                                placeholder="Rechercher..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                        </Col>
                    </Row>
                    
                    {/* Grille des éléments */}
                    <Card bodyStyle={{ padding: '16px' }}>
                        {currentItems.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {currentItems.map((item) => (
                                    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={item.id}>
                                        <Card
                                            hoverable
                                            style={{ 
                                                textAlign: 'center', 
                                                height: '200px',
                                                border: '1px solid #f0f0f0',
                                                transition: 'all 0.3s'
                                            }}
                                            bodyStyle={{ 
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                height: '100%'
                                            }}
                                            actions={[
                                                <Dropdown 
                                                    overlay={getActionMenu(item)} 
                                                    trigger={['click']}
                                                    key="actions"
                                                >
                                                    <Button 
                                                        type="text" 
                                                        icon={<MoreOutlined />}
                                                        size="small"
                                                    />
                                                </Dropdown>
                                            ]}
                                            onDoubleClick={() => {
                                                if (item.type === 'DOSSIER') {
                                                    navigateToFolder(item);
                                                }
                                            }}
                                        >
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div style={{ marginBottom: '12px' }}>
                                                    {getItemIcon(item)}
                                                </div>
                                                <Title level={5} style={{ margin: '8px 0 4px 0' }} ellipsis={{ rows: 2 }}>
                                                    {item.label}
                                                </Title>
                                                <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
                                                    {item.description}
                                                </Text>
                                                <div style={{ marginTop: '8px' }}>
                                                    <Tag 
                                                        color={item.type === 'DOSSIER' ? 'blue' : 'green'}
                                                        size="small"
                                                    >
                                                        {item.type === 'DOSSIER' ? 'Dossier' : 'Document'}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Empty 
                                description={
                                    searchText ? 
                                    `Aucun résultat pour "${searchText}"` : 
                                    currentFolder ? 
                                    "Ce dossier est vide" : 
                                    "Aucun élément trouvé"
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            >
                                <Space>
                                    <Button 
                                        type="primary" 
                                        icon={<FolderAddOutlined />}
                                        onClick={handleCreateFolder}
                                    >
                                        Créer un dossier
                                    </Button>
                                    <Button 
                                        icon={<FileAddOutlined />}
                                        onClick={handleCreateDocument}
                                    >
                                        Créer un document
                                    </Button>
                                </Space>
                            </Empty>
                        )}
                    </Card>
                </Content>
            </Layout>
            
            {/* Modal de création/modification */}
            <Modal
                title={
                    <Space>
                        {modalType === 'folder' ? <FolderOutlined /> : <FileAddOutlined />}
                        {editingItem ? 
                            `Modifier ${modalType === 'folder' ? 'le dossier' : 'le document'}` : 
                            `Créer ${modalType === 'folder' ? 'un nouveau dossier' : 'un nouveau document'}`
                        }
                    </Space>
                }
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                destroyOnClose={true}
                width={600}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={formData}
                    name="itemForm"
                >
                    <Form.Item 
                        name="label" 
                        label="Nom" 
                        rules={[
                            { required: true, message: 'Veuillez saisir un nom' },
                            { min: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                        ]}
                    >
                        <Input 
                            placeholder={`Nom du ${modalType === 'folder' ? 'dossier' : 'document'}`}
                            prefix={modalType === 'folder' ? <FolderOutlined /> : <FileTextOutlined />}
                        />
                    </Form.Item>
                    
                    <Form.Item 
                        name="description" 
                        label="Description" 
                        rules={[
                            { required: true, message: 'Veuillez saisir une description' }
                        ]}
                    >
                        <TextArea 
                            rows={3} 
                            placeholder="Description détaillée" 
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>
                    
                    {modalType === 'document' && (
                        <Form.Item 
                            name="type" 
                            label="Type de document" 
                            rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                        >
                            <Select placeholder="Sélectionnez le type de document">
                                {documentTypes.map(type => (
                                    <Option key={type.value} value={type.value}>
                                        <Space>
                                            {type.icon}
                                            {type.label}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    
                    <Form.Item 
                        name="colorSeries" 
                        label="Couleur" 
                    >
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {colors.map(color => (
                                <div
                                    key={color}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: color,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: formData.colorSeries === color ? '3px solid #000' : '1px solid #d9d9d9'
                                    }}
                                    onClick={() => setFormData(prev => ({ ...prev, colorSeries: color }))}
                                />
                            ))}
                        </div>
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                        <Row justify="end" gutter={8}>
                            <Col>
                                <Button onClick={() => setShowModal(false)}>
                                    Annuler
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    icon={editingItem ? <EditOutlined /> : <PlusOutlined />}
                                >
                                    {editingItem ? 'Mettre à jour' : 'Créer'}
                                </Button>
                            </Col>
                        </Row>
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    );
};

export default AssistanceClassement;