import React, { useState } from 'react';
import { 
  Table, Button, Form, Input, Modal, Space, 
  Popconfirm, Typography, Row, Col, Card, Tag
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  TagsOutlined, ReloadOutlined
} from '@ant-design/icons';
import TypeEntiteService from '../../../services/TypeEntiteService';

const { Text, Title } = Typography;
const { TextArea } = Input;

const TypeEntiteTab = ({ typeEntites, onRefresh }) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentTypeEntite, setCurrentTypeEntite] = useState(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Libellé',
      dataIndex: 'libele',
      key: 'libele',
      width: '25%',
      render: (text) => (
        <Tag color="blue" icon={<TagsOutlined />}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '45%',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            Modifier
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce type d'entité?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setModalMode('create');
    setCurrentTypeEntite(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setCurrentTypeEntite(record);
    form.setFieldsValue({
      libele: record.libele,
      description: record.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await TypeEntiteService.deleteTypeEntite(id);
      onRefresh();
    } catch (error) {
      console.error("Error deleting type entity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (modalMode === 'create') {
        await TypeEntiteService.createTypeEntite(values);
      } else {
        await TypeEntiteService.updateTypeEntite(currentTypeEntite.id, values);
      }
      
      setModalVisible(false);
      onRefresh();
    } catch (error) {
      console.error("Form validation or submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>Types d'entités</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Ajouter un type d'entité
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
            >
              Actualiser
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={typeEntites}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? "Ajouter un type d'entité" : "Modifier un type d'entité"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          name="typeEntiteForm"
        >
          <Form.Item
            name="libele"
            label="Libellé"
            rules={[
              { required: true, message: 'Le libellé est obligatoire' },
              { max: 100, message: 'Le libellé ne peut pas dépasser 100 caractères' }
            ]}
          >
            <Input placeholder="Libellé du type d'entité" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Description du type d'entité" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TypeEntiteTab;
