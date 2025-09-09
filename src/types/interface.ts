// Assumindo que você tem uma interface base para os campos comuns
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

// Medicamento estende Item e adiciona seus campos específicos
export interface MedicamentoDTO extends ItemDTO {
    dtype: 'MEDICAMENTO'; // O tipo é fixo para Medicamento
    tipo: string; // Ex: ORAL, INJETAVEL...
}

// Insumo apenas estende Item
export interface InsumoDTO extends ItemDTO {
    dtype: 'INSUMO'; // O tipo é fixo para Insumo
}

export interface SetorDTO {
    id: string;
    nome: string;
}

// --- MODIFICADO ---
// Reflete o resumo de uma movimentação "mãe" com múltiplos itens.
export interface MovimentacaoHistoricoDTO {
    id: string;
    tipoMovimentacao: 'ENTRADA' | 'SAIDA' | 'AJUSTE_ENTRADA' | 'AJUSTE_SAIDA';
    totalItens: number;
    quantidadeTotal: number;
    nomeSetor?: string;
    observacao: string;
    dataMovimentacao: string; // Vem como string do back-end
    nomeFuncionario: string;
}

export interface EstoqueSaldoDTO {
    itemId: string;
    nomeItem: string;
    dtype: string; // Vem como 'MEDICAMENTO' ou 'INSUMO' do back-end
    quantidadeTotal: number;
}

// Para a lista de lotes de um item específico (visão Detalhe)
export interface EstoqueListaDTO {
    id: string; // ID do lote de estoque (Estoque.id)
    numeroLote: string;
    dataValidade: string; // Vem como string no formato 'YYYY-MM-DD'
    quantidade: number;
    itemId: string;
    nomeItem: string;
    tipoItem: string;
}

// --- NOVO ---
// DTO para representar cada item dentro dos detalhes de uma movimentação.
export interface ItemMovimentadoDTO {
    nomeItem: string;
    tipoItem: string;
    quantidade: number;
}


// --- MODIFICADO ---
// Agora contém uma lista de itens em vez de um único item.
export interface MovimentacaoDetalhesDTO {
    id: string;
    tipoMovimentacao: string;
    dataMovimentacao: string;
    observacao: string;
    nomeFuncionario: string;
    nomeSetor?: string;
    itens: ItemMovimentadoDTO[]; // Lista de itens
}

export interface DashboardStats {
    totalMedicamentos: number;
    totalInsumos: number;
    lotesProximosVencimento: number;
    itensEstoqueBaixo: number;
    medicamentosComEstoque: number;
    insumosComEstoque: number;
}

/**
 * Representa um item em uma das listas de alerta do Dashboard
 * (Lotes a Vencer ou Estoque Baixo).
 */
export interface AlertaEstoque {
    itemId: string;
    nomeItem: string;
    /**
     * Informação extra e flexível.
     * - Para lotes a vencer: "Lote: [número] (Qtd: [quantidade])"
     * - Para estoque baixo: "[quantidade total]"
     */
    extraInfo: string;
    /**
     * Opcional: Usado apenas para a lista de lotes a vencer.
     */
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