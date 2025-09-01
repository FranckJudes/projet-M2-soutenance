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
import ProcessAnalyticsPanel from '../components/analytics/ProcessAnalyticsPanel';
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
  const [selectedProcessKey, setSelectedProcessKey] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('process-discovery');
  const [analysisData, setAnalysisData] = useState({});
  const [error, setError] = useState(null);

  // Helpers: transformer pour adapter les DTO backend aux formats attendus par les tabs
  const transformDiscoveryResponse = (dto) => {
    if (!dto) return null;
    const metrics = dto.metrics || {};
    return {
      petri_net_image: dto.petriNetImage || null,
      metrics: {
        fitness: { average_trace_fitness: metrics.fitness ?? 0 },
        precision: metrics.precision ?? 0,
        generalization: metrics.generalization ?? 0,
        simplicity: metrics.simplicity ?? 0,
      },
    };
  };

  const transformVariantsResponse = (dto) => {
    if (!dto) return null;
    const variants = Array.isArray(dto.variants)
      ? dto.variants.map(v => ({
          variant: Array.isArray(v.activities) ? v.activities.join(' → ') : '',
          activities: v.activities || [],
          count: v.count ?? 0,
          percentage: (v.frequency ?? 0) * 100,
          averageDuration: v.averageDuration ?? 0,
        }))
      : [];
    return {
      variants,
      case_statistics: {
        total_cases: variants.reduce((acc, v) => acc + (v.count || 0), 0),
        median_duration: 0,
        min_duration: 0,
        max_duration: 0,
        case_duration_image: null,
      },
    };
  };

  const transformBottleneckResponse = (dto) => {
    if (!dto) return null;
    const bottlenecks = Array.isArray(dto.bottlenecks)
      ? dto.bottlenecks.map(b => ({
          activity: b.activity,
          sojourn_time: b.averageWaitingTime ?? 0,
          resource_utilization: b.resourceUtilization ?? null,
          frequency: b.frequency ?? null,
          severity: b.severity ?? null,
        }))
      : [];
    return {
      bottlenecks,
      sojourn_time_image: null,
      sorted_sojourn_image: null,
    };
  };

  // Utils pour la prédiction: calculer durées à partir des logs (ms -> sec)
  const computeCaseDurations = (logs) => {
    const perCase = new Map();
    for (const e of logs || []) {
      const caseId = e.case_id || e.process_instance_id || e.processInstanceId || e.caseId;
      if (!caseId) continue;
      const durMs = e.durationInMillis ?? e.duration_ms ?? e.duration ?? 0;
      perCase.set(caseId, (perCase.get(caseId) || 0) + (durMs || 0));
    }
    // Convertir en secondes
    const perCaseSec = new Map();
    for (const [k, v] of perCase.entries()) perCaseSec.set(k, v / 1000);
    return perCaseSec;
  };

  const transformPredictionResponse = (dto, logs, selectedCaseId) => {
    if (!dto) return null;
    const predictions = Array.isArray(dto.predictions) ? dto.predictions : [];
    const chosen = predictions.find(p => (p.caseId === selectedCaseId)) || predictions[0] || null;
    const perCaseDur = computeCaseDurations(logs);
    const currentSec = selectedCaseId ? (perCaseDur.get(selectedCaseId) || 0) : 0;
    // On suppose que predictedCompletionTime est en secondes
    const predictedTotal = chosen?.predictedCompletionTime ?? 0;

    // Moyenne calculée à partir des logs si non fournie par le modèle
    const values = Array.from(perCaseDur.values());
    const avgFromLogs = values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const averageDuration = dto.modelMetrics?.averageDuration ?? avgFromLogs;

    const remaining = Math.max(0, (predictedTotal || 0) - currentSec);
    const delayRisk = averageDuration ? (predictedTotal > averageDuration * 1.1) : false;

    return {
      case_id: chosen?.caseId || selectedCaseId || null,
      current_duration: currentSec,
      predicted_remaining_duration: remaining,
      predicted_total_duration: predictedTotal,
      average_duration: averageDuration,
      delay_risk: !!delayRisk,
      comparison_image: dto.predictionChart || null,
      similar_cases_count: dto.modelMetrics?.similarCasesCount ?? 0,
    };
  };

  const transformSnaResponse = (dto) => {
    if (!dto) return null;
    const edges = Array.isArray(dto.edges) ? dto.edges : [];
    return {
      roles: [],
      social_network: edges.map(e => ({
        source: e.source,
        target: e.target,
        value: e.weight ?? e.value ?? 1,
      })),
      social_network_image: dto.networkChart || null,
    };
  };

  // Normaliser les définitions de processus pour garantir des chaînes pour id/key/label
  const normalizeProcessDefinitions = (defs) => {
    if (!Array.isArray(defs)) return [];
    const seen = new Set();
    const result = [];
    for (const pd of defs) {
      const id = String(pd.id || pd.definitionId || pd.processDefinitionId || pd.key || '');
      const key = String(pd.key || pd.processDefinitionKey || pd.definitionKey || id);
      const name = pd.name || pd.processDefinitionName || key;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ id, key, name, label: name });
      }
    }
    return result;
  };

  // Charger les définitions de processus au chargement de la page
  useEffect(() => {
    const fetchProcessDefinitions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Test de connectivité d'abord
        
        await BpmnAnalyticsService.testConnection();
        
        // 2. Chargement des définitions de processus
        const data = await BpmnAnalyticsService.getProcessDefinitions();
        
        const normalized = normalizeProcessDefinitions(data);
        
        setProcessDefinitions(normalized);
        if (normalized.length > 0) {
          setSelectedProcessKey(normalized[0].key);
        } else {
          const msg = 'Aucune définition de processus disponible';
          setError(msg);
        }
      } catch (error) {
        
        let errorMessage = 'Erreur inconnue';
        if (error.response) {
          // Erreur de réponse HTTP
          errorMessage = `Erreur serveur (${error.response.status}): ${error.response.data?.message || error.message}`;
        } else if (error.request) {
          // Problème de réseau
          errorMessage = `Problème de connexion au serveur: ${error.message}`;
        } else {
          // Autre erreur
          errorMessage = `Erreur: ${error.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcessDefinitions();
  }, []);

  // Fonction pour récupérer les logs d'événements
  const fetchEventLogs = async () => {
    if (!selectedProcessKey) return [];

    try {
      let start = null;
      let end = null;
      if (dateRange && dateRange.length === 2) {
        start = dateRange[0]?.toDate?.() ? dateRange[0].toDate().toISOString() : null;
        end = dateRange[1]?.toDate?.() ? dateRange[1].toDate().toISOString() : null;
      }
      const logs = await BpmnAnalyticsService.getProcessLogsForAnalytics(selectedProcessKey, start, end);
      return Array.isArray(logs) ? logs : [];
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
          result = transformDiscoveryResponse(
            await BpmnAnalyticsService.processDiscovery(logs, 'inductive')
          );
          break;
        case 'process-variants':
          result = transformVariantsResponse(
            await BpmnAnalyticsService.processVariants(logs, 10)
          );
          break;
        case 'bottleneck-analysis':
          result = transformBottleneckResponse(
            await BpmnAnalyticsService.bottleneckAnalysis(logs, 'waiting_time')
          );
          break;
        case 'performance-prediction':
          // Pour la prédiction, nous avons besoin d'un cas spécifique
          // Utilisons le premier cas disponible pour cet exemple
          const first = logs[0] || {};
          const caseId = logs.length > 0 ? (first.case_id || first.process_instance_id || first.processInstanceId || first.caseId || null) : null;
          if (!caseId) {
            setError('Aucun cas disponible pour la prédiction');
            setLoading(false);
            return;
          }
          result = transformPredictionResponse(
            await BpmnAnalyticsService.performancePrediction(logs, 'completion_time', { case_id: caseId }),
            logs,
            caseId
          );
          break;
        case 'social-network-analysis':
          result = transformSnaResponse(
            await BpmnAnalyticsService.socialNetworkAnalysis(logs, 'handover_of_work')
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
    setSelectedProcessKey(value);
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
                  value={selectedProcessKey}
                  onChange={handleProcessChange}
                  placeholder="Sélectionner un processus"
                  disabled={loading}
                >
                  {processDefinitions.map(process => (
                    <Select.Option key={process.key} value={process.key}>
                      {process.name || process.key}
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
                  disabled={!selectedProcessKey || loading}
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
