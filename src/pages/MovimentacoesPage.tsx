import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, CircularProgress, Alert, Paper, Stack, Chip,
    Grid, Button, IconButton
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import dayjs from 'dayjs';

import MovimentacaoDetailsModal from '../components/MovimentacoesDetailsModal';
import { type MovimentacaoHistoricoDTO } from '../types/interface';

const API_BASE_URL = 'http://localhost:8080/api';

const MovimentacoesPage = () => {
    const [movimentacoes, setMovimentacoes] = useState<MovimentacaoHistoricoDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    // --- ESTADOS PARA O MODAL DE DETALHES ---
    const [movimentacaoToView, setMovimentacaoToView] = useState<MovimentacaoHistoricoDTO | null>(null);

    const [reportDate, setReportDate] = useState<Dayjs | null>(dayjs()); // Estado para a data do relatório

    const handleGeneratePdf = async () => {
        if (!reportDate) {
            alert("Por favor, selecione uma data para o relatório.");
            return;
        }

        const token = localStorage.getItem('token');
        const formattedDate = reportDate.format('YYYY-MM-DD');

        try {
            const response = await axios.get(`${API_BASE_URL}/relatorios/saidas-diarias`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { data: formattedDate },
                responseType: 'blob', // MUITO IMPORTANTE: para receber um arquivo
            });

            // Lógica para forçar o download no navegador
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `relatorio_saidas_${formattedDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Não foi possível gerar o relatório.");
        }
    };


    useEffect(() => {
        // A função agora vive dentro do useEffect e não é uma dependência externa
        const fetchMovimentacoes = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get<MovimentacaoHistoricoDTO[]>(`${API_BASE_URL}/movimentacoes`, { headers: { Authorization: `Bearer ${token}` } });
                setMovimentacoes(response.data || []);
            } catch (err) {
                setError('Falha ao carregar o histórico de movimentações.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovimentacoes();
    }, []); // Busca inicial

    // Função para definir a cor do Chip com base no tipo de movimentação
    const getChipColor = (tipo: string) => {
        if (tipo.includes('ENTRADA')) return 'success';
        if (tipo.includes('SAIDA')) return 'warning';
        return 'default';
    };

    const columns: GridColDef<MovimentacaoHistoricoDTO>[] = [
        {
            field: 'dataMovimentacao', headerName: 'Data e Hora', flex: 1.2,
            type: 'dateTime',
            valueGetter: (value) => new Date(value),
        },
        { field: 'nomeItem', headerName: 'Item', flex: 1.5 },
        {
            field: 'tipoMovimentacao',
            headerName: 'Tipo',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <Chip
                        label={params.value.replace('_', ' ')}
                        color={getChipColor(params.value)}
                        size="small"
                    />
                </Box>
            ),
        },
        { field: 'quantidade', headerName: 'Qtd.', flex: 0.5, align: 'center', headerAlign: 'center' },
        {
            field: 'nomeSetor', headerName: 'Setor Destino', flex: 1,
            valueGetter: (value: string | null) => value || 'N/A'
        },
        {
            field: 'actions',
            headerName: 'Detalhes',
            width: 80,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={() => setMovimentacaoToView(params.row)}
                        aria-label="ver detalhes"
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        }
    ];

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" fontWeight="bold">Histórico de Movimentações</Typography>
            </Box>

            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid><Typography fontWeight="medium">Relatório de Saídas Diárias</Typography></Grid>
                    <Grid>
                        <DatePicker label="Selecione a Data" value={reportDate} onChange={setReportDate} />
                    </Grid>
                    <Grid>
                        <Button variant="contained" color="secondary" startIcon={<PictureAsPdfIcon />} onClick={handleGeneratePdf}>
                            Gerar PDF
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={2} sx={{ height: 650, width: '100%', borderRadius: 2 }}>
                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box> :
                    error ? <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box> :
                        <DataGrid
                            rows={movimentacoes}
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
                            initialState={{
                                sorting: { sortModel: [{ field: 'dataMovimentacao', sort: 'desc' }] },
                            }}
                        />}
            </Paper>

            <MovimentacaoDetailsModal
                open={!!movimentacaoToView}
                onClose={() => setMovimentacaoToView(null)}
                movimentacao={movimentacaoToView}
            />
        </Stack>
    );
};

export default MovimentacoesPage;