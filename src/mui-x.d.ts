import type { DataGridProps } from '@mui/x-data-grid';
import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface ComponentPropsList {
    MuiDataGrid: DataGridProps;
  }

  interface Components<Theme = unknown> {
    MuiDataGrid?: {
      defaultProps?: ComponentsProps['MuiDataGrid'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiDataGrid'];
      variants?: ComponentsVariants<Theme>['MuiDataGrid'];
    };
  }
}