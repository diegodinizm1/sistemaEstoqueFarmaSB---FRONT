

import { createTheme } from '@mui/material/styles';
import { blue, grey } from '@mui/material/colors';

import { ptBR as corePtBR } from '@mui/material/locale';
import { ptBR as dataGridPtBR } from '@mui/x-data-grid/locales';

export const appTheme = createTheme({
  palette: {
    primary: {
      main: blue[700], 
    },
    secondary: {
      main: grey[500],
    },
    background: {
      default: grey[100],
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  shape: {
    borderRadius: 4,
  }
},
corePtBR, 
dataGridPtBR 
);