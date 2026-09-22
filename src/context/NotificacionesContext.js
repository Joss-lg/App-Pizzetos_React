import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificacionesIniciales } from '../data/notificaciones';

const NotificacionesContext = createContext();
const CLAVE_LEIDAS = 'pizzetos:notificacionesLeidas';

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState(notificacionesIniciales);

  // Al abrir la app, marca como leídas las que ya se habían leído antes
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_LEIDAS)
      .then((valor) => {
        if (!valor) return;
        const idsLeidas = JSON.parse(valor);
        setNotificaciones((prev) =>
          prev.map((n) => (idsLeidas.includes(n.id) ? { ...n, leida: true } : n))
        );
      })
      .catch(() => {});
  }, []);

  // Guarda en el celular los id de todas las notificaciones leídas
  const guardar = (lista) => {
    const ids = lista.filter((n) => n.leida).map((n) => n.id);
    AsyncStorage.setItem(CLAVE_LEIDAS, JSON.stringify(ids)).catch(() => {});
  };

  const marcarLeida = (id) =>
    setNotificaciones((prev) => {
      const nueva = prev.map((n) => (n.id === id ? { ...n, leida: true } : n));
      guardar(nueva);
      return nueva;
    });

  const marcarTodas = () =>
    setNotificaciones((prev) => {
      const nueva = prev.map((n) => ({ ...n, leida: true }));
      guardar(nueva);
      return nueva;
    });

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <NotificacionesContext.Provider value={{ notificaciones, marcarLeida, marcarTodas, noLeidas }}>
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}