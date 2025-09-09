import { useEffect, useState } from 'react';
import { memo } from 'react';
import axios from 'axios';
import { Paper, Typography, Box, useTheme, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


//const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const API_BASE_URL = `http://localhost:8080/api`;

interface GraficoData {
    nomeItem: string;
    quantidadeTotal: number;
}

// O componente agora não precisa mais de props
const GraficoEstoque = () => {
    const theme = useTheme();
    const [data, setData] = useState<GraficoData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChartData = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get<GraficoData[]>(`${API_BASE_URL}/dashboard/grafico-estoque`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data || []);
            } catch (err) {
                setError('Falha ao carregar dados do gráfico de estoque.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChartData();
    }, []);
    
    // Função para abreviar nomes longos
    const abreviarNome = (nome: string) => {
        const maxLength = 15;
        if (nome.length > maxLength) {
            return `${nome.substring(0, maxLength)}...`;
        }
        return nome;
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
    }
    
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!data || data.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                    Não há dados de estoque para exibir no gráfico.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
                Top 5 Itens com Maior Estoque
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}> {/* Aumenta a margem inferior */}
                        <CartesianGrid strokeDasharray="3 3" />
                        
                        <XAxis 
                            dataKey="nomeItem" 
                            tick={{ fontSize: 12 }} 
                            angle={-35} 
                            textAnchor="end"
                            height={80} // Aumenta a altura para caber o texto inclinado
                            interval={0}
                            tickFormatter={abreviarNome} // Aplica a função de abreviação
                        />
                        
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '15px' }} />
                        <Bar dataKey="quantidadeTotal" name="Qtd. em Estoque" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};


// Componente para o Tooltip customizado (mostra o nome completo)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ padding: '8px 12px' }}>
                {/* 'label' no tooltip contém o valor original, não o abreviado */}
                <Typography variant="body2" fontWeight="bold">{label}</Typography>
                <Typography variant="caption" color="primary">
                    {`Qtd. em Estoque: ${payload[0].value}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

export default memo(GraficoEstoque);