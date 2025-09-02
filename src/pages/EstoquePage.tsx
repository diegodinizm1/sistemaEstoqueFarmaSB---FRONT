import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Stack, IconButton, Chip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import MovimentacaoFormModal from '../components/MovimentacaoFormModal';
import LotesPorItemModal from '../components/LotesPorItemModal';
import { type EstoqueSaldoDTO } from '../types/interface';

const API_BASE_URL = 'http://localhost:8080/api';

const EstoquePage = () => {
    const [saldos, setSaldos] = useState<EstoqueSaldoDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
    const [selectedItemSaldo, setSelectedItemSaldo] = useState<EstoqueSaldoDTO | null>(null);

    const fetchSaldos = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get<EstoqueSaldoDTO[]>(`${API_BASE_URL}/estoque`, { headers: { Authorization: `Bearer ${token}` } });
            setSaldos(response.data || []);
        } catch (err) { 
            setError('Falha ao carregar o estoque.'); 
            console.error(err);
        } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchSaldos(); }, []);

    const handleOpenMovimentacaoModal = (type: 'ENTRADA' | 'SAIDA') => { setModalType(type); setIsMovimentacaoModalOpen(true); };
    const handleSave = () => { fetchSaldos(); };

    const columns: GridColDef<EstoqueSaldoDTO>[] = [
        { field: 'nomeItem', headerName: 'Item', flex: 2 },
        { field: 'dtype', headerName: 'Categoria', flex: 1, renderCell: (params: GridRenderCellParams) => (<Chip label={params.value} size="small" />) },
        { field: 'quantidadeTotal', headerName: 'Quantidade Total', flex: 1 },
        {
            field: 'actions', headerName: 'Lotes', flex: 0.5, sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton size="small" onClick={() => setSelectedItemSaldo(params.row)} aria-label="ver lotes">
                    <PlaylistPlayIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Saldo de Estoque</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenMovimentacaoModal('ENTRADA')}>Registrar Entrada</Button>
                    <Button variant="contained" color="warning" startIcon={<RemoveCircleOutlineIcon />} onClick={() => handleOpenMovimentacaoModal('SAIDA')}>Registrar Saída</Button>
                </Stack>
            </Box>

            <Paper sx={{ height: 650, width: '100%' }}>
                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box> :
                 error ? <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box> :
                <DataGrid rows={saldos} columns={columns} getRowId={(row) => row.itemId}
                 sx={{
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: 'white',
                                color: 'primary.main',
                                fontWeight: 'bold',
                            },
                            backgroundColor: 'white',
                        }}
                 />}
            </Paper>
            
            <MovimentacaoFormModal open={isMovimentacaoModalOpen} onClose={() => setIsMovimentacaoModalOpen(false)} onMovimentacaoSaved={handleSave} initialType={modalType} />
            
            <LotesPorItemModal open={!!selectedItemSaldo} onClose={() => setSelectedItemSaldo(null)} itemSaldo={selectedItemSaldo} onLotesUpdated={handleSave} />
        </Stack>
    );
};

export default EstoquePage;