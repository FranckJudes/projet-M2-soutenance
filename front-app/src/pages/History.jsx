import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { ForceGraph2D } from 'react-force-graph';
import {
  Card, Row, Col, Statistic, Table, Button, Select, DatePicker, Space, Spin, Alert,
  Typography, Tabs, Empty, Tag, Progress, Timeline, List, Avatar, Divider, message
} from 'antd';
import {
  DownloadOutlined, ReloadOutlined, BarChartOutlined, PieChartOutlined,
  LineChartOutlined, NodeIndexOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, UserOutlined, AppstoreOutlined, SettingOutlined
} from '@ant-design/icons';

import Main from "../layout/Main";
import { AnalyticsService, ProcessService } from '../services/AnalyticsService';
import "../styles/bpmn-analytics.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Composant pour afficher les métriques générales avec Ant Design
const MetricsOverview = ({ metrics, loading }) => {
  if (loading) return <Spin size="large" />;
  if (!metrics) return <Empty description="Aucune métrique disponible" />;
  
  // Normaliser/fiabiliser les valeurs de métriques
  const totalInstances = metrics?.totalInstances ?? 0;
  const completedInstances = metrics?.completedInstances ?? 0;
  const completionRate = metrics?.completionRate ?? 0;
  const averageTime = metrics?.averageExecutionTime ?? metrics?.averageDuration ?? null;
  const activeInstances = totalInstances - completedInstances;
  
  const pieData = [
    { name: 'Terminés', value: completedInstances, color: '#52c41a' },
    { name: 'En cours', value: activeInstances, color: '#1890ff' }
  ];
  
  return (
    <Card title={<Title level={4}><BarChartOutlined /> Vue d'ensemble</Title>} className="metrics-overview">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Instances totales"
              value={totalInstances}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Instances terminées"
              value={completedInstances}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Taux de complétion"
              value={(completionRate * 100).toFixed(1)}
              suffix="%"
              prefix={<PieChartOutlined />}
              valueStyle={{ color: completionRate > 0.8 ? '#52c41a' : completionRate > 0.5 ? '#faad14' : '#ff4d4f' }}
            />
            <Progress 
              percent={(completionRate * 100).toFixed(1)} 
              size="small" 
              strokeColor={completionRate > 0.8 ? '#52c41a' : completionRate > 0.5 ? '#faad14' : '#ff4d4f'}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Temps moyen d'exécution"
              value={averageTime ?? 'N/A'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Statut des instances" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Résumé" size="small">
            <List size="small">
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#1890ff' }} icon={<AppstoreOutlined />} />}
                  title="Processus actifs"
                  description={`${activeInstances} instances en cours d'exécution`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />} />}
                  title="Processus terminés"
                  description={`${completedInstances} instances terminées avec succès`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#722ed1' }} icon={<ClockCircleOutlined />} />}
                  title="Performance"
                  description={`Taux de complétion de ${(completionRate * 100).toFixed(1)}%`}
                />
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

// Composant pour afficher les métriques des tâches avec Ant Design
const TaskMetrics = ({ metrics, loading }) => {
  if (loading) return <Spin size="large" />;
  if (!metrics || !metrics.taskMetrics) return <Empty description="Aucune métrique de tâche disponible" />;
  
  const taskData = metrics.taskMetrics.map(task => ({
    name: task.taskName,
    avgDuration: task.averageDuration,
    count: task.count,
    efficiency: task.efficiency || 85 // Valeur par défaut
  }));
  
  const columns = [
    {
      title: 'Nom de la tâche',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Durée moyenne',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      render: (duration) => (
        <Tag color={duration < 30 ? 'green' : duration < 60 ? 'orange' : 'red'}>
          {duration} min
        </Tag>
      ),
      sorter: (a, b) => a.avgDuration - b.avgDuration
    },
    {
      title: 'Nombre d\'exécutions',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Text>{count}</Text>,
      sorter: (a, b) => a.count - b.count
    },
    {
      title: 'Efficacité',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (efficiency) => (
        <Progress 
          percent={efficiency} 
          size="small" 
          strokeColor={efficiency > 80 ? '#52c41a' : efficiency > 60 ? '#faad14' : '#ff4d4f'}
        />
      ),
      sorter: (a, b) => a.efficiency - b.efficiency
    }
  ];
  
  return (
    <Card title={<Title level={4}><LineChartOutlined /> Métriques des tâches</Title>}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Durée moyenne par tâche" size="small">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgDuration" fill="#1890ff" name="Durée moyenne (min)" />
                <Bar dataKey="count" fill="#52c41a" name="Nombre d'exécutions" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Détails des tâches" size="small">
            <Table 
              dataSource={taskData} 
              columns={columns} 
              pagination={{ pageSize: 5 }}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

// Composant pour afficher la carte du processus avec Ant Design
const ProcessMap = ({ processMapData, loading }) => {
  if (loading) return <Spin size="large" />;
  if (!processMapData) return <Empty description="Aucune donnée de carte de processus disponible" />;
  
  // Transformer les données pour react-force-graph
  const graphData = {
    nodes: processMapData.nodes?.map(node => ({
      id: node.id,
      name: node.name || node.id,
      val: (node.count ?? node.frequency ?? 1)
    })) || [],
    links: (processMapData.edges || processMapData.links || [])?.map(edge => ({
      source: edge.source,
      target: edge.target,
      value: edge.value || 1
    })) || []
  };
  
  return (
    <Card title={<Title level={4}><NodeIndexOutlined /> Carte du processus</Title>}>
      <div style={{ height: '500px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
        <ForceGraph2D
          graphData={graphData}
          nodeLabel={node => `${node.name}: ${node.val} occurrences`}
          linkLabel={link => `${link.value} transitions`}
          nodeAutoColorBy="id"
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkWidth={link => Math.sqrt(link.value)}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              bckgDimensions[0],
              bckgDimensions[1]
            );

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions;
          }}
        />
      </div>
    </Card>
  );
};

// Composant pour afficher les logs d'événements avec Ant Design
const EventLogs = ({ logs, loading }) => {
  if (loading) return <Spin size="large" />;
  if (!logs || logs.length === 0) return <Empty description="Aucun log d'événement disponible" />;
  
  const handleExportCsv = () => {
    try {
      AnalyticsService.exportLogsAsCsv();
      message.success('Export CSV lancé avec succès');
    } catch (error) {
      message.error('Erreur lors de l\'export CSV');
      console.error('Export error:', error);
    }
  };
  
  const getEventTypeColor = (eventType) => {
    const colorMap = {
      'START': 'green',
      'END': 'blue',
      'TASK': 'orange',
      'GATEWAY': 'purple',
      'ERROR': 'red'
    };
    return colorMap[eventType] || 'default';
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <Text code>{id}</Text>
    },
    {
      title: 'Type d\'événement',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (eventType) => (
        <Tag color={getEventTypeColor(eventType)}>
          {eventType}
        </Tag>
      ),
      filters: [
        { text: 'START', value: 'START' },
        { text: 'END', value: 'END' },
        { text: 'TASK', value: 'TASK' },
        { text: 'GATEWAY', value: 'GATEWAY' },
        { text: 'ERROR', value: 'ERROR' }
      ],
      onFilter: (value, record) => record.eventType === value
    },
    {
      title: 'ID de processus',
      dataIndex: 'processDefinitionId',
      key: 'processDefinitionId',
      ellipsis: true,
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'ID d\'instance',
      dataIndex: 'processInstanceId',
      key: 'processInstanceId',
      ellipsis: true,
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'Nom de tâche',
      dataIndex: 'taskName',
      key: 'taskName',
      render: (taskName) => taskName ? <Text>{taskName}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'Utilisateur',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => userId ? (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{userId}</Text>
        </Space>
      ) : <Text type="secondary">-</Text>
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => timestamp ? (
        <Text>{format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}</Text>
      ) : <Text type="secondary">-</Text>,
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    },
    {
      title: 'Durée (ms)',
      dataIndex: 'durationMs',
      key: 'durationMs',
      render: (duration) => duration ? (
        <Tag color={duration < 1000 ? 'green' : duration < 5000 ? 'orange' : 'red'}>
          {duration}ms
        </Tag>
      ) : <Text type="secondary">-</Text>,
      sorter: (a, b) => (a.durationMs || 0) - (b.durationMs || 0)
    }
  ];
  
  return (
    <Card 
      title={<Title level={4}><ClockCircleOutlined /> Logs d'événements</Title>}
      extra={
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={handleExportCsv}
        >
          Exporter CSV
        </Button>
      }
    >
      <Table 
        dataSource={logs} 
        columns={columns} 
        rowKey={(record, idx) => record.id || `${record.processInstanceId || 'pi'}-${record.taskName || record.activityId || idx}`}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} éléments`
        }}
        scroll={{ x: 1200 }}
        size="small"
      />
    </Card>
  );
};

// Composant principal History avec Ant Design
function History() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [processMapData, setProcessMapData] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  
  // Charger les définitions de processus au chargement de la page
  useEffect(() => {
    const fetchProcessDefinitions = async () => {
      try {
        setLoading(true);
        const data = await AnalyticsService.getProcessDefinitions();
        // Normaliser les définitions (garantir des chaînes pour id et name)
        const defs = (data || []).map((p, idx) => {
          const id = typeof p === 'string' ? p : (p?.id || p?.processDefinitionId || p?.key || `proc-${idx}`);
          const key = typeof p === 'object' ? (p?.key || p?.id) : (typeof p === 'string' ? p : undefined);
          const name = typeof p === 'object' ? (p?.name || key || id) : p;
          const version = typeof p === 'object' ? p?.version : undefined;
          return { id: String(id), key: key ? String(key) : undefined, name: String(name), version };
        });
        setProcessDefinitions(defs);
        if (defs.length > 0) {
          setSelectedProcess(defs[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des définitions de processus:', error);
        message.error('Erreur lors du chargement des définitions de processus');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcessDefinitions();
  }, []);
  
  // Charger les données lorsqu'un processus est sélectionné
  useEffect(() => {
    if (!selectedProcess) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [metricsData, mapData, logsData] = await Promise.all([
          AnalyticsService.getProcessMetrics(selectedProcess).catch(() => null),
          AnalyticsService.getProcessMapData(selectedProcess).catch(() => null),
          AnalyticsService.getAllEventLogs(
            dateRange[0]?.format('YYYY-MM-DD'),
            dateRange[1]?.format('YYYY-MM-DD')
          ).catch(() => [])
        ]);
        
        setMetrics(metricsData);
        setProcessMapData(mapData);
        const selectedProcKey = processDefinitions.find(p => p.id === selectedProcess)?.key;
        const filtered = (logsData || []).filter(log => {
          const pdid = log.processDefinitionId || log.processDefinitionKey || log.processDefinition;
          return pdid === selectedProcess || (selectedProcKey && pdid === selectedProcKey);
        });
        const normalized = filtered.map((log, idx) => ({
          id: log.id || log.activity_instance_id || log.activityInstanceId || `${log.processInstanceId || 'pi'}-${log.activityId || idx}`,
          eventType: log.eventType || log.activityType || 'TASK',
          processDefinitionId: log.processDefinitionId || log.processDefinitionKey || log.processDefinition,
          processInstanceId: log.processInstanceId,
          taskName: log.taskName || log.activityName,
          userId: log.userId || log.assignee,
          timestamp: log.timestamp || log.startTime,
          durationMs: log.durationMs || log.durationInMillis
        }));
        setEventLogs(normalized);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        message.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProcess, dateRange]);
  
  // Gérer le changement de processus
  const handleProcessChange = (value) => {
    setSelectedProcess(value);
  };
  
  // Gérer le changement de plage de dates
  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
  };
  
  // Rafraîchir les données
  const handleRefresh = () => {
    if (selectedProcess) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [metricsData, mapData, logsData] = await Promise.all([
            AnalyticsService.getProcessMetrics(selectedProcess).catch(() => null),
            AnalyticsService.getProcessMapData(selectedProcess).catch(() => null),
            AnalyticsService.getAllEventLogs(
              dateRange[0]?.format('YYYY-MM-DD'),
              dateRange[1]?.format('YYYY-MM-DD')
            ).catch(() => [])
          ]);
          
          setMetrics(metricsData);
          setProcessMapData(mapData);
          const selectedProcKey = processDefinitions.find(p => p.id === selectedProcess)?.key;
          const filtered = (logsData || []).filter(log => {
            const pdid = log.processDefinitionId || log.processDefinitionKey || log.processDefinition;
            return pdid === selectedProcess || (selectedProcKey && pdid === selectedProcKey);
          });
          const normalized = filtered.map((log, idx) => ({
            id: log.id || log.activity_instance_id || log.activityInstanceId || `${log.processInstanceId || 'pi'}-${log.activityId || idx}`,
            eventType: log.eventType || log.activityType || 'TASK',
            processDefinitionId: log.processDefinitionId || log.processDefinitionKey || log.processDefinition,
            processInstanceId: log.processInstanceId,
            taskName: log.taskName || log.activityName,
            userId: log.userId || log.assignee,
            timestamp: log.timestamp || log.startTime,
            durationMs: log.durationMs || log.durationInMillis
          }));
          setEventLogs(normalized);
          message.success('Données rafraîchies avec succès');
        } catch (error) {
          console.error('Erreur lors du rafraîchissement:', error);
          message.error('Erreur lors du rafraîchissement des données');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  };
  
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <BarChartOutlined />
          Vue d'ensemble
        </span>
      ),
      children: <MetricsOverview metrics={metrics} loading={loading} />
    },
    {
      key: 'task-metrics',
      label: (
        <span>
          <LineChartOutlined />
          Métriques des tâches
        </span>
      ),
      children: <TaskMetrics metrics={metrics} loading={loading} />
    },
    {
      key: 'process-map',
      label: (
        <span>
          <NodeIndexOutlined />
          Carte du processus
        </span>
      ),
      children: <ProcessMap processMapData={processMapData} loading={loading} />
    },
    {
      key: 'event-logs',
      label: (
        <span>
          <ClockCircleOutlined />
          Logs d'événements
        </span>
      ),
      children: <EventLogs logs={eventLogs} loading={loading} />
    }
  ];
  
  return (
    <Main>
      <div className="bpmn-analytics" style={{ padding: '24px' }}>
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
            <Col>
              <Title level={2}>
                <AppstoreOutlined /> {t('Analyse des processus BPMN')}
              </Title>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                Rafraîchir
              </Button>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Sélectionner un processus :</Text>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Choisir un processus"
                  value={selectedProcess}
                  onChange={handleProcessChange}
                  loading={loading}
                  disabled={processDefinitions.length === 0}
                >
                  {processDefinitions.map(proc => {
                    const label = proc.name || proc.key || proc.id || 'Processus';
                    return (
                      <Option key={proc.id} value={proc.id}>
                        {String(label)}
                      </Option>
                    );
                  })}
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Plage de dates :</Text>
                <RangePicker
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  format="DD/MM/YYYY"
                  placeholder={['Date de début', 'Date de fin']}
                />
              </Space>
            </Col>
          </Row>
          
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Card>
      </div>
    </Main>
  );
}

export default History;
