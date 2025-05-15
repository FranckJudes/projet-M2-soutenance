import React, { useState, useEffect, useCallback } from 'react';
import { notification, Badge, Popover, List, Typography, Button, Empty, Spin, Tag } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  MessageOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const { Text, Title } = Typography;

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  // Connect to WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new SockJS('http://localhost:8100/ws');
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.log('Connected to WebSocket');
        
        // Subscribe to user-specific notifications
        client.subscribe('/user/queue/notifications', (message) => {
          const newNotification = JSON.parse(message.body);
          handleNewNotification(newNotification);
        });
        
        // Subscribe to broadcast notifications
        client.subscribe('/topic/notifications', (message) => {
          const newNotification = JSON.parse(message.body);
          handleNewNotification(newNotification);
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP error', frame.headers['message']);
        console.error('Additional details', frame.body);
      };

      client.activate();
      setStompClient(client);
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, []);

  // Fetch existing notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8100/notifications');
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data);
        
        // Count unread notifications
        const unread = data.filter(notif => !notif.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  // Handle new notification
  const handleNewNotification = useCallback((newNotification) => {
    // Add to notifications list
    setNotifications(prev => [newNotification, ...prev]);
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    notification.open({
      message: newNotification.title,
      description: newNotification.message,
      icon: getNotificationIcon(newNotification.type),
      duration: 4.5,
      onClick: () => {
        // Mark as read and navigate if needed
        markAsRead(newNotification.id);
        if (newNotification.link) {
          window.location.href = newNotification.link;
        }
      },
    });
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:8100/notifications/${id}/read`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:8100/notifications/read-all', {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MENTION':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'DEADLINE':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'TASK_ASSIGNED':
        return <MessageOutlined style={{ color: '#52c41a' }} />;
      case 'ALERT':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <BellOutlined />;
    }
  };

  // Get tag color based on notification type
  const getTagColor = (type) => {
    switch (type) {
      case 'MENTION':
        return 'blue';
      case 'DEADLINE':
        return 'orange';
      case 'TASK_ASSIGNED':
        return 'green';
      case 'ALERT':
        return 'red';
      default:
        return 'default';
    }
  };

  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Notification list content
  const notificationContent = (
    <div style={{ width: 350 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Title level={5} style={{ margin: 0 }}>Notifications</Title>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            Tout marquer comme lu
          </Button>
        )}
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description="Aucune notification" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          style={{ maxHeight: 400, overflow: 'auto' }}
          renderItem={item => (
            <List.Item
              style={{ 
                padding: '8px 12px', 
                backgroundColor: item.read ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (!item.read) {
                  markAsRead(item.id);
                }
                if (item.link) {
                  window.location.href = item.link;
                }
              }}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item.type)}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong={!item.read}>{item.title}</Text>
                    <Tag color={getTagColor(item.type)}>
                      {item.type === 'MENTION' ? 'Mention' : 
                       item.type === 'DEADLINE' ? 'Échéance' : 
                       item.type === 'TASK_ASSIGNED' ? 'Tâche' : 
                       item.type === 'ALERT' ? 'Alerte' : 'Info'}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div>{item.message}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatTime(item.timestamp)}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      
      <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
        <Button type="link" onClick={() => window.location.href = '/notifications'}>
          Voir toutes les notifications
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <Popover
        content={notificationContent}
        trigger="click"
        visible={visible}
        onVisibleChange={setVisible}
        placement="bottomRight"
        overlayStyle={{ width: 350 }}
      >
        <Badge count={unreadCount} overflowCount={99}>
          <Button 
            type="text" 
            icon={<BellOutlined style={{ fontSize: '20px' }} />} 
            style={{ padding: '8px 12px' }}
          />
        </Badge>
      </Popover>
    </div>
  );
};

export default NotificationSystem;
