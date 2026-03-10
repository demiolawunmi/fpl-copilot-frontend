import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { TeamIdProvider } from './context/TeamIdContext'
import theme from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>
        <TeamIdProvider>
          <App />
        </TeamIdProvider>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)
