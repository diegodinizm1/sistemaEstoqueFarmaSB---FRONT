import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import toast from 'react-hot-toast';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

interface RelatorioModalProps {
    open: boolean;
    onClose: () => void;
}

const RelatorioModal = ({ open, onClose }: RelatorioModalProps) => {
    const [reportDate, setReportDate] = useState<Dayjs | null>(dayjs());

    const handleGeneratePdf = async () => {
        if (!reportDate) return;
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
            onClose(); // Fecha o modal após gerar o relatório
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Falha ao gerar o relatório. Tente novamente.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Gerar Relatório de Saídas</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2">Selecione a data para gerar o relatório de saídas diárias por setor.</Typography>
                    <DatePicker label="Data do Relatório" value={reportDate} onChange={setReportDate} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleGeneratePdf} disabled={!reportDate}>
                    Gerar PDF
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RelatorioModal;