import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  InputNumber, 
  DatePicker, 
  Typography, 
  Divider, 
  Tag,
  Timeline,
  Comment,
  Avatar,
  List,
  Tabs
} from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  CommentOutlined, 
  SendOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BellOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const TaskDetailModal = ({ visible, task, onClose, onUpdate }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task && visible) {
      form.setFieldsValue({
        name: task.name,
        description: task.description,
        type: task.type,
        priority: task.priority,
        status: task.status,
        duration: task.duration,
        dueDate: task.dueDate ? moment(task.dueDate) : null,
        assignedUsers: task.assignedUsers,
        assignedRoles: task.assignedRoles,
      });
    }
  }, [task, visible, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Format values
      const updatedTask = {
        ...task,
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
      };
      
      // Call API to update task
      const response = await fetch(`http://localhost:8100/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Return updated task to parent component
      onUpdate(updatedTask);
      
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    
    try {
      setLoading(true);
      
      // Call API to add comment
      const response = await fetch(`http://localhost:8100/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          userId: 'current-user', // This would be the current user's ID
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      // Clear comment input
      setComment('');
      
      // Refresh task data
      const updatedTaskResponse = await fetch(`http://localhost:8100/tasks/${task.id}`);
      if (!updatedTaskResponse.ok) {
        throw new Error('Failed to refresh task data');
      }
      
      const updatedTask = await updatedTaskResponse.json();
      onUpdate(updatedTask);
      
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'TO_DO':
        return 'blue';
      case 'IN_PROGRESS':
        return 'orange';
      case 'REVIEW':
        return 'purple';
      case 'DONE':
        return 'green';
      default:
        return 'default';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'orange';
      case 'LOW':
        return 'green';
      default:
        return 'default';
    }
  };
  
  if (!task) return null;
  
  return (
    <Modal
      title={`Tâche: ${task.name}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Fermer
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          disabled={activeTab !== '1'}
        >
          Enregistrer les modifications
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Détails
            </span>
          } 
          key="1"
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <Tag color={getStatusColor(task.status)}>
                  {task.status === 'TO_DO' ? 'À faire' : 
                   task.status === 'IN_PROGRESS' ? 'En cours' : 
                   task.status === 'REVIEW' ? 'En révision' : 'Terminé'}
                </Tag>
                <Tag color={getPriorityColor(task.priority)}>
                  {task.priority === 'HIGH' ? 'Priorité haute' : 
                   task.priority === 'MEDIUM' ? 'Priorité moyenne' : 'Priorité basse'}
                </Tag>
              </div>
              <Text type="secondary">
                ID: {task.id}
              </Text>
            </div>
            
            <Form.Item
              name="name"
              label="Nom de la tâche"
              rules={[{ required: true, message: 'Veuillez entrer un nom de tâche' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} />
            </Form.Item>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="type"
                label="Type"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
              >
                <Select>
                  <Option value="information">Information</Option>
                  <Option value="authorization">Autorisation</Option>
                  <Option value="planning">Planification</Option>
                  <Option value="resource">Ressource</Option>
                  <Option value="notification">Notification</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="priority"
                label="Priorité"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Veuillez sélectionner une priorité' }]}
              >
                <Select>
                  <Option value="HIGH">Haute</Option>
                  <Option value="MEDIUM">Moyenne</Option>
                  <Option value="LOW">Basse</Option>
                </Select>
              </Form.Item>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item
                name="status"
                label="Statut"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Veuillez sélectionner un statut' }]}
              >
                <Select>
                  <Option value="TO_DO">À faire</Option>
                  <Option value="IN_PROGRESS">En cours</Option>
                  <Option value="REVIEW">En révision</Option>
                  <Option value="DONE">Terminé</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="duration"
                label="Durée estimée (heures)"
                style={{ flex: 1 }}
                rules={[{ required: true, message: 'Veuillez entrer une durée' }]}
              >
                <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            
            <Form.Item
              name="dueDate"
              label="Date d'échéance"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="assignedUsers"
              label="Utilisateurs assignés"
            >
              <Select mode="multiple" placeholder="Sélectionner des utilisateurs">
                <Option value="user1">John Doe</Option>
                <Option value="user2">Jane Smith</Option>
                <Option value="user3">Robert Johnson</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="assignedRoles"
              label="Rôles assignés"
            >
              <Select mode="multiple" placeholder="Sélectionner des rôles">
                <Option value="admin">Administrateur</Option>
                <Option value="manager">Manager</Option>
                <Option value="employee">Employé</Option>
                <Option value="guest">Invité</Option>
              </Select>
            </Form.Item>
            
            {task.customFields && task.customFields.length > 0 && (
              <>
                <Divider orientation="left">Champs personnalisés</Divider>
                
                {task.customFields.map((field, index) => (
                  <Form.Item
                    key={index}
                    name={['customFieldValues', field.key]}
                    label={field.key}
                    rules={[{ required: field.required, message: `Ce champ est requis` }]}
                  >
                    {field.type === 'text' ? (
                      <Input />
                    ) : field.type === 'number' ? (
                      <InputNumber style={{ width: '100%' }} />
                    ) : field.type === 'date' ? (
                      <DatePicker style={{ width: '100%' }} />
                    ) : field.type === 'boolean' ? (
                      <Select>
                        <Option value={true}>Oui</Option>
                        <Option value={false}>Non</Option>
                      </Select>
                    ) : field.type === 'select' ? (
                      <Select>
                        {field.options && field.options.map(option => (
                          <Option key={option} value={option}>{option}</Option>
                        ))}
                      </Select>
                    ) : (
                      <Input />
                    )}
                  </Form.Item>
                ))}
              </>
            )}
          </Form>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CommentOutlined />
              Commentaires
            </span>
          } 
          key="2"
        >
          <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px' }}>
            {task.comments && task.comments.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={task.comments}
                renderItem={item => (
                  <Comment
                    author={<Text strong>{item.userName}</Text>}
                    avatar={<Avatar icon={<UserOutlined />} />}
                    content={<p>{item.content}</p>}
                    datetime={<span>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</span>}
                  />
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">Aucun commentaire pour cette tâche</Text>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              placeholder="Ajouter un commentaire..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              onPressEnter={handleCommentSubmit}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleCommentSubmit}
              loading={loading}
            />
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              Historique
            </span>
          } 
          key="3"
        >
          {task.history && task.history.length > 0 ? (
            <Timeline>
              {task.history.map((event, index) => (
                <Timeline.Item key={index}>
                  <div>
                    <Text strong>{event.action}</Text>
                    <div>
                      <Text type="secondary">
                        {moment(event.timestamp).format('DD/MM/YYYY HH:mm')} par {event.userName}
                      </Text>
                    </div>
                    {event.details && <div>{event.details}</div>}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">Aucun historique disponible</Text>
            </div>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default TaskDetailModal;
