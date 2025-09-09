import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, IconButton } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import TuneIcon from '@mui/icons-material/Tune';
import { type EstoqueListaDTO, type EstoqueSaldoDTO } from '../types/interface';
import AjusteLoteModal from './AjusteLoteModal';

//const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const API_BASE_URL = `http://localhost:8080/api`;

interface LotesPorItemModalProps {
    open: boolean;
    onClose: () => void;
    itemSaldo: EstoqueSaldoDTO | null; // Recebe o item mestre para exibir o nome
    onLotesUpdated: () => void; // Callback para atualizar a tela principal
}

const LotesPorItemModal = ({ open, onClose, itemSaldo, onLotesUpdated }: LotesPorItemModalProps) => {
    const [lotes, setLotes] = useState<EstoqueListaDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loteToEdit, setLoteToEdit] = useState<EstoqueListaDTO | null>(null);

    const fetchLotes = () => {
        if (open && itemSaldo) {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            axios.get<EstoqueListaDTO[]>(`${API_BASE_URL}/estoque/item/${itemSaldo.itemId}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => setLotes(response.data || []))
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    };
    
    useEffect(fetchLotes, [open, itemSaldo]);

    const handleAjusteSaved = () => {
        fetchLotes(); // Recarrega a lista de lotes
        onLotesUpdated(); // Avisa a página principal para recarregar os saldos
    };

    const columns: GridColDef<EstoqueListaDTO>[] = [
        { field: 'numeroLote', headerName: 'Nº do Lote', flex: 1 },
        { field: 'quantidade', headerName: 'Qtd.', width: 100 },
        { field: 'dataValidade', headerName: 'Validade', flex: 1, type: 'date', 
            valueGetter: (value: string) => new Date(value)
         },
        {
            field: 'actions', headerName: 'Ajustar', width: 80, sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton size="small" onClick={() => setLoteToEdit(params.row)} aria-label="ajustar lote">
                    <TuneIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">Lotes em Estoque para: {itemSaldo?.nomeItem}</Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ height: 400, width: '100%' }}>
                        {isLoading ? <CircularProgress /> : (
                            <DataGrid rows={lotes} columns={columns} getRowId={(row) => row.id} density="compact" sx={{ border: 0 }} />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} variant="contained">Fechar</Button>
                </DialogActions>
            </Dialog>

            <AjusteLoteModal
                open={!!loteToEdit}
                onClose={() => setLoteToEdit(null)}
                onAjusteSaved={handleAjusteSaved}
                loteToEdit={loteToEdit}
            />
        </>
    );
};

export default LotesPorItemModal;