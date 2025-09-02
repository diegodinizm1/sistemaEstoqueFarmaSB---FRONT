import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, Stack, CircularProgress } from '@mui/material';

interface ConfirmPasswordModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void; // Callback que retorna a senha digitada
    isLoading: boolean;
}

const ConfirmPasswordModal = ({ open, onClose, onConfirm, isLoading }: ConfirmPasswordModalProps) => {
    const [password, setPassword] = useState('');

    const handleConfirm = () => {
        if (password) {
            onConfirm(password);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Confirmação de Segurança</DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2">
                            Para prosseguir com esta ação, por favor, digite sua senha de administrador.
                        </Typography>
                        <TextField
                            autoFocus
                            label="Sua Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading || !password.trim()}>
                        {isLoading ? <CircularProgress size={24} /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default ConfirmPasswordModal;