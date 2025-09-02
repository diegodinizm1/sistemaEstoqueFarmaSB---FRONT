import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

// Definindo as propriedades que o componente receberá
interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }: ConfirmationDialogProps) => {
    
    const handleConfirm = () => {
        onConfirm();
        onClose(); // Fecha o diálogo após a confirmação
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
        >
            <DialogTitle id="confirmation-dialog-title">
                <Typography fontWeight="bold">{title}</Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="confirmation-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {/* Botão para cancelar a ação */}
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                {/* Botão para confirmar a ação */}
                <Button onClick={handleConfirm} color="primary" autoFocus variant="contained">
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;