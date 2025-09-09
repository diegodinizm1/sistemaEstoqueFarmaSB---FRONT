/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    CircularProgress, Box, Typography, Autocomplete, Stack,
    List, ListItem, ListItemText, IconButton, Divider, Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import toast from 'react-hot-toast';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

import { type ItemDTO, type SetorDTO } from '../types/interface';
import { soundService } from '../services/soundService';

const API_BASE_URL = `http://localhost:8080/api`;

// Interface para o item na lista do formulário
interface ItemNaLista {
    id: string; // Para controle de chave no React
    item: ItemDTO;
    quantidade: number;
    numeroLote?: string;
    dataValidade?: Dayjs | null;
}

interface MovimentacaoFormModalProps {
    open: boolean;
    onClose: () => void;
    onMovimentacaoSaved: () => void;
    initialType: 'ENTRADA' | 'SAIDA';
    itemToRegister?: ItemDTO | null;
}

const MovimentacaoFormModal = ({ open, onClose, onMovimentacaoSaved, initialType, itemToRegister }: MovimentacaoFormModalProps) => {
    const navigate = useNavigate();

    // -- ESTADOS GERAIS DA MOVIMENTAÇÃO --
    const [observacao, setObservacao] = useState('');
    const [selectedSetor, setSelectedSetor] = useState<SetorDTO | null>(null); // Apenas para Saída

    // -- ESTADOS PARA A LISTA DE ITENS --
    const [itensNaLista, setItensNaLista] = useState<ItemNaLista[]>([]);

    // -- ESTADOS PARA O "FORMULÁRIO DE ADIÇÃO DE ITEM" --
    const [itemAtual, setItemAtual] = useState<ItemDTO | null>(null);
    const [quantidadeAtual, setQuantidadeAtual] = useState<number | ''>('');
    const [loteAtual, setLoteAtual] = useState('');
    const [validadeAtual, setValidadeAtual] = useState<Dayjs | null>(null);

    // -- ESTADOS DE DADOS E UI --
    const [itemList, setItemList] = useState<ItemDTO[]>([]);
    const [setorList, setSetorList] = useState<SetorDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
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
                }
            };
            fetchDropdownData();
        } else {
            // Limpa tudo ao fechar
            setObservacao('');
            setSelectedSetor(null);
            setItensNaLista([]);
            // Limpa o formulário de adição
            setItemAtual(null);
            setQuantidadeAtual('');
            setLoteAtual('');
            setValidadeAtual(null);
        }
    }, [open]);

    useEffect(() => {
        if (open && itemToRegister) {
            // Pré-preenche o campo do item a ser adicionado
            setItemAtual(itemToRegister);
        }
    }, [open, itemToRegister]);

    const handleAdicionarItem = () => {
        if (!itemAtual || !quantidadeAtual || (initialType === 'ENTRADA' && (!loteAtual.trim() || !validadeAtual))) {
            toast.error("Preencha todos os campos do item para adicionar.");
            return;
        }

        const novoItem: ItemNaLista = {
            id: `${itemAtual.id}-${new Date().getTime()}`, // Chave única simples
            item: itemAtual,
            quantidade: Number(quantidadeAtual),
            ...(initialType === 'ENTRADA' && {
                numeroLote: loteAtual,
                dataValidade: validadeAtual
            })
        };

        setItensNaLista(prev => [...prev, novoItem]);

        // Limpa os campos de adição para o próximo item
        setItemAtual(null);
        setQuantidadeAtual('');
        setLoteAtual('');
        setValidadeAtual(null);
    };

    const handleRemoverItem = (id: string) => {
        setItensNaLista(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        let endpoint = '';
        let payload: any = {};

        if (initialType === 'ENTRADA') {
            endpoint = '/movimentacoes/entrada';
            payload = {
                observacao,
                itens: itensNaLista.map(i => ({
                    itemId: i.item.id,
                    quantidade: i.quantidade,
                    numeroLote: i.numeroLote,
                    dataValidade: i.dataValidade ? i.dataValidade.format('YYYY-MM-DD') : null,
                }))
            };
        } else { // SAIDA
            endpoint = '/movimentacoes/saida';
            payload = {
                observacao,
                setorId: selectedSetor?.id,
                itens: itensNaLista.map(i => ({
                    itemId: i.item.id,
                    quantidade: i.quantidade,
                }))
            };
        }

        try {
            await axios.post(`${API_BASE_URL}${endpoint}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            onMovimentacaoSaved();
            onClose();
            soundService.playSuccess();
            renderSuccessToastWithAction();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.response?.data || 'Falha ao registrar a movimentação.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSuccessToastWithAction = () => {
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
                duration: 6000,
            }
        );
    };

    const isFormInvalid =
        itensNaLista.length === 0 ||
        (initialType === 'SAIDA' && !selectedSetor);

    const isAddItemDisabled = !itemAtual || !quantidadeAtual || (initialType === 'ENTRADA' && (!loteAtual.trim() || !validadeAtual));

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Typography variant="h6" fontWeight="bold">
                    Registrar {initialType === 'ENTRADA' ? 'Entrada no Estoque' : 'Saída para Setor'}
                </Typography>
            </DialogTitle>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); if (!isFormInvalid) handleSubmit(); }}>
                <DialogContent dividers>
                    {/* SEÇÃO DE DADOS GERAIS (CABEÇALHO) */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {initialType === 'SAIDA' && (
                            <Autocomplete options={setorList} getOptionLabel={(o) => o.nome} value={selectedSetor} onChange={(_, nv) => setSelectedSetor(nv)} isOptionEqualToValue={(option, value) => option.id === value?.id} renderInput={(params) => <TextField {...params} label="Setor de Destino" required />} />
                        )}
                        <TextField label="Observação Geral (Opcional)" fullWidth multiline rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
                    </Stack>
                    <Divider />
                    {/* SEÇÃO DE ADIÇÃO DE ITENS */}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Adicionar Itens à Movimentação</Typography>
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="flex-start">
                        <Autocomplete options={itemList} getOptionLabel={(o) => o.nome} value={itemAtual} onChange={(_, nv) => setItemAtual(nv)} isOptionEqualToValue={(option, value) => option.id === value?.id} sx={{ flexGrow: 1, minWidth: '200px' }} renderInput={(params) => <TextField {...params} label="Item" />} />
                        <TextField label="Qtd." type="number" value={quantidadeAtual} onChange={(e) => setQuantidadeAtual(e.target.value === '' ? '' : Number(e.target.value))} InputProps={{ inputProps: { min: 1 } }} sx={{ width: '100px' }} />
                        {initialType === 'ENTRADA' && (
                            <>
                                <TextField label="Lote" value={loteAtual} onChange={(e) => setLoteAtual(e.target.value)} sx={{ width: '150px' }} />
                                <DatePicker label="Validade" value={validadeAtual} onChange={setValidadeAtual} minDate={dayjs().add(1, 'day')} sx={{ width: '180px' }} />
                            </>
                        )}
                        <Button variant="outlined" onClick={handleAdicionarItem} disabled={isAddItemDisabled} startIcon={<AddCircleOutlineIcon />} sx={{ height: '56px' }}>Adicionar</Button>
                    </Stack>

                    {/* SEÇÃO DA LISTA DE ITENS ADICIONADOS */}
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>Itens na Cesta ({itensNaLista.length})</Typography>
                    <Paper variant="outlined">
                        <List dense>
                            {itensNaLista.length === 0 ? (
                                <ListItem><ListItemText primary="Nenhum item adicionado ainda." /></ListItem>
                            ) : (
                                itensNaLista.map((itemNaLista) => (
                                    <ListItem key={itemNaLista.id} secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => handleRemoverItem(itemNaLista.id)}><DeleteIcon /></IconButton>}>
                                        <ListItemText
                                            primary={`${itemNaLista.item.nome} (Qtd: ${itemNaLista.quantidade})`}
                                            secondary={initialType === 'ENTRADA' ? `Lote: ${itemNaLista.numeroLote} / Val: ${itemNaLista.dataValidade?.format('MM/YYYY')}` : null}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading || isFormInvalid}>
                        {isLoading ? <CircularProgress size={24} /> : 'Registrar Movimentação'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default MovimentacaoFormModal;