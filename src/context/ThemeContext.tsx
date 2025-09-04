import { createContext, useState, useMemo, useContext, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
    // A função de inicialização lê o tema salvo ou usa o padrão do sistema do usuário
    const [mode, setMode] = useState<ThemeMode>(() => {
        const storedTheme = localStorage.getItem('themeMode') as ThemeMode;
        if (storedTheme) {
            return storedTheme;
        }
        // Se não houver nada salvo, verifica a preferência do sistema operacional
        const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return userPrefersDark ? 'dark' : 'light';
    });

    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            // Salva a nova preferência no localStorage
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeMode must be used within a ThemeModeProvider');
    }
    return context;
};