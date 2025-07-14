import React, { useState } from "react";
import Main from "../../layout/Main";
import { toast, Toaster } from "react-hot-toast";
import "../../styles/settings.css";

import {
  Layout,
  Menu,
  Card,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  Checkbox,
  Tag,
  Avatar,
  Divider,
  Row,
  Col,
  Statistic,
  Alert,
  Space,
  Typography,
  Badge,
  Tooltip
} from 'antd';

import {
  SecurityScanOutlined,
  InboxOutlined,
  DatabaseOutlined,
  SwapOutlined,
  SafetyOutlined,
  FolderOutlined,
  ApartmentOutlined,
  TeamOutlined,
  SettingOutlined,
  SearchOutlined,
  BellOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function Settings() {
    const [activeSection, setActiveSection] = useState("security");
    const [searchQuery, setSearchQuery] = useState("");

    const settingsSections = [
        {
            key: "security",
            icon: <SecurityScanOutlined />,
            label: "Configuration d'indice de sécurité",
            description: "Gérer les paramètres de sécurité",
            component: <SecurityConfig />
        },
        {
            key: "archiving",
            icon: <InboxOutlined />,
            label: "Configuration de l'archivage physique",
            description: "Paramètres d'archivage et stockage",
            component: <ArchivingConfig />
        },
        {
            key: "directory",
            icon: <DatabaseOutlined />,
            label: "Configuration des services d'annuaire (LDAP)",
            description: "Intégration LDAP et authentification",
            component: <DirectoryConfig />
        },
        {
            key: "transfers",
            icon: <SwapOutlined />,
            label: "Configuration des références de transferts",
            description: "Gestion des transferts de données",
            component: <TransfersConfig />
        },
        {
            key: "coffee",
            icon: <SafetyOutlined />,
            label: "Configuration du Compensat Coffee-Fort Numérique",
            description: "Coffre-fort numérique sécurisé",
            component: <CoffeeFortConfig />
        },
        {
            key: "classification",
            icon: <FolderOutlined />,
            label: "Configuration des codes de classements",
            description: "Système de classification des documents",
            component: <ClassificationConfig />
        },
        {
            key: "workflow",
            icon: <ApartmentOutlined />,
            label: "Configuration du Workflow",
            description: "Automatisation des processus",
            component: <WorkflowConfig />
        },
        {
            key: "directory2",
            icon: <TeamOutlined />,
            label: "Configuration des services d'annuaire",
            description: "Gestion des utilisateurs et groupes",
            component: <DirectoryServicesConfig />
        }
    ];

    const filteredSections = settingsSections.filter(section =>
        section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function SecurityConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Indices de Sécurité"
                    description="Configurez les niveaux de sécurité pour vos documents"
                    type="info"
                    icon={<SecurityScanOutlined />}
                    showIcon
                />
                
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Niveaux de Classification" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Checkbox defaultChecked>Public</Checkbox>
                                    <Tag color="green">Niveau 1</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Checkbox defaultChecked>Interne</Checkbox>
                                    <Tag color="orange">Niveau 2</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Checkbox defaultChecked>Confidentiel</Checkbox>
                                    <Tag color="red">Niveau 3</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Checkbox>Secret</Checkbox>
                                    <Tag color="purple">Niveau 4</Tag>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                    
                    <Col xs={24} lg={12}>
                        <Card title="Paramètres de Sécurité" size="small">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <Text strong>Durée de session (minutes)</Text>
                                    <InputNumber
                                        style={{ width: '100%', marginTop: 8 }}
                                        defaultValue={30}
                                        min={5}
                                        max={480}
                                    />
                                </div>
                                <div>
                                    <Text strong>Tentatives de connexion max</Text>
                                    <InputNumber
                                        style={{ width: '100%', marginTop: 8 }}
                                        defaultValue={3}
                                        min={1}
                                        max={10}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                                    <Text>Authentification à deux facteurs</Text>
                                    <Switch defaultChecked />
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Space>
        );
    }

    function ArchivingConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Archivage Physique"
                    description="Configuration des politiques d'archivage et de stockage"
                    type="warning"
                    icon={<InboxOutlined />}
                    showIcon
                />
                
                <Card title="Politiques d'Archivage">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <div>
                                <Text strong>Période de rétention par défaut</Text>
                                <Select
                                    style={{ width: '100%', marginTop: 8 }}
                                    defaultValue="5ans"
                                    options={[
                                        { value: '1an', label: '1 an' },
                                        { value: '5ans', label: '5 ans' },
                                        { value: '10ans', label: '10 ans' },
                                        { value: 'permanent', label: 'Permanent' }
                                    ]}
                                />
                            </div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div>
                                <Text strong>Localisation de stockage</Text>
                                <Input
                                    style={{ marginTop: 8 }}
                                    placeholder="Emplacement physique"
                                    defaultValue="Salle d'archives - Bâtiment A"
                                />
                            </div>
                        </Col>
                    </Row>
                    
                    <Divider />
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Statistic
                                title="Documents archivés"
                                value={2847}
                                prefix={<InboxOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <Statistic
                                title="Espace utilisé"
                                value={68.2}
                                suffix="GB"
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <Statistic
                                title="Taux de compression"
                                value={85}
                                suffix="%"
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Col>
                    </Row>
                </Card>
            </Space>
        );
    }

    function DirectoryConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Services d'Annuaire LDAP"
                    description="Configuration de l'intégration LDAP pour l'authentification"
                    type="success"
                    icon={<DatabaseOutlined />}
                    showIcon
                />
                
                <Card 
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Configuration du Serveur LDAP</span>
                            <Badge status="success" text="Connecté" />
                        </div>
                    }
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <div>
                                <Text strong>Serveur LDAP</Text>
                                <Input
                                    style={{ marginTop: 8 }}
                                    defaultValue="ldap://server.domain.com"
                                    prefix={<DatabaseOutlined />}
                                />
                            </div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div>
                                <Text strong>Port</Text>
                                <InputNumber
                                    style={{ width: '100%', marginTop: 8 }}
                                    defaultValue={389}
                                />
                            </div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div>
                                <Text strong>Base DN</Text>
                                <Input
                                    style={{ marginTop: 8 }}
                                    defaultValue="dc=domain,dc=com"
                                />
                            </div>
                        </Col>
                        <Col xs={24} lg={12}>
                            <div>
                                <Text strong>Utilisateur de liaison</Text>
                                <Input
                                    style={{ marginTop: 8 }}
                                    defaultValue="cn=admin,dc=domain,dc=com"
                                />
                            </div>
                        </Col>
                    </Row>
                    
                    <Divider />
                    
                    <Space>
                        <Button type="primary" icon={<CheckCircleOutlined />}>
                            Tester la connexion
                        </Button>
                        <Button icon={<SaveOutlined />}>
                            Enregistrer
                        </Button>
                    </Space>
                </Card>
            </Space>
        );
    }

    function TransfersConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Références de Transferts"
                    description="Configuration des paramètres de transfert de données"
                    type="info"
                    icon={<SwapOutlined />}
                    showIcon
                />
                
                <Card title="Paramètres de Transfert">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f5f5f5',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <Text strong>Transferts automatiques</Text>
                                <br />
                                <Text type="secondary">Activer les transferts programmés</Text>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f5f5f5',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <Text strong>Compression des fichiers</Text>
                                <br />
                                <Text type="secondary">Compresser avant transfert</Text>
                            </div>
                            <Switch />
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '16px',
                            background: '#f5f5f5',
                            borderRadius: '8px'
                        }}>
                            <div>
                                <Text strong>Notifications de transfert</Text>
                                <br />
                                <Text type="secondary">Recevoir des notifications par email</Text>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </Space>
                </Card>
            </Space>
        );
    }

    function CoffeeFortConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Coffre-Fort Numérique"
                    description="Configuration du système de coffre-fort numérique sécurisé"
                    type="warning"
                    icon={<SafetyOutlined />}
                    showIcon
                />
                
                <Card title="Configuration du Coffre-Fort">
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <SafetyOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
                        <Title level={4} type="secondary">Configuration du coffre-fort numérique</Title>
                        <Paragraph type="secondary">
                            Sécurisez vos documents les plus sensibles avec notre système de coffre-fort numérique
                        </Paragraph>
                        <Button type="primary" size="large">
                            Configurer le coffre-fort
                        </Button>
                    </div>
                </Card>
            </Space>
        );
    }

    function ClassificationConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Codes de Classements"
                    description="Gérez votre système de classification des documents"
                    type="info"
                    icon={<FolderOutlined />}
                    showIcon
                />
                
                <Card title="Système de Classification">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Card size="small" style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>ADM - Administration</Text>
                                    <br />
                                    <Text type="secondary">Documents administratifs généraux</Text>
                                </div>
                                <Button type="link">Modifier</Button>
                            </div>
                        </Card>
                        
                        <Card size="small" style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>FIN - Finance</Text>
                                    <br />
                                    <Text type="secondary">Documents financiers et comptables</Text>
                                </div>
                                <Button type="link">Modifier</Button>
                            </div>
                        </Card>
                        
                        <Card size="small" style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>JUR - Juridique</Text>
                                    <br />
                                    <Text type="secondary">Documents légaux et contractuels</Text>
                                </div>
                                <Button type="link">Modifier</Button>
                            </div>
                        </Card>
                        
                        <Button type="dashed" style={{ width: '100%' }}>
                            + Ajouter un nouveau code de classement
                        </Button>
                    </Space>
                </Card>
            </Space>
        );
    }

    function WorkflowConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Configuration du Workflow"
                    description="Gérez l'automatisation de vos processus métier"
                    type="success"
                    icon={<ApartmentOutlined />}
                    showIcon
                />
                
                <Card title="Workflows Actifs">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Card size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Badge status="success" style={{ marginRight: '12px' }} />
                                    <div>
                                        <Text strong>Validation de documents</Text>
                                        <br />
                                        <Text type="secondary">Workflow de validation en 3 étapes</Text>
                                    </div>
                                </div>
                                <Space>
                                    <Tag color="green" icon={<PlayCircleOutlined />}>Actif</Tag>
                                    <Button size="small">Configurer</Button>
                                </Space>
                            </div>
                        </Card>
                        
                        <Card size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Badge status="warning" style={{ marginRight: '12px' }} />
                                    <div>
                                        <Text strong>Archivage automatique</Text>
                                        <br />
                                        <Text type="secondary">Archivage basé sur les règles de rétention</Text>
                                    </div>
                                </div>
                                <Space>
                                    <Tag color="orange" icon={<PauseCircleOutlined />}>En pause</Tag>
                                    <Button size="small">Configurer</Button>
                                </Space>
                            </div>
                        </Card>
                        
                        <Card size="small">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Badge status="success" style={{ marginRight: '12px' }} />
                                    <div>
                                        <Text strong>Notification d'échéance</Text>
                                        <br />
                                        <Text type="secondary">Alertes automatiques pour les documents</Text>
                                    </div>
                                </div>
                                <Space>
                                    <Tag color="green" icon={<PlayCircleOutlined />}>Actif</Tag>
                                    <Button size="small">Configurer</Button>
                                </Space>
                            </div>
                        </Card>
                    </Space>
                </Card>
            </Space>
        );
    }

    function DirectoryServicesConfig() {
        return (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                    message="Services d'Annuaire"
                    description="Gestion des utilisateurs, groupes et permissions"
                    type="info"
                    icon={<TeamOutlined />}
                    showIcon
                />
                
                <Card title="Statistiques des Utilisateurs">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Card>
                                <Statistic
                                    title="Utilisateurs actifs"
                                    value={247}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card>
                                <Statistic
                                    title="Groupes"
                                    value={12}
                                    prefix={<ApartmentOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card>
                                <Statistic
                                    title="Administrateurs"
                                    value={5}
                                    prefix={<SecurityScanOutlined />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Card>
                
                <Card title="Paramètres d'Annuaire">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>Synchronisation automatique</Text>
                            <Switch defaultChecked />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>Authentification unique (SSO)</Text>
                            <Switch />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text>Audit des connexions</Text>
                            <Switch defaultChecked />
                        </div>
                    </Space>
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
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
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
                    <Space>
                        <Tooltip title="Notifications">
                            <Button type="text" icon={<BellOutlined />} />
                        </Tooltip>
                        <Avatar style={{ backgroundColor: '#1890ff' }}>AD</Avatar>
                    </Space>
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

            {/* Toast container pour les notifications */}
            <Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: {
                    background: '#333',
                    color: '#fff',
                },
                success: {
                    style: {
                        background: '#28a745',
                    },
                },
                error: {
                    style: {
                        background: '#dc3545',
                    },
                },
            }} />
        </Main>
    );
}

export default Settings;