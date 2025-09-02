import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Chip
} from '@mui/material';
// 1. Importando os tipos corretos
import { type ItemDTO, type MedicamentoDTO } from '../types/interface';

interface ItemDetailsModalProps {
    open: boolean;
    onClose: () => void;
    item: ItemDTO | null; // 2. A prop 'item' agora aceita o tipo base 'ItemDTO'
}

const ItemDetailsModal = ({ open, onClose, item }: ItemDetailsModalProps) => {
    if (!item) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold">Detalhes do Item</Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">ID: {item.id}</Typography>
                    <Typography variant="h6" gutterBottom>{item.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {item.descricaoDetalhada}
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">Unidade de Medida</Typography>
                    <Typography variant="body1">{item.unidadeMedida || 'Não informado'}</Typography>
                </Box>
                
                {/* 3. Usamos o 'dtype' para verificar se é um medicamento e exibir o campo 'tipo' */}
                {item.dtype === 'MEDICAMENTO' && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Tipo de Medicamento</Typography>
                        <Chip label={(item as MedicamentoDTO).tipo} color="primary" size="small" />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ItemDetailsModal;