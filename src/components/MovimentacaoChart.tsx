import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Box, Paper, Typography, CircularProgress, Alert, useTheme } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

interface ChartData {
    mes: number;
    entradas: number;
    saidas: number;
}

const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const MovimentacaoChart = () => {
    const theme = useTheme();
    const [data, setData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChartData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<ChartData[]>(`${API_BASE_URL}/dashboard/movimentacoes-por-mes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data || []);
        } catch (err) {
            setError('Falha ao carregar dados do gráfico.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, []);

    const formatarMes = (numeroDoMes: number) => {
        return meses[numeroDoMes - 1];
    };

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Movimentações por Mês (Último Ano)</Typography>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{left:20}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tickFormatter={formatarMes} tick={{ fontSize: 12 }} />
                    <YAxis/>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entradas" fill={theme.palette.success.main} name="Entradas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saidas" fill={theme.palette.warning.main} name="Saídas" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default MovimentacaoChart;