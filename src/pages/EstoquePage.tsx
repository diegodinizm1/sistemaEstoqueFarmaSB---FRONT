import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Stack, IconButton, Chip, Tooltip, Grid, TextField, InputAdornment } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import MovimentacaoFormModal from '../components/MovimentacaoFormModal';
import LotesPorItemModal from '../components/LotesPorItemModal';
import { type EstoqueSaldoDTO } from '../types/interface';
import toast from 'react-hot-toast';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation } from 'react-router-dom';
import { Global } from '@emotion/react';
import { fadeInUp } from '../utils/animacao';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

const EstoquePage = () => {
    const location = useLocation();
    const apiRef = useGridApiRef();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rows, setRows] = useState<EstoqueSaldoDTO[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [filtroBusca, setFiltroBusca] = useState('');
    const [termoBusca, setTermoBusca] = useState('');

    const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
    const [selectedItemSaldo, setSelectedItemSaldo] = useState<EstoqueSaldoDTO | null>(null);

    const fetchSaldos = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {

            const params = new URLSearchParams({
                page: paginationModel.page.toString(),
                size: paginationModel.pageSize.toString(),
                sort: 'item.nome,asc',
            });
            if (termoBusca) params.append('busca', termoBusca);

            const response = await axios.get<{ content: EstoqueSaldoDTO[], totalElements: number }>(`${API_BASE_URL}/estoque`, { headers: { Authorization: `Bearer ${token}` }, params });

            setRows(response.data.content || []);
            setRowCount(response.data.totalElements || 0);
        } catch (err) {
            toast.error('Falha ao carregar o estoque.');
        } finally {
            setIsLoading(false);
        }
    }, [paginationModel, termoBusca]); // Dependências corretas

    // 2. useEffect agora chama a função memorizada
    useEffect(() => {
        fetchSaldos();
    }, [fetchSaldos]);

    useEffect(() => {
        const itemIdToScroll = location.state?.itemIdToScroll;

        // Roda apenas se houver um ID e os dados já tiverem carregado
        if (itemIdToScroll && !isLoading && rows.length > 0 && apiRef.current) {
            const rowIndex = rows.findIndex(row => row.itemId === itemIdToScroll);

            if (rowIndex !== -1) {
                // O comando para rolar a tabela até a linha do item
                apiRef.current.scrollToIndexes({ rowIndex });

                // Limpa o estado da navegação para não rolar de novo se o usuário der F5
                window.history.replaceState({}, document.title);
            }
        }
    }, [isLoading, rows, location.state, apiRef]);

    const handleSearch = () => {
        setTermoBusca(filtroBusca);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handleClearSearch = () => {
        setFiltroBusca('');
        setTermoBusca('');
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    };

    const handleOpenMovimentacaoModal = (type: 'ENTRADA' | 'SAIDA') => { setModalType(type); setIsMovimentacaoModalOpen(true); };
    const handleSave = () => { fetchSaldos(); };

    const columns: GridColDef<EstoqueSaldoDTO>[] = [
        { field: 'nomeItem', headerName: 'Item', align: 'center', headerAlign: 'center', flex: 1.3 },
        { field: 'dtype', headerName: 'Categoria', flex: 1, align: 'center', headerAlign: 'center', renderCell: (params: GridRenderCellParams) => (<Chip label={params.value} size="small" />) },
        { field: 'quantidadeTotal', headerName: 'Quantidade Total', align: 'center', headerAlign: 'center', flex: 1 },
        {
            field: 'actions', headerName: 'Lotes', flex: 0.5, align: 'center', headerAlign: 'center', sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Ver Lotes">
                    <IconButton size="small" onClick={() => setSelectedItemSaldo(params.row)} aria-label="ver lotes">
                        <PlaylistPlayIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    return (
        <Stack spacing={3}>
            <Global styles={fadeInUp} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Saldo de Estoque</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenMovimentacaoModal('ENTRADA')}>Registrar Entrada</Button>
                    <Button variant="contained" color="warning" startIcon={<RemoveCircleOutlineIcon />} onClick={() => handleOpenMovimentacaoModal('SAIDA')}>Registrar Saída</Button>
                </Stack>
            </Box>

            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth variant="outlined" size="small" placeholder="Buscar por nome do item..." value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} onKeyUp={(e) => e.key === 'Enter' && handleSearch()} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /></Grid>
                    <Grid size={{ xs: 6, sm: 2 }}><Button variant="contained" onClick={handleSearch} fullWidth>Buscar</Button></Grid>
                    <Grid size={{ xs: 6, sm: 2 }}><Button variant="outlined" onClick={handleClearSearch} fullWidth>Limpar</Button></Grid>
                </Grid>
            </Paper>

            <Paper sx={{ height: 650, width: '100%' }}>
                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box> :
                    error ? <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box> :
                        <DataGrid
                            rowCount={rowCount}
                            rows={rows}
                            columns={columns}
                            loading={isLoading}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            disableColumnResize
                            showColumnVerticalBorder
                            showToolbar
                            showCellVerticalBorder
                            pageSizeOptions={[10, 25, 50]}
                            getRowId={(row) => row.itemId}
                            sx={{
                                '& .MuiDataGrid-row': {
                                    animation: 'fadeInUp 0.5s ease-in-out forwards',
                                    opacity: 0,
                                },
                                '& .MuiDataGrid-row:nth-of-type(1)': { animationDelay: '0.05s' },
                                '& .MuiDataGrid-row:nth-of-type(2)': { animationDelay: '0.1s' },
                                '& .MuiDataGrid-row:nth-of-type(3)': { animationDelay: '0.15s' },
                                '& .MuiDataGrid-row:nth-of-type(4)': { animationDelay: '0.2s' },
                                '& .MuiDataGrid-row:nth-of-type(5)': { animationDelay: '0.25s' },
                                '& .MuiDataGrid-row:nth-of-type(6)': { animationDelay: '0.3s' },
                                '& .MuiDataGrid-row:nth-of-type(7)': { animationDelay: '0.35s' },
                                '& .MuiDataGrid-row:nth-of-type(8)': { animationDelay: '0.4s' },
                                '& .MuiDataGrid-row:nth-of-type(9)': { animationDelay: '0.45s' },
                                '& .MuiDataGrid-row:nth-of-type(10)': { animationDelay: '0.5s' },
                            }}
                        />}
            </Paper>

            <MovimentacaoFormModal open={isMovimentacaoModalOpen} onClose={() => setIsMovimentacaoModalOpen(false)} onMovimentacaoSaved={handleSave} initialType={modalType} />

            <LotesPorItemModal open={!!selectedItemSaldo} onClose={() => setSelectedItemSaldo(null)} itemSaldo={selectedItemSaldo} onLotesUpdated={handleSave} />
        </Stack>
    );
};

export default EstoquePage;