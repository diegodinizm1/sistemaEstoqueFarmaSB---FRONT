// Caminho: src/mui-x.d.ts

import type { DataGridProps } from '@mui/x-data-grid';
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

// Aumenta o módulo do Material-UI para que ele reconheça o MuiDataGrid
declare module '@mui/material/styles' {
  // Permite o uso de `defaultProps` no tema para a DataGrid
  interface ComponentPropsList {
    MuiDataGrid: DataGridProps;
  }

  // Permite o uso de `styleOverrides` no tema para a DataGrid
  interface Components<Theme = unknown> {
    MuiDataGrid?: {
      defaultProps?: ComponentsProps['MuiDataGrid'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDataGrid'];
      variants?: ComponentsVariants<Theme>['MuiDataGrid'];
    };
  }
}