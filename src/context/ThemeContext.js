// src/context/ThemeContext.js
// Tema claro / oscuro de la app.
// - Por defecto SIGUE AL TELÉFONO y cambia solo al momento en que el teléfono cambia.
// - El botón de sol/luna lo cambia a mano, pero en cuanto el teléfono vuelve a
//   cambiar de modo, la app se sincroniza otra vez con él.

import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const CLAVE_TEMA = 'pizzetos:temaManual'; // clave nueva (la vieja se ignora)
const CLAVE_VIEJA = 'pizzetos:modoOscuro';

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

// Modo del teléfono ('light' o 'dark').
// Solo se actualiza con la app en primer plano: en iPhone, al mandar la app al
// fondo, el sistema cambia el modo un instante para tomar la "foto" del
// multitarea, y eso no debe contar como un cambio real.
function useModoTelefono() {
  const [modo, setModo] = useState(() => Appearance.getColorScheme() ?? 'light');

  useEffect(() => {
    const subApariencia = Appearance.addChangeListener(({ colorScheme }) => {
      if (AppState.currentState === 'active' && colorScheme) setModo(colorScheme);
    });
    // Al regresar a la app, lee el modo actual (por si cambió mientras no estabas)
    const subEstado = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        const actual = Appearance.getColorScheme();
        if (actual) setModo(actual);
      }
    });
    return () => {
      subApariencia.remove();
      subEstado.remove();
    };
  }, []);

  return modo;
}

export function ThemeProvider({ children }) {
  const modoTelefono = useModoTelefono();

  // null = seguir al teléfono.
  // { oscuro, telefono } = el usuario eligió a mano, y "telefono" es el modo
  // que tenía el teléfono en ese momento.
  const [manual, setManual] = useState(null);
  const [cargado, setCargado] = useState(false);

  // Al abrir la app, lee la elección manual guardada
  useEffect(() => {
    AsyncStorage.removeItem(CLAVE_VIEJA).catch(() => {}); // limpia la versión anterior
    AsyncStorage.getItem(CLAVE_TEMA)
      .then((valor) => {
        if (!valor) return;
        const guardado = JSON.parse(valor);
        if (guardado && typeof guardado.oscuro === 'boolean' && guardado.telefono) {
          setManual(guardado);
        }
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  // Si el teléfono cambió de modo desde que el usuario eligió a mano,
  // se olvida la elección y se vuelve a seguir al teléfono
  useEffect(() => {
    if (manual && manual.telefono !== modoTelefono) {
      setManual(null);
      AsyncStorage.removeItem(CLAVE_TEMA).catch(() => {});
    }
  }, [modoTelefono, manual]);

  const modoOscuro = manual ? manual.oscuro : modoTelefono === 'dark';

  const toggleTema = () => {
    const nuevo = !modoOscuro;
    // Si lo nuevo coincide con el teléfono, simplemente se sigue al teléfono
    if (nuevo === (modoTelefono === 'dark')) {
      setManual(null);
      AsyncStorage.removeItem(CLAVE_TEMA).catch(() => {});
      return;
    }
    const eleccion = { oscuro: nuevo, telefono: modoTelefono };
    setManual(eleccion);
    AsyncStorage.setItem(CLAVE_TEMA, JSON.stringify(eleccion)).catch(() => {});
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