import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';

/**
 * Composant pour démarrer une nouvelle instance de processus
 */
const ProcessForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [processDefinitions, setProcessDefinitions] = useState([]);
  const [loadingDefinitions, setLoadingDefinitions] = useState(true);
  
  const [formData, setFormData] = useState({
    processDefinitionId: '',
    name: '',
    description: '',
    initiatorId: 'current-user', // Remplacer par l'ID de l'utilisateur actuel
    variables: {}
  });

  // Variables personnalisées pour le processus
  const [variables, setVariables] = useState([
    { key: '', value: '' }
  ]);

  useEffect(() => {
    fetchProcessDefinitions();
  }, []);

  const fetchProcessDefinitions = async () => {
    try {
      // Remplacer par l'API réelle pour récupérer les définitions de processus
      const response = await axios.get('http://localhost:8080/api/process-definitions');
      setProcessDefinitions(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des définitions de processus:', err);
      setError('Impossible de charger les définitions de processus. Veuillez réessayer plus tard.');
      setProcessDefinitions([]);
    } finally {
      setLoadingDefinitions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
    
    // Mettre à jour les variables dans formData
    const variablesObject = {};
    newVariables.forEach(variable => {
      if (variable.key && variable.value) {
        variablesObject[variable.key] = variable.value;
      }
    });
    
    setFormData({
      ...formData,
      variables: variablesObject
    });
  };

  const addVariableField = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const removeVariableField = (index) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
    
    // Mettre à jour les variables dans formData
    const variablesObject = {};
    newVariables.forEach(variable => {
      if (variable.key && variable.value) {
        variablesObject[variable.key] = variable.value;
      }
    });
    
    setFormData({
      ...formData,
      variables: variablesObject
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8080/api/processes', formData);
      setSuccess(true);
      
      // Rediriger vers la page de détails du processus après 2 secondes
      setTimeout(() => {
        navigate(`/processes/${response.data.id}`);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors du démarrage du processus:', err);
      setError('Impossible de démarrer le processus. Veuillez réessayer plus tard.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Démarrer un nouveau processus
        </Typography>
        <Button
          component={Link}
          to="/processes"
          variant="outlined"
        >
          Retour à la liste
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Processus démarré avec succès ! Redirection en cours...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={loadingDefinitions}>
                <InputLabel id="process-definition-label">Définition de processus</InputLabel>
                <Select
                  labelId="process-definition-label"
                  name="processDefinitionId"
                  value={formData.processDefinitionId}
                  label="Définition de processus"
                  onChange={handleInputChange}
                >
                  {loadingDefinitions ? (
                    <MenuItem disabled>Chargement...</MenuItem>
                  ) : (
                    processDefinitions.map((definition) => (
                      <MenuItem key={definition.id} value={definition.id}>
                        {definition.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nom du processus"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Variables du processus
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {variables.map((variable, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={5}>
                    <TextField
                      label="Clé"
                      value={variable.key}
                      onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      label="Valeur"
                      value={variable.value}
                      onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2} display="flex" alignItems="center">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeVariableField(index)}
                      disabled={variables.length === 1}
                    >
                      Supprimer
                    </Button>
                  </Grid>
                </Grid>
              ))}

              <Button
                variant="outlined"
                onClick={addVariableField}
                sx={{ mt: 1 }}
              >
                Ajouter une variable
              </Button>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !formData.processDefinitionId || !formData.name}
                >
                  {loading ? <CircularProgress size={24} /> : 'Démarrer le processus'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProcessForm;
