import React, { useState, useEffect } from "react";
import { Card, Button, Table, Empty, Space } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

const ListUserNotGroup = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Définition des colonnes pour le tableau antd
    const columns = [
        {
            title: 'Nom',
            dataIndex: 'name',
            key: 'name',
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
                <Button 
                    type="primary" 
                    icon={<UserAddOutlined />} 
                    size="small"
                >
                    Ajouter à un groupe
                </Button>
            )
        }
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<UserAddOutlined />}>
                    Ajouter à un groupe
                </Button>
            </Space>
            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
                loading={loading}
                locale={{ emptyText: <Empty description="Aucun utilisateur sans groupe trouvé" /> }}
            />
        </div>
    );
};

export default ListUserNotGroup;