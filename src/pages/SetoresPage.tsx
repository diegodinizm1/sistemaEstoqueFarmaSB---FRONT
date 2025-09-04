import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Stack, IconButton } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import SetorFormModal from '../components/SetorFormModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { type SetorDTO } from '../types/interface';
import toast from 'react-hot-toast';
import { Global } from '@emotion/react';
import { fadeInUp } from '../utils/animacao';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const SetoresPage = () => {
    const [setores, setSetores] = useState<SetorDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [setorToEdit, setSetorToEdit] = useState<SetorDTO | null>(null);
    const [setorToDelete, setSetorToDelete] = useState<SetorDTO | null>(null);

    const fetchSetores = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get<SetorDTO[]>(`${API_BASE_URL}/setores`, { headers: { Authorization: `Bearer ${token}` } });
            setSetores(response.data || []);
        } catch (err) {
            setError('Falha ao carregar os setores.');
            toast.error('Falha ao carregar os setores.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSetores(); }, []);

    const handleOpenAddModal = () => { setSetorToEdit(null); setIsFormModalOpen(true); };
    const handleOpenEditModal = (setor: SetorDTO) => { setSetorToEdit(setor); setIsFormModalOpen(true); };
    const handleCloseFormModal = () => { setIsFormModalOpen(false); setSetorToEdit(null); };
    const handleSetorSaved = () => { fetchSetores(); };

    const handleConfirmDelete = async () => {
        if (!setorToDelete) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/setores/${setorToDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchSetores();
            toast.success('Setor excluído com sucesso.');
        } catch (err) {
            setError('Falha ao excluir o setor.');
            toast.error('Falha ao excluir o setor. Verifique se há itens associados a ele.');
            console.error(err);
        } finally {
            setSetorToDelete(null);
        }
    };

    const columns: GridColDef<SetorDTO>[] = [
        { field: 'nome', headerName: 'Nome do Setor', flex: 0.5 },
        {
            field: 'actions',
            headerName: 'Ações',
            flex: 0.1,
            align: 'center',
            headerAlign: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton size="medium" onClick={() => handleOpenEditModal(params.row)}><EditIcon fontSize="medium" /></IconButton>
                    <IconButton size="medium" onClick={() => setSetorToDelete(params.row)}><DeleteIcon fontSize="medium" /></IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Stack spacing={3}>
            <Global styles={fadeInUp} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold">Gerenciamento de Setores</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                    Adicionar Novo Setor
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>}
                {error && !isLoading && <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>}
                {!isLoading && !error && (
                    <DataGrid
                        rows={setores}
                        columns={columns}
                        getRowId={(row) => row.id}
                        initialState={{ pagination: { paginationModel: { pageSize: 12, page: 0 } } }}
                        disableColumnResize
                        showColumnVerticalBorder
                        showCellVerticalBorder
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
                )}
            </Paper>

            <SetorFormModal
                open={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSetorSaved={handleSetorSaved}
                setorToEdit={setorToEdit}
            />
            {setorToDelete && (
                <ConfirmationDialog
                    open={!!setorToDelete}
                    onClose={() => setSetorToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Exclusão"
                    message={`Tem certeza que deseja excluir o setor "${setorToDelete.nome}"?`}
                />
            )}
        </Stack>
    );
};

export default SetoresPage;