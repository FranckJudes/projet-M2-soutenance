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
  AppstoreOutlined,
  EyeOutlined 
} from "@ant-design/icons";
import DomaineValeurService from "../../services/DomaineValeurService";
import ValeurService from "../../services/ValeurService";
const { TextArea } = Input;
const { Title } = Typography;

function Domaine () {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const [domaines, setDomaines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDomaine, setEditingDomaine] = useState(null);
  const [valeursModalVisible, setValeursModalVisible] = useState(false);
  const [selectedDomaine, setSelectedDomaine] = useState(null);
  const [valeurs, setValeurs] = useState([]);
  const [valeursLoading, setValeursLoading] = useState(false);
  const [valeurForm] = Form.useForm();
  const [valeurModalVisible, setValeurModalVisible] = useState(false);
  const [editingValeur, setEditingValeur] = useState(null);

  const fetchDomaines = async () => {
    setLoading(true);
    try {
      const response = await DomaineValeurService.getAllDomaineValeurs();
      if (response.data && response.data.success && response.data.data) {
        setDomaines(response.data.data);
      } else {
        const errorMsg = response.data?.message || t("Error loading domain values");
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error loading domain values:", error);
      const errorMsg = error.response?.data?.message || t("Error loading domain values");
      message.error(errorMsg);
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
        description: domaine.description || "",
        type: domaine.type || "1"
      });
    } else {
      setEditingDomaine(null);
      form.setFieldsValue({
        libele: "",
        description: "",
        type: "1"
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingDomaine(null);
  };

  // === VALEUR MANAGEMENT FUNCTIONS ===
  
  const showValeursModal = async (domaine) => {
    setSelectedDomaine(domaine);
    setValeursModalVisible(true);
    await fetchValeurs(domaine.id);
  };

  const fetchValeurs = async (domaineValeurId) => {
    setValeursLoading(true);
    try {
      const response = await ValeurService.getValeursByDomaineValeurId(domaineValeurId);
      if (response.data && response.data.success && response.data.data) {
        setValeurs(response.data.data);
      } else {
        const errorMsg = response.data?.message || t("Error loading values");
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error loading values:", error);
      const errorMsg = error.response?.data?.message || t("Error loading values");
      message.error(errorMsg);
    } finally {
      setValeursLoading(false);
    }
  };

  const handleValeursModalCancel = () => {
    setValeursModalVisible(false);
    setSelectedDomaine(null);
    setValeurs([]);
  };

  const showValeurModal = (valeur = null) => {
    if (valeur) {
      setEditingValeur(valeur);
      valeurForm.setFieldsValue({
        libele: valeur.libele,
        description: valeur.description || ""
      });
    } else {
      setEditingValeur(null);
      valeurForm.setFieldsValue({
        libele: "",
        description: ""
      });
    }
    setValeurModalVisible(true);
  };

  const handleValeurCancel = () => {
    setValeurModalVisible(false);
    valeurForm.resetFields();
    setEditingValeur(null);
  };

  const handleValeurDelete = async (id) => {
    try {
      const response = await ValeurService.deleteValeur(id);
      if (response.data && response.data.success) {
        message.success(response.data.message || t("Value successfully deleted"));
        await fetchValeurs(selectedDomaine.id);
      } else {
        const errorMsg = response.data?.message || t("Error deleting value");
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error deleting value:", error);
      const errorMsg = error.response?.data?.message || t("Error deleting value");
      message.error(errorMsg);
    }
  };

  const handleValeurSubmit = async (values) => {
    try {
      const payload = {
        libele: (values.libele || '').trim(),
        description: typeof values.description === 'string' ? values.description.trim() : null,
        // Coerce to number to match backend Long type and avoid serialization issues
        domaineValeurId: selectedDomaine ? Number(selectedDomaine.id) : undefined,
        // Laisser code et ordre non définis pour permettre l'auto-génération côté backend
      };
      // Sécurité: supprimer les clés undefined
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
      
      let response;
      if (editingValeur) {
        response = await ValeurService.updateValeur(editingValeur.id, payload);
      } else {
        response = await ValeurService.createValeur(payload);
      }
      
      if (response.data && response.data.success) {
        message.success(response.data.message || t(editingValeur ? "Value successfully updated" : "Value successfully created"));
        setValeurModalVisible(false);
        await fetchValeurs(selectedDomaine.id);
        valeurForm.resetFields();
        setEditingValeur(null);
      } else {
        const errorMsg = response.data?.message || t("Error saving value");
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving value:", error);
      const errorMsg = error.response?.data?.message || t("Error saving value");
      message.error(errorMsg);
    }
  };

  const handleToggleValeurStatus = async (id) => {
    try {
      const response = await ValeurService.toggleValeurStatus(id);
      if (response.data && response.data.success) {
        message.success(response.data.message || t("Status changed successfully"));
        await fetchValeurs(selectedDomaine.id);
      } else {
        const errorMsg = response.data?.message || t("Error changing status");
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error changing status:", error);
      const errorMsg = error.response?.data?.message || t("Error changing status");
      message.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    try {
      // 1) Récupérer toutes les valeurs du domaine et tenter de les supprimer
      const listRes = await ValeurService.getValeursByDomaineValeurId(id);
      const valeursToDelete = (listRes.data && listRes.data.success && Array.isArray(listRes.data.data))
        ? listRes.data.data
        : [];

      if (valeursToDelete.length > 0) {
        // Supprimer toutes les valeurs avant de supprimer le domaine
        const deletionResults = await Promise.allSettled(
          valeursToDelete.map(v => ValeurService.deleteValeur(v.id))
        );
        const failed = deletionResults.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          message.warning(t('Some values could not be deleted; retrying domain deletion'));
        }
      }

      // 2) Supprimer le domaine
      const response = await DomaineValeurService.deleteDomaineValeur(id);
      if (response.data && response.data.success) {
        message.success(response.data.message || t("Domain value successfully deleted"));
        fetchDomaines();
      } else {
        const errorMsg = response.data?.message || t("Error deleting domain value");
        message.error(errorMsg);
      }
    } catch (error) {
      // Si la suppression directe échoue (contrainte FK), tenter un fallback: supprimer valeurs puis re-essayer
      const isConstraint = Boolean(error?.response?.data) || String(error?.message || '').toLowerCase().includes('constraint');
      if (!isConstraint) {
        console.error('Error deleting domain value:', error);
      }
      try {
        const listRes = await ValeurService.getValeursByDomaineValeurId(id);
        const valeursToDelete = (listRes.data && listRes.data.success && Array.isArray(listRes.data.data))
          ? listRes.data.data
          : [];

        if (valeursToDelete.length > 0) {
          await Promise.allSettled(valeursToDelete.map(v => ValeurService.deleteValeur(v.id)));
        }

        const retry = await DomaineValeurService.deleteDomaineValeur(id);
        if (retry.data && retry.data.success) {
          message.success(retry.data.message || t('Domain value successfully deleted'));
          fetchDomaines();
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback deletion failed:', fallbackErr);
      }
      const errorMsg = error.response?.data?.message || t('Error deleting domain value');
      message.error(errorMsg);
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Assurez-vous que le type est défini
      const payload = {
        libele: values.libele,
        description: values.description,
        type: values.type || "1"
      };
      
      let response;
      if (editingDomaine) {
        response = await DomaineValeurService.updateDomaineValeur(editingDomaine.id, payload);
      } else {
        response = await DomaineValeurService.createDomaineValeur(payload);
      }
      
      if (response.data && response.data.success) {
        message.success(response.data.message || t(editingDomaine ? "Domain value successfully updated" : "Domain value successfully created"));
        setIsModalVisible(false);
        fetchDomaines();
        form.resetFields();
        setEditingDomaine(null);
      } else {
        const errorMsg = response.data?.message || t("Error saving domain value");
        message.error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving domain value:", error);
      const errorMsg = error.response?.data?.message || t("Error saving domain value");
      message.error(errorMsg);
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
          <Button 
            type="default" 
            icon={<EyeOutlined />} 
            onClick={() => showValeursModal(record)}
            title={t("View values")}
          >
            {t("Values")}
          </Button>
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
            rules={[{ required: false, message: t("Please enter the description") }]}
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

      {/* Valeurs Management Modal */}
      <Modal
        title={`${t("Values")} - ${selectedDomaine?.libele || ""}`}
        open={valeursModalVisible}
        onCancel={handleValeursModalCancel}
        footer={null}
        width={1000}
      >
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showValeurModal()}
          >
            {t("Add Value")}
          </Button>
        </div>
        
        <Table 
          columns={[

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
              render: (text) => text || <span style={{ color: '#999' }}>{t("No description")}</span>
            },

            {
              title: t("Actions"),
              key: "actions",
              render: (_, record) => (
                <Space size="small">
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={() => showValeurModal(record)}
                  />
                  <Popconfirm
                    title={t("Are you sure you want to delete this value?")}
                    onConfirm={() => handleValeurDelete(record.id)}
                    okText={t("Yes")}
                    cancelText={t("No")}
                  >
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </Space>
              ),
            }
          ]}
          dataSource={valeurs} 
          rowKey="id" 
          loading={valeursLoading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>

      {/* Valeur Create/Edit Modal */}
      <Modal
        title={editingValeur ? t("Edit Value") : t("Add Value")}
        open={valeurModalVisible}
        onCancel={handleValeurCancel}
        footer={null}
        width={600}
      >
        <Form
          form={valeurForm}
          layout="vertical"
          onFinish={handleValeurSubmit}
          initialValues={{
            libele: "",
            description: ""
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
          >
            <TextArea rows={3} placeholder={t("Enter description")} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingValeur ? t("Update") : t("Create")}
            </Button>
            <Button onClick={handleValeurCancel}>
              {t("Cancel")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Main>
  );
};

export default Domaine;
