import { useEffect, useState, useMemo } from 'react';
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
    IconButton
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams} from '@mui/x-data-grid';
import { toast } from 'react-hot-toast';

// --- ÍCONES E COMPONENTES ---
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MedicationIcon from '@mui/icons-material/Medication';
import VaccinesIcon from '@mui/icons-material/Vaccines';

// --- MODAIS E TIPOS ---
import ItemFormModal from '../components/AddItemModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ItemDetailsModal from '../components/ItemDetailsModal';
import { type ItemDTO, type MedicamentoDTO, type InsumoDTO, type DashboardStats } from '../types/interface';

const API_BASE_URL = 'http://localhost:8080/api';

const ItensPage = () => {
    const [allItems, setAllItems] = useState<ItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [tabValue, setTabValue] = useState(0);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ItemDTO | null>(null);
    const [itemToDelete, setItemToDelete] = useState<ItemDTO | null>(null);
    const [itemToView, setItemToView] = useState<ItemDTO | null>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const [itemsRes, statsRes] = await Promise.all([
                axios.get<ItemDTO[]>(`${API_BASE_URL}/itens`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get<DashboardStats>(`${API_BASE_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setAllItems(itemsRes.data || []);
            setStats(statsRes.data);
        } catch (err) {
            // 3. Usa toast para notificar o erro de busca
            toast.error('Falha ao carregar os itens.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const medicamentos = useMemo(() => allItems.filter(item => item.dtype === 'MEDICAMENTO') as MedicamentoDTO[], [allItems]);
    const insumos = useMemo(() => allItems.filter(item => item.dtype === 'INSUMO') as InsumoDTO[], [allItems]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => { setTabValue(newValue); };
    const handleOpenAddModal = () => { setItemToEdit(null); setIsFormModalOpen(true); };
    const handleOpenEditModal = (item: ItemDTO) => { setItemToEdit(item); setIsFormModalOpen(true); };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setItemToEdit(null); };
    const handleItemSaved = () => { fetchItems(); };
    const handleOpenViewModal = (item: ItemDTO) => { setItemToView(item); };
    const handleCloseViewModal = () => { setItemToView(null); };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        const token = localStorage.getItem('token');
        const endpoint = itemToDelete.dtype === 'MEDICAMENTO' ? '/medicamentos' : '/insumos';
        
        const promise = axios.delete(`${API_BASE_URL}${endpoint}/${itemToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });

        // 4. Usa toast.promise para a operação de exclusão
        await toast.promise(promise, {
            loading: 'Excluindo item...',
            success: 'Item excluído com sucesso!',
            error: 'Falha ao excluir o item.',
        });
        
        fetchItems(); // Recarrega os itens após o sucesso
        setItemToDelete(null);
    };

    const columns = useMemo((): GridColDef<ItemDTO>[] => {
        const baseColumns: GridColDef<ItemDTO>[] = [
            { field: 'nome', headerName: 'Nome', flex: 1.2 },
            { field: 'descricaoDetalhada', headerName: 'Descrição', flex: 2 },
            { field: 'unidadeMedida', headerName: 'Unidade', flex: 0.5 },
        ];

        const actionsColumn: GridColDef<ItemDTO> = {
            field: 'actions', headerName: 'Ações', flex: 0.8, sortable: false, filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ width: '100%', height: "100%", display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenViewModal(params.row)}><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleOpenEditModal(params.row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => setItemToDelete(params.row)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            ),
        };

        if (tabValue === 0) {
            const tipoColumn: GridColDef<ItemDTO> = {
                field: 'tipo', headerName: 'Tipo', flex: 0.8,
                //valueGetter: (params) => {
                   // if (params.row?.dtype === 'MEDICAMENTO') { return (params.row as MedicamentoDTO).tipo; }
                   // return 'N/A';
                //},
            };
            return [...baseColumns, tipoColumn, actionsColumn];
        }
        return [...baseColumns, actionsColumn];
    }, [tabValue]); // A dependência correta é só tabValue, pois as funções não mudam

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Gerenciamento de Itens</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>Adicionar Novo Item</Button>
            </Box>

            <Grid container spacing={3}>
                {/* Card de Medicamentos */}
                <Grid size = {{xs : 12, sm : 6}}>
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
                <Grid size = {{xs : 12, sm : 6}}>
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
                            rows={tabValue === 0 ? medicamentos : insumos}
                            columns={columns}
                            getRowId={(row) => row.id}
                            pageSizeOptions={[10, 25, 50, 100]}
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-columnHeader': { backgroundColor: 'white', color: 'primary.main', fontWeight: 'bold' },
                                backgroundColor: 'white',
                            }}
                        />
                    </Box>
                )}
            </Paper>

            <ItemFormModal open={isFormModalOpen} onClose={handleCloseFormModal} onItemSaved={handleItemSaved} itemType={tabValue === 0 ? 'medicamento' : 'insumo'} itemToEdit={itemToEdit} />
            {itemToDelete && (<ConfirmationDialog open={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Confirmar Exclusão" message={`Você tem certeza que deseja excluir o item "${itemToDelete.nome}"?`} />)}
            <ItemDetailsModal open={!!itemToView} onClose={handleCloseViewModal} item={itemToView} />
        </Stack>
    );
};

export default ItensPage;