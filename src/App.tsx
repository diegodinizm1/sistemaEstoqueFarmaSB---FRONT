import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Importando o nosso tema customizado (com cores e traduções)
import { getAppTheme } from './theme';

// Importando provedor de localização para componentes de data (DatePicker, etc)
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br'; // Importa a linguagem pt-br para a biblioteca de datas
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ThemeModeProvider, useThemeMode, } from './context/ThemeContext';
import { ptBR } from '@mui/material/locale';
import { ptBR as dataGridPtBR } from '@mui/x-data-grid/locales';

// Importando nossos componentes de página e layout
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ItensPage from './pages/ItensPage';
import SetoresPage from './pages/SetoresPage';
import MovimentacoesPage from './pages/MovimentacoesPage';
import EstoquePage from './pages/EstoquePage';
import Layout from './components/Layout';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import { useMemo } from 'react';

// Componente principal da Aplicação
const ThemedApp = () => {
  const { mode } = useThemeMode(); // Pega o modo atual ('light' ou 'dark')
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
            {/* Rota pública de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas Protegidas que usarão nosso Layout Principal */}
            <Route element={<ProtectedRouteWithLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/itens" element={<ItensPage />} />
              <Route path="/estoque" element={<EstoquePage />} />
              <Route path="/setores" element={<SetoresPage />} />
              <Route path="/movimentacoes" element={<MovimentacoesPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            </Route>

            {/* Redirecionamentos padrão */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

// Componente auxiliar para proteger rotas e aplicar o Layout
const ProtectedRouteWithLayout = () => {
  const navigate = useNavigate();
  // Verifica se o token de autenticação existe no localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    navigate('/login');
  }

  // Se estiver autenticado, renderiza o Layout,
  // e o <Outlet /> será substituído pelo componente da rota filha (DashboardPage, ItensPage, etc.)
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App = () => {
  return (
    <ThemeModeProvider> {/* Envolve com o provider de tema */}
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;