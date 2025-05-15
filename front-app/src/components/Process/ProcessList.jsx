import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Composant pour afficher la liste des instances de processus
 */
const ProcessList = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  
  const statusColors = {
    ACTIVE: 'primary',
    COMPLETED: 'success',
    SUSPENDED: 'warning',
    TERMINATED: 'error',
    CANCELLED: 'default'
  };

  useEffect(() => {
    fetchProcesses();
  }, [page, statusFilter]);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:8080/api/processes?page=${page}&size=10${statusFilter ? `&status=${statusFilter}` : ''}`;
      const response = await axios.get(url);
      setProcesses(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des processus:', err);
      setError('Impossible de charger les processus. Veuillez réessayer plus tard.');
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
  };

  if (loading && processes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Instances de processus
        </Typography>
        <Button
          component={Link}
          to="/processes/new"
          variant="contained"
          color="primary"
        >
          Démarrer un nouveau processus
        </Button>
      </Box>

      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Filtrer par statut</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Filtrer par statut"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="ACTIVE">Actif</MenuItem>
            <MenuItem value="COMPLETED">Terminé</MenuItem>
            <MenuItem value="SUSPENDED">Suspendu</MenuItem>
            <MenuItem value="TERMINATED">Interrompu</MenuItem>
            <MenuItem value="CANCELLED">Annulé</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {processes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">Aucun processus trouvé</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Initiateur</TableCell>
                  <TableCell>Date de début</TableCell>
                  <TableCell>Date de fin</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell>{process.name}</TableCell>
                    <TableCell>{process.initiatorId}</TableCell>
                    <TableCell>{formatDate(process.startTime)}</TableCell>
                    <TableCell>{formatDate(process.endTime)}</TableCell>
                    <TableCell>
                      <Chip
                        label={process.status}
                        color={statusColors[process.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          component={Link}
                          to={`/processes/${process.id}`}
                          size="small"
                          variant="outlined"
                        >
                          Détails
                        </Button>
                        {process.status === 'ACTIVE' && (
                          <Button
                            component={Link}
                            to={`/processes/${process.id}/monitor`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          >
                            Monitorer
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProcessList;
