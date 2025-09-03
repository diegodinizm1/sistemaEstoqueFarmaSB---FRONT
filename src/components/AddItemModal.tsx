/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    type SelectChangeEvent,
    Typography,
    Stack,
    useTheme
} from '@mui/material';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ScienceIcon from '@mui/icons-material/Science';
import toast from 'react-hot-toast'; // 1. Importando o toast

import { type ItemDTO, type MedicamentoDTO } from '../types/interface';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const tiposDeMedicamento = [
    { value: 'ORAL', label: 'Oral' },
    { value: 'INJETAVEL', label: 'Injetável' },
    { value: 'CONTROLADO', label: 'Controlado' },
];

interface ItemFormModalProps {
    open: boolean;
    onClose: () => void;
    onItemSaved: () => void;
    itemType: 'medicamento' | 'insumo';
    itemToEdit: ItemDTO | null;
}

const ItemFormModal = ({ open, onClose, onItemSaved, itemType, itemToEdit }: ItemFormModalProps) => {
    const theme = useTheme();
    const isEditMode = itemToEdit !== null;
    const [formData, setFormData] = useState({
        nome: '',
        descricaoDetalhada: '',
        unidadeMedida: '',
        estoqueMinimo: 0, // Adicionado o novo campo
        tipo: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    // O estado 'error' não é mais necessário

    useEffect(() => {
        if (open) {
            if (isEditMode && itemToEdit) {
                setFormData({
                    nome: itemToEdit.nome,
                    descricaoDetalhada: itemToEdit.descricaoDetalhada,
                    unidadeMedida: itemToEdit.unidadeMedida,
                    estoqueMinimo: itemToEdit.estoqueMinimo || 0,
                    tipo: itemToEdit.dtype === 'MEDICAMENTO' ? (itemToEdit as MedicamentoDTO).tipo : '',
                });
            } else {
                setFormData({ nome: '', descricaoDetalhada: '', unidadeMedida: '', estoqueMinimo: 0, tipo: '' });
            }
        }
    }, [itemToEdit, isEditMode, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = event.target as HTMLInputElement;
        // Garante que o estoque mínimo seja tratado como número
        const finalValue = name === 'estoqueMinimo' ? (value === '' ? '' : Number(value)) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const endpoint = itemType === 'medicamento' ? '/medicamentos' : '/insumos';
        
        const payload = itemType === 'medicamento' ? formData : {
            nome: formData.nome,
            descricaoDetalhada: formData.descricaoDetalhada,
            unidadeMedida: formData.unidadeMedida,
            estoqueMinimo: formData.estoqueMinimo,
        };

        const promise = isEditMode
            ? axios.put(`${API_BASE_URL}${endpoint}/${itemToEdit?.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
            : axios.post(`${API_BASE_URL}${endpoint}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        
        // Usando toast.promise para gerenciar o feedback
        toast.promise(promise, {
            loading: 'Salvando item...',
            success: 'Item salvo com sucesso!',
            error: (err: any) => err.response?.data?.message || `Falha ao salvar o ${itemType}.`,
        })
        .then(() => {
            onItemSaved();
            onClose();
        })
        .catch(() => {
            // O erro já é tratado pelo toast
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const isFormInvalid = 
        !formData.nome.trim() || 
        !formData.descricaoDetalhada.trim() || 
        formData.estoqueMinimo < 0 ||
        (itemType === 'medicamento' && !formData.tipo);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{ paper: { sx: { borderRadius: theme.shape.borderRadius } } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                {itemType === 'medicamento' ? <MedicalInformationIcon color="primary" /> : <ScienceIcon color="secondary" />}
                <Typography variant="h5" component="span" fontWeight="bold">
                    {isEditMode ? 'Editar' : 'Adicionar Novo'} {itemType === 'medicamento' ? 'Medicamento' : 'Insumo'}
                </Typography>
            </DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); if (!isFormInvalid) handleSubmit(); }}>
                <DialogContent sx={{ pt: 2, pb: 2 }} dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField autoFocus name="nome" label="Nome do Item" required value={formData.nome} onChange={handleChange} />
                        <TextField name="descricaoDetalhada" label="Descrição Detalhada" multiline rows={3} required value={formData.descricaoDetalhada} onChange={handleChange} />
                        <TextField name="unidadeMedida" label="Unidade de Medida" required value={formData.unidadeMedida} onChange={handleChange} />
                        
                        {/* NOVO CAMPO ADICIONADO */}
                        <TextField 
                            name="estoqueMinimo" 
                            label="Estoque Mínimo" 
                            type="number" 
                            required 
                            value={formData.estoqueMinimo} 
                            onChange={handleChange}
                            helperText="Ponto de reposição para alertas no dashboard"
                            InputProps={{ inputProps: { min: 0 } }} 
                        />

                        {itemType === 'medicamento' && (
                            <FormControl fullWidth required>
                                <InputLabel>Tipo</InputLabel>
                                <Select name="tipo" value={formData.tipo} label="Tipo" onChange={handleChange}>
                                    {tiposDeMedicamento.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px', gap: 1 }}>
                    <Button onClick={onClose} color="secondary" variant="outlined">Cancelar</Button>
                    <Box sx={{ position: 'relative' }}>
                        <Button type="submit" variant="contained" disabled={isLoading || isFormInvalid}>
                            Salvar
                        </Button>
                        {isLoading && (<CircularProgress size={24} sx={{ color: 'primary.contrastText', position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />)}
                    </Box>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default ItemFormModal;