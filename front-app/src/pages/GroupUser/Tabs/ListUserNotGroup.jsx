import React, { useState, useEffect } from "react";
import { Table, Empty, Spin, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import GroupeService from "../../../services/GroupeService";

const ListUserNotGroup = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Charger les utilisateurs sans groupe
    const loadUsersWithoutGroup = async () => {
        setLoading(true);
        try {
            const response = await GroupeService.getUsersWithoutGroup();
            if (response.data && response.data.data) {
                setUsers(response.data.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs sans groupe", error);
            const errorMsg = error.response?.data?.message || "Erreur lors du chargement des utilisateurs sans groupe";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Charger les utilisateurs au chargement du composant
    useEffect(() => {
        loadUsersWithoutGroup();
    }, []);

    // Définition des colonnes pour le tableau antd
    const columns = [
        {
            title: '#',
            key: 'index',
            render: (_, __, index) => index + 1,
            width: 60
        },
      
        {
            title: 'Nom',
            key: 'name',
            render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            render: (_, record) => `${record.firstName || ''} `,
        },
        {
            title: 'Date création',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
    ];

    return (
        <div>
            <Spin spinning={loading} tip="Chargement des utilisateurs...">
                {users.length === 0 ? (
                    <Empty 
                        description="Aucun utilisateur sans groupe trouvé" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    />
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={users} 
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        size="middle"
                    />
                )}
            </Spin>
        </div>
    );
};

export default ListUserNotGroup;