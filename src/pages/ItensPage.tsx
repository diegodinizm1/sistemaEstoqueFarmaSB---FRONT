/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Divider,
    Tabs,
    Tab,
    Grid,
    Stack,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { toast } from 'react-hot-toast';
import { fadeInUp } from '../utils/animacao';

// --- ÍCONES E COMPONENTES ---
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MedicationIcon from '@mui/icons-material/Medication';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SearchIcon from '@mui/icons-material/Search';

// --- MODAIS E TIPOS ---
import ItemFormModal from '../components/AddItemModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ItemDetailsModal from '../components/ItemDetailsModal';
import { type ItemDTO, type DashboardStats } from '../types/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import MovimentacaoFormModal from '../components/MovimentacaoFormModal';
import { Global } from '@emotion/react';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

const ItensPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = location.state?.initialTab ?? 0;

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [tabValue, setTabValue] = useState(initialTab);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rows, setRows] = useState<ItemDTO[]>([]);
    const [rowCount, setRowCount] = useState(0);

    const [filtroBusca, setFiltroBusca] = useState('');
    const [termoBusca, setTermoBusca] = useState('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ItemDTO | null>(null);
    const [itemToDelete, setItemToDelete] = useState<ItemDTO | null>(null);
    const [itemToView, setItemToView] = useState<ItemDTO | null>(null);
    const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
    const [itemParaEntrada, setItemParaEntrada] = useState<ItemDTO | null>(null);

    // Envolvendo a função principal de busca com useCallback
    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const itemType = tabValue === 0 ? 'MEDICAMENTO' : 'INSUMO';

        try {
            const params = new URLSearchParams({
                page: paginationModel.page.toString(),
                size: paginationModel.pageSize.toString(),
                sort: 'nome,asc',
                dtype: itemType,
            });
            if (termoBusca) {
                params.append('busca', termoBusca);
            }

            const [itemsRes, statsRes] = await Promise.all([
                axios.get<{ content: ItemDTO[], totalElements: number }>(`${API_BASE_URL}/itens`, { headers: { Authorization: `Bearer ${token}` }, params }),
                axios.get<DashboardStats>(`${API_BASE_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setRows(itemsRes.data.content || []);
            setRowCount(itemsRes.data.totalElements || 0);
            setStats(statsRes.data);
        } catch (err) {
            toast.error('Falha ao carregar os dados da página.');
        } finally {
            setIsLoading(false);
        }
    }, [paginationModel, tabValue, termoBusca]); // Dependências corretas

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);
    
    // Envolvendo todos os handlers em useCallback para estabilizá-los
    const handleSearch = useCallback(() => {
        setTermoBusca(filtroBusca);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    }, [filtroBusca]);

    const handleClearSearch = useCallback(() => {
        setFiltroBusca('');
        setTermoBusca('');
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    }, []);

    const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setPaginationModel(prev => ({ ...prev, page: 0 }));
    }, []);
    
    const handleItemSaved = useCallback(() => { fetchPageData(); }, [fetchPageData]);
    const handleOpenAddModal = useCallback(() => { setItemToEdit(null); setIsFormModalOpen(true); }, []);
    const handleOpenEditModal = useCallback((item: ItemDTO) => { setItemToEdit(item); setIsFormModalOpen(true); }, []);
    const handleCloseFormModal = useCallback(() => { setIsFormModalOpen(false); setItemToEdit(null); }, []);
    const handleOpenViewModal = useCallback((item: ItemDTO) => { setItemToView(item); }, []);
    const handleCloseViewModal = useCallback(() => { setItemToView(null); }, []);
    const handleStockAction = useCallback((item: ItemDTO) => {
        if (item.possuiEstoque) {
            navigate('/estoque', { state: { itemIdToScroll: item.id } });
        } else {
            setItemParaEntrada(item);
            setIsEntradaModalOpen(true);
        }
    }, [navigate]);

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const token = localStorage.getItem('token');
        const endpoint = itemToDelete.dtype === 'MEDICAMENTO' ? '/medicamentos' : '/insumos';
        const promise = axios.delete(`${API_BASE_URL}${endpoint}/${itemToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });

        await toast.promise(promise, {
            loading: 'Excluindo item...',
            success: 'Item excluído com sucesso!',
            error: 'Falha ao excluir o item.',
        });
        
        fetchPageData();
        setItemToDelete(null);
    };

    const columns = useMemo((): GridColDef<ItemDTO>[] => {
        const baseColumns: GridColDef<ItemDTO>[] = [
            { field: 'nome', headerName: 'Nome', align: 'center',headerAlign: 'center', flex: 1.2 },
            { field: 'descricaoDetalhada', headerName: 'Descrição', align: 'center',headerAlign: 'center', flex: 2 },
            { field: 'unidadeMedida', headerName: 'Unidade', align: 'center',headerAlign: 'center', flex: 0.8 },
        ];

        const actionsColumn: GridColDef<ItemDTO> = {
            field: 'actions', headerName: 'Ações', flex: 1, sortable: false, filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ width: '100%', height: "100%", display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Detalhes" arrow><IconButton size="small" onClick={() => handleOpenViewModal(params.row)} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.28)' } }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEditModal(params.row)} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.28)' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Deletar (Não deve conter movimentações)" arrow><IconButton size="small" onClick={() => setItemToDelete(params.row)} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.28)' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip arrow title={params.row.possuiEstoque ? "Ver no estoque" : "Registrar primeira entrada"} ><IconButton size="small" onClick={() => handleStockAction(params.row)} color={params.row.possuiEstoque ? 'primary' : 'success'} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.28)' } }}><StorefrontIcon fontSize="small" /> </IconButton></Tooltip>
                </Box>
            ),
        };

        if (tabValue === 0) {
            const tipoColumn: GridColDef<ItemDTO> = {
                field: 'tipo', headerName: 'Tipo', flex: 0.8, align: 'center',headerAlign: 'center',
                //valueGetter: (params) => {
                // if (params.row?.dtype === 'MEDICAMENTO') { return (params.row as MedicamentoDTO).tipo; }
                // return 'N/A';
                //},
            };
            return [...baseColumns, tipoColumn, actionsColumn];
        }
        return [...baseColumns, actionsColumn];
    }, [tabValue, handleStockAction, handleOpenViewModal, handleOpenEditModal]); // A dependência correta é só tabValue, pois as funções não mudam

    return (
        <Stack spacing={3}>
            <Global styles={fadeInUp} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Gerenciamento de Itens</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>Adicionar Novo Item</Button>
            </Box>

            <Grid container spacing={3}>
                {/* Card de Medicamentos */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 2 }}>
                        <MedicationIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {`${stats?.medicamentosComEstoque ?? 0} / ${stats?.totalMedicamentos ?? 0}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Medicamentos em Estoque
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Card de Insumos */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 2 }}>
                        <VaccinesIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {`${stats?.insumosComEstoque ?? 0} / ${stats?.totalInsumos ?? 0}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Insumos em Estoque
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{xs:12, sm:8}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Buscar por nome ou descrição..."
                            value={filtroBusca}
                            onChange={(e) => setFiltroBusca(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                                startAdornment: ( <InputAdornment position="start"><SearchIcon /></InputAdornment> ),
                            }}
                        />
                    </Grid>
                    <Grid size={{xs:6, sm:2}}>
                        <Button variant="contained" onClick={handleSearch} fullWidth>Buscar</Button>
                    </Grid>
                    <Grid size={{xs:6, sm:2}}>
                        <Button variant="outlined" onClick={handleClearSearch} fullWidth>Limpar</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Medicamentos" />
                    <Tab label="Insumos" />
                </Tabs>
                <Divider />
                {isLoading && (<Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 400 }}><CircularProgress /></Box>)}


                {!isLoading && (
                    <Box sx={{ flexGrow: 1, width: '100%', height: 500 }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            getRowId={(row) => row.id}
                            pageSizeOptions={[10, 25, 50, 100]}
                            showColumnVerticalBorder
                            showToolbar
                            showCellVerticalBorder
                            rowCount={rowCount}
                            loading={isLoading}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            disableColumnResize
                            disableRowSelectionOnClick
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
                        />
                    </Box>
                )}
            </Paper>

            <ItemFormModal open={isFormModalOpen} onClose={handleCloseFormModal} onItemSaved={handleItemSaved} itemType={tabValue === 0 ? 'medicamento' : 'insumo'} itemToEdit={itemToEdit} />
            {itemToDelete && (<ConfirmationDialog open={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" message={`Você tem certeza que deseja excluir o item "${itemToDelete.nome}"?`} />)}
            <ItemDetailsModal open={!!itemToView} onClose={handleCloseViewModal} item={itemToView} />
            <MovimentacaoFormModal
                open={isEntradaModalOpen}
                onClose={() => setIsEntradaModalOpen(false)}
                onMovimentacaoSaved={() => {
                    setIsEntradaModalOpen(false);
                    handleItemSaved(); // Recarrega os dados da página
                }}
                initialType='ENTRADA'
                itemToRegister={itemParaEntrada} // Passa o item para ser pré-selecionado
            />
        </Stack>
    );
};

export default ItensPage;