import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Stack } from '@mui/material';

// DTO para os dados do formulário
export interface NewUserFormData {
    nome: string;
    login: string;
    senha: string;
}

interface UsuarioFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (formData: NewUserFormData) => void;
}

const UsuarioFormModal = ({ open, onClose, onSave }: UsuarioFormModalProps) => {
    const [formData, setFormData] = useState<NewUserFormData>({
        nome: '',
        login: '',
        senha: '',
    });
    const [confirmarSenha, setConfirmarSenha] = useState('');

    // Limpa o formulário quando o modal fecha
    useEffect(() => {
        if (!open) {
            setFormData({ nome: '', login: '', senha: '' });
            setConfirmarSenha('');
        }
    }, [open]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (formData.senha !== confirmarSenha) {
            alert("As senhas não coincidem."); // Pode ser um toast
            return;
        }
        onSave(formData);
    };

    const isFormInvalid = !formData.nome.trim() || !formData.login.trim() || formData.senha.length < 6 || formData.senha !== confirmarSenha;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Novo Usuário</DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); if (!isFormInvalid) handleSave(); }}>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} required autoFocus/>
                        <TextField label="Login" name="login" value={formData.login} onChange={handleChange} required />
                        <TextField label="Senha" name="senha" type="password" value={formData.senha} onChange={handleChange} required helperText="Mínimo de 6 caracteres" />
                        <TextField label="Confirmar Senha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isFormInvalid}>Próximo</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default UsuarioFormModal;