import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, Divider, Stack } from '@mui/material';
import { type MovimentacaoDetalhes, type MovimentacaoHistoricoDTO } from '../types/interface'; // Usamos o DTO do histórico para iniciar

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

// Interface para os dados detalhados que virão da API

interface MovimentacaoDetailsModalProps {
    open: boolean;
    onClose: () => void;
    movimentacao: MovimentacaoHistoricoDTO | null;
}

const MovimentacaoDetailsModal = ({ open, onClose, movimentacao }: MovimentacaoDetailsModalProps) => {
    const [detalhes, setDetalhes] = useState<MovimentacaoDetalhes | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && movimentacao) {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            axios.get<MovimentacaoDetalhes>(`${API_BASE_URL}/movimentacoes/${movimentacao.id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => setDetalhes(response.data))
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [open, movimentacao]);

    const DetailRow = ({ label, value }: { label: string, value?: string | number | null }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight="medium">{value || '-'}</Typography>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Detalhes da Movimentação</DialogTitle>
            <DialogContent dividers>
                {isLoading ? <CircularProgress /> : (
                    <Stack spacing={1}>
                        <DetailRow label="Item" value={detalhes?.nomeItem} />
                        <DetailRow label="Categoria do Item" value={detalhes?.tipoItem} />
                        <Divider />
                        <DetailRow label="Tipo de Movimentação" value={detalhes?.tipoMovimentacao} />
                        <DetailRow label="Quantidade" value={detalhes?.quantidade} />
                        <DetailRow label="Setor de Destino" value={detalhes?.nomeSetor} />
                        <Divider />
                        <DetailRow label="Realizado por" value={detalhes?.nomeFuncionario} />
                        <DetailRow label="Data e Hora" value={detalhes ? new Date(detalhes.dataMovimentacao).toLocaleString('pt-BR') : '-'} />
                        <Divider />
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body2" color="text.secondary">Observação</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>{detalhes?.observacao || 'Nenhuma observação.'}</Typography>
                        </Box>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">Fechar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MovimentacaoDetailsModal;