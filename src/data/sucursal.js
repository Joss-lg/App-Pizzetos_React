// src/data/sucursal.js
// Respaldo local de la sucursal: se usa solo si todavía no hay datos de Supabase.

const FOTOS = 'https://arzvmrscwqzmgbburwox.supabase.co/storage/v1/object/public/fotos/sucursal';

export const sucursal = {
  nombre: 'Pizzetos Miraflores',
  direccion: 'Carretera Chalco Manzana 005, Miraflores, 56645 San Mateo Tezoquipan, Méx.',
  telefono: '5584457355',
  telefonoFormato: '55 8445 7355',
  whatsapp: '525584457355', // 52 = lada de México
  horario: { apertura: 11, cierre: 22 }, // formato 24 hrs
  horarioTexto: '11:00 AM – 10:00 PM',
  imagen: `${FOTOS}/foto1.jpg`,
  // Fotos del carrusel de la pantalla Sucursal
  imagenes: [
    `${FOTOS}/foto1.jpg`,
    `${FOTOS}/foto2.jpg`,
    `${FOTOS}/foto3.jpg`,
  ],
};