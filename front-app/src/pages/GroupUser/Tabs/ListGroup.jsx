import React from "react";
import { useTranslation } from "react-i18next";
import { Table, Button, Tag, Space, Empty, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ListGroup = ({ groups = [], onEdit, onDelete }) => {
    const { t } = useTranslation();
    
    // Fonction pour obtenir la couleur du tag en fonction du type
    const getTypeTag = (type) => {
        switch(type) {
            case 'TYPE_0':
                return <Tag color="blue">Type 0</Tag>;
            case 'TYPE_1':
                return <Tag color="green">Type 1</Tag>;
            case 'TYPE_2':
                return <Tag color="orange">Type 2</Tag>;
            default:
                return <Tag color="default">{type}</Tag>;
        }
    };

    // Définition des colonnes pour le tableau antd
    const columns = [
        {
            title: 'Libellé',
            dataIndex: 'libeleGroupeUtilisateur',
            key: 'libeleGroupeUtilisateur',
        },
        {
            title: 'Description',
            dataIndex: 'descriptionGroupeUtilisateur',
            key: 'descriptionGroupeUtilisateur',
            render: (text) => text || <span style={{ color: '#999' }}>Aucune description</span>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => getTypeTag(type)
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={() => onEdit(record)}
                    />
                    <Popconfirm
                        title="Êtes-vous sûr de vouloir supprimer ce groupe ?"
                        description="Cette action est irréversible."
                        onConfirm={() => onDelete(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Button 
                            type="primary" 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            {groups.length === 0 ? (
                <Empty description="Aucun groupe trouvé" />
            ) : (
                <Table 
                    columns={columns} 
                    dataSource={groups} 
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="middle"
                />
            )}
        </div>
    );
};

export default ListGroup;