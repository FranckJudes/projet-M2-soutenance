import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Typography,
  Modal,
  Tag,
  Breadcrumb,
  Tooltip
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HomeOutlined,
  SearchOutlined,
  EyeOutlined
} from "@ant-design/icons";
import FormService from "../../../services/FormService";
import MetadataService from "../../../services/MetadataService";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

export default function ListForm() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    
    const [forms, setForms] = useState([]);
    const [metadatas, setMetadatas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingForm, setEditingForm] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [viewingForm, setViewingForm] = useState(null);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const response = await FormService.getAllForms();
            if (response.data && response.data.success && response.data.data) {
                setForms(response.data.data);
            } else {
                const errorMsg = response.data?.message || t("Error loading forms");
                message.error(errorMsg);
            }
        } catch (error) {
            console.error("Error loading forms:", error);
            const errorMsg = error.response?.data?.message || t("Error loading forms");
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadatas = async () => {
        try {
            const response = await MetadataService.getAllMetadata();
            if (response.data && response.data.success && response.data.data) {
                setMetadatas(response.data.data);
            }
        } catch (error) {
            console.error("Error loading metadatas:", error);
        }
    };

    useEffect(() => {
        fetchForms();
        fetchMetadatas();
    }, []);
    
    // Refresh metadata when component becomes visible (tab switching)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Only refresh metadata when tab becomes visible
                fetchMetadatas();
            }
        };
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Also listen for focus events to catch tab switches within the same window
        const handleFocus = () => {
            fetchMetadatas();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);
    
    // Additional effect to refresh metadata when modal opens
    useEffect(() => {
        if (isModalVisible) {
            fetchMetadatas();
        }
    }, [isModalVisible]);
    
    const showModal = (formData = null) => {
        if (formData) {
            setEditingForm(formData);
            form.setFieldsValue({
                nom: formData.nom,
                description: formData.description || "",
                metadataIds: formData.metadatas ? formData.metadatas.map(m => m.id) : []
            });
        } else {
            setEditingForm(null);
            form.setFieldsValue({
                nom: "",
                description: "",
                metadataIds: []
            });
        }
        setIsModalVisible(true);
    };
    
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingForm(null);
    };

    const handleSubmit = async (values) => {
        try {
            let response;
            if (editingForm) {
                response = await FormService.updateForm(editingForm.id, values);
            } else {
                response = await FormService.createForm(values);
            }
            
            if (response.data && response.data.success) {
                message.success(response.data.message || t(editingForm ? "Form successfully updated" : "Form successfully created"));
                setIsModalVisible(false);
                await fetchForms();
                form.resetFields();
                setEditingForm(null);
            } else {
                const errorMsg = response.data?.message || t("Error saving form");
                message.error(errorMsg);
            }
        } catch (error) {
            console.error("Error saving form:", error);
            const errorMsg = error.response?.data?.message || t("Error saving form");
            message.error(errorMsg);
        }
    };
    
    const handleDelete = async (id) => {
        try {
            const response = await FormService.deleteForm(id);
            if (response.data && response.data.success) {
                message.success(response.data.message || t("Form successfully deleted"));
                await fetchForms();
            } else {
                const errorMsg = response.data?.message || t("Error deleting form");
                message.error(errorMsg);
            }
        } catch (error) {
            console.error("Error deleting form:", error);
            const errorMsg = error.response?.data?.message || t("Error deleting form");
            message.error(errorMsg);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            await fetchForms();
            return;
        }
        
        setLoading(true);
        try {
            const response = await FormService.searchForms(searchTerm);
            if (response.data && response.data.success && response.data.data) {
                setForms(response.data.data);
            } else {
                const errorMsg = response.data?.message || t("Error searching forms");
                message.error(errorMsg);
            }
        } catch (error) {
            console.error("Error searching forms:", error);
            const errorMsg = error.response?.data?.message || t("Error searching forms");
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const showViewModal = (formData) => {
        setViewingForm(formData);
        setViewModalVisible(true);
    };

    const handleViewCancel = () => {
        setViewModalVisible(false);
        setViewingForm(null);
    };
    
    const columns = [
        {
            title: t("ID"),
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
            width: 80
        },
        {
            title: t("Form Name"),
            dataIndex: "nom",
            key: "nom",
            sorter: (a, b) => a.nom.localeCompare(b.nom),
        },
        {
            title: t("Description"),
            dataIndex: "description",
            key: "description",
            render: (text) => text || <span style={{ color: '#999' }}>{t("No description")}</span>,
            ellipsis: {
                showTitle: false,
            },
        },
        {
            title: t("Metadata Count"),
            dataIndex: "metadataCount",
            key: "metadataCount",
            render: (count) => (
                <Tag color={count > 0 ? "blue" : "default"}>
                    {count} {t("metadata(s)")}
                </Tag>
            ),
            sorter: (a, b) => a.metadataCount - b.metadataCount,
            width: 150
        },
        {
            title: t("Actions"),
            key: "actions",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={t("View details")}>
                        <Button 
                            type="default" 
                            icon={<EyeOutlined />} 
                            size="small"
                            onClick={() => showViewModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title={t("Edit form")}>
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            size="small"
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title={t("Are you sure you want to delete this form?")}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t("Yes")}
                        cancelText={t("No")}
                    >
                        <Tooltip title={t("Delete form")}>
                            <Button 
                                type="primary" 
                                danger 
                                icon={<DeleteOutlined />} 
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
            width: 150
        },
    ];

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item>{t("Forms")}</Breadcrumb.Item>
                <Breadcrumb.Item>{t("Form Management")}</Breadcrumb.Item>
            </Breadcrumb>
            
            <Card 
                title={<Title level={4}>{t("Form Management")}</Title>}
                extra={
                    <Space>
                        <Input
                            placeholder={t("Search forms...")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined />}
                            style={{ width: 200 }}
                        />
                        <Button 
                            type="default" 
                            icon={<SearchOutlined />} 
                            onClick={handleSearch}
                        >
                            {t("Search")}
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => showModal()}
                        >
                            {t("Add Form")}
                        </Button>
                    </Space>
                }
            >
                <Table 
                    dataSource={forms} 
                    columns={columns} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ 
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} ${t("of")} ${total} ${t("forms")}`
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* Create/Edit Form Modal */}
            <Modal
                title={editingForm ? t("Edit Form") : t("Add New Form")}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        nom: "",
                        description: "",
                        metadataIds: []
                    }}
                >
                    <Form.Item
                        name="nom"
                        label={t("Form Name")}
                        rules={[{ required: true, message: t("Please enter form name") }]}
                    >
                        <Input placeholder={t("Enter form name")} />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label={t("Description")}
                    >
                        <TextArea rows={3} placeholder={t("Enter form description")} />
                    </Form.Item>
                    
                    <Form.Item
                        name="metadataIds"
                        label={t("Select Metadata")}
                        rules={[{ required: true, message: t("Please select at least one metadata") }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder={t("Select metadata for this form")}
                            allowClear
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {metadatas.map(metadata => (
                                <Option key={metadata.id} value={metadata.id}>
                                    {metadata.nom} - {metadata.libelle}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item>
                        <Space style={{ float: 'right' }}>
                            <Button onClick={handleCancel}>
                                {t("Cancel")}
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingForm ? t("Update") : t("Create")}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Form Details Modal */}
            <Modal
                title={t("Form Details")}
                open={viewModalVisible}
                onCancel={handleViewCancel}
                footer={[
                    <Button key="close" onClick={handleViewCancel}>
                        {t("Close")}
                    </Button>
                ]}
                width={600}
            >
                {viewingForm && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>{t("Form Name")}:</strong> {viewingForm.nom}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>{t("Description")}:</strong> {viewingForm.description || t("No description")}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>{t("Metadata Count")}:</strong> {viewingForm.metadataCount}
                        </div>
                        {viewingForm.metadatas && viewingForm.metadatas.length > 0 && (
                            <div>
                                <strong>{t("Associated Metadata")}:</strong>
                                <div style={{ marginTop: 8 }}>
                                    {viewingForm.metadatas.map(metadata => (
                                        <Tag key={metadata.id} color="blue" style={{ marginBottom: 4 }}>
                                            {metadata.nom} - {metadata.libelle}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                        )}
                        {viewingForm.createdAt && (
                            <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
                                <strong>{t("Created")}:</strong> {new Date(viewingForm.createdAt).toLocaleString()}<br/>
                                <strong>{t("Updated")}:</strong> {new Date(viewingForm.updatedAt).toLocaleString()}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}