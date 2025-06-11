import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Form, Input, Select, Modal, Space, 
  Popconfirm, Typography, Row, Col, Tree, Card, Tooltip 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SaveOutlined, CloseOutlined, ReloadOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import EntiteOrganisationService from '../../../services/EntiteOrganisationService';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EntiteOrganisationTab = ({ entites, typeEntites, onRefresh }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentEntite, setCurrentEntite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    if (entites.length > 0) {
      const rootEntites = entites.filter(e => !e.parentId);
      const tree = buildTreeData(rootEntites, entites);
      setTreeData(tree);
      
      // Expand root nodes by default
      setExpandedKeys(rootEntites.map(e => e.id.toString()));
    }
  }, [entites]);

  // Build tree data for the Tree component
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

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
    },
    {
      title: 'Libellé',
      dataIndex: 'libele',
      key: 'libele',
      width: '20%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      ellipsis: true,
    },
    {
      title: 'Type d\'entité',
      dataIndex: 'typeEntite',
      key: 'typeEntite',
      width: '20%',
      render: (_, record) => {
        const typeEntite = typeEntites.find(t => t.id === record.typeEntityId);
        return typeEntite ? typeEntite.libele : '-';
      }
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
            title="Êtes-vous sûr de vouloir supprimer cette entité?"
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
    setCurrentEntite(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setCurrentEntite(record);
    form.setFieldsValue({
      code: record.code,
      libele: record.libele,
      description: record.description,
      typeEntityId: record.typeEntityId,
      parentId: record.parentId,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await EntiteOrganisationService.deleteEntite(id);
      onRefresh();
    } catch (error) {
      console.error("Error deleting entity:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (modalMode === 'create') {
        await EntiteOrganisationService.createEntite(values);
      } else {
        await EntiteOrganisationService.updateEntite(currentEntite.id, values);
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

  const handleTreeSelect = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      setSelectedKey(selectedKeys[0]);
    } else {
      setSelectedKey(null);
    }
  };

  const filteredEntites = selectedKey 
    ? entites.filter(e => e.id.toString() === selectedKey || e.parentId?.toString() === selectedKey)
    : entites;

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
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4}>
              {selectedKey 
                ? `Entités ${entites.find(e => e.id.toString() === selectedKey)?.libele || ''}` 
                : 'Toutes les entités'}
            </Title>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                Ajouter une entité
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
            dataSource={filteredEntites}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        </Col>
      </Row>

      <Modal
        title={modalMode === 'create' ? "Ajouter une entité" : "Modifier une entité"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          name="entiteForm"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Code"
                rules={[
                  { required: true, message: 'Le code est obligatoire' },
                  { max: 50, message: 'Le code ne peut pas dépasser 50 caractères' }
                ]}
              >
                <Input placeholder="Code de l'entité" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="libele"
                label="Libellé"
                rules={[
                  { required: true, message: 'Le libellé est obligatoire' },
                  { max: 100, message: 'Le libellé ne peut pas dépasser 100 caractères' }
                ]}
              >
                <Input placeholder="Libellé de l'entité" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Description de l'entité" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="typeEntityId"
                label="Type d'entité"
                rules={[{ required: true, message: 'Le type d\'entité est obligatoire' }]}
              >
                <Select placeholder="Sélectionner un type d'entité">
                  {typeEntites.map(type => (
                    <Option key={type.id} value={type.id}>{type.libele}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="parentId"
                label="Entité parent"
              >
                <Select 
                  placeholder="Sélectionner une entité parent" 
                  allowClear
                >
                  {entites
                    .filter(e => currentEntite ? e.id !== currentEntite.id : true)
                    .map(entite => (
                      <Option key={entite.id} value={entite.id}>{entite.libele}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EntiteOrganisationTab;
