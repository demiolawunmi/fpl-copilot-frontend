import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },
  styles: {
    global: {
      'html, body, #root': {
        minHeight: '100%',
      },
      body: {
        margin: 0,
        minWidth: '320px',
        backgroundColor: 'slate.950',
        color: 'white',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*::placeholder': {
        color: 'slate.500',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'lg',
        fontWeight: 'semibold',
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'slate.800',
            borderWidth: '1px',
            borderColor: 'whiteAlpha.200',
            color: 'white',
            _hover: {
              borderColor: 'whiteAlpha.300',
            },
            _focusVisible: {
              borderColor: 'brand.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});

export default theme;

