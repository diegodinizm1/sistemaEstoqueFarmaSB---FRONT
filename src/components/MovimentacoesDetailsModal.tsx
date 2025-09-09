import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, 
    Typography, Box, CircularProgress, Divider, Stack, 
    Paper, List, ListItem, ListItemText
} from '@mui/material';
import { type MovimentacaoDetalhesDTO } from '../types/interface';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

interface MovimentacaoDetailsModalProps {
    open: boolean;
    onClose: () => void;
    movimentacaoId: string | null;
}

const MovimentacaoDetailsModal = ({ open, onClose, movimentacaoId }: MovimentacaoDetailsModalProps) => {
    const [detalhes, setDetalhes] = useState<MovimentacaoDetalhesDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && movimentacaoId) {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            axios.get<MovimentacaoDetalhesDTO>(`${API_BASE_URL}/movimentacoes/${movimentacaoId}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => setDetalhes(response.data))
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [open, movimentacaoId]);

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
                {isLoading ? <CircularProgress /> : detalhes && (
                    <Stack spacing={1}>
                        <DetailRow label="Tipo de Movimentação" value={detalhes.tipoMovimentacao.replace('_', ' ')} />
                        <DetailRow label="Setor de Destino" value={detalhes.nomeSetor} />
                        <Divider />
                        <DetailRow label="Realizado por" value={detalhes.nomeFuncionario} />
                        <DetailRow label="Data e Hora" value={new Date(detalhes.dataMovimentacao).toLocaleString('pt-BR')} />
                        <Divider />
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body2" color="text.secondary">Observação</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>{detalhes.observacao || 'Nenhuma observação.'}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Itens Movimentados ({detalhes.itens.length})</Typography>
                            <Paper variant="outlined">
                                <List dense>
                                    {detalhes.itens.map((item, index) => (
                                        <ListItem key={index}>
                                            <ListItemText 
                                                primary={`${item.nomeItem} (${item.tipoItem})`}
                                                secondary={`Quantidade: ${item.quantidade}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
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