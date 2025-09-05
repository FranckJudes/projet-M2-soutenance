import './i18n';
import React from "react";
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import NotificationListener from './components/NotificationListener.jsx';

function App() {
  return (
    <>
      <AppRoutes />
      <NotificationListener />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
