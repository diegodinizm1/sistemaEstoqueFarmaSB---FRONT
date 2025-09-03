import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    TextField, 
    Button, 
    Typography,  
    Paper, 
    CircularProgress, 
    InputAdornment, 
    IconButton,
    Avatar
} from '@mui/material';
import toast from 'react-hot-toast';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const API_BASE_URL = '${VITE_API_BASE_URL}/api';

const LoginPage = () => {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault(); // Impede o recarregamento da página ao submeter o formulário
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { login, senha });
            localStorage.setItem('token', response.data);
            toast.success('Login realizado com sucesso!');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Credenciais inválidas. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                // Usa a cor de fundo do tema global
                backgroundColor: 'background.default', 
                p: 3,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: { xs: 3, sm: 4 }, // Padding responsivo
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 3,
                    maxWidth: 400,
                    width: '100%',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5" fontWeight="bold">
                    EstoqueFarma
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Acesse sua conta para continuar
                </Typography>


                <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        label="Login"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required // Adicionado para validação básica
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutline />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Senha"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockOutlinedIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit" // Permite submeter o formulário com a tecla Enter
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;