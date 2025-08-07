import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Layout, Typography, Card, Row, Col, Select, DatePicker, Button, Spin,
  Alert, Space, Divider, Statistic, notification
} from 'antd';
import {
  AreaChartOutlined, NodeIndexOutlined, ClockCircleOutlined, 
  WarningOutlined, TeamOutlined, RocketOutlined, DatabaseOutlined
} from '@ant-design/icons';
import BpmnAnalyticsService from '../services/BpmnAnalyticsService';
import ProcessAnalyticsPanel from '../components/analytics/ProcessAnalyticsPanel';
import Main from "../layout/Main";
import "../styles/bpmn-analytics.css";
import "../styles/advanced-analytics.css";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const IntegratedAnalytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [logsData, setLogsData] = useState(null);

  // Charger les définitions de processus au chargement de la page
  useEffect(() => {
    const fetchProcessDefinitions = async () => {
      try {
        // Simuler des définitions de processus pour la démonstration
        // En production, cela viendrait du backend
        const mockProcessDefinitions = [
          { key: 'order-process', name: 'Processus de commande' },
          { key: 'approval-process', name: 'Processus d\'approbation' },
          { key: 'customer-onboarding', name: 'Intégration client' }
        ];
        
        setProcessDefinitions(mockProcessDefinitions);
        if (mockProcessDefinitions.length > 0) {
          setSelectedProcess(mockProcessDefinitions[0].key);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des définitions de processus:', error);
        setError('Impossible de charger les définitions de processus');
      }
    };
    
    fetchProcessDefinitions();
  }, []);

  // Fonction pour charger les logs de processus
  const loadProcessLogs = async () => {
    if (!selectedProcess) return;

    setLoading(true);
    setError(null);

    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD');
      
      const response = await BpmnAnalyticsService.getProcessLogsForAnalytics(
        selectedProcess, 
        startDate, 
        endDate
      );
      
      setLogsData(response);
      
      notification.success({
        message: 'Logs chargés',
        description: `${response.data?.length || 0} événements récupérés pour l'analyse`,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des logs:', err);
      setError(err.message || 'Erreur lors du chargement des logs');
      notification.error({
        message: 'Erreur',
        description: 'Impossible de charger les logs de processus',
      });
    } finally {
      setLoading(false);
    }
  };

  // Callback pour les résultats d'analyse
  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    notification.success({
      message: 'Analyse terminée',
      description: `Analyse complétée avec succès sur ${results.logsCount} événements`,
    });
  };

  // Fonction pour exporter les résultats
  const exportResults = () => {
    if (!analysisResults) return;
    
    const dataStr = JSON.stringify(analysisResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-results-${selectedProcess}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Main>
      <div style={{ padding: '24px' }}>
        <Title level={2}>
          <AreaChartOutlined /> Analytics Intégrés BPMN
        </Title>
        <Text type="secondary">
          Analyse avancée des processus métier avec intégration Camunda et PM4Py
        </Text>

        <Divider />

        {/* Configuration de l'analyse */}
        <Card title="Configuration de l'analyse" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Processus à analyser</Text>
                <Select
                  value={selectedProcess}
                  onChange={setSelectedProcess}
                  style={{ width: '100%' }}
                  placeholder="Sélectionner un processus"
                >
                  {processDefinitions.map(process => (
                    <Option key={process.key} value={process.key}>
                      <NodeIndexOutlined /> {process.name}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Période d'analyse</Text>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  style={{ width: '100%' }}
                  placeholder={['Date de début', 'Date de fin']}
                />
              </Space>
            </Col>
            <Col span={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Actions</Text>
                <Space>
                  <Button
                    type="primary"
                    icon={<DatabaseOutlined />}
                    onClick={loadProcessLogs}
                    loading={loading}
                    disabled={!selectedProcess}
                  >
                    Charger les logs
                  </Button>
                  {analysisResults && (
                    <Button
                      icon={<AreaChartOutlined />}
                      onClick={exportResults}
                    >
                      Exporter
                    </Button>
                  )}
                </Space>
              </Space>
            </Col>
          </Row>

          {error && (
            <Alert
              message="Erreur"
              description={error}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
              closable
              onClose={() => setError(null)}
            />
          )}
        </Card>

        {/* Statistiques des logs */}
        {logsData && (
          <Card title="Statistiques des logs" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Événements totaux"
                  value={logsData.data?.length || 0}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Processus sélectionné"
                  value={selectedProcess}
                  prefix={<NodeIndexOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Période"
                  value={dateRange ? `${dateRange[0].format('DD/MM')} - ${dateRange[1].format('DD/MM')}` : 'Toutes'}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Statut"
                  value={analysisResults ? 'Analysé' : 'En attente'}
                  prefix={analysisResults ? <AreaChartOutlined /> : <WarningOutlined />}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Panel d'analytics intégré */}
        {selectedProcess && (
          <ProcessAnalyticsPanel
            processDefinitionKey={selectedProcess}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {/* Instructions d'utilisation */}
        <Card title="Instructions d'utilisation" style={{ marginTop: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              <strong>1. Sélection du processus :</strong> Choisissez le processus métier que vous souhaitez analyser
            </Text>
            <Text>
              <strong>2. Période d'analyse :</strong> Définissez optionnellement une période pour filtrer les données
            </Text>
            <Text>
              <strong>3. Chargement des logs :</strong> Cliquez sur "Charger les logs" pour récupérer les données depuis Camunda
            </Text>
            <Text>
              <strong>4. Configuration de l'analyse :</strong> Sélectionnez les types d'analyse à exécuter
            </Text>
            <Text>
              <strong>5. Exécution :</strong> Lancez l'analyse pour obtenir des insights sur votre processus
            </Text>
            <Text>
              <strong>6. Résultats :</strong> Consultez les différents onglets pour explorer les résultats
            </Text>
          </Space>
        </Card>

        {/* Informations techniques */}
        <Card title="Architecture technique" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="Backend Spring Boot">
                <Space direction="vertical">
                  <Text>• Endpoints REST /api/analytics/*</Text>
                  <Text>• Intégration Camunda History API</Text>
                  <Text>• Proxy vers service Python PM4Py</Text>
                  <Text>• Gestion des erreurs et logs</Text>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Service Analytics Python">
                <Space direction="vertical">
                  <Text>• Flask API sur port 5000</Text>
                  <Text>• Bibliothèque PM4Py</Text>
                  <Text>• Algorithmes de process mining</Text>
                  <Text>• Génération de visualisations</Text>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="Frontend React">
                <Space direction="vertical">
                  <Text>• Composants Ant Design</Text>
                  <Text>• Service BpmnAnalyticsService</Text>
                  <Text>• Visualisation des résultats</Text>
                  <Text>• Export des données</Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </Main>
  );
};

export default IntegratedAnalytics;
