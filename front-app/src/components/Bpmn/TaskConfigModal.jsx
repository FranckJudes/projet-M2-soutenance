import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, InputNumber, Space, Typography, Divider } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

const TaskConfigModal = ({ visible, task, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [taskType, setTaskType] = useState("information");
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    if (task && visible) {
      // Load task data into form
      form.setFieldsValue({
        name: task.name || "",
        type: task.type || "information",
        duration: task.duration || 0,
        assignedRoles: task.assignedRoles || [],
        assignedUsers: task.assignedUsers || [],
        description: task.description || "",
      });
      
      setTaskType(task.type || "information");
      setCustomFields(task.customFields || []);
    }
  }, [task, visible, form]);

  const handleTypeChange = (value) => {
    setTaskType(value);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", type: "text", required: false }]);
  };

  const removeCustomField = (index) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  const updateCustomField = (index, field, value) => {
    const updatedFields = [...customFields];
    updatedFields[index][field] = value;
    setCustomFields(updatedFields);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Combine form values with custom fields
      const updatedTask = {
        ...task,
        ...values,
        customFields,
      };
      
      onSave(updatedTask);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={`Configure Task: ${task?.name || ""}`}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Task Name"
          rules={[{ required: true, message: "Please enter a task name" }]}
        >
          <Input placeholder="Enter task name" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Task Type"
          rules={[{ required: true, message: "Please select a task type" }]}
        >
          <Select onChange={handleTypeChange}>
            <Option value="information">Information</Option>
            <Option value="authorization">Authorization</Option>
            <Option value="planning">Planning</Option>
            <Option value="resource">Resource</Option>
            <Option value="notification">Notification</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="duration"
          label="Estimated Duration (hours)"
          rules={[{ required: true, message: "Please enter estimated duration" }]}
        >
          <InputNumber min={0} step={0.5} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="assignedRoles"
          label="Assigned Roles"
        >
          <Select mode="multiple" placeholder="Select roles">
            <Option value="admin">Administrator</Option>
            <Option value="manager">Manager</Option>
            <Option value="employee">Employee</Option>
            <Option value="guest">Guest</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="assignedUsers"
          label="Assigned Users"
        >
          <Select mode="multiple" placeholder="Select users">
            <Option value="user1">John Doe</Option>
            <Option value="user2">Jane Smith</Option>
            <Option value="user3">Robert Johnson</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="Enter task description" />
        </Form.Item>

        <Divider />
        
        <Title level={5}>Custom Form Fields</Title>
        <Text type="secondary">
          Define custom fields that will be required when this task is executed
        </Text>
        
        {customFields.map((field, index) => (
          <Space key={index} style={{ display: "flex", marginBottom: 8 }} align="baseline">
            <Form.Item
              label="Field Name"
              required
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="Field name"
                value={field.key}
                onChange={(e) => updateCustomField(index, "key", e.target.value)}
              />
            </Form.Item>
            
            <Form.Item
              label="Type"
              required
              style={{ marginBottom: 0 }}
            >
              <Select
                value={field.type}
                onChange={(value) => updateCustomField(index, "type", value)}
                style={{ width: 120 }}
              >
                <Option value="text">Text</Option>
                <Option value="number">Number</Option>
                <Option value="date">Date</Option>
                <Option value="boolean">Yes/No</Option>
                <Option value="select">Dropdown</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label="Required"
              style={{ marginBottom: 0 }}
            >
              <Select
                value={field.required}
                onChange={(value) => updateCustomField(index, "required", value)}
                style={{ width: 80 }}
              >
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
            
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeCustomField(index)}
              danger
            />
          </Space>
        ))}
        
        <Form.Item>
          <Button
            type="dashed"
            onClick={addCustomField}
            icon={<PlusOutlined />}
            style={{ width: "100%", marginTop: 8 }}
          >
            Add Custom Field
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskConfigModal;
