/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, CircularProgress, Paper, Stack, Chip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';

import UsuarioFormModal, { type NewUserFormData } from './UsuarioFormModal';
import ConfirmPasswordModal from './ConfirmPasswordModal';
import { type FuncionarioListaDTO } from '../../types/interface';
import { Global } from '@emotion/react';
import { fadeInUp } from '../../utils/animacao';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const GerenciamentoUsuarios = () => {
    const [usuarios, setUsuarios] = useState<FuncionarioListaDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para os modais de criação
    const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [newUserFormData, setNewUserFormData] = useState<NewUserFormData | null>(null);

    const fetchUsuarios = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get<FuncionarioListaDTO[]>(`${API_BASE_URL}/funcionarios`, { headers: { Authorization: `Bearer ${token}` } });
            setUsuarios(response.data || []);
        } catch (err) {
            toast.error("Você não tem permissão para ver os usuários ou ocorreu um erro.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUsuarios(); }, []);

    // Abre o primeiro modal (formulário)
    const handleOpenAddModal = () => { setIsUserFormModalOpen(true); };

    // Chamado pelo primeiro modal ao clicar em "Próximo"
    const handlePrepareNewUser = (formData: NewUserFormData) => {
        setNewUserFormData(formData);
        setIsUserFormModalOpen(false);
        setIsConfirmModalOpen(true);
    };

    // Chamado pelo segundo modal ao confirmar a senha
    const handleConfirmCreateUser = async (adminPassword: string) => {
        if (!newUserFormData) return;

        // Usamos um toast.promise para gerenciar todos os estados da requisição
        const promise = axios.post(`${API_BASE_URL}/funcionarios`, {
            ...newUserFormData,
            senhaAdminConfirmacao: adminPassword,
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        toast.promise(promise, {
            loading: 'Criando usuário...',
            success: 'Usuário criado com sucesso!',
            error: (err: any) => err.response?.data || 'Falha ao criar usuário.',
        })
            .then(() => {
                fetchUsuarios();
                setIsConfirmModalOpen(false);
            });
    };

    // Coluna de ações foi removida
    const columns: GridColDef<FuncionarioListaDTO>[] = [
        { field: 'nome', headerName: 'Nome', flex: 1.5 },
        { field: 'login', headerName: 'Login', flex: 1 },
        {
            field: 'ativo', headerName: 'Status', flex: 0.8,
            renderCell: (params: GridRenderCellParams) => <Chip label={params.value ? 'Ativo' : 'Inativo'} color={params.value ? 'success' : 'default'} size="small" />
        },
    ];

    return (
        <Stack spacing={2}>
            <Global styles={fadeInUp} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
                    Adicionar Usuário
                </Button>
            </Box>
            <Paper sx={{ height: 500, width: '100%' }}>
                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box> : (
                    <DataGrid
                        rows={usuarios}
                        columns={columns}
                        getRowId={(row) => row.id}
                        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                        sx={{
                            '& .MuiDataGrid-row': {
                                animation: 'fadeInUp 0.5s ease-in-out forwards'
                            }
                        }}
                    />
                )}
            </Paper>

            <UsuarioFormModal
                open={isUserFormModalOpen}
                onClose={() => setIsUserFormModalOpen(false)}
                onSave={handlePrepareNewUser}
            />
            <ConfirmPasswordModal
                open={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmCreateUser}
                isLoading={isLoading} // Passando isLoading para desabilitar botão
            />
        </Stack>
    );
};

export default GerenciamentoUsuarios;