import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Import des composants
import ProcessList from '../components/Process/ProcessList';
import ProcessDetails from '../components/Process/ProcessDetails';
import ProcessForm from '../components/Process/ProcessForm';
import ProcessMonitor from '../components/Process/ProcessMonitor';

/**
 * Routes pour la gestion des processus
 */
const ProcessRoutes = () => {
  return (
    <Routes>
      <Route path="/processes" element={<ProcessList />} />
      <Route path="/processes/new" element={<ProcessForm />} />
      <Route path="/processes/:id" element={<ProcessDetails />} />
      <Route path="/processes/:id/monitor" element={<ProcessMonitor />} />
    </Routes>
  );
};

export default ProcessRoutes;
