import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Composant pour afficher les détails d'une instance de processus
 */
const ProcessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openTerminateDialog, setOpenTerminateDialog] = useState(false);
  
  const statusColors = {
    ACTIVE: 'primary',
    COMPLETED: 'success',
    SUSPENDED: 'warning',
    TERMINATED: 'error',
    CANCELLED: 'default'
  };

  useEffect(() => {
    fetchProcessDetails();
    fetchProcessTasks();
  }, [id]);

  const fetchProcessDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/processes/${id}`);
      setProcess(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des détails du processus:', err);
      setError('Impossible de charger les détails du processus. Veuillez réessayer plus tard.');
      setProcess(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/processes/${id}/tasks`);
      setTasks(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches du processus:', err);
      setTasks([]);
    }
  };

  const handleTerminateProcess = async () => {
    try {
      await axios.put(`http://localhost:8080/api/processes/${id}/terminate`, {
        userId: 'current-user', // Remplacer par l'ID de l'utilisateur actuel
      });
      setOpenTerminateDialog(false);
      fetchProcessDetails(); // Rafraîchir les détails du processus
    } catch (err) {
      console.error('Erreur lors de la terminaison du processus:', err);
      setError('Impossible de terminer le processus. Veuillez réessayer plus tard.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
  };

  if (loading) {
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
          {process.name}
        </Typography>
        <Box>
          <Button
            component={Link}
            to="/processes"
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Retour à la liste
          </Button>
          {process.status === 'ACTIVE' && (
            <>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenTerminateDialog(true)}
                sx={{ ml: 1 }}
              >
                Interrompre
              </Button>
              <Button
                component={Link}
                to={`/processes/${id}/monitor`}
                variant="contained"
                color="primary"
                sx={{ ml: 1 }}
              >
                Monitorer
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" component="div" gutterBottom>
              Informations générales
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  ID
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{process.id}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Statut
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={process.status}
                  color={statusColors[process.status] || 'default'}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Initiateur
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{process.initiatorId}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Définition
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{process.processDefinitionId}</Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" component="div" gutterBottom>
              Dates
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Démarré le
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{formatDate(process.startTime)}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Terminé le
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{formatDate(process.endTime)}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Durée
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {process.startTime && (process.endTime 
                    ? calculateDuration(process.startTime, process.endTime)
                    : calculateDuration(process.startTime, new Date()))}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" component="div" gutterBottom>
          Tâches
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {tasks.length === 0 ? (
          <Typography variant="body2">Aucune tâche trouvée pour ce processus</Typography>
        ) : (
          <List>
            {tasks.map((task) => (
              <ListItem key={task.id} divider>
                <ListItemText
                  primary={task.name}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {task.description}
                      </Typography>
                      <br />
                      <Chip
                        label={task.status}
                        color={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'primary' : 'default'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Dialogue de confirmation pour terminer le processus */}
      <Dialog
        open={openTerminateDialog}
        onClose={() => setOpenTerminateDialog(false)}
      >
        <DialogTitle>Confirmer l'interruption</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir interrompre ce processus ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTerminateDialog(false)}>Annuler</Button>
          <Button onClick={handleTerminateProcess} color="error" autoFocus>
            Interrompre
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Fonction utilitaire pour calculer la durée entre deux dates
const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = Math.abs(end - start);
  
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  let result = '';
  if (days > 0) result += `${days} jour${days > 1 ? 's' : ''} `;
  if (hours > 0) result += `${hours} heure${hours > 1 ? 's' : ''} `;
  if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''} `;
  
  return result.trim() || 'Moins d\'une minute';
};

export default ProcessDetails;
