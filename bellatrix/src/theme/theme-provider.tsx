'use client';

import { useMemo } from 'react';
// @mui
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider as MuiThemeProvider, ThemeOptions } from '@mui/material/styles';
// system
import { palette } from './palette';
import { shadows } from './shadows';
import { typography } from './typography';
import { customShadows } from './custom-shadows';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
    const baseOption = useMemo(
        () => ({
            palette: palette('light'),
            shadows: shadows('light'),
            customShadows: customShadows('light'),
            typography,
            shape: { borderRadius: 8 },
        }),
        []
    );

    const theme = createTheme(baseOption as ThemeOptions);

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}
