import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Spin, Tabs, Select, Form, Space, Popconfirm, Empty } from 'antd';
import { UserAddOutlined, DeleteOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import GroupeService from '../../../services/GroupeService';
import UserService from '../../../services/UserService';

const { TabPane } = Tabs;

const GroupUserManagement = ({ selectedGroup, onRefresh }) => {
    const [usersInGroup, setUsersInGroup] = useState([]);
    const [usersWithoutGroup, setUsersWithoutGroup] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState({
        usersInGroup: false,
        usersWithoutGroup: false,
        addUsers: false,
        removeUser: false
    });

    // Charger les utilisateurs du groupe sélectionné
    const loadUsersInGroup = async () => {
        if (!selectedGroup) return;
        
        setLoading(prev => ({ ...prev, usersInGroup: true }));
        try {
            const response = await GroupeService.getUsersInGroup(selectedGroup.id);
            if (response.data) {
                setUsersInGroup(response.data);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs du groupe", error);
            message.error("Erreur lors du chargement des utilisateurs du groupe");
        } finally {
            setLoading(prev => ({ ...prev, usersInGroup: false }));
        }
    };

    // Charger les utilisateurs sans groupe
    const loadUsersWithoutGroup = async () => {
        setLoading(prev => ({ ...prev, usersWithoutGroup: true }));
        try {
            const response = await GroupeService.getUsersWithoutGroup();
            if (response.data) {
                setUsersWithoutGroup(response.data);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs sans groupe", error);
            message.error("Erreur lors du chargement des utilisateurs sans groupe");
        } finally {
            setLoading(prev => ({ ...prev, usersWithoutGroup: false }));
        }
    };

    // Ajouter des utilisateurs au groupe
    const addUsersToGroup = async () => {
        if (!selectedGroup || selectedUsers.length === 0) return;
        
        setLoading(prev => ({ ...prev, addUsers: true }));
        try {
            await GroupeService.addUsersToGroup(selectedGroup.id, selectedUsers);
            message.success("Utilisateurs ajoutés au groupe avec succès");
            setSelectedUsers([]);
            loadUsersInGroup();
            loadUsersWithoutGroup();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Erreur lors de l'ajout des utilisateurs au groupe", error);
            message.error("Erreur lors de l'ajout des utilisateurs au groupe");
        } finally {
            setLoading(prev => ({ ...prev, addUsers: false }));
        }
    };

    // Retirer un utilisateur du groupe
    const removeUserFromGroup = async (userId) => {
        if (!selectedGroup) return;
        
        setLoading(prev => ({ ...prev, removeUser: true }));
        try {
            await GroupeService.removeUserFromGroup(selectedGroup.id, userId);
            message.success("Utilisateur retiré du groupe avec succès");
            loadUsersInGroup();
            loadUsersWithoutGroup();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Erreur lors du retrait de l'utilisateur du groupe", error);
            message.error("Erreur lors du retrait de l'utilisateur du groupe");
        } finally {
            setLoading(prev => ({ ...prev, removeUser: false }));
        }
    };

    // Effet pour charger les données lorsque le groupe sélectionné change
    useEffect(() => {
        if (selectedGroup) {
            loadUsersInGroup();
            loadUsersWithoutGroup();
        }
    }, [selectedGroup]);

    // Colonnes pour le tableau des utilisateurs du groupe
    const usersInGroupColumns = [
        {
            title: 'Nom',
            dataIndex: 'firstName',
            key: 'firstName',
            render: (text, record) => `${record.firstName || ''} ${record.lastName || ''}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Popconfirm
                    title="Êtes-vous sûr de vouloir retirer cet utilisateur du groupe ?"
                    onConfirm={() => removeUserFromGroup(record.id)}
                    okText="Oui"
                    cancelText="Non"
                >
                    <Button 
                        type="primary" 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small"
                        loading={loading.removeUser}
                    />
                </Popconfirm>
            ),
        },
    ];

    // Options pour le select des utilisateurs sans groupe
    const userOptions = usersWithoutGroup.map(user => ({
        value: user.id,
        label: `${user.firstName || ''} ${user.lastName || ''} (${user.email})`,
    }));

    return (
        <div>
            {!selectedGroup ? (
                <Empty description="Veuillez sélectionner un groupe pour gérer ses utilisateurs" />
            ) : (
                <Tabs defaultActiveKey="usersInGroup">
                    <TabPane 
                        tab={
                            <span>
                                <TeamOutlined />
                                Utilisateurs du groupe
                            </span>
                        } 
                        key="usersInGroup"
                    >
                        <Spin spinning={loading.usersInGroup}>
                            {usersInGroup.length === 0 ? (
                                <Empty description="Aucun utilisateur dans ce groupe" />
                            ) : (
                                <Table 
                                    dataSource={usersInGroup} 
                                    columns={usersInGroupColumns} 
                                    rowKey="id"
                                    pagination={{ pageSize: 5 }}
                                    size="small"
                                />
                            )}
                        </Spin>
                    </TabPane>
                    <TabPane 
                        tab={
                            <span>
                                <UserAddOutlined />
                                Ajouter des utilisateurs
                            </span>
                        } 
                        key="addUsers"
                    >
                        <Spin spinning={loading.usersWithoutGroup}>
                            <Form layout="vertical">
                                <Form.Item label="Sélectionner des utilisateurs à ajouter au groupe :">
                                    <Select
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        placeholder="Sélectionner des utilisateurs..."
                                        value={selectedUsers}
                                        onChange={setSelectedUsers}
                                        options={userOptions}
                                        optionFilterProp="label"
                                        loading={loading.usersWithoutGroup}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button 
                                        type="primary" 
                                        onClick={addUsersToGroup} 
                                        disabled={selectedUsers.length === 0}
                                        loading={loading.addUsers}
                                        icon={<UserAddOutlined />}
                                    >
                                        Ajouter au groupe
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Spin>
                    </TabPane>
                </Tabs>
            )}
        </div>
    );
};

export default GroupUserManagement;
