// Caminho: src/theme.ts
import { type ThemeOptions } from '@mui/material/styles';

// 1. Opções de tema que são compartilhadas entre os modos claro e escuro
const sharedThemeOptions: ThemeOptions = {
    typography: {
        fontFamily: '"Poppins", sans-serif',
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 12, // Cantos mais arredondados para um visual moderno
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
                },
            },
        },
        // 2. Para todos os 'Paper' (cards, modais, DataGrid, etc.)
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    transition: 'background-color 0.2s ease-in-out',
                },
            },
        },
        // 3. Para os botões
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: 'none',
                    }
                },
            },
        },
        // 4. Para os ícones
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    transition: 'color 0.2s ease-in-out',
                }
            }
        }
    },
};

// 2. Função que gera o tema completo com base no modo ('light' ou 'dark')
export const getAppTheme = (mode: 'light' | 'dark'): ThemeOptions => {
    // Configurações específicas do tema claro
    if (mode === 'light') {
        return {
            ...sharedThemeOptions,
            palette: {
                mode: 'light',
                primary: {
                    main: '#2C5282',
                    light: '#4A6FA5',
                    dark: '#2A4365',
                },
                secondary: {
                    main: '#ED8936',
                    light: '#F6AD55',
                    dark: '#DD6B20',
                },
                background: {
                    default: '#F7FAFC',
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#2D3748',
                    secondary: '#718096',
                }
            },
            components: {
                ...sharedThemeOptions.components,
                MuiDataGrid: {
                    styleOverrides: {
                        root: { border: 'none', backgroundColor: '#FFFFFF' },
                        columnHeaders: { backgroundColor: '#ffffffff', borderBottom: '1px solid #E2E8F0', color: '#2D3748', fontWeight: 600,  },
                        cell: { borderBottom: '1px solid #ffffffff' },
                        footerContainer: { borderTop: '1px solid #E2E8F0' },
                    }
                }
            }
        };
    }

    // Configurações específicas do tema escuro
    return {
        ...sharedThemeOptions,
        palette: {
            mode: 'dark',
            primary: {
                main: '#90CDF4', // Azul claro para bom contraste no fundo escuro
            },
            secondary: {
                main: '#F6AD55', // Laranja um pouco mais claro
            },
            background: {
                default: '#1A202C', // Fundo principal escuro
                paper: '#2D3748',   // Fundo dos cards e modais um pouco mais claro
            },
            text: {
                primary: '#F7FAFC',   // Texto principal quase branco
                secondary: '#A0AEC0', // Texto secundário acinzentado
            },
        },
        components: {
            ...sharedThemeOptions.components,
            MuiDataGrid: {
                styleOverrides: {
                    root: { border: 'none' },
                    columnHeaders: { backgroundColor: '#2D3748', borderBottom: '1px solid #4A5568' },
                    cell: { borderBottom: '1px solid #4A5568' },
                    footerContainer: { borderTop: '1px solid #4A5568' },
                    toolbarContainer: { '& .MuiButton-root': { color: '#F7FAFC' } }
                }
            }
        }
    };
};