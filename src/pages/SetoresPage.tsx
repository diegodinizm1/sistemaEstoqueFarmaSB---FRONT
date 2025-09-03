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
        } catch (err) {
            setError('Falha ao excluir o setor.');
            console.error(err);
        } finally {
            setSetorToDelete(null);
        }
    };

    const columns: GridColDef<SetorDTO>[] = [
        { field: 'nome', headerName: 'Nome do Setor', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton size="small" onClick={() => handleOpenEditModal(params.row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => setSetorToDelete(params.row)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Stack spacing={3}>
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
                        sx={{
                            '& .MuiDataGrid-columnHeader': {
                                backgroundColor: 'white',
                                color: 'primary.main',
                                fontWeight: 'bold',
                            },
                            backgroundColor: 'white',
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