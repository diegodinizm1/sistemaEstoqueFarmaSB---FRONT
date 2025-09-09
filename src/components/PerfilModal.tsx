/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Box, Typography, Stack, TextField, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { type UsuarioPerfilDTO } from '../types/interface';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

interface PerfilModalProps {
    open: boolean;
    onClose: () => void;
}

const PerfilModal = ({ open, onClose }: PerfilModalProps) => {
    const { fetchUser } = useAuth();
    
    const [infoData, setInfoData] = useState({ nome: '', login: '' });
    const [senhaData, setSenhaData] = useState({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
    const [isLoading, setIsLoading] = useState(true); // Começa como true para a busca inicial

    useEffect(() => {
        if (open) {
            const fetchPerfilData = async () => {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                try {
                    const response = await axios.get<UsuarioPerfilDTO>(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
                    setInfoData({ nome: response.data.nome, login: response.data.login });
                } catch (error) {
                    toast.error("Não foi possível carregar os dados do perfil.");
                    console.error("Erro ao buscar perfil:", error);
                    onClose(); // Fecha o modal se houver erro
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPerfilData();
        } else {
            // Limpa os formulários ao fechar
            setSenhaData({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
        }
    }, [open, onClose]);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInfoData({ ...infoData, [e.target.name]: e.target.value });
    };

    const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSenhaData({ ...senhaData, [e.target.name]: e.target.value });
    };

    const handleUpdateInfo = async () => {
        setIsLoading(true);
        const promise = axios.put(`${API_BASE_URL}/usuarios/perfil`, infoData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        
        toast.promise(promise, {
            loading: 'Salvando...',
            success: 'Informações atualizadas!',
            error: (err: any) => err.response?.data || 'Falha ao atualizar.',
        })
        .then(() => {
            fetchUser();
            onClose();
        })
        .finally(() => setIsLoading(false));
    };

    const handleUpdateSenha = async () => {
        if (senhaData.novaSenha !== senhaData.confirmarNovaSenha) {
            toast.error("A nova senha e a confirmação não coincidem.");
            return;
        }
        setIsLoading(true);
        const promise = axios.put(`${API_BASE_URL}/usuarios/perfil/alterar-senha`, { senhaAtual: senhaData.senhaAtual, novaSenha: senhaData.novaSenha }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

        toast.promise(promise, {
            loading: 'Alterando senha...',
            success: 'Senha alterada com sucesso!',
            error: (err: any) => err.response?.data || 'Falha ao alterar a senha.',
        })
        .then(() => {
            setSenhaData({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
            onClose();
        })
        .finally(() => setIsLoading(false));
    };

     return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"> {/* Mudei para sm para um layout mais compacto */}
            <DialogTitle sx={{ fontWeight: 'bold' }}>Meu Perfil</DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    // 2. LAYOUT VERTICAL com Stack
                    <Stack spacing={4} sx={{ pt: 1 }}>
                        {/* Seção de Informações da Conta */}
                        <Box>
                            <Typography variant="h6" gutterBottom>Informações da Conta</Typography>
                            <Stack spacing={2} mt={2}>
                                <TextField label="Nome Completo" name="nome" value={infoData.nome} onChange={handleInfoChange} />
                                <TextField label="Login" name="login" value={infoData.login} onChange={handleInfoChange} />
                                <Button variant="contained" onClick={handleUpdateInfo}>Salvar Informações</Button>
                            </Stack>
                        </Box>
                        
                        <Divider />

                        {/* Seção de Alterar Senha */}
                        <Box>
                            <Typography variant="h6" gutterBottom>Alterar Senha</Typography>
                            <Stack spacing={2} mt={2}>
                                <TextField label="Senha Atual" name="senhaAtual" type="password" value={senhaData.senhaAtual} onChange={handleSenhaChange} />
                                <TextField label="Nova Senha" name="novaSenha" type="password" value={senhaData.novaSenha} onChange={handleSenhaChange} />
                                <TextField label="Confirmar Nova Senha" name="confirmarNovaSenha" type="password" value={senhaData.confirmarNovaSenha} onChange={handleSenhaChange} />
                                <Button variant="contained" onClick={handleUpdateSenha}>Alterar Senha</Button>
                            </Stack>
                        </Box>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PerfilModal;