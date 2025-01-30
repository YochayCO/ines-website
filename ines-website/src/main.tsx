import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTheme, ThemeProvider } from '@mui/material'
import App from './App.tsx'

import './index.css'
import './fonts.css'

const theme = createTheme({
  typography: {
    fontFamily: ['Lato', 'Open Sans Hebrew', 'Arial'].join(','),
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
