export interface ItemDTO {
    estoqueMinimo: number;
    id: string;
    nome: string;
    descricaoDetalhada: string;
    unidadeMedida: string;
    ativo: boolean;
    dtype: 'MEDICAMENTO' | 'INSUMO';
    possuiEstoque?: boolean;
}

export interface MedicamentoDTO extends ItemDTO {
    dtype: 'MEDICAMENTO';
    tipo: string;
}


export interface InsumoDTO extends ItemDTO {
    dtype: 'INSUMO';
}

export interface SetorDTO {
    id: string;
    nome: string;
}

export interface MovimentacaoHistoricoDTO {
    id: string;
    tipoMovimentacao: 'ENTRADA' | 'SAIDA' | 'AJUSTE_ENTRADA' | 'AJUSTE_SAIDA';
    totalItens: number;
    quantidadeTotal: number;
    nomeSetor?: string;
    observacao: string;
    dataMovimentacao: string;
    nomeFuncionario: string;
}

export interface EstoqueSaldoDTO {
    itemId: string;
    nomeItem: string;
    dtype: string;
    quantidadeTotal: number;
}

export interface EstoqueListaDTO {
    id: string;
    numeroLote: string;
    dataValidade: string;
    quantidade: number;
    itemId: string;
    nomeItem: string;
    tipoItem: string;
}

export interface ItemMovimentadoDTO {
    nomeItem: string;
    tipoItem: string;
    quantidade: number;
}

export interface MovimentacaoDetalhesDTO {
    id: string;
    tipoMovimentacao: string;
    dataMovimentacao: string;
    observacao: string;
    nomeFuncionario: string;
    nomeSetor?: string;
    itens: ItemMovimentadoDTO[];
}

export interface DashboardStats {
    totalMedicamentos: number;
    totalInsumos: number;
    lotesProximosVencimento: number;
    itensEstoqueBaixo: number;
    medicamentosComEstoque: number;
    insumosComEstoque: number;
}

export interface AlertaEstoque {
    itemId: string;
    nomeItem: string;
    extraInfo: string;
    diasParaVencer?: number;
}

export interface GraficoData {
    nomeItem: string;
    quantidadeTotal: number;
}

export interface FuncionarioListaDTO {
    id: string;
    nome: string;
    login: string;
    ativo: boolean;
}

export interface UsuarioPerfilDTO {
    id: string;
    nome: string;
    login: string;
}