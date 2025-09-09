import { useEffect, useState } from 'react';
import axios from 'axios';
import {memo} from 'react';
import { Paper, Typography, Box, useTheme, CircularProgress, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

//const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const API_BASE_URL = `http://localhost:8080/api`;

interface ConsumoData {
    nomeSetor: string;
    quantidadeTotal: number;
}

const ConsumoSetorChart = () => {
    const theme = useTheme();
    const [data, setData] = useState<ConsumoData[]>([]);
    const [periodo, setPeriodo] = useState<'DIA' | 'MES' | 'ANO'>('MES');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChartData = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get<ConsumoData[]>(`${API_BASE_URL}/dashboard/consumo-setor`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { periodo } // Passa o período selecionado para a API
                });
                setData(response.data || []);
            } catch (err) {
                setError('Falha ao carregar dados do gráfico de consumo.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChartData();
    }, [periodo]); // Re-executa a busca sempre que o 'periodo' mudar

    const handlePeriodoChange = (_event: React.MouseEvent<HTMLElement>, newPeriodo: 'DIA' | 'MES' | 'ANO' | null) => {
        if (newPeriodo !== null) {
            setPeriodo(newPeriodo);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Consumo por Setor</Typography>
                <ToggleButtonGroup
                    value={periodo}
                    exclusive
                    onChange={handlePeriodoChange}
                    size="small"
                >
                    <ToggleButton value="DIA">Dia</ToggleButton>
                    <ToggleButton value="MES">Mês</ToggleButton>
                    <ToggleButton value="ANO">Ano</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
                {isLoading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> :
                 !data || data.length === 0 ? <Typography color="text.secondary" sx={{textAlign: 'center', pt: 4}}>Nenhuma saída registrada para o período.</Typography> :
                (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="nomeSetor" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quantidadeTotal" name="Qtd. Itens" fill={theme.palette.secondary.main} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Box>
        </Paper>
    );
};

export default memo(ConsumoSetorChart);