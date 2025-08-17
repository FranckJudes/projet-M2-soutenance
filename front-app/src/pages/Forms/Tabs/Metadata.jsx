import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  message,
  Typography,
  Modal,
  DatePicker,
  Switch,
  Breadcrumb
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HomeOutlined
} from "@ant-design/icons";
import MetadataService from "../../../services/MetadataService";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

export default function Metadata() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    
    const [metadatas, setMetadatas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMetadata, setEditingMetadata] = useState(null);
    const [fieldVisibility, setFieldVisibility] = useState({
        masqueSaisie: false,
        longeur: false,
        conceptLie: false,
        domaineValeurLie: false,
        valeurDefaut: false,
        formatDate: false,
        champIncrementiel: false,
    });

    const fetchMetadatas = async () => {
        setLoading(true);
        try {
            const response = await MetadataService.getAllMetadata();
            if (response.data && response.data.success && response.data.data) {
                setMetadatas(response.data.data);
            } else {
                const errorMsg = response.data?.message || t("Error loading metadata");
                message.error(errorMsg);
            }
        } catch (error) {
            console.error("Error loading metadata:", error);
            const errorMsg = error.response?.data?.message || t("Error loading metadata");
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadatas();
    }, []);
    
    const showModal = (metadata = null) => {
        if (metadata) {
            setEditingMetadata(metadata);
            form.setFieldsValue({
                nom: metadata.nom,
                libelle: metadata.libelle,
                question: metadata.question,
                typeChamp: metadata.typeChamp || metadata.type_champ,
                masqueSaisie: metadata.masqueSaisie || metadata.masque_saisie,
                longeur: metadata.longeur,
                conceptLie: metadata.conceptLie || metadata.concept_lie,
                domaineValeurLie: metadata.domaineValeurLie || metadata.domaine_valeur_lie,
                valeurDefaut: metadata.valeurDefaut || metadata.valeur_defaut,
                formatDate: metadata.formatDate || metadata.format_date,
                champIncrementiel: metadata.champIncrementiel || metadata.champ_incrementiel
            });
            handleTypeChange(metadata.typeChamp || metadata.type_champ);
        } else {
            setEditingMetadata(null);
            form.resetFields();
            setFieldVisibility({
                masqueSaisie: false,
                longeur: false,
                conceptLie: false,
                domaineValeurLie: false,
                valeurDefaut: false,
                formatDate: false,
                champIncrementiel: false,
            });
        }
        setIsModalVisible(true);
    };
    
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingMetadata(null);
    };

    const handleSubmit = async (values) => {
        try {
            let response;
            if (editingMetadata) {
                response = await MetadataService.updateMetadata(editingMetadata.id, values);
            } else {
                response = await MetadataService.createMetadata(values);
            }
            
            if (response.data && response.data.success) {
                message.success(response.data.message || t(editingMetadata ? "Metadata successfully updated" : "Metadata successfully created"));
                setIsModalVisible(false);
                await fetchMetadatas();
                form.resetFields();
                setEditingMetadata(null);
            } else {
                const errorMsg = response.data?.message || t("Error saving metadata");
                message.error(errorMsg);
            }
        } catch (error) {
            console.error("Error saving metadata:", error);
            const errorMsg = error.response?.data?.message || t("Error saving metadata");
            message.error(errorMsg);
        }
    };
    
    const handleDelete = async (id) => {
        try {
            const response = await MetadataService.deleteMetadata(id);
            if (response.data && response.data.success) {
                message.success(response.data.message || t("Metadata successfully deleted"));
                await fetchMetadatas();
            } else {
                const errorMsg = response.data?.message || t("Error deleting metadata");
                message.error(errorMsg);
            }
        } catch (error) {
            console.error("Error deleting metadata:", error);
            const errorMsg = error.response?.data?.message || t("Error deleting metadata");
            message.error(errorMsg);
        }
    };
    
    const handleTypeChange = (value) => {
        const visibility = {
            masqueSaisie: ["text", "number"].includes(value),
            longeur: ["text", "number"].includes(value),
            conceptLie: ["selection", "selection_multiple"].includes(value),
            domaineValeurLie: ["selection", "selection_multiple"].includes(value),
            valeurDefaut: false,
            formatDate: value === "date",
            champIncrementiel: value === "incrementiel"
        };
        
        setFieldVisibility(visibility);
    };

    const typeOptions = [
        { value: "text", label: t("Text") },
        { value: "number", label: t("Number") },
        { value: "date", label: t("Date") },
        { value: "selection", label: t("Selection") },
        { value: "selection_multiple", label: t("Multiple Selection") },
        { value: "logique", label: t("Boolean") },
        { value: "incrementiel", label: t("Incremental") }
    ];
    
    const optionsConceptLie = [
        { value: "Users", label: t("Users") },
        { value: "Domaine Lies", label: t("Domaine Lies") },
        { value: "Entites", label: t("Entites") }
    ];

    const optionsDomaineValeur = [
        { value: "domaine1", label: t("domaine1") },
        { value: "domaine2", label: t("domaine2") },
        { value: "domaine3", label: t("domaine3") }
    ];
    
    const columns = [
        {
            title: t("ID"),
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: t("Name"),
            dataIndex: "nom",
            key: "nom",
            sorter: (a, b) => a.nom.localeCompare(b.nom),
        },
        {
            title: t("Label"),
            dataIndex: "libelle",
            key: "libelle",
        },
        {
            title: t("Field Type"),
            dataIndex: "typeChamp",
            key: "typeChamp",
            render: (type) => {
                const option = typeOptions.find(opt => opt.value === type);
                return option ? option.label : type;
            }
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
                        title={t("Are you sure you want to delete this metadata?")}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t("Yes")}
                        cancelText={t("No")}
                    >
                        <Button 
                            type="primary" 
                            danger 
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
    
    const formatDateOptions = [
        { value: "normal_date", label: t("Normal Date") },
        { value: "plage_date", label: t("Date Range") },
        { value: "time_date", label: t("Time") },
        { value: "mois_annee", label: t("Month/Year") }
    ];
    
    const booleanOptions = [
        { value: "true", label: t("True/False") },
        { value: "false", label: t("Yes/No") }
    ];

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item>{t("Forms")}</Breadcrumb.Item>
                <Breadcrumb.Item>{t("Metadata")}</Breadcrumb.Item>
            </Breadcrumb>
            
            <Card 
                title={<Title level={4}>{t("Metadata Management")}</Title>}
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => showModal()}
                    >
                        {t("Add Metadata")}
                    </Button>
                }
            >
                <Table 
                    dataSource={metadatas} 
                    columns={columns} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
            
            <Modal
                title={editingMetadata ? t("Edit Metadata") : t("Add New Metadata")}
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
                        libelle: "",
                        question: "",
                        typeChamp: "",
                        masqueSaisie: "",
                        longeur: 0,
                        conceptLie: null,
                        domaineValeurLie: null,
                        valeurDefaut: "",
                        formatDate: "",
                        champIncrementiel: ""
                    }}
                >
                    <Form.Item
                        name="nom"
                        label={t("Property Name")}
                        rules={[{ required: true, message: t("Please enter property name") }]}
                    >
                        <Input placeholder={t("Enter property name")} />
                    </Form.Item>
                    
                    <Form.Item
                        name="libelle"
                        label={t("Label")}
                        rules={[{ required: true, message: t("Please enter label") }]}
                    >
                        <Input placeholder={t("Enter label")} />
                    </Form.Item>
                    
                    <Form.Item
                        name="question"
                        label={t("Question")}
                        rules={[{ required: true, message: t("Please enter question") }]}
                    >
                        <TextArea rows={2} placeholder={t("Enter question")} />
                    </Form.Item>
                    
                    <Form.Item
                        name="typeChamp"
                        label={t("Field Type")}
                        rules={[{ required: true, message: t("Please select field type") }]}
                    >
                        <Select 
                            placeholder={t("Select field type")} 
                            onChange={handleTypeChange}
                        >
                            {typeOptions.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    {fieldVisibility.masqueSaisie && (
                        <Form.Item
                            name="masqueSaisie"
                            label={t("Input Mask")}
                        >
                            <Input placeholder={t("Enter input mask")} />
                        </Form.Item>
                    )}
                    
                    {fieldVisibility.longeur && (
                        <Form.Item
                            name="longeur"
                            label={t("Length")}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    )}
                    
                    {fieldVisibility.conceptLie && (
                        <Form.Item
                            name="conceptLie"
                            label={t("Linked Concept")}
                            rules={[{ required: true, message: t("Please select linked concept") }]}
                        >
                            <Select placeholder={t("Select linked concept")} allowClear>
                                {optionsConceptLie.map(option => (
                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    
                    {fieldVisibility.domaineValeurLie && (
                        <Form.Item
                            name="domaineValeurLie"
                            label={t("Value Domain")}
                            rules={[{ required: true, message: t("Please select value domain") }]}
                        >
                            <Select placeholder={t("Select value domain")} allowClear>
                                {optionsDomaineValeur.map(option => (
                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    
                    {fieldVisibility.formatDate && (
                        <Form.Item
                            name="formatDate"
                            label={t("Date Format")}
                        >
                            <Select placeholder={t("Select date format")}>
                                {formatDateOptions.map(option => (
                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    
                    {fieldVisibility.champIncrementiel && (
                        <Form.Item
                            name="champIncrementiel"
                            label={t("Incremental Value")}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    )}
                    
                    <Form.Item>
                        <Space style={{ float: 'right' }}>
                            <Button onClick={handleCancel}>
                                {t("Cancel")}
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingMetadata ? t("Update") : t("Create")}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

