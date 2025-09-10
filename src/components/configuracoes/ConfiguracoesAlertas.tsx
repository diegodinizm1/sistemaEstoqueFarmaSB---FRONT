import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Stack, TextField, Button, CircularProgress, Divider } from '@mui/material';
import toast from 'react-hot-toast';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

const ConfiguracaoAlertas = () => {
    const [settings, setSettings] = useState({
        DIAS_ALERTA_VENCIMENTO: '30',
        LIMITE_ESTOQUE_BAIXO: '10'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/configuracoes`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                if (response.data) {
                    setSettings(prev => ({ ...prev, ...response.data }));
                }
            })
            .catch(() => toast.error("Falha ao carregar configurações."))
            .finally(() => setIsLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const token = localStorage.getItem('token');
        const promise = axios.put(`${API_BASE_URL}/configuracoes`, settings, { headers: { Authorization: `Bearer ${token}` } });
        toast.promise(promise, {
            loading: 'Salvando...',
            success: 'Configurações salvas com sucesso!',
            error: 'Falha ao salvar configurações.'
        });
    };

    if (isLoading) return <CircularProgress />;

    return (
        <Stack spacing={4} sx={{ maxWidth: 400 }}>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h6">Alertas de Vencimento</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Defina com quantos dias de antecedência o sistema deve alertar sobre lotes próximos de vencer.
                    </Typography>
                </Box>
                <TextField
                    label="Dias para Alerta de Vencimento"
                    name="DIAS_ALERTA_VENCIMENTO"
                    type="number"
                    value={settings.DIAS_ALERTA_VENCIMENTO}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 1 } }}
                />
            </Stack>

            <Divider />
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h6">Alerta de Estoque Baixo</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Defina a quantidade mínima geral para que um item seja considerado com "estoque baixo".
                    </Typography>
                </Box>
                <TextField
                    label="Quantidade Mínima Geral"
                    name="LIMITE_ESTOQUE_BAIXO"
                    type="number"
                    value={settings.LIMITE_ESTOQUE_BAIXO}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                />
            </Stack>

            <Box>
                <Button variant="contained" onClick={handleSave}>Salvar Alterações</Button>
            </Box>
        </Stack>
    );
};

export default ConfiguracaoAlertas;
