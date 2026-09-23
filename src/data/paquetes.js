// src/data/paquetes.js
// Paquetes que SOLO se muestran en la pestaña Promos (y en la alerta al abrir la app).
// En el Inicio no aparecen: ni en "Todos", ni en la búsqueda, ni en Favoritos.
// Son los ids de la tabla productos de Supabase:
// 1 = Paquete 1, 2 = Paquete 2, 3 = Paquete 3, 4 = Promo Magno
export const IDS_PAQUETES_PROMOS = [1, 2, 3, 4];

// ¿Este producto es uno de los paquetes que solo van en Promos?
export function esPaqueteDePromos(producto) {
  return IDS_PAQUETES_PROMOS.includes(Number(producto?.id));
}