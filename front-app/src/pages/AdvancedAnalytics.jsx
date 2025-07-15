import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Layout, Typography, Card, Row, Col, Select, DatePicker, Button, Spin,
  Tabs, Alert, Space, Divider
} from 'antd';
import {
  AreaChartOutlined, NodeIndexOutlined, ClockCircleOutlined, 
  WarningOutlined, TeamOutlined, RocketOutlined
} from '@ant-design/icons';
import BpmnAnalyticsService from '../services/BpmnAnalyticsService';
import Main from "../layout/Main";
import "../styles/bpmn-analytics.css";
import "../styles/advanced-analytics.css";

// Importer les composants d'analyse
import ProcessDiscoveryTab from '../components/analytics/ProcessDiscoveryTab';
import ProcessVariantsTab from '../components/analytics/ProcessVariantsTab';
import BottleneckAnalysisTab from '../components/analytics/BottleneckAnalysisTab';
import PerformancePredictionTab from '../components/analytics/PerformancePredictionTab';
import SocialNetworkAnalysisTab from '../components/analytics/SocialNetworkAnalysisTab';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AdvancedAnalytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('process-discovery');
  const [analysisData, setAnalysisData] = useState({});
  const [error, setError] = useState(null);

  // Charger les définitions de processus au chargement de la page
  useEffect(() => {
    const fetchProcessDefinitions = async () => {
      try {
        const data = await BpmnAnalyticsService.getProcessDefinitions();
        setProcessDefinitions(data);
        if (data.length > 0) {
          setSelectedProcess(data[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des définitions de processus:', error);
        setError('Impossible de charger les définitions de processus');
      }
    };
    
    fetchProcessDefinitions();
  }, []);

  // Fonction pour récupérer les logs d'événements
  const fetchEventLogs = async () => {
    if (!selectedProcess) return [];
    
    const filters = {};
    if (dateRange && dateRange.length === 2) {
      filters.startDate = dateRange[0].toISOString();
      filters.endDate = dateRange[1].toISOString();
    }
    filters.processDefinitionId = selectedProcess;
    
    try {
      return await BpmnAnalyticsService.getAllEventLogs(filters);
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      setError('Impossible de récupérer les logs d\'événements');
      return [];
    }
  };

  // Fonction pour exécuter l'analyse sélectionnée
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const logs = await fetchEventLogs();
      
      if (logs.length === 0) {
        setError('Aucun log d\'événement disponible pour l\'analyse');
        setLoading(false);
        return;
      }
      
      let result;
      
      switch (activeTab) {
        case 'process-discovery':
          result = await BpmnAnalyticsService.runPm4pyAnalysis(
            selectedProcess,
            'process-discovery',
            { algorithm: 'inductive' }
          );
          break;
        case 'process-variants':
          result = await BpmnAnalyticsService.runPm4pyAnalysis(
            selectedProcess,
            'process-variants'
          );
          break;
        case 'bottleneck-analysis':
          result = await BpmnAnalyticsService.runPm4pyAnalysis(
            selectedProcess,
            'bottleneck-analysis'
          );
          break;
        case 'performance-prediction':
          // Pour la prédiction, nous avons besoin d'un cas spécifique
          // Utilisons le premier cas disponible pour cet exemple
          const caseId = logs.length > 0 ? logs[0].processInstanceId : null;
          if (!caseId) {
            setError('Aucun cas disponible pour la prédiction');
            setLoading(false);
            return;
          }
          result = await BpmnAnalyticsService.runPm4pyAnalysis(
            selectedProcess,
            'performance-prediction',
            { case_id: caseId }
          );
          break;
        case 'social-network-analysis':
          result = await BpmnAnalyticsService.runPm4pyAnalysis(
            selectedProcess,
            'social-network-analysis'
          );
          break;
        default:
          setError('Type d\'analyse non reconnu');
          setLoading(false);
          return;
      }
      
      setAnalysisData(prevData => ({
        ...prevData,
        [activeTab]: result
      }));
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setError(`Erreur lors de l'analyse: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement de processus
  const handleProcessChange = (value) => {
    setSelectedProcess(value);
    // Réinitialiser les données d'analyse
    setAnalysisData({});
  };

  // Gérer le changement de date
  const handleDateChange = (dates) => {
    setDateRange(dates);
    // Réinitialiser les données d'analyse
    setAnalysisData({});
  };

  // Gérer le changement d'onglet
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Main>
      <div className="advanced-analytics">
        <Title level={2}>{t('Analyse avancée des processus BPMN')}</Title>
        
        <Card className="filter-card">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div className="filter-item">
                <Text strong>Processus :</Text>
                <Select
                  style={{ width: '100%' }}
                  value={selectedProcess}
                  onChange={handleProcessChange}
                  placeholder="Sélectionner un processus"
                  disabled={loading}
                >
                  {processDefinitions.map(process => (
                    <Select.Option key={process} value={process}>
                      {process}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="filter-item">
                <Text strong>Période :</Text>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={handleDateChange}
                  disabled={loading}
                />
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="filter-item">
                <Button
                  type="primary"
                  onClick={runAnalysis}
                  disabled={!selectedProcess || loading}
                  loading={loading}
                  style={{ marginTop: 24 }}
                >
                  Exécuter l'analyse
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
        
        {error && (
          <Alert
            message="Erreur"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
        
        <Tabs activeKey={activeTab} onChange={handleTabChange} className="analysis-tabs">
          <TabPane
            tab={<span><NodeIndexOutlined /> Découverte de processus</span>}
            key="process-discovery"
          >
            <ProcessDiscoveryTab data={analysisData['process-discovery']} loading={loading} />
          </TabPane>
          <TabPane
            tab={<span><AreaChartOutlined /> Variantes de processus</span>}
            key="process-variants"
          >
            <ProcessVariantsTab data={analysisData['process-variants']} loading={loading} />
          </TabPane>
          <TabPane
            tab={<span><ClockCircleOutlined /> Analyse des goulots d'étranglement</span>}
            key="bottleneck-analysis"
          >
            <BottleneckAnalysisTab data={analysisData['bottleneck-analysis']} loading={loading} />
          </TabPane>
          <TabPane
            tab={<span><RocketOutlined /> Prédiction de performance</span>}
            key="performance-prediction"
          >
            <PerformancePredictionTab data={analysisData['performance-prediction']} loading={loading} />
          </TabPane>
          <TabPane
            tab={<span><TeamOutlined /> Analyse du réseau social</span>}
            key="social-network-analysis"
          >
            <SocialNetworkAnalysisTab data={analysisData['social-network-analysis']} loading={loading} />
          </TabPane>
        </Tabs>
      </div>
    </Main>
  );
};

// Le composant ProcessDiscoveryTab est maintenant importé depuis un fichier séparé

export default AdvancedAnalytics;
