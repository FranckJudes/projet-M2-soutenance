import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Main from "../../layout/Main";
import { 
  Card, 
  Table, 
  Button, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  message, 
  Typography, 
  Breadcrumb as AntBreadcrumb, 
  Modal
} from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  HomeOutlined, 
  AppstoreOutlined 
} from "@ant-design/icons";
import DomaineValeurService from "../../services/DomaineValeurService";
const { TextArea } = Input;
const { Title } = Typography;

export default function Domaine () {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDomaine, setEditingDomaine] = useState(null);

  const fetchDomaines = async () => {
    setLoading(true);
    try {
      const response = await DomaineValeurService.getAllDomaineValeurs();
      if (response.data && response.data.data) {
        setDomaines(response.data.data);
      } else {
        message.error(t("Error loading domain values"));
      }
    } catch (error) {
      console.error("Error loading domain values:", error);
      message.error(t("Error loading domain values"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomaines();
  }, []);

  const showModal = (domaine = null) => {
    if (domaine) {
      setEditingDomaine(domaine);
      form.setFieldsValue({
        libele: domaine.libele,
        description: domaine.description,
        type: domaine.type || "1"
      });
    } else {
      setEditingDomaine(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingDomaine(null);
  };

  const handleDelete = async (id) => {
    try {
      await DomaineValeurService.deleteDomaineValeur(id);
      message.success(t("Domain value successfully deleted"));
      fetchDomaines();
    } catch (error) {
      console.error("Error deleting domain value:", error);
      message.error(t("Error deleting domain value"));
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingDomaine) {
        await DomaineValeurService.updateDomaineValeur(editingDomaine.id, values);
        message.success(t("Domain value successfully updated"));
      } else {
        await DomaineValeurService.createDomaineValeur(values);
        message.success(t("Domain value successfully created"));
      }
      setIsModalVisible(false);
      fetchDomaines();
      form.resetFields();
      setEditingDomaine(null);
    } catch (error) {
      console.error("Error saving domain value:", error);
      message.error(t("Error saving domain value"));
    }
  };

  const columns = [
    {
      title: t("ID"),
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t("Name"),
      dataIndex: "libele",
      key: "libele",
      sorter: (a, b) => a.libele.localeCompare(b.libele),
    },
    {
      title: t("Description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("Actions"),
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title={t("Are you sure you want to delete this domain value?")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("Yes")}
            cancelText={t("No")}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Main>
      <div style={{ marginBottom: 16 }}>
        <AntBreadcrumb>
          <AntBreadcrumb.Item href="#">
            <HomeOutlined /> {t("Home")}
          </AntBreadcrumb.Item>
          <AntBreadcrumb.Item href="#">
            <AppstoreOutlined /> {t("Admin")}
          </AntBreadcrumb.Item>
          <AntBreadcrumb.Item>{t("Domain Values")}</AntBreadcrumb.Item>
        </AntBreadcrumb>
      </div>
      
      <Card 
        title={<Title level={4}>{t("Domain Values Management")}</Title>}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            {t("Add Domain Value")}
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={domaines} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingDomaine ? t("Edit Domain Value") : t("Add Domain Value")}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            libele: "",
            description: "",
            type: "1"
          }}
        >
          <Form.Item
            name="libele"
            label={t("Name")}
            rules={[{ required: true, message: t("Please enter the name") }]}
          >
            <Input placeholder={t("Enter name")} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label={t("Description")}
            rules={[{ required: true, message: t("Please enter the description") }]}
          >
            <TextArea rows={4} placeholder={t("Enter description")} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingDomaine ? t("Update") : t("Create")}
            </Button>
            <Button onClick={handleCancel}>
              {t("Cancel")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
};
