import React, { useState, useEffect } from "react";
import Main from "../../layout/Main";
import "../../styles/settings.css";
import DefaultPasswordService from "../../services/DefaultPasswordService";
import moment from 'moment';
import {
  Layout,
  Menu,
  Card,
  Input,
  Button,
  Switch,
  InputNumber,
  Checkbox,
  Tag,
  Divider,
  Row,
  Col,
  Alert,
  Space,
  Typography,
  Tooltip,
  Table,
  Form,
  message,
  Select,
  TimePicker,
  Tabs,
  Radio
} from 'antd';
import {
  SettingOutlined,
  SearchOutlined,
  SaveOutlined,
  CloseOutlined,
  KeyOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  MailOutlined,
  CloudOutlined,
  LockOutlined
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function Settings() {
    const [activeSection, setActiveSection] = useState("passwords");
    const [searchQuery, setSearchQuery] = useState("");

    const settingsSections = [
        {
            key: "passwords",
            icon: <KeyOutlined />,
            label: "Gestion des mots de passe par défaut",
            description: "Créer et gérer les mots de passe par défaut",
            component: <PasswordManagement />
        },
        {
            key: "backup",
            icon: <SaveOutlined />,
            label: "Gestion des sauvegardes",
            description: "Configurer les sauvegardes et restaurations",
            component: <BackupManagement />
        }
    ];

    const filteredSections = settingsSections.filter(section =>
        section.label.toLowerCase().includes(searchQuery.toLowerCase())
        //  || section.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function PasswordManagement() {
        const [form] = Form.useForm();
        const [passwords, setPasswords] = useState([]);
        const [loading, setLoading] = useState(false);
        const [editingKey, setEditingKey] = useState('');
        
        useEffect(() => {
            fetchPasswords();
        }, []);
        
        const fetchPasswords = async () => {
            setLoading(true);
            try {
                const response = await DefaultPasswordService.getAllDefaultPasswords();
                setPasswords(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des mots de passe:', error);
                message.error('Impossible de charger les mots de passe');
            } finally {
                setLoading(false);
            }
        };
        
        const handleAdd = async (values) => {
            try {
                await DefaultPasswordService.createDefaultPassword(values);
                fetchPasswords(); // Refresh the list after adding
                message.success('Mot de passe ajouté avec succès');
                form.resetFields();
            } catch (error) {
                console.error('Erreur lors de l\'ajout du mot de passe:', error);
                message.error('Impossible d\'ajouter le mot de passe');
            }
        };
        
        const handleDelete = async (id) => {
            try {
                await DefaultPasswordService.deleteDefaultPassword(id);
                fetchPasswords(); // Refresh the list after deletion
                message.success('Mot de passe supprimé avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression du mot de passe:', error);
                message.error('Impossible de supprimer le mot de passe');
            }
        };
        
        const columns = [
            {
                title: 'Index',
                dataIndex: 'id',
                key: 'id',
                width: '10%',
            },
            {
                title: 'Libellé',
                dataIndex: 'libelle',
                key: 'libelle',
                width: '30%',
            },
            {
                title: 'Valeur',
                dataIndex: 'valeur',
                key: 'valeur',
                width: '30%',
                render: (text) => {
                    return <Input.Password value={text} readOnly />
                }
            },
            {
                title: 'Date de création',
                dataIndex: 'dateCreation',
                key: 'dateCreation',
                width: '20%',
            },
            {
                title: 'Actions',
                key: 'action',
                width: '10%',
                render: (_, record) => (
                    <Space size="middle">
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Space>
                ),
            },
        ];
        
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Gestion des mots de passe par défaut"
                    description="Créez et gérez les mots de passe par défaut utilisés dans l'application"
                    type="info"
                    icon={<KeyOutlined />}
                    showIcon
                />
                
                <Card title="Ajouter un mot de passe" size="small">
                    <Form
                        form={form}
                        layout="horizontal"
                        onFinish={handleAdd}
                    >
                        <Row gutter={16}>
                            <Col xs={24} md={10}>
                                <Form.Item
                                    name="libelle"
                                    label="Libellé"
                                    rules={[{ required: true, message: 'Veuillez saisir un libellé' }]}
                                >
                                    <Input placeholder="Libellé du mot de passe" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={10}>
                                <Form.Item
                                    name="valeur"
                                    label="Valeur"
                                    rules={[{ required: true, message: 'Veuillez saisir une valeur' }]}
                                >
                                    <Input.Password placeholder="Valeur du mot de passe" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                                        Ajouter
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>
                
                <Card title="Liste des mots de passe" size="small">
                    <Table
                        columns={columns}
                        dataSource={passwords}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                    />
                </Card>
            </Space>
        );
    }

    const menuItems = filteredSections.map(section => ({
        key: section.key,
        icon: section.icon,
        label: (
            <div>
                <div style={{ fontWeight: 500 }}>{section.label}</div>
                <div style={{ fontSize: '12px', color: '#666', margin: '-20px' }}>
                    {section.description}
                </div>
            </div>
        )
    }));

    return (
        <Main>
            <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{ 
                    background: '#fff', 
                    padding: '16px 24px',
                    marginBottom: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <SettingOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
                        <Title level={3} style={{ margin: 0, color: '#262626' }}>
                            Configuration Système
                        </Title>
                    </div>
                </div>

                <Layout style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <Sider 
                        width={350} 
                        style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
                    >
                        <div style={{ padding: '16px' }}>
                            <Input
                                placeholder="Rechercher dans les paramètres..."
                                prefix={<SearchOutlined />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ marginBottom: '16px' }}
                            />
                            
                            <Menu
                                mode="inline"
                                selectedKeys={[activeSection]}
                                onClick={({ key }) => setActiveSection(key)}
                                items={menuItems}
                                style={{ border: 'none' }}
                            />
                        </div>
                    </Sider>

                    {/* Main Content */}
                    <Layout style={{ padding: '24px' }}>
                        <Content>
                            <Card>
                                {/* Content Header */}
                                <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
                                    <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                        {settingsSections.find(s => s.key === activeSection)?.icon}
                                        <span style={{ marginLeft: '12px' }}>
                                            {settingsSections.find(s => s.key === activeSection)?.label}
                                        </span>
                                    </Title>
                                    <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
                                        {settingsSections.find(s => s.key === activeSection)?.description}
                                    </Text>
                                </div>

                                {/* Content Body */}
                                <div style={{ minHeight: '400px' }}>
                                    {settingsSections.find(s => s.key === activeSection)?.component}
                                </div>

                                {/* Content Footer */}
                                <div style={{ 
                                    marginTop: '32px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #f0f0f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Text type="secondary">
                                        Dernière modification: Aujourd'hui à 14:30
                                    </Text>
                                    <Space>
                                        <Button icon={<CloseOutlined />}>
                                            Annuler
                                        </Button>
                                        <Button type="primary" icon={<SaveOutlined />}>
                                            Enregistrer
                                        </Button>
                                    </Space>
                                </div>
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </Main>
    );
}

function BackupManagement() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [restoreInProgress, setRestoreInProgress] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [activeTab, setActiveTab] = useState('1');
    const [backupLocation, setBackupLocation] = useState('local');
    const [notificationEmail, setNotificationEmail] = useState('');

    const { TabPane } = Tabs;

    useEffect(() => {
        // This would be replaced with an actual API call
        const fetchBackups = async () => {
            setLoading(true);
            try {
                // Replace with actual API call when backend is ready
                // const response = await BackupService.getBackups();
                // setBackups(response.data);
                
                // Mock data for now
                setTimeout(() => {
                    setBackups([
                        {
                            id: 1,
                            name: 'backup_2023_11_15_10_30_00',
                            size: '45.2 MB',
                            created_at: '2023-11-15 10:30:00',
                            status: 'completed',
                            location: 'local'
                        },
                        {
                            id: 2,
                            name: 'backup_2023_11_14_22_15_00',
                            size: '44.8 MB',
                            created_at: '2023-11-14 22:15:00',
                            status: 'completed',
                            location: 'ftp'
                        },
                        {
                            id: 3,
                            name: 'backup_2023_11_13_09_00_00',
                            size: '43.5 MB',
                            created_at: '2023-11-13 09:00:00',
                            status: 'completed',
                            location: 'ssh'
                        }
                    ]);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching backups:', error);
                message.error('Impossible de récupérer les sauvegardes');
                setLoading(false);
            }
        };

        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        setBackupInProgress(true);
        try {
            // Replace with actual API call when backend is ready
            // await BackupService.createBackup();
            
            // Mock successful backup creation
            setTimeout(() => {
                const newBackup = {
                    id: Date.now(),
                    name: `backup_${new Date().toISOString().replace(/[\\:.-]/g, '_').replace('T', '_').split('.')[0]}`,
                    size: '45.6 MB',
                    created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
                    status: 'completed',
                    location: backupLocation
                };
                setBackups([newBackup, ...backups]);
                setBackupInProgress(false);
                message.success('Sauvegarde créée avec succès');
            }, 2000);
        } catch (error) {
            console.error('Error creating backup:', error);
            message.error('Impossible de créer la sauvegarde');
            setBackupInProgress(false);
        }
    };

    const handleRestoreBackup = async (backupId) => {
        setRestoreInProgress(true);
        setSelectedBackup(backupId);
        try {
            // Replace with actual API call when backend is ready
            // await BackupService.restoreBackup(backupId);
            
            // Mock successful restore
            setTimeout(() => {
                setRestoreInProgress(false);
                setSelectedBackup(null);
                message.success('Restauration effectuée avec succès');
            }, 3000);
        } catch (error) {
            console.error('Error restoring backup:', error);
            message.error('Impossible de restaurer la sauvegarde');
            setRestoreInProgress(false);
            setSelectedBackup(null);
        }
    };

    const handleDeleteBackup = async (backupId) => {
        try {
            // Replace with actual API call when backend is ready
            // await BackupService.deleteBackup(backupId);
            
            // Mock successful deletion
            setBackups(backups.filter(backup => backup.id !== backupId));
            message.success('Sauvegarde supprimée avec succès');
        } catch (error) {
            console.error('Error deleting backup:', error);
            message.error('Impossible de supprimer la sauvegarde');
        }
    };

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Taille',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Date de création',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: (a, b) => new Date(b.created_at) - new Date(a.created_at),
            defaultSortOrder: 'descend'
        },
        {
            title: 'Emplacement',
            dataIndex: 'location',
            key: 'location',
            render: (location) => {
                let color = 'blue';
                let text = 'Local';
                
                if (location === 'ftp') {
                    color = 'green';
                    text = 'FTP';
                } else if (location === 'ssh') {
                    color = 'purple';
                    text = 'SSH';
                }
                
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        onClick={() => handleRestoreBackup(record.id)}
                        loading={restoreInProgress && selectedBackup === record.id}
                        disabled={restoreInProgress}
                    >
                        Restaurer
                    </Button>
                    <Button 
                        danger 
                        onClick={() => handleDeleteBackup(record.id)}
                        disabled={restoreInProgress}
                    >
                        <DeleteOutlined /> Supprimer
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
                message="Gestion des Sauvegardes"
                description="Créez, restaurez et gérez les sauvegardes de votre système"
                type="info"
                icon={<SaveOutlined />}
                showIcon
            />
            
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Liste des sauvegardes" key="1">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Title level={4}>Liste des sauvegardes</Title>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={handleCreateBackup}
                            loading={backupInProgress}
                            disabled={backupInProgress || restoreInProgress}
                        >
                            Créer une sauvegarde
                        </Button>
                    </div>
                    
                    <Table 
                        columns={columns} 
                        dataSource={backups} 
                        rowKey="id" 
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                        locale={{ emptyText: 'Aucune sauvegarde disponible' }}
                    />
                </TabPane>
                
                <TabPane tab="Configuration automatique" key="2">
                    <Card title="Configuration des sauvegardes automatiques" size="small">
                        <Form layout="vertical">
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <SettingOutlined style={{ marginRight: 8 }} />
                                Paramètres généraux
                            </Title>
                            <Form.Item label={<span><SaveOutlined style={{ marginRight: 8 }} />Activer les sauvegardes automatiques</span>}>
                                <Switch defaultChecked />
                            </Form.Item>
                            
                            <Divider />
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <ClockCircleOutlined style={{ marginRight: 8 }} />
                                Planification
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Fréquence">
                                        <Select defaultValue="daily" style={{ width: '100%' }}>
                                            <Select.Option value="hourly">Toutes les heures</Select.Option>
                                            <Select.Option value="daily">Quotidienne</Select.Option>
                                            <Select.Option value="weekly">Hebdomadaire</Select.Option>
                                            <Select.Option value="monthly">Mensuelle</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Heure">
                                        <TimePicker format="HH:mm" style={{ width: '100%' }} defaultValue={moment('02:00', 'HH:mm')} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Divider />
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <DatabaseOutlined style={{ marginRight: 8 }} />
                                Stockage
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Nombre à conserver">
                                        <InputNumber min={1} max={100} defaultValue={10} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Emplacement">
                                        <Radio.Group value={backupLocation} onChange={e => setBackupLocation(e.target.value)}>
                                            <Radio value="local">Local</Radio>
                                            <Radio value="ftp">FTP</Radio>
                                            <Radio value="ssh">SSH</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Divider />
                            <Title level={5} style={{ marginBottom: 16 }}>
                                <MailOutlined style={{ marginRight: 8 }} />
                                Notifications
                            </Title>
                            <Form.Item label="Email">
                                <Input 
                                    placeholder="exemple@domaine.com" 
                                    value={notificationEmail} 
                                    onChange={e => setNotificationEmail(e.target.value)} 
                                />
                            </Form.Item>
                            
                            <Divider />
                            <Form.Item>
                                <Space>
                                    <Button type="primary">Enregistrer</Button>
                                    <Button>Annuler</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </TabPane>
                
                <TabPane tab="Configuration à distance" key="3">
                    <Card title="Configuration des stockages distants" size="small">
                        <Tabs defaultActiveKey="ftp" tabPosition="left">
                            <TabPane tab="FTP" key="ftp">
                                <Form layout="vertical">
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        <CloudOutlined style={{ marginRight: 8 }} />
                                        Connexion FTP
                                    </Title>
                                    <Form.Item label="Activer">
                                        <Switch defaultChecked />
                                    </Form.Item>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Serveur" required>
                                                <Input placeholder="ftp.exemple.com" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Port" required>
                                                <InputNumber min={1} max={65535} defaultValue={21} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Utilisateur" required>
                                                <Input placeholder="utilisateur" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Mot de passe" required>
                                                <Input.Password placeholder="mot de passe" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Item label="Répertoire">
                                        <Input placeholder="/backups" defaultValue="/backups" />
                                    </Form.Item>
                                    
                                    <Form.Item label="Mode passif">
                                        <Switch defaultChecked />
                                    </Form.Item>
                                    
                                    <Divider />
                                    <Form.Item>
                                        <Space>
                                            <Button type="primary">Enregistrer</Button>
                                            <Button>Tester la connexion</Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                            
                            <TabPane tab="SSH/SFTP" key="ssh">
                                <Form layout="vertical">
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        <LockOutlined style={{ marginRight: 8 }} />
                                        Connexion SSH/SFTP
                                    </Title>
                                    <Form.Item label="Activer">
                                        <Switch defaultChecked />
                                    </Form.Item>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Serveur" required>
                                                <Input placeholder="ssh.exemple.com" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Port" required>
                                                <InputNumber min={1} max={65535} defaultValue={22} style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Utilisateur" required>
                                                <Input placeholder="utilisateur" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Authentification">
                                                <Radio.Group defaultValue="password">
                                                    <Radio value="password">Mot de passe</Radio>
                                                    <Radio value="key">Clé privée</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    
                                    <Form.Item label="Mot de passe">
                                        <Input.Password placeholder="mot de passe" />
                                    </Form.Item>
                                    
                                    <Form.Item label="Clé privée">
                                        <Input placeholder="/chemin/vers/cle_privee" disabled />
                                        <Button style={{ marginTop: '8px' }}>Parcourir</Button>
                                    </Form.Item>
                                    
                                    <Form.Item label="Répertoire">
                                        <Input placeholder="/backups" defaultValue="/backups" />
                                    </Form.Item>
                                    
                                    <Divider />
                                    <Form.Item>
                                        <Space>
                                            <Button type="primary">Enregistrer</Button>
                                            <Button>Tester la connexion</Button>
                                        </Space>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </Card>
                </TabPane>
            </Tabs>
        </Space>
    );
}

export default Settings;