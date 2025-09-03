import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Alert, Box, Typography } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { type SetorDTO } from '../types/interface'; // Supondo que você adicionará SetorDTO em interface.ts

const API_BASE_URL = '${VITE_API_BASE_URL}/api';

interface SetorFormModalProps {
    open: boolean;
    onClose: () => void;
    onSetorSaved: () => void;
    setorToEdit: SetorDTO | null;
}

const SetorFormModal = ({ open, onClose, onSetorSaved, setorToEdit }: SetorFormModalProps) => {
    const isEditMode = setorToEdit !== null;
    const [nome, setNome] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setNome(isEditMode ? setorToEdit.nome : '');
            setError(null);
        }
    }, [open, isEditMode, setorToEdit]);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const payload = { nome };

        try {
            if (isEditMode) {
                await axios.put(`${API_BASE_URL}/setores/${setorToEdit?.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post(`${API_BASE_URL}/setores`, payload, { headers: { Authorization: `Bearer ${token}` } });
            }
            onSetorSaved();
            onClose();
        } catch (err) {
            setError('Falha ao salvar o setor. Verifique se o nome já existe.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApartmentIcon color="primary" />
                <Typography variant="h6" component="span" fontWeight="bold">
                    {isEditMode ? 'Editar Setor' : 'Adicionar Novo Setor'}
                </Typography>
            </DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        name="nome"
                        label="Nome do Setor"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading || !nome.trim()}>
                        {isLoading ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default SetorFormModal;