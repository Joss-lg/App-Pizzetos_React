import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const colores = {
  claro: {
    fondo: '#F5F5F5',
    card: '#FFFFFF',
    header: '#FFFFFF',
    texto: '#1A1A1A',
    textoSecundario: '#666666',
    textoSoloInfo: '#999999',
    pill: '#EEEEEE',
    pillBorde: '#DDDDDD',
    pillTexto: '#555555',
    pillActivoBg: '#F5A623',
    pillActivoTexto: '#000000',
    pillActivoBorde: '#F5A623',
    sucursalBorde: '#CCCCCC',
    sucursalTexto: '#1A1A1A',
    marcaTexto: '#1A1A1A',
    precio: '#E8940A',
    statusBar: 'dark',
  },
  oscuro: {
    fondo: '#1A1A1A',
    card: '#242424',
    header: '#1A1A1A',
    texto: '#FFFFFF',
    textoSecundario: '#CCCCCC',
    textoSoloInfo: '#666666',
    pill: 'transparent',
    pillBorde: '#444444',
    pillTexto: '#AAAAAA',
    pillActivoBg: '#F5A623',
    pillActivoTexto: '#000000',
    pillActivoBorde: '#F5A623',
    sucursalBorde: '#444444',
    sucursalTexto: '#FFFFFF',
    marcaTexto: '#FFFFFF',
    precio: '#F5A623',
    statusBar: 'light',
  },
};

export function ThemeProvider({ children }) {
  const [modoOscuro, setModoOscuro] = useState(false);

  const toggleTema = () => setModoOscuro((prev) => !prev);
  const tema = modoOscuro ? colores.oscuro : colores.claro;

  return (
    <ThemeContext.Provider value={{ modoOscuro, toggleTema, tema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  return useContext(ThemeContext);
}