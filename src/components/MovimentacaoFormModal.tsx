/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    CircularProgress, Box, Typography, Autocomplete, Stack
} from '@mui/material';
// NOVO: Importando o DatePicker
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs'; // Day.js para manipulação de datas
import toast from 'react-hot-toast'; // Importando o toast

import { type ItemDTO } from '../types/interface';
import { type SetorDTO } from '../types/interface';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

interface MovimentacaoFormModalProps {
    open: boolean;
    onClose: () => void;
    onMovimentacaoSaved: () => void;
    initialType: 'ENTRADA' | 'SAIDA';
    itemToRegister?: ItemDTO | null;
}

const MovimentacaoFormModal = ({ open, onClose, onMovimentacaoSaved, initialType, itemToRegister}: MovimentacaoFormModalProps) => {
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState<ItemDTO | null>(null);
    const [selectedSetor, setSelectedSetor] = useState<SetorDTO | null>(null);
    const [quantidade, setQuantidade] = useState<number | ''>('');
    const [observacao, setObservacao] = useState('');
    // NOVOS ESTADOS para Entradas
    const [numeroLote, setNumeroLote] = useState('');
    const [dataValidade, setDataValidade] = useState<Dayjs | null>(null);

    // Estados para carregar dados
    const [itemList, setItemList] = useState<ItemDTO[]>([]);
    const [setorList, setSetorList] = useState<SetorDTO[]>([]);

    // Estados de controle da UI
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        if (open) {
            if(itemToRegister) {
                setSelectedItem(itemToRegister);
            }
            const fetchDropdownData = async () => {
                const token = localStorage.getItem('token');
                try {
                    const [itemsRes, setoresRes] = await Promise.all([
                        axios.get<ItemDTO[]>(`${API_BASE_URL}/itens/com-estoque`, { headers: { Authorization: `Bearer ${token}` } }),
                        axios.get<SetorDTO[]>(`${API_BASE_URL}/setores`, { headers: { Authorization: `Bearer ${token}` } })
                    ]);
                    setItemList(itemsRes.data || []);
                    setSetorList(setoresRes.data || []);
                } catch (err) {
                    toast.error('Falha ao carregar dados de itens ou setores.');
                    console.error(err);
                }
            };
            fetchDropdownData();
        } else {
            // Limpa o formulário completamente ao fechar
            setSelectedItem(null);
            setSelectedSetor(null);
            setQuantidade('');
            setObservacao('');
            setNumeroLote('');
            setDataValidade(null);
        }
    }, [open, itemToRegister]);

    const handleSubmit = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        // Define o endpoint e o payload com base no tipo de movimentação
        let endpoint = '';
        let payload: any = {};

        if (initialType === 'ENTRADA') {
            endpoint = '/movimentacoes/entrada';
            payload = {
                itemId: selectedItem?.id,
                quantidade,
                observacao,
                numeroLote,
                dataValidade: dataValidade ? dataValidade.format('YYYY-MM-DD') : null,
            };
        } else { // SAIDA
            endpoint = '/movimentacoes/saida';
            payload = {
                itemId: selectedItem?.id,
                setorId: selectedSetor?.id,
                quantidade,
                observacao,
            };
        }

        try {
            await axios.post(`${API_BASE_URL}${endpoint}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            onMovimentacaoSaved();
            onClose();
            renderSuccessToastWithAction();
        } catch (err: any) {
            const errorMessage = err.response?.data || 'Falha ao registrar a movimentação.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSuccessToastWithAction  = () => {
        toast.success(
            (t) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">
                        Movimentação registrada com sucesso!
                    </Typography>
                    <Button
                        size="small"
                        variant="text"
                        sx={{
                            color: 'white', 
                            fontWeight: 'bold',
                            textDecoration: 'underline', 
                            textTransform: 'none', 
                            ml: 2, 
                        }}
                        onClick={() => {
                            toast.dismiss(t.id); 
                            navigate('/movimentacoes');
                        }}
                    >
                        Ver
                    </Button>
                </Box>
            ),
            {
                duration: 6000, // Dê mais tempo para o usuário clicar
            }
        );
    };


    // Validação ajustada para os novos campos de entrada
    const isFormInvalid =
        !selectedItem ||
        !quantidade ||
        (initialType === 'SAIDA' && !selectedSetor) ||
        (initialType === 'ENTRADA' && (!numeroLote.trim() || !dataValidade));

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h6" fontWeight="bold">
                    Registrar {initialType === 'ENTRADA' ? 'Entrada no Estoque' : 'Saída para Setor'}
                </Typography>
            </DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); if (!isFormInvalid) handleSubmit(); }}>
                <DialogContent dividers>

                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Autocomplete
                            options={itemList}
                            getOptionLabel={(option) => option.nome}
                            value={selectedItem}
                            onChange={(_event, newValue) => setSelectedItem(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            disabled={!!itemToRegister}
                            renderInput={(params) => <TextField {...params} label="Item (Medicamento ou Insumo)" required />}
                        />

                        {/* Campos que só aparecem para ENTRADA */}
                        {initialType === 'ENTRADA' && (
                            <>
                                <TextField
                                    label="Número do Lote"
                                    value={numeroLote}
                                    onChange={(e) => setNumeroLote(e.target.value)}
                                    required
                                />
                                <DatePicker
                                    label="Data de Validade"
                                    value={dataValidade}
                                    onChange={(newValue) => setDataValidade(newValue)}
                                    minDate={dayjs().add(1, 'day')} // Validade deve ser no futuro
                                    slotProps={{ textField: { required: true } }}
                                />
                            </>
                        )}

                        {/* Campo que só aparece para SAÍDA */}
                        {initialType === 'SAIDA' && (
                            <Autocomplete
                                options={setorList}
                                getOptionLabel={(option) => option.nome}
                                value={selectedSetor}
                                onChange={(_event, newValue) => setSelectedSetor(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => <TextField {...params} label="Setor de Destino" required />}
                            />
                        )}

                        <TextField
                            label="Quantidade"
                            type="number"
                            fullWidth
                            value={quantidade}
                            onChange={(e) => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                        <TextField
                            label="Observação (Opcional)"
                            fullWidth
                            multiline
                            rows={2}
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading || isFormInvalid}>
                        {isLoading ? <CircularProgress size={24} /> : 'Registrar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default MovimentacaoFormModal;