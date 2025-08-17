import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Switch,
    Select,
    Space,
    Popconfirm,
    message,
    Tag,
    Card,
    Row,
    Col,
    Tooltip,
    InputNumber
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FileOutlined,
    ReloadOutlined,
    SettingOutlined
} from '@ant-design/icons';
import DocumentTypeService from '../../../services/DocumentTypeService';

const { Option } = Select;
const { Search } = Input;

const DocumentType = () => {
    const [documentTypes, setDocumentTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDocumentType, setEditingDocumentType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [form] = Form.useForm();

    // Options d'icônes prédéfinies
    const iconOptions = [
        { value: 'file', label: 'Document générique', icon: '📄' },
        { value: 'file-pdf', label: 'PDF', icon: '📑' },
        { value: 'file-word', label: 'Word', icon: '📝' },
        { value: 'file-excel', label: 'Excel', icon: '📊' },
        { value: 'file-ppt', label: 'PowerPoint', icon: '📊' },
        { value: 'file-image', label: 'Image', icon: '🖼️' },
        { value: 'file-zip', label: 'Archive', icon: '🗜️' },
        { value: 'file-text', label: 'Texte', icon: '📝' },
        { value: 'file-code', label: 'Code', icon: '💻' },
        { value: 'file-video', label: 'Vidéo', icon: '🎬' },
        { value: 'file-audio', label: 'Audio', icon: '🎵' }
    ];

    // Options de couleurs prédéfinies
    const colorOptions = [
        '#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', 
        '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#1677ff'
    ];

    useEffect(() => {
        loadDocumentTypes();
    }, [showInactive]);

    const loadDocumentTypes = async () => {
        setLoading(true);
        try {
            const response = showInactive 
                ? await DocumentTypeService.getAllDocumentTypes()
                : await DocumentTypeService.getAllActiveDocumentTypes();
            
            if (response.success) {
                setDocumentTypes(response.data || []);
            } else {
                message.error('Erreur lors du chargement des types de documents');
            }
        } catch (error) {
            console.error('Erreur:', error);
            message.error('Erreur lors du chargement des types de documents');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (value) => {
        if (value.trim()) {
            setLoading(true);
            try {
                const response = await DocumentTypeService.searchDocumentTypes(value);
                if (response.success) {
                    setDocumentTypes(response.data || []);
                } else {
                    message.error('Erreur lors de la recherche');
                }
            } catch (error) {
                console.error('Erreur:', error);
                message.error('Erreur lors de la recherche');
            } finally {
                setLoading(false);
            }
        } else {
            loadDocumentTypes();
        }
    };

    const showModal = (documentType = null) => {
        setEditingDocumentType(documentType);
        setModalVisible(true);
        
        if (documentType) {
            form.setFieldsValue({
                ...documentType,
                isActive: documentType.isActive !== undefined ? documentType.isActive : true
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                isActive: true,
                icon: 'file',
                color: '#1890ff',
                sortOrder: 0
            });
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingDocumentType(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const response = editingDocumentType
                ? await DocumentTypeService.updateDocumentType(editingDocumentType.id, values)
                : await DocumentTypeService.createDocumentType(values);

            if (response.success) {
                message.success(
                    editingDocumentType 
                        ? 'Type de document mis à jour avec succès' 
                        : 'Type de document créé avec succès'
                );
                handleCancel();
                loadDocumentTypes();
            } else {
                message.error(response.message || 'Erreur lors de l\'opération');
            }
        } catch (error) {
            console.error('Erreur:', error);
            message.error(
                error.response?.data?.message || 
                'Erreur lors de l\'opération'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const response = await DocumentTypeService.deleteDocumentType(id);
            if (response.success) {
                message.success('Type de document supprimé avec succès');
                loadDocumentTypes();
            } else {
                message.error(response.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            message.error('Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        setLoading(true);
        try {
            const response = await DocumentTypeService.toggleDocumentTypeStatus(id, !currentStatus);
            if (response.success) {
                message.success('Statut mis à jour avec succès');
                loadDocumentTypes();
            } else {
                message.error(response.message || 'Erreur lors de la mise à jour du statut');
            }
        } catch (error) {
            console.error('Erreur:', error);
            message.error('Erreur lors de la mise à jour du statut');
        } finally {
            setLoading(false);
        }
    };

    const initializeDefaults = async () => {
        setLoading(true);
        try {
            const response = await DocumentTypeService.initializeDefaultDocumentTypes();
            if (response.success) {
                message.success('Types de documents par défaut initialisés');
                loadDocumentTypes();
            } else {
                message.error(response.message || 'Erreur lors de l\'initialisation');
            }
        } catch (error) {
            console.error('Erreur:', error);
            message.error('Erreur lors de l\'initialisation');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <span style={{ fontSize: '16px' }}>
                        {getIconEmoji(record.icon)}
                    </span>
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Couleur',
            dataIndex: 'color',
            key: 'color',
            render: (color) => (
                <div style={{
                    width: 20,
                    height: 20,
                    backgroundColor: color,
                    border: '1px solid #d9d9d9',
                    borderRadius: 4
                }} />
            ),
        },
        {
            title: 'Extension',
            dataIndex: 'fileExtension',
            key: 'fileExtension',
            render: (ext) => ext ? <Tag>{ext}</Tag> : '-',
        },
        {
            title: 'Ordre',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
        },
        {
            title: 'Statut',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleStatus(record.id, isActive)}
                    checkedChildren="Actif"
                    unCheckedChildren="Inactif"
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Modifier">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer ce type de document ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Tooltip title="Supprimer">
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const getIconEmoji = (iconName) => {
        const iconMap = {
            'file': '📄',
            'file-pdf': '📑',
            'file-word': '📝',
            'file-excel': '📊',
            'file-ppt': '📊',
            'file-image': '🖼️',
            'file-zip': '🗜️',
            'file-text': '📝',
            'file-code': '💻',
            'file-video': '🎬',
            'file-audio': '🎵'
        };
        return iconMap[iconName] || '📄';
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col flex="auto">
                        <Search
                            placeholder="Rechercher des types de documents..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            onChange={(e) => {
                                if (!e.target.value) {
                                    loadDocumentTypes();
                                }
                            }}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Switch
                                checked={showInactive}
                                onChange={setShowInactive}
                                checkedChildren="Tous"
                                unCheckedChildren="Actifs"
                            />
                            <Button
                                type="default"
                                icon={<ReloadOutlined />}
                                onClick={loadDocumentTypes}
                            >
                                Actualiser
                            </Button>
                            <Button
                                type="default"
                                icon={<SettingOutlined />}
                                onClick={initializeDefaults}
                            >
                                Types par défaut
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                            >
                                Nouveau type
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={documentTypes}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} sur ${total} éléments`,
                    }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <FileOutlined />
                        {editingDocumentType ? 'Modifier le type de document' : 'Nouveau type de document'}
                    </Space>
                }
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                width={600}
                confirmLoading={loading}
                okText={editingDocumentType ? 'Mettre à jour' : 'Créer'}
                cancelText="Annuler"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        isActive: true,
                        icon: 'file',
                        color: '#1890ff',
                        sortOrder: 0
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="name"
                                label="Nom"
                                rules={[
                                    { required: true, message: 'Le nom est obligatoire' },
                                    { max: 100, message: 'Le nom ne peut dépasser 100 caractères' }
                                ]}
                            >
                                <Input placeholder="Nom du type de document" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="code"
                                label="Code"
                                rules={[
                                    { required: true, message: 'Le code est obligatoire' },
                                    { pattern: /^[A-Z0-9_]+$/, message: 'Le code ne peut contenir que des lettres majuscules, chiffres et underscores' }
                                ]}
                            >
                                <Input placeholder="CODE_DOCUMENT" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { max: 255, message: 'La description ne peut dépasser 255 caractères' }
                        ]}
                    >
                        <Input.TextArea
                            placeholder="Description du type de document"
                            rows={3}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="icon"
                                label="Icône"
                            >
                                <Select placeholder="Sélectionner une icône">
                                    {iconOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            <Space>
                                                <span>{option.icon}</span>
                                                <span>{option.label}</span>
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="color"
                                label="Couleur"
                            >
                                <Select placeholder="Sélectionner une couleur">
                                    {colorOptions.map(color => (
                                        <Option key={color} value={color}>
                                            <Space>
                                                <div style={{
                                                    width: 16,
                                                    height: 16,
                                                    backgroundColor: color,
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 2
                                                }} />
                                                <span>{color}</span>
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item
                                name="sortOrder"
                                label="Ordre de tri"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="fileExtension"
                                label="Extension de fichier"
                                rules={[
                                    { max: 10, message: 'L\'extension ne peut dépasser 10 caractères' }
                                ]}
                            >
                                <Input placeholder=".pdf, .docx, etc." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="mimeType"
                                label="Type MIME"
                                rules={[
                                    { max: 100, message: 'Le type MIME ne peut dépasser 100 caractères' }
                                ]}
                            >
                                <Input placeholder="application/pdf, etc." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="isActive"
                        label="Statut"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Actif"
                            unCheckedChildren="Inactif"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DocumentType;
