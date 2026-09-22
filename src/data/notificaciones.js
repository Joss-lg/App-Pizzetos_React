// tipo: 'promo' | 'aviso' | 'nuevo'
// destino: nombre de la pestaña a la que lleva al tocarla (o null)
export const notificacionesIniciales = [
  {
    id: 1,
    tipo: 'promo',
    titulo: '¡Hoy es Promo Lunes!',
    mensaje: '2x1 en pizzas medianas todo el día. Toca para ver los detalles.',
    fecha: '2026-09-21T11:00:00',
    destino: 'Promos',
    leida: false,
  },
  {
    id: 2,
    tipo: 'nuevo',
    titulo: 'Conoce la Promo Magno',
    mensaje: '2 pizzas grandes + alitas + 2 refrescos Jarritos por $599.',
    fecha: '2026-09-20T18:30:00',
    destino: 'Promos',
    leida: false,
  },
  {
    id: 3,
    tipo: 'aviso',
    titulo: 'Visítanos en Miraflores',
    mensaje: 'Abrimos de lunes a domingo de 11:00 AM a 10:00 PM.',
    fecha: '2026-09-18T12:00:00',
    destino: 'Sucursales',
    leida: true,
  },
  {
    id: 4,
    tipo: 'aviso',
    titulo: "¡Bienvenido a Pizzeto's!",
    mensaje: 'Aquí verás nuestras promociones y novedades antes que nadie.',
    fecha: '2026-09-15T10:00:00',
    destino: null,
    leida: true,
  },
];