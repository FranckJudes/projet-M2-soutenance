import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Typography, Button, Tag, Avatar, Tooltip, Spin, Empty, Select, Input } from 'antd';
import { 
  ClockCircleOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  PlusOutlined,
  FilterOutlined,
  SearchOutlined
} from '@ant-design/icons';
import TaskDetailModal from './TaskDetailModal';

const { Title, Text } = Typography;
const { Option } = Select;

const KanbanBoard = () => {
  const [columns, setColumns] = useState({
    'to-do': {
      id: 'to-do',
      title: 'À faire',
      taskIds: [],
      color: '#e6f7ff',
      borderColor: '#91d5ff'
    },
    'in-progress': {
      id: 'in-progress',
      title: 'En cours',
      taskIds: [],
      color: '#fff7e6',
      borderColor: '#ffd591'
    },
    'review': {
      id: 'review',
      title: 'En révision',
      taskIds: [],
      color: '#f9f0ff',
      borderColor: '#d3adf7'
    },
    'done': {
      id: 'done',
      title: 'Terminé',
      taskIds: [],
      color: '#f6ffed',
      borderColor: '#b7eb8f'
    }
  });
  
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processFilter, setProcessFilter] = useState('all');
  
  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        const response = await fetch('http://localhost:8100/tasks/user');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        
        // Transform data for Kanban board
        const taskMap = {};
        const columnMap = { ...columns };
        
        // Reset taskIds in all columns
        Object.keys(columnMap).forEach(colId => {
          columnMap[colId].taskIds = [];
        });
        
        // Populate tasks and columns
        data.forEach(task => {
          taskMap[task.id] = task;
          
          // Map status to column
          let columnId;
          switch(task.status) {
            case 'TO_DO':
              columnId = 'to-do';
              break;
            case 'IN_PROGRESS':
              columnId = 'in-progress';
              break;
            case 'REVIEW':
              columnId = 'review';
              break;
            case 'DONE':
              columnId = 'done';
              break;
            default:
              columnId = 'to-do';
          }
          
          columnMap[columnId].taskIds.push(task.id);
        });
        
        setTasks(taskMap);
        setColumns(columnMap);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  // Handle drag and drop
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Get source and destination columns
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    
    // Update columns
    const newSourceTaskIds = Array.from(sourceColumn.taskIds);
    newSourceTaskIds.splice(source.index, 1);
    
    const newDestTaskIds = Array.from(destColumn.taskIds);
    newDestTaskIds.splice(destination.index, 0, draggableId);
    
    // Create new column objects
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: newSourceTaskIds
    };
    
    const newDestColumn = {
      ...destColumn,
      taskIds: newDestTaskIds
    };
    
    // Update state
    setColumns({
      ...columns,
      [newSourceColumn.id]: newSourceColumn,
      [newDestColumn.id]: newDestColumn
    });
    
    // Map column IDs to task status
    const columnToStatus = {
      'to-do': 'TO_DO',
      'in-progress': 'IN_PROGRESS',
      'review': 'REVIEW',
      'done': 'DONE'
    };
    
    // Update task status in backend
    try {
      const response = await fetch(`http://localhost:8100/tasks/${draggableId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: columnToStatus[destination.droppableId]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update task in state
      setTasks({
        ...tasks,
        [draggableId]: {
          ...tasks[draggableId],
          status: columnToStatus[destination.droppableId]
        }
      });
      
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert changes on error
      setColumns({
        ...columns,
        [sourceColumn.id]: sourceColumn,
        [destColumn.id]: destColumn
      });
    }
  };
  
  // Open task detail modal
  const openTaskDetail = (taskId) => {
    setSelectedTask(tasks[taskId]);
    setIsDetailModalVisible(true);
  };
  
  // Filter tasks based on user selection and search term
  const getFilteredTasks = () => {
    const filteredTasks = { ...tasks };
    
    // Apply filters
    Object.keys(filteredTasks).forEach(taskId => {
      const task = filteredTasks[taskId];
      let visible = true;
      
      // User filter
      if (userFilter !== 'all' && !task.assignedUsers.includes(userFilter)) {
        visible = false;
      }
      
      // Process filter
      if (processFilter !== 'all' && task.processId !== processFilter) {
        visible = false;
      }
      
      // Search term
      if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        visible = false;
      }
      
      // Mark task as filtered
      task.filtered = !visible;
    });
    
    return filteredTasks;
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Get available users for filter
  const getUsers = () => {
    const users = new Set();
    Object.values(tasks).forEach(task => {
      if (task.assignedUsers) {
        task.assignedUsers.forEach(user => users.add(user));
      }
    });
    return Array.from(users);
  };
  
  // Get available processes for filter
  const getProcesses = () => {
    const processes = new Set();
    Object.values(tasks).forEach(task => {
      if (task.processId) {
        processes.add(task.processId);
      }
    });
    return Array.from(processes);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Title level={3}>Tableau Kanban des Tâches</Title>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Input
            placeholder="Rechercher une tâche"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
          />
          
          <Select
            placeholder="Filtrer par utilisateur"
            style={{ width: 180 }}
            value={userFilter}
            onChange={setUserFilter}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Tous les utilisateurs</Option>
            {getUsers().map(user => (
              <Option key={user} value={user}>{user}</Option>
            ))}
          </Select>
          
          <Select
            placeholder="Filtrer par processus"
            style={{ width: 180 }}
            value={processFilter}
            onChange={setProcessFilter}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Tous les processus</Option>
            {getProcesses().map(process => (
              <Option key={process} value={process}>{process}</Option>
            ))}
          </Select>
          
          <Button type="primary" icon={<PlusOutlined />}>
            Nouvelle Tâche
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', minHeight: 'calc(100vh - 200px)' }}>
            {Object.values(columns).map(column => (
              <div
                key={column.id}
                style={{
                  background: '#f5f5f5',
                  borderRadius: '6px',
                  width: '300px',
                  minWidth: '300px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: column.color,
                    borderBottom: `2px solid ${column.borderColor}`,
                    borderTopLeftRadius: '6px',
                    borderTopRightRadius: '6px'
                  }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    {column.title} ({column.taskIds.filter(id => !filteredTasks[id].filtered).length})
                  </Title>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: '8px',
                        flexGrow: 1,
                        minHeight: '100px',
                        backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {column.taskIds.length === 0 ? (
                        <Empty description="Aucune tâche" style={{ margin: '20px 0' }} />
                      ) : (
                        column.taskIds.map((taskId, index) => {
                          const task = filteredTasks[taskId];
                          
                          // Skip filtered tasks
                          if (task.filtered) return null;
                          
                          return (
                            <Draggable key={taskId} draggableId={taskId} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    marginBottom: '8px',
                                    borderLeft: `4px solid ${task.priority === 'HIGH' ? '#f5222d' : task.priority === 'MEDIUM' ? '#faad14' : '#52c41a'}`,
                                    backgroundColor: snapshot.isDragging ? '#fafafa' : 'white',
                                    ...provided.draggableProps.style
                                  }}
                                  onClick={() => openTaskDetail(taskId)}
                                >
                                  <div style={{ marginBottom: '8px' }}>
                                    <Text strong>{task.name}</Text>
                                  </div>
                                  
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Tag color={task.type === 'information' ? 'blue' : task.type === 'authorization' ? 'purple' : task.type === 'planning' ? 'orange' : task.type === 'resource' ? 'green' : 'cyan'}>
                                      {task.type}
                                    </Tag>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Tooltip title={`Durée: ${task.duration} heures`}>
                                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                      </Tooltip>
                                      
                                      {task.assignedUsers && task.assignedUsers.length > 0 && (
                                        <Avatar.Group maxCount={2} size="small">
                                          {task.assignedUsers.map(user => (
                                            <Tooltip key={user} title={user}>
                                              <Avatar size="small" icon={<UserOutlined />} />
                                            </Tooltip>
                                          ))}
                                        </Avatar.Group>
                                      )}
                                      
                                      {column.id === 'done' && (
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
      
      <TaskDetailModal
        visible={isDetailModalVisible}
        task={selectedTask}
        onClose={() => setIsDetailModalVisible(false)}
        onUpdate={(updatedTask) => {
          setTasks({
            ...tasks,
            [updatedTask.id]: updatedTask
          });
          setIsDetailModalVisible(false);
        }}
      />
    </div>
  );
};

export default KanbanBoard;
