# Sistema de Gestão de Farmácia Hospitalar - Frontend ⚛️

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Material UI](https://img.shields.io/badge/Material--UI-5.x-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)

Este é o projeto frontend para o Sistema de Gestão de Farmácia. É uma Single-Page Application (SPA) construída com React e TypeScript, projetada para consumir a API RESTful do backend e fornecer uma interface de usuário rica, reativa e intuitiva para os funcionários da farmácia.

##  Features Principais

-   **Interface Responsiva:** Construída com Material-UI, a aplicação se adapta a diferentes tamanhos de tela.
-   **Autenticação Segura:** Fluxo de login completo com armazenamento de token JWT e rotas protegidas.
-   **Dashboard Interativo:** Apresenta dados vitais da farmácia em tempo real, com gráficos (usando Recharts) para visualização de tendências de consumo.
-   **Gerenciamento Completo:** Módulos com CRUD completo para Itens (Medicamentos/Insumos), Setores e Funcionários.
-   **Fluxo de Movimentação em Lote:** Formulário avançado que permite ao usuário registrar a entrada ou saída de múltiplos itens em uma única operação, otimizando o fluxo de trabalho.
-   **Visualização de Estoque Detalhada:** Telas para consulta de saldo de estoque geral e visualização detalhada de lotes por item, com alertas visuais para datas de validade.
-   **Geração de Relatórios:** Funcionalidade para solicitar e baixar relatórios em PDF gerados pelo backend.
-   **Feedback ao Usuário:** Notificações (toasts) e alertas sonoros para confirmar ações de sucesso ou informar sobre erros.

##  Tecnologias Utilizadas

#### **Core**
* **React 18:** Biblioteca para construção da interface de usuário.
* **TypeScript:** Para tipagem estática e um código mais robusto e seguro.
* **Vite:** Ferramenta de build moderna e ultra-rápida.

#### **UI & Estilização**
* **Material-UI (MUI) 5.x:** Biblioteca de componentes para uma UI consistente e profissional.
* **MUI DataGrid:** Para a criação de tabelas de dados ricas e interativas.
* **MUI X Date Pickers:** Para seleção de datas.
* **Recharts:** Para a criação de gráficos no dashboard.

#### **Gerenciamento de Estado e Requisições**
* **React Context API:** Para gerenciamento do estado de autenticação e temas (Dark/Light).
* **Axios:** Cliente HTTP para fazer requisições à API do backend, com interceptors para tratamento global de erros.
* **React Router DOM:** Para gerenciamento de rotas e navegação.

#### **Utilitários**
* **Day.js:** Para manipulação e formatação de datas.
* **React Hot Toast:** Para exibir notificações (toasts) de forma simples e elegante.

##  Como Executar o Projeto

### Pré-requisitos
-   Node.js v18 ou superior.
-   NPM ou Yarn.
-   Uma instância do **[Backend do Sistema de Farmácia](https://github.com/seu-usuario/sistema-farmacia-backend)** deve estar rodando e acessível.

### Configuração do Ambiente
1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/sistema-farmacia-frontend.git](https://github.com/seu-usuario/sistema-farmacia-frontend.git)
    cd sistema-farmacia-frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    # yarn install
    ```
3.  **Configure as variáveis de ambiente:**
    * Crie uma cópia do arquivo `.env.example` e renomeie-a para `.env.local`.
    * Abra o novo arquivo `.env.local` e defina a URL da sua API backend:
      ```env
      VITE_API_BASE_URL=http://localhost:8080
      ```

### Executando a Aplicação
-   **Modo de Desenvolvimento:**
    ```bash
    npm run dev
    # ou
    # yarn dev
    ```
-   **Build de Produção:**
    ```bash
    npm run build
    # ou
    # yarn build
    ```

A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

---
_Este projeto foi desenvolvido para o hospital da minha cidade, demonstrando competências em tecnologias frontend modernas e experiência com o cliente._

