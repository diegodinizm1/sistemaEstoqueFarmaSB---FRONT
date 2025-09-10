import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Paper, Stack, Divider, Chip, Button, Grid } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import MedicationIcon from '@mui/icons-material/Medication';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArchiveIcon from '@mui/icons-material/Archive';

import { toast } from 'react-hot-toast';

import ItemFormModal from '../components/AddItemModal';
import MovimentacaoFormModal from '../components/MovimentacaoFormModal';
import RelatorioModal from '../components/RelatorioModal';

import { type DashboardStats, type AlertaEstoque } from '../types/interface';
import MovimentacaoChart from '../components/MovimentacaoChart';
import GraficoEstoque from '../components/GraficoEstoque';
import ConsumoSetorChart from '../components/ConsumoSetorChart';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertasVencimento, setAlertasVencimento] = useState<AlertaEstoque[]>([]);
  const [alertasEstoqueBaixo, setAlertasEstoqueBaixo] = useState<AlertaEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
  const [isSaidaModalOpen, setIsSaidaModalOpen] = useState(false);
  const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      try {
        const [statsRes, vencimentoRes, estoqueBaixoRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/dashboard/vencimento`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/dashboard/estoque-baixo`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data);
        setAlertasVencimento(vencimentoRes.data || []);
        setAlertasEstoqueBaixo(estoqueBaixoRes.data || []);
      } catch (err) {
        toast.error('Falha ao carregar os dados do dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

  }, []);

  const handleSave = () => { useEffect };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight="bold">Dashboard</Typography>

      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography fontWeight="medium">Ações Rápidas:</Typography>
          <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => setIsItemModalOpen(true)}>Adicionar Item</Button>
          <Button variant="outlined" startIcon={<ArchiveIcon />} onClick={() => setIsEntradaModalOpen(true)}>Registrar Entrada</Button>
          <Button variant="outlined" startIcon={<RemoveCircleOutlineIcon />} onClick={() => setIsSaidaModalOpen(true)}>Registrar Saída</Button>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => setIsRelatorioModalOpen(true)}>Gerar Relatório</Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard icon={<MedicationIcon />} value={stats?.totalMedicamentos} title="Medicamentos" color="primary.main" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard icon={<VaccinesIcon />} value={stats?.totalInsumos} title="Insumos" color="secondary.main" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard icon={<EventBusyIcon />} value={stats?.lotesProximosVencimento} title="Lotes a Vencer" color="error.main" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard icon={<InventoryIcon />} value={stats?.itensEstoqueBaixo} title="Estoque Baixo" color="warning.main" /></Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box sx={{ width: { xs: '100%', lg: '40%' } }}>
          <Stack spacing={3}>
            <AlertCard icon={<EventBusyIcon color="error" />} title="Lotes Próximos do Vencimento" data={alertasVencimento} />
            <AlertCard icon={<WarningAmberIcon color="warning" />} title="Itens com Estoque Baixo" data={alertasEstoqueBaixo} />
          </Stack>
        </Box>

        <Box sx={{ width: { xs: '100%', lg: '60%' } }}>
          <GraficoEstoque />
        </Box>
        <Box sx={{ width: { xs: '100%', lg: '60%' } }}>
          <MovimentacaoChart />
        </Box>
      </Box>
      <Box sx={{ width: { xs: '100%', lg: '60%' }, height: 460 }}>
        <ConsumoSetorChart />
      </Box>

      <ItemFormModal open={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onItemSaved={handleSave} itemType="medicamento" itemToEdit={null} />
      <MovimentacaoFormModal open={isSaidaModalOpen} onClose={() => setIsSaidaModalOpen(false)} onMovimentacaoSaved={handleSave} initialType='SAIDA' />
      <MovimentacaoFormModal open={isEntradaModalOpen} onClose={() => setIsEntradaModalOpen(false)} onMovimentacaoSaved={handleSave} initialType='ENTRADA' />
      <RelatorioModal open={isRelatorioModalOpen} onClose={() => setIsRelatorioModalOpen(false)} />
    </Stack>
  );
};

const KPICard = ({ icon, value, title, color }: any) => (<Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 2 }}> <Box sx={{ bgcolor: color, borderRadius: '50%', p: 1.5, display: 'flex', mr: 2, color: 'white' }}>{icon}</Box> <Box><Typography variant="h5" fontWeight="bold">{value ?? 0}</Typography><Typography variant="body2" color="text.secondary">{title}</Typography></Box></Paper>);
const AlertCard = ({ icon, title, data }: any) => (<Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}> <Stack direction="row" spacing={1} alignItems="center" mb={1}>{icon}<Typography variant="h6" fontWeight="bold">{title}</Typography></Stack><Divider /><Box sx={{ mt: 2, maxHeight: 280, overflowY: 'auto' }}>{data && data.length > 0 ? (data.map((item: AlertaEstoque) => (<Box key={item.itemId} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}><Typography variant="body2">{item.nomeItem}</Typography><Chip label={item.extraInfo} size="small" /></Box>))) : (<Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>Nenhum alerta.</Typography>)}</Box></Paper>);

export default DashboardPage;