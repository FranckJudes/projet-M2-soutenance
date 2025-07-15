import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { ForceGraph2D } from 'react-force-graph';
import { CSVLink } from "react-csv";

import Main from "../layout/Main";
import "../styles/bpmn-analytics.css";

// Service pour communiquer avec l'API backend
const BpmnAnalyticsService = {
  getAllEventLogs: async () => {
    const response = await axios.get('http://localhost:8200/api/bpmn/analytics/logs');
    return response.data;
  },
  
  getProcessDefinitions: async () => {
    const response = await axios.get('http://localhost:8200/api/bpmn/analytics/process-definitions');
    return response.data;
  },
  
  getProcessMetrics: async (processDefinitionId) => {
    const response = await axios.get(`http://localhost:8200/api/bpmn/analytics/metrics/${processDefinitionId}`);
    return response.data;
  },
  
  getProcessMapData: async (processDefinitionId) => {
    const response = await axios.get(`http://localhost:8200/api/bpmn/analytics/process-map/${processDefinitionId}`);
    return response.data;
  },
  
  exportLogsAsCsv: () => {
    return `/api/bpmn/analytics/export/csv`;
  }
};

// Composant pour afficher les métriques générales
const MetricsOverview = ({ metrics }) => {
  if (!metrics) return <div>Chargement des métriques...</div>;
  
  const { totalInstances, completedInstances, completionRate } = metrics;
  
  const pieData = [
    { name: 'Terminés', value: completedInstances },
    { name: 'En cours', value: totalInstances - completedInstances }
  ];
  
  const COLORS = ['#0088FE', '#FF8042'];
  
  return (
    <div className="metrics-overview">
      <h3>Vue d'ensemble</h3>
      <div className="metrics-cards">
        <div className="metric-card">
          <h4>Instances totales</h4>
          <div className="metric-value">{totalInstances}</div>
        </div>
        <div className="metric-card">
          <h4>Instances terminées</h4>
          <div className="metric-value">{completedInstances}</div>
        </div>
        <div className="metric-card">
          <h4>Taux de complétion</h4>
          <div className="metric-value">{(completionRate * 100).toFixed(2)}%</div>
        </div>
      </div>
      
      <div className="metrics-chart">
        <h4>Statut des instances</h4>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Composant pour afficher les métriques des tâches
const TaskMetrics = ({ metrics }) => {
  if (!metrics || !metrics.tasks) return <div>Chargement des métriques des tâches...</div>;
  
  const taskData = Object.entries(metrics.tasks).map(([key, value]) => ({
    name: key,
    averageDuration: value.averageDuration ? (value.averageDuration / 1000 / 60).toFixed(2) : 0 // Convertir en minutes
  }));
  
  return (
    <div className="task-metrics">
      <h3>Métriques des tâches</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={taskData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Durée moyenne (minutes)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => [`${value} min`, 'Durée moyenne']} />
          <Legend />
          <Bar dataKey="averageDuration" name="Durée moyenne" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Composant pour afficher la carte du processus
const ProcessMap = ({ processMapData }) => {
  if (!processMapData || !processMapData.nodes || !processMapData.edges) {
    return <div>Chargement de la carte du processus...</div>;
  }
  
  // Convertir les données au format attendu par react-force-graph
  const graphData = {
    nodes: processMapData.nodes.map(node => ({
      id: node.id,
      name: node.name,
      val: node.frequency
    })),
    links: processMapData.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      value: edge.value
    }))
  };
  
  return (
    <div className="process-map">
      <h3>Carte du processus</h3>
      <div style={{ height: '500px', border: '1px solid #ddd' }}>
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
    </div>
  );
};

// Composant pour afficher les logs d'événements
const EventLogs = ({ logs }) => {
  if (!logs || logs.length === 0) return <div>Aucun log d'événement disponible</div>;
  
  // Préparer les données pour l'export CSV
  const csvData = logs.map(log => ({
    id: log.id,
    eventType: log.eventType,
    processDefinitionId: log.processDefinitionId,
    processInstanceId: log.processInstanceId,
    taskId: log.taskId || '',
    taskName: log.taskName || '',
    userId: log.userId || '',
    timestamp: log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss') : '',
    durationMs: log.durationMs || ''
  }));
  
  return (
    <div className="event-logs">
      <h3>Logs d'événements</h3>
      <div className="export-buttons">
        <CSVLink
          data={csvData}
          filename={`bpmn_event_logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`}
          className="btn btn-primary"
        >
          Exporter en CSV
        </CSVLink>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type d'événement</th>
              <th>ID de processus</th>
              <th>ID d'instance</th>
              <th>ID de tâche</th>
              <th>Nom de tâche</th>
              <th>Utilisateur</th>
              <th>Timestamp</th>
              <th>Durée (ms)</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 100).map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.eventType}</td>
                <td>{log.processDefinitionId}</td>
                <td>{log.processInstanceId}</td>
                <td>{log.taskId || '-'}</td>
                <td>{log.taskName || '-'}</td>
                <td>{log.userId || '-'}</td>
                <td>{log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss') : '-'}</td>
                <td>{log.durationMs || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length > 100 && (
          <div className="text-center mt-3">
            <em>Affichage limité aux 100 premiers résultats. Utilisez l'export CSV pour voir toutes les données.</em>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant principal
function History() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [processMapData, setProcessMapData] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
        // Charger les métriques
        const metricsData = await BpmnAnalyticsService.getProcessMetrics(selectedProcess);
        setMetrics(metricsData);
        
        // Charger les données de la carte du processus
        const mapData = await BpmnAnalyticsService.getProcessMapData(selectedProcess);
        setProcessMapData(mapData);
        
        // Charger les logs d'événements
        const logsData = await BpmnAnalyticsService.getAllEventLogs();
        setEventLogs(logsData.filter(log => log.processDefinitionId === selectedProcess));
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProcess]);
  
  // Gérer le changement de processus
  const handleProcessChange = (e) => {
    setSelectedProcess(e.target.value);
  };
  
  return (
    <Main>
      <div className="bpmn-analytics">
        <h1>{t('Analyse des processus BPMN')}</h1>
        
        {/* Sélecteur de processus */}
        <div className="process-selector mb-4">
          <label htmlFor="process-select" className="form-label">Sélectionner un processus :</label>
          <select
            id="process-select"
            className="form-select"
            value={selectedProcess}
            onChange={handleProcessChange}
            disabled={loading || processDefinitions.length === 0}
          >
            {processDefinitions.length === 0 && (
              <option value="">Aucun processus disponible</option>
            )}
            {processDefinitions.map(process => (
              <option key={process} value={process}>
                {process}
              </option>
            ))}
          </select>
        </div>
        
        {/* Onglets */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Vue d'ensemble
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'process-map' ? 'active' : ''}`}
              onClick={() => setActiveTab('process-map')}
            >
              Carte du processus
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'task-metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('task-metrics')}
            >
              Métriques des tâches
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'event-logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('event-logs')}
            >
              Logs d'événements
            </button>
          </li>
        </ul>
        
        {/* Contenu des onglets */}
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2">Chargement des données...</p>
          </div>
        ) : (
          <div className="tab-content">
            {activeTab === 'overview' && <MetricsOverview metrics={metrics} />}
            {activeTab === 'process-map' && <ProcessMap processMapData={processMapData} />}
            {activeTab === 'task-metrics' && <TaskMetrics metrics={metrics} />}
            {activeTab === 'event-logs' && <EventLogs logs={eventLogs} />}
          </div>
        )}
      </div>
    </Main>
  );
}

export default History;

// Ajouter ces styles dans votre fichier CSS
/*
.bpmn-analytics {
  padding: 20px;
}

.metrics-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #0d6efd;
}

.metrics-chart {
  margin-bottom: 30px;
}

.process-map {
  margin-bottom: 30px;
}

.event-logs {
  margin-bottom: 30px;
}

.export-buttons {
  margin-bottom: 15px;
  text-align: right;
}

.export-buttons .btn {
  margin-left: 10px;
}
*/
