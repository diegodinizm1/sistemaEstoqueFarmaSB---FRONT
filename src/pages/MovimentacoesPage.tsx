import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box, Typography, CircularProgress, Alert, Paper, Chip,
    Grid, Button, IconButton, Stack
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import dayjs from 'dayjs';
import { Global } from '@emotion/react';

import MovimentacaoDetailsModal from '../components/MovimentacoesDetailsModal';
import { type MovimentacaoHistoricoDTO } from '../types/interface';
import toast from 'react-hot-toast';
import { fadeInUp } from '../utils/animacao';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

const MovimentacoesPage = () => {
    const [movimentacoes, setMovimentacoes] = useState<MovimentacaoHistoricoDTO[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [movimentacaoIdToView, setMovimentacaoIdToView] = useState<string | null>(null);
    const [reportDate, setReportDate] = useState<Dayjs | null>(dayjs());

    const handleGeneratePdf = async () => {
        if (!reportDate) {
            toast.error("Data do relatório não selecionada.");
            return;
        }

        const token = localStorage.getItem('token');
        const formattedDate = reportDate.format('YYYY-MM-DD');

        try {
            const response = await axios.get(`${API_BASE_URL}/relatorios/saidas-diarias`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { data: formattedDate },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `relatorio_saidas_${formattedDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Falha ao gerar o relatório. Tente novamente.");
        }
    };

    useEffect(() => {
        const fetchMovimentacoes = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get<MovimentacaoHistoricoDTO[]>(`${API_BASE_URL}/movimentacoes`, { headers: { Authorization: `Bearer ${token}` } });
                setMovimentacoes(response.data || []);
            } catch (err) {
                setError('Falha ao carregar o histórico de movimentações.');
                toast.error('Falha ao carregar o histórico de movimentações.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovimentacoes();
    }, []);

    const getChipColor = (tipo: string) => {
        if (tipo.includes('ENTRADA')) return 'success';
        if (tipo.includes('SAIDA')) return 'warning';
        return 'default';
    };

    const columns: GridColDef<MovimentacaoHistoricoDTO>[] = [
        {
            field: 'dataMovimentacao', headerName: 'Data e Hora', flex: 0.6,
            type: 'dateTime', valueGetter: (value) => new Date(value),
        },
        {
            field: 'tipoMovimentacao', headerName: 'Tipo', flex: 0.55, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Chip label={params.value.replace('_', ' ')} color={getChipColor(params.value)} size="small" />
            ),
        },
        {
            field: 'totalItens', headerName: 'Nº de Itens', flex: 0.4, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'quantidadeTotal', headerName: 'Qtd. Total', flex: 0.4, align: 'center', headerAlign: 'center'
        },
        {
            field: 'nomeSetor', headerName: 'Setor Destino', flex: 0.66, align: 'center', headerAlign: 'center',
            valueGetter: (value: string | null) => value || 'N/A'
        },
        {
            field: 'actions', headerName: 'Detalhes', flex: 0.4,
            sortable: false, filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <IconButton size="small" onClick={() => setMovimentacaoIdToView(params.row.id)} aria-label="ver detalhes">
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            ),
        }
    ];

    return (
        <Stack spacing={3}>
            <Global styles={fadeInUp} />
            <Box>
                <Typography variant="h4" fontWeight="bold">Histórico de Movimentações</Typography>
            </Box>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid ><Typography fontWeight="medium">Relatório de Saídas Diárias</Typography></Grid>
                    <Grid>
                        <DatePicker label="Selecione a Data" value={reportDate} onChange={setReportDate} />
                    </Grid>
                    <Grid>
                        <Button variant="outlined" color="primary" startIcon={<PictureAsPdfIcon />} onClick={handleGeneratePdf}>
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
                            initialState={{
                                sorting: { sortModel: [{ field: 'dataMovimentacao', sort: 'desc' }] },
                                pagination: { paginationModel: { pageSize: 10, page: 0 } }
                            }}
                            sx={{
                                '& .MuiDataGrid-row': {
                                    animation: 'fadeInUp 0.5s ease-in-out forwards',
                                    opacity: 0,
                                    '&:nth-of-type(1)': { animationDelay: '0.05s' },
                                    '&:nth-of-type(2)': { animationDelay: '0.1s' },
                                    '&:nth-of-type(3)': { animationDelay: '0.15s' },
                                    '&:nth-of-type(4)': { animationDelay: '0.2s' },
                                    '&:nth-of-type(5)': { animationDelay: '0.25s' },
                                },
                            }}
                        />}
            </Paper>
            <MovimentacaoDetailsModal
                open={!!movimentacaoIdToView}
                onClose={() => setMovimentacaoIdToView(null)}
                movimentacaoId={movimentacaoIdToView}
            />
        </Stack>
    );
};

export default MovimentacoesPage;