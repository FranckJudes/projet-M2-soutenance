import React, { useState } from "react";
import Main from "../../layout/Main";
import "../../styles/settings.css";
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
  Tooltip
} from 'antd';
import {
  SecurityScanOutlined,
  SettingOutlined,
  SearchOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

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
        }
    ];

    const filteredSections = settingsSections.filter(section =>
        section.label.toLowerCase().includes(searchQuery.toLowerCase())
        //  || section.description.toLowerCase().includes(searchQuery.toLowerCase())
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

export default Settings;