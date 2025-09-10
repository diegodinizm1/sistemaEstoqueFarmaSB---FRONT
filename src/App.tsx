import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { getAppTheme } from './theme';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ThemeModeProvider, useThemeMode, } from './context/ThemeContext';
import { ptBR } from '@mui/material/locale';
import { ptBR as dataGridPtBR } from '@mui/x-data-grid/locales';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ItensPage from './pages/ItensPage';
import SetoresPage from './pages/SetoresPage';
import MovimentacoesPage from './pages/MovimentacoesPage';
import EstoquePage from './pages/EstoquePage';
import Layout from './components/Layout';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import { useMemo } from 'react';

const ThemedApp = () => {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createTheme(getAppTheme(mode), ptBR, dataGridPtBR), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='pt-br'>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              duration: 3000,
              style: { background: '#2e7d32', color: 'white' },
            },
            error: {
              duration: 5000,
              style: { background: '#d32f2f', color: 'white' },
            },
          }}
        />
        <CssBaseline />

        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRouteWithLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/itens" element={<ItensPage />} />
              <Route path="/estoque" element={<EstoquePage />} />
              <Route path="/setores" element={<SetoresPage />} />
              <Route path="/movimentacoes" element={<MovimentacoesPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const ProtectedRouteWithLayout = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    navigate('/login');
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;