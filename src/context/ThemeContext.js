import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const CLAVE_TEMA = 'pizzetos:modoOscuro';

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
  const temaSistema = useColorScheme(); // 'light' | 'dark' | null

  // null = el usuario nunca eligió, se sigue el tema del sistema
  const [preferencia, setPreferencia] = useState(null);
  const [cargado, setCargado] = useState(false);

  // Al abrir la app, lee la elección guardada
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_TEMA)
      .then((valor) => {
        if (valor !== null) setPreferencia(valor === 'true');
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  const modoOscuro = preferencia ?? temaSistema === 'dark';

  const toggleTema = () => {
    const nuevo = !modoOscuro;
    setPreferencia(nuevo);
    AsyncStorage.setItem(CLAVE_TEMA, String(nuevo)).catch(() => {});
  };

  const tema = modoOscuro ? colores.oscuro : colores.claro;

  // Espera a leer la preferencia para no mostrar un "parpadeo" del tema equivocado
  if (!cargado) return null;

  return (
    <ThemeContext.Provider value={{ modoOscuro, toggleTema, tema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  return useContext(ThemeContext);
}