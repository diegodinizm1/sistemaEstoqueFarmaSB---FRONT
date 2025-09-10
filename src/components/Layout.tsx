import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { styled, useTheme, type Theme, type CSSObject } from '@mui/material/styles';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import {
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    CssBaseline,
    SpeedDial,
    SpeedDialIcon,
    SpeedDialAction
} from '@mui/material';
import toast from 'react-hot-toast';
import { useThemeMode } from '../context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MedicationIcon from '@mui/icons-material/Medication';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LogoutIcon from '@mui/icons-material/Logout';
import ApartmentIcon from '@mui/icons-material/Apartment';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import PerfilModal from './PerfilModal';
import MovimentacaoFormModal from './MovimentacaoFormModal';
import ItemFormModal from './AddItemModal';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps { open?: boolean; }

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const Layout = ({ children }: { children: ReactNode }) => {
    const { mode, toggleTheme } = useThemeMode();
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
    const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
    const [isSaidaModalOpen, setIsSaidaModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 });
    const [fabDirection, setFabDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');
    const fabRef = useRef<HTMLDivElement>(null);
    const appBarRef = useRef<HTMLElement>(null);
    const [appBarHeight, setAppBarHeight] = useState(0);
    const [fabSize, setFabSize] = useState({ width: 0, height: 0 });
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useLayoutEffect(() => {
        const updateDimensions = () => {
            if (appBarRef.current) setAppBarHeight(appBarRef.current.clientHeight);
            if (fabRef.current) setFabSize({ width: fabRef.current.clientWidth, height: fabRef.current.clientHeight });
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const draggableBounds = useMemo(() => {
        if (!fabSize.width || !fabSize.height) return undefined;

        const initialRight = 32;
        const initialBottom = 32;

        return {
            top: -(windowSize.height - appBarHeight - fabSize.height - initialBottom),
            left: -(windowSize.width - fabSize.width - initialRight),
            right: 0,
            bottom: 0,
        };
    }, [appBarHeight, fabSize, windowSize]);

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        toast.success('Você saiu da aplicação.');
    };
    const handleSave = () => { window.location.reload(); };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Itens', icon: <MedicationIcon />, path: '/itens' },
        { text: 'Setores', icon: <ApartmentIcon />, path: '/setores' },
        { text: 'Estoque', icon: <Inventory2Icon />, path: '/estoque' },
        { text: 'Movimentações', icon: <SyncAltIcon />, path: '/movimentacoes' },
        { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
    ];

    const speedDialActions = [
        { icon: <AddCircleOutlineIcon />, name: 'Adicionar Item', handler: () => setIsItemModalOpen(true) },
        { icon: <AddCircleOutlineIcon color="success" />, name: 'Registrar Entrada', handler: () => setIsEntradaModalOpen(true) },
        { icon: <RemoveCircleOutlineIcon color="warning" />, name: 'Registrar Saída', handler: () => setIsSaidaModalOpen(true) },
    ];

    const handleFabDoubleClick = () => {
        setFabPosition({ x: 0, y: 0 });
        setFabDirection('up');
    };

    const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
        setFabPosition({ x: data.x, y: data.y });

        const node = data.node;
        const screenHeight = window.innerHeight;
        const finalY = node.offsetTop + data.y;

        if (finalY < screenHeight / 2) {
            setFabDirection('down');
        } else {
            setFabDirection('up');
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar ref={appBarRef} position="fixed" open={open} elevation={0} sx={{ backgroundColor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar>
                    <IconButton color="inherit" onClick={handleDrawerOpen} edge="start" sx={{ marginRight: 5, ...(open && { display: 'none' }) }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        onClick={() => navigate('/dashboard')}
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        EstoqueFarma
                    </Typography>
                    <Tooltip title={mode === 'dark' ? "Modo Claro" : "Modo Escuro"}>
                        <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                            {mode === 'dark' ? <Brightness7Icon sx={{ color: '#ffee01ff' }} /> : <Brightness4Icon sx={{ color: '#030224ff' }} />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Meu Perfil">
                        <IconButton color="inherit" onClick={() => setIsPerfilModalOpen(true)}>
                            <AccountCircleIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List sx={{ p: 1, flexGrow: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Tooltip title={!open ? item.text : ''} placement="right" key={item.text}>
                                <ListItem disablePadding sx={{ display: 'block' }}>
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        selected={isActive}
                                        sx={{
                                            minHeight: 48,
                                            justifyContent: open ? 'initial' : 'center',
                                            px: 2.5,
                                            borderRadius: 2,
                                            mb: 0.5,
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                            backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.hover,
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'inherit',
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                    </ListItemButton>
                                </ListItem>
                            </Tooltip>
                        );
                    })}
                </List>
                <Box sx={{ p: 1 }}>
                    <Divider />
                    <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, mt: 1 }}>
                        <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', alignItems: 'center' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Sair" sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
                <Toolbar />
                {children}
            </Box>

            <Draggable
                nodeRef={fabRef}
                position={fabPosition}
                onStop={handleDragStop}
                bounds={draggableBounds}
            >
                <Box
                    ref={fabRef}
                    onDoubleClick={handleFabDoubleClick}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        zIndex: theme.zIndex.speedDial,
                        cursor: 'move',
                        transition: fabPosition.x === 0 && fabPosition.y === 0 ? 'transform 0.3s ease-in-out' : 'none',
                    }}
                >
                    <SpeedDial
                        ariaLabel="Ações Rápidas"
                        icon={<SpeedDialIcon />}
                        direction={fabDirection}
                    >
                        {speedDialActions.map((action) => (
                            <SpeedDialAction
                                key={action.name}
                                icon={action.icon}
                                tooltipTitle={action.name}
                                onClick={action.handler}
                                tooltipPlacement={fabDirection === 'down' ? 'right' : 'left'}
                            />
                        ))}
                    </SpeedDial>
                </Box>
            </Draggable>

            <PerfilModal open={isPerfilModalOpen} onClose={() => setIsPerfilModalOpen(false)} />
            <ItemFormModal open={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onItemSaved={handleSave} itemType="medicamento" itemToEdit={null} />
            <MovimentacaoFormModal open={isEntradaModalOpen} onClose={() => setIsEntradaModalOpen(false)} onMovimentacaoSaved={handleSave} initialType="ENTRADA" />
            <MovimentacaoFormModal open={isSaidaModalOpen} onClose={() => setIsSaidaModalOpen(false)} onMovimentacaoSaved={handleSave} initialType="SAIDA" />
        </Box>
    );
};

export default Layout;