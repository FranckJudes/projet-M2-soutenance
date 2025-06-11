import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Popconfirm, Typography, Row, Col, 
  Card, Tree, Select, message, Spin, Empty, Avatar, Tag
} from 'antd';
import { 
  UserOutlined, PlusOutlined, DeleteOutlined, 
  ApartmentOutlined, ReloadOutlined, TeamOutlined
} from '@ant-design/icons';
import EntiteOrganisationService from '../../../services/EntiteOrganisationService';
import UserService from '../../../services/UserService';

const { Text, Title } = Typography;
const { Option } = Select;

const EntiteUsersTab = ({ entites, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entityUsers, setEntityUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Build tree data for the Tree component
  useEffect(() => {
    if (entites.length > 0) {
      const rootEntites = entites.filter(e => !e.parentId);
      const tree = buildTreeData(rootEntites, entites);
      setTreeData(tree);
      
      // Expand root nodes by default
      setExpandedKeys(rootEntites.map(e => e.id.toString()));
    }
  }, [entites]);

  // Fetch all users
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch entity users when entity selection changes
  useEffect(() => {
    if (selectedEntityId) {
      fetchEntityUsers(selectedEntityId);
      const entity = entites.find(e => e.id === selectedEntityId);
      setSelectedEntity(entity);
    } else {
      setEntityUsers([]);
      setSelectedEntity(null);
    }
  }, [selectedEntityId, entites]);

  const buildTreeData = (nodes, allEntites) => {
    return nodes.map(node => {
      const children = allEntites.filter(e => e.parentId === node.id);
      return {
        title: node.libele,
        key: node.id.toString(),
        icon: <ApartmentOutlined />,
        children: children.length > 0 ? buildTreeData(children, allEntites) : []
      };
    });
  };

  const fetchAllUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      if (response.data && response.data.data) {
        setAllUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Erreur lors du chargement des utilisateurs");
    }
  };

  const fetchEntityUsers = async (entityId) => {
    setLoading(true);
    try {
      const response = await EntiteOrganisationService.getUsersByEntityId(entityId);
      if (response.data && response.data.data) {
        setEntityUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching entity users:", error);
      message.error("Erreur lors du chargement des utilisateurs de l'entité");
    } finally {
      setLoading(false);
    }
  };

  const handleTreeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      setSelectedEntityId(parseInt(selectedKeys[0]));
    } else {
      setSelectedEntityId(null);
    }
  };

  const handleAddUser = async () => {
    if (!selectedEntityId || !selectedUserId) {
      message.warning("Veuillez sélectionner une entité et un utilisateur");
      return;
    }

    setAddUserLoading(true);
    try {
      await EntiteOrganisationService.addUserToEntity(selectedEntityId, selectedUserId);
      message.success("Utilisateur ajouté à l'entité avec succès");
      fetchEntityUsers(selectedEntityId);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error adding user to entity:", error);
      message.error("Erreur lors de l'ajout de l'utilisateur à l'entité");
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!selectedEntityId) return;

    setLoading(true);
    try {
      await EntiteOrganisationService.removeUserFromEntity(selectedEntityId, userId);
      message.success("Utilisateur retiré de l'entité avec succès");
      fetchEntityUsers(selectedEntityId);
    } catch (error) {
      console.error("Error removing user from entity:", error);
      message.error("Erreur lors du retrait de l'utilisateur de l'entité");
    } finally {
      setLoading(false);
    }
  };

  // Filter out users already in the entity
  const availableUsers = allUsers.filter(
    user => !entityUsers.some(entityUser => entityUser.id === user.id)
  );

  const columns = [
    {
      title: 'Utilisateur',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            src={record.profilePicture} 
          />
          <span>{`${record.firstName} ${record.lastName}`}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'red' : role === 'MANAGER' ? 'blue' : 'green'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Êtes-vous sûr de vouloir retirer cet utilisateur de l'entité?"
          onConfirm={() => handleRemoveUser(record.id)}
          okText="Oui"
          cancelText="Non"
        >
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          >
            Retirer
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Hiérarchie des entités" style={{ height: '100%' }}>
            {treeData.length > 0 ? (
              <Tree
                showIcon
                defaultExpandAll
                expandedKeys={expandedKeys}
                onExpand={setExpandedKeys}
                onSelect={handleTreeSelect}
                treeData={treeData}
              />
            ) : (
              <Text type="secondary">Aucune entité disponible</Text>
            )}
          </Card>
        </Col>
        <Col span={16}>
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Title level={4}>
                {selectedEntity 
                  ? `Utilisateurs de ${selectedEntity.libele}` 
                  : 'Sélectionnez une entité'}
              </Title>
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => {
                    onRefresh();
                    if (selectedEntityId) fetchEntityUsers(selectedEntityId);
                  }}
                >
                  Actualiser
                </Button>
              </Space>
            </div>

            {selectedEntityId ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={18}>
                      <Select
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="Sélectionner un utilisateur à ajouter"
                        optionFilterProp="children"
                        value={selectedUserId}
                        onChange={setSelectedUserId}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {availableUsers.map(user => (
                          <Option key={user.id} value={user.id}>
                            {`${user.firstName} ${user.lastName} (${user.email})`}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddUser}
                        loading={addUserLoading}
                        disabled={!selectedUserId}
                        style={{ width: '100%' }}
                      >
                        Ajouter
                      </Button>
                    </Col>
                  </Row>
                </div>

                <Spin spinning={loading}>
                  {entityUsers.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={entityUsers}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty 
                      description="Aucun utilisateur dans cette entité" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Spin>
              </>
            ) : (
              <Empty 
                description="Sélectionnez une entité pour gérer ses utilisateurs" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EntiteUsersTab;
