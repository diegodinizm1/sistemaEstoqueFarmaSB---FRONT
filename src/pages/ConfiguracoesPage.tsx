import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import GerenciamentoUsuarios from '../components/configuracoes/GerenciamentoUsuarios';
import ConfiguracaoAlertas from '../components/configuracoes/ConfiguracoesAlertas';

const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
};

const ConfiguracoesPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => { setTabValue(newValue); };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Configurações do Sistema
            </Typography>

            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Gerenciamento de Usuários" />
                        <Tab label="Alertas e Notificações" />
                    </Tabs>
                </Box>
                <TabPanel value={tabValue} index={0}>
                    <GerenciamentoUsuarios />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <ConfiguracaoAlertas />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default ConfiguracoesPage;