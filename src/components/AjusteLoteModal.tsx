/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { type EstoqueListaDTO } from '../types/interface';
import toast from 'react-hot-toast';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const API_BASE_URL = `http://localhost:8080/api`;

interface AjusteLoteModalProps {
    open: boolean;
    onClose: () => void;
    onAjusteSaved: () => void;
    loteToEdit: EstoqueListaDTO | null;
}

const AjusteLoteModal = ({ open, onClose, onAjusteSaved, loteToEdit }: AjusteLoteModalProps) => {
    const [quantidade, setQuantidade] = useState<number | ''>('');
    const [dataValidade, setDataValidade] = useState<Dayjs | null>(null);
    const [observacao, setObservacao] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (loteToEdit) {
            setQuantidade(loteToEdit.quantidade);
            setDataValidade(dayjs(loteToEdit.dataValidade));
            setObservacao('');
        }
    }, [loteToEdit]);

    const handleSubmit = async () => {
        if (!loteToEdit) return;
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const payload = {
            novaQuantidade: quantidade,
            novaDataValidade: dataValidade ? dataValidade.format('YYYY-MM-DD') : null,
            observacao,
        };
        try {
            await axios.put(`${API_BASE_URL}/estoque/ajustar/${loteToEdit.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            onAjusteSaved();
            toast.success('Ajuste salvo com sucesso!');
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data || 'Falha ao salvar o ajuste.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const isFormInvalid = quantidade === '' || !dataValidade || !observacao.trim();

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>
                <Typography variant="h6" fontWeight="bold">Ajustar Lote</Typography>
                <Typography variant="body2" color="text.secondary">{loteToEdit?.nomeItem} - Lote: {loteToEdit?.numeroLote}</Typography>
            </DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); if (!isFormInvalid) handleSubmit(); }}>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Nova Quantidade"
                            type="number"
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))}
                            required InputProps={{ inputProps: { min: 0 } }}
                        />
                        <DatePicker
                            label="Nova Data de Validade"
                            value={dataValidade}
                            onChange={setDataValidade}
                        />
                        <TextField label="Observação / Justificativa" multiline rows={3} value={observacao} onChange={(e) => setObservacao(e.target.value)} required />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading || isFormInvalid}>Salvar Ajuste</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default AjusteLoteModal;