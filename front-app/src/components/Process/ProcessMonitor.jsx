import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Composant pour monitorer une instance de processus en temps réel
 */
const ProcessMonitor = () => {
  const { id } = useParams();
  const [process, setProcess] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 secondes par défaut
  const intervalRef = useRef(null);
  
  const statusColors = {
    ACTIVE: 'primary',
    COMPLETED: 'success',
    SUSPENDED: 'warning',
    TERMINATED: 'error',
    CANCELLED: 'default'
  };

  useEffect(() => {
    // Charger les données initiales
    fetchData();
    
    // Configurer l'intervalle de rafraîchissement
    intervalRef.current = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id, refreshInterval]);

  // Arrêter le rafraîchissement automatique si le processus n'est plus actif
  useEffect(() => {
    if (process && process.status !== 'ACTIVE') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [process]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchProcessDetails(),
        fetchProcessTasks()
      ]);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Impossible de charger les données du processus. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessDetails = async () => {
    const response = await axios.get(`http://localhost:8080/api/processes/${id}`);
    setProcess(response.data);
    return response.data;
  };

  const fetchProcessTasks = async () => {
    const response = await axios.get(`http://localhost:8080/api/processes/${id}/tasks`);
    setTasks(response.data);
    return response.data;
  };

  const handleRefreshIntervalChange = (interval) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setRefreshInterval(interval);
    
    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm:ss', { locale: fr });
  };

  // Calculer le pourcentage d'avancement basé sur les tâches terminées
  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (loading && !process) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !process) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Processus non trouvé'}</Alert>
        <Box mt={2}>
          <Button component={Link} to="/processes" variant="outlined">
            Retour à la liste
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Monitoring: {process.name}
        </Typography>
        <Box>
          <Button
            component={Link}
            to={`/processes/${id}`}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Détails
          </Button>
          <Button
            component={Link}
            to="/processes"
            variant="outlined"
          >
            Retour à la liste
          </Button>
        </Box>
      </Box>

      {process.status !== 'ACTIVE' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ce processus n'est plus actif. Le rafraîchissement automatique a été désactivé.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" component="div" gutterBottom>
              État du processus
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Statut
              </Typography>
              <Chip
                label={process.status}
                color={statusColors[process.status] || 'default'}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Démarré le
              </Typography>
              <Typography variant="body1">
                {formatDate(process.startTime)}
              </Typography>
            </Box>
            
            {process.endTime && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Terminé le
                </Typography>
                <Typography variant="body1">
                  {formatDate(process.endTime)}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progression
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress()} 
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" align="center">
                {calculateProgress()}%
              </Typography>
            </Box>
            
            {process.status === 'ACTIVE' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Intervalle de rafraîchissement
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Button 
                    variant={refreshInterval === 2000 ? "contained" : "outlined"} 
                    size="small"
                    onClick={() => handleRefreshIntervalChange(2000)}
                  >
                    2s
                  </Button>
                  <Button 
                    variant={refreshInterval === 5000 ? "contained" : "outlined"} 
                    size="small"
                    onClick={() => handleRefreshIntervalChange(5000)}
                  >
                    5s
                  </Button>
                  <Button 
                    variant={refreshInterval === 10000 ? "contained" : "outlined"} 
                    size="small"
                    onClick={() => handleRefreshIntervalChange(10000)}
                  >
                    10s
                  </Button>
                  <Button 
                    variant={refreshInterval === 30000 ? "contained" : "outlined"} 
                    size="small"
                    onClick={() => handleRefreshIntervalChange(30000)}
                  >
                    30s
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" component="div" gutterBottom>
              Tâches en cours
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {tasks.length === 0 ? (
              <Typography variant="body2">Aucune tâche trouvée pour ce processus</Typography>
            ) : (
              <List>
                {tasks.map((task) => (
                  <Card key={task.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <Typography variant="h6">{task.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                          <Chip
                            label={task.status}
                            color={
                              task.status === 'DONE' 
                                ? 'success' 
                                : task.status === 'IN_PROGRESS' 
                                  ? 'primary' 
                                  : 'default'
                            }
                          />
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Assigné à:
                          </Typography>
                          <Typography variant="body2">
                            {task.assignee || 'Non assigné'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Dernière mise à jour:
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(task.lastUpdated || task.createdAt)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProcessMonitor;
