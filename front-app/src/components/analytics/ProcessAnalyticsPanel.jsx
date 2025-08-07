import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Select, 
  Spin, 
  Alert, 
  Typography, 
  Space, 
  Tabs,
  Image,
  Table,
  Progress,
  Statistic
} from 'antd';
import { 
  AreaChartOutlined, 
  NodeIndexOutlined, 
  ClockCircleOutlined, 
  TeamOutlined,
  RocketOutlined,
  WarningOutlined
} from '@ant-design/icons';
import BpmnAnalyticsService from '../../services/BpmnAnalyticsService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ProcessAnalyticsPanel = ({ processDefinitionKey, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAnalysisTypes, setSelectedAnalysisTypes] = useState([
    'process-discovery',
    'process-variants',
    'bottleneck-analysis'
  ]);

  const analysisOptions = [
    { value: 'process-discovery', label: 'Découverte de processus', icon: <NodeIndexOutlined /> },
    { value: 'process-variants', label: 'Variantes de processus', icon: <AreaChartOutlined /> },
    { value: 'bottleneck-analysis', label: 'Analyse des goulots', icon: <WarningOutlined /> },
    { value: 'performance-prediction', label: 'Prédiction de performance', icon: <RocketOutlined /> },
    { value: 'social-network-analysis', label: 'Analyse réseau social', icon: <TeamOutlined /> }
  ];

  const runAnalysis = async () => {
    if (!processDefinitionKey) {
      setError('Veuillez sélectionner un processus');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await BpmnAnalyticsService.runCompleteAnalysis(
        processDefinitionKey, 
        selectedAnalysisTypes
      );
      
      setAnalysisResults(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('Erreur lors de l\'analyse:', err);
      setError(err.message || 'Erreur lors de l\'exécution de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const renderProcessDiscovery = (data) => {
    if (!data?.data?.petriNetImage) return null;

    return (
      <Card title="Découverte de processus" size="small">
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Image
              src={`data:image/png;base64,${data.data.petriNetImage}`}
              alt="Réseau de Petri découvert"
              style={{ maxWidth: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Fitness"
                value={data.data.metrics?.fitness}
                precision={3}
                suffix="/1.0"
              />
              <Statistic
                title="Précision"
                value={data.data.metrics?.precision}
                precision={3}
                suffix="/1.0"
              />
              <Statistic
                title="Généralisation"
                value={data.data.metrics?.generalization}
                precision={3}
                suffix="/1.0"
              />
              <Statistic
                title="Simplicité"
                value={data.data.metrics?.simplicity}
                precision={3}
                suffix="/1.0"
              />
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderProcessVariants = (data) => {
    if (!data?.data?.variants) return null;

    const columns = [
      {
        title: 'Variante',
        dataIndex: 'activities',
        key: 'activities',
        render: (activities) => activities.join(' → ')
      },
      {
        title: 'Occurrences',
        dataIndex: 'count',
        key: 'count'
      },
      {
        title: 'Fréquence',
        dataIndex: 'frequency',
        key: 'frequency',
        render: (freq) => `${(freq * 100).toFixed(1)}%`
      },
      {
        title: 'Durée moyenne',
        dataIndex: 'averageDuration',
        key: 'averageDuration',
        render: (duration) => duration ? `${duration.toFixed(0)}ms` : 'N/A'
      }
    ];

    return (
      <Card title="Variantes de processus" size="small">
        <Table
          dataSource={data.data.variants}
          columns={columns}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 5 }}
          size="small"
        />
        {data.data.variantsChart && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Image
              src={`data:image/png;base64,${data.data.variantsChart}`}
              alt="Graphique des variantes"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
      </Card>
    );
  };

  const renderBottleneckAnalysis = (data) => {
    if (!data?.data?.bottlenecks) return null;

    const columns = [
      {
        title: 'Activité',
        dataIndex: 'activity',
        key: 'activity'
      },
      {
        title: 'Temps d\'attente moyen',
        dataIndex: 'averageWaitingTime',
        key: 'averageWaitingTime',
        render: (time) => time ? `${time.toFixed(0)}ms` : 'N/A'
      },
      {
        title: 'Utilisation ressource',
        dataIndex: 'resourceUtilization',
        key: 'resourceUtilization',
        render: (util) => util ? `${(util * 100).toFixed(1)}%` : 'N/A'
      },
      {
        title: 'Fréquence',
        dataIndex: 'frequency',
        key: 'frequency'
      },
      {
        title: 'Sévérité',
        dataIndex: 'severity',
        key: 'severity',
        render: (severity) => {
          const color = severity === 'HIGH' ? 'red' : severity === 'MEDIUM' ? 'orange' : 'green';
          return <Text style={{ color }}>{severity}</Text>;
        }
      }
    ];

    return (
      <Card title="Analyse des goulots d'étranglement" size="small">
        <Table
          dataSource={data.data.bottlenecks}
          columns={columns}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 5 }}
          size="small"
        />
        {data.data.analysisChart && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Image
              src={`data:image/png;base64,${data.data.analysisChart}`}
              alt="Graphique d'analyse des goulots"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
      </Card>
    );
  };

  const renderPerformancePrediction = (data) => {
    if (!data?.data?.predictions) return null;

    const columns = [
      {
        title: 'ID Cas',
        dataIndex: 'caseId',
        key: 'caseId'
      },
      {
        title: 'Temps prédit',
        dataIndex: 'predictedCompletionTime',
        key: 'predictedCompletionTime',
        render: (time) => time ? `${time.toFixed(0)}ms` : 'N/A'
      },
      {
        title: 'Prochaine activité',
        dataIndex: 'nextActivity',
        key: 'nextActivity'
      },
      {
        title: 'Confiance',
        dataIndex: 'confidence',
        key: 'confidence',
        render: (conf) => (
          <Progress 
            percent={conf ? (conf * 100).toFixed(1) : 0} 
            size="small" 
            status={conf > 0.8 ? 'success' : conf > 0.6 ? 'normal' : 'exception'}
          />
        )
      }
    ];

    return (
      <Card title="Prédiction de performance" size="small">
        <Table
          dataSource={data.data.predictions}
          columns={columns}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 5 }}
          size="small"
        />
        {data.data.predictionChart && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Image
              src={`data:image/png;base64,${data.data.predictionChart}`}
              alt="Graphique de prédiction"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
      </Card>
    );
  };

  const renderSocialNetworkAnalysis = (data) => {
    if (!data?.data?.nodes) return null;

    return (
      <Card title="Analyse du réseau social" size="small">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Title level={5}>Nœuds du réseau</Title>
            <Table
              dataSource={data.data.nodes}
              columns={[
                { title: 'ID', dataIndex: 'id', key: 'id' },
                { title: 'Label', dataIndex: 'label', key: 'label' },
                { title: 'Type', dataIndex: 'type', key: 'type' },
                { title: 'Centralité', dataIndex: 'centrality', key: 'centrality', render: (val) => val?.toFixed(3) }
              ]}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Col>
          <Col span={12}>
            {data.data.networkChart && (
              <div style={{ textAlign: 'center' }}>
                <Title level={5}>Visualisation du réseau</Title>
                <Image
                  src={`data:image/png;base64,${data.data.networkChart}`}
                  alt="Réseau social"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div>
      <Card title="Analytics Avancés de Processus" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Sélectionner les types d'analyse"
              value={selectedAnalysisTypes}
              onChange={setSelectedAnalysisTypes}
              style={{ width: '100%' }}
            >
              {analysisOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              icon={<AreaChartOutlined />}
              onClick={runAnalysis}
              loading={loading}
              disabled={!processDefinitionKey || selectedAnalysisTypes.length === 0}
            >
              Lancer l'analyse
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert
            message="Erreur"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Analyse en cours...</Text>
            </div>
          </div>
        </Card>
      )}

      {analysisResults && !loading && (
        <Card title={`Résultats de l'analyse (${analysisResults.logsCount} événements traités)`}>
          <Tabs defaultActiveKey="process-discovery">
            {analysisResults.data.processDiscovery && (
              <TabPane tab="Découverte" key="process-discovery">
                {renderProcessDiscovery(analysisResults.data.processDiscovery)}
              </TabPane>
            )}
            {analysisResults.data.processVariants && (
              <TabPane tab="Variantes" key="process-variants">
                {renderProcessVariants(analysisResults.data.processVariants)}
              </TabPane>
            )}
            {analysisResults.data.bottleneckAnalysis && (
              <TabPane tab="Goulots" key="bottleneck-analysis">
                {renderBottleneckAnalysis(analysisResults.data.bottleneckAnalysis)}
              </TabPane>
            )}
            {analysisResults.data.performancePrediction && (
              <TabPane tab="Prédiction" key="performance-prediction">
                {renderPerformancePrediction(analysisResults.data.performancePrediction)}
              </TabPane>
            )}
            {analysisResults.data.socialNetworkAnalysis && (
              <TabPane tab="Réseau Social" key="social-network-analysis">
                {renderSocialNetworkAnalysis(analysisResults.data.socialNetworkAnalysis)}
              </TabPane>
            )}
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default ProcessAnalyticsPanel;
