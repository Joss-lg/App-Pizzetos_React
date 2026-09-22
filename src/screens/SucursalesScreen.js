import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Pressable, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTema } from '../context/ThemeContext';
import { useDatos } from '../context/DatosContext';
import ImageBackground from '../components/ImagenFondo';
import {
  IconoTelefono, IconoChat, IconoMapa, IconoPin, IconoReloj, IconoChevron,
} from '../components/IconosUI';

const INICIALES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]; // Lunes a Domingo

// Convierte 11 → "11:00 AM", 22 → "10:00 PM"
function formatoHora(hora24) {
  const sufijo = hora24 >= 12 ? 'PM' : 'AM';
  const hora12 = hora24 % 12 === 0 ? 12 : hora24 % 12;
  return `${hora12}:00 ${sufijo}`;
}

// Convierte minutos en "8 h 51 min", "45 min", etc.
function formatoDuracion(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function calcularEstado(horario) {
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const { apertura, cierre } = horario;
  const minApertura = apertura * 60;
  const minCierre = cierre * 60;
  const abierto = minutosAhora >= minApertura && minutosAhora < minCierre;

  if (abierto) {
    const faltan = minCierre - minutosAhora;
    return { abierto, detalle: `Cierra en ${formatoDuracion(faltan)} · ${formatoHora(cierre)}` };
  }

  const faltan = minutosAhora < minApertura
    ? minApertura - minutosAhora
    : 24 * 60 - minutosAhora + minApertura;
  return { abierto, detalle: `Abre en ${formatoDuracion(faltan)} · ${formatoHora(apertura)}` };
}

async function abrirEnlace(url, mensajeError) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Ups', mensajeError);
  }
}

export default function SucursalesScreen() {
  const { tema, modoOscuro } = useTema();
  const { sucursal } = useDatos();
  const [estado, setEstado] = useState(() => calcularEstado(sucursal.horario));
  const hoy = new Date().getDay();

  // Recalcula al cambiar el horario (si lo editan en Supabase) y cada minuto
  useEffect(() => {
    setEstado(calcularEstado(sucursal.horario));
    const intervalo = setInterval(() => setEstado(calcularEstado(sucursal.horario)), 60000);
    return () => clearInterval(intervalo);
  }, [sucursal.horario.apertura, sucursal.horario.cierre]);

  const urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sucursal.direccion)}`;
  const urlWhats = `https://wa.me/${sucursal.whatsapp}?text=${encodeURIComponent("¡Hola Pizzeto's! Quiero información 🍕")}`;

  const llamar = () => abrirEnlace(`tel:${sucursal.telefono}`, 'No se pudo abrir el marcador.');
  const whatsapp = () => abrirEnlace(urlWhats, 'No se pudo abrir WhatsApp.');
  const comoLlegar = () => abrirEnlace(urlMaps, 'No se pudo abrir el mapa.');

  const acciones = [
    { Icono: IconoTelefono, label: 'Llamar', color: '#27AE60', onPress: llamar },
    { Icono: IconoChat, label: 'WhatsApp', color: '#25D366', onPress: whatsapp },
    { Icono: IconoMapa, label: 'Cómo llegar', color: '#F5A623', onPress: comoLlegar },
  ];

  const bordeSuave = modoOscuro ? '#2C2C2C' : '#EEEEEE';
  const fondoIconoInfo = modoOscuro ? 'rgba(245,166,35,0.15)' : 'rgba(245,166,35,0.12)';
  const fondoDia = modoOscuro ? '#2C2C2C' : '#F2F2F2';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── TÍTULO GRANDE ── */}
        <Text style={[styles.tituloGrande, { color: tema.texto }]}>Sucursal</Text>
        <Text style={[styles.subtitulo, { color: tema.textoSecundario }]}>
          Visítanos o contáctanos directo
        </Text>

        {/* ── TARJETA PRINCIPAL ── */}
        <ImageBackground
          source={{ uri: sucursal.imagen }}
          style={styles.hero}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.estadoBadge, { backgroundColor: estado.abierto ? '#27AE60' : '#C0392B' }]}>
            <View style={styles.estadoPunto} />
            <Text style={styles.estadoTexto}>{estado.abierto ? 'ABIERTO AHORA' : 'CERRADO'}</Text>
          </View>
          <Text style={styles.heroMarca}>PIZZETO'S</Text>
          <Text style={styles.heroNombre}>{sucursal.nombre}</Text>
          <Text style={styles.heroDetalle}>{estado.detalle}</Text>
        </ImageBackground>

        {/* ── BOTONES DE ACCIÓN ── */}
        <View style={styles.accionesRow}>
          {acciones.map(({ Icono, label, color, onPress }) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                styles.accionBtn,
                { backgroundColor: tema.card },
                pressed && { opacity: 0.75 },
              ]}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View style={[styles.accionIcono, { backgroundColor: color }]}>
                <Icono color="#FFFFFF" size={21} />
              </View>
              <Text style={[styles.accionLabel, { color: tema.texto }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── INFORMACIÓN ── */}
        <View style={[styles.infoCard, { backgroundColor: tema.card }]}>
          <Pressable
            style={({ pressed }) => [styles.infoFila, pressed && { opacity: 0.6 }]}
            onPress={comoLlegar}
          >
            <View style={[styles.infoIcono, { backgroundColor: fondoIconoInfo }]}>
              <IconoPin color="#F5A623" size={19} />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoEtiqueta}>DIRECCIÓN</Text>
              <Text style={[styles.infoValor, { color: tema.texto }]}>{sucursal.direccion}</Text>
            </View>
            <IconoChevron color={tema.textoSoloInfo} />
          </Pressable>

          <View style={[styles.separador, { backgroundColor: bordeSuave }]} />

          <Pressable
            style={({ pressed }) => [styles.infoFila, pressed && { opacity: 0.6 }]}
            onPress={llamar}
          >
            <View style={[styles.infoIcono, { backgroundColor: fondoIconoInfo }]}>
              <IconoTelefono color="#F5A623" size={18} />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoEtiqueta}>TELÉFONO</Text>
              <Text style={[styles.infoValor, { color: tema.texto }]}>{sucursal.telefonoFormato}</Text>
            </View>
            <IconoChevron color={tema.textoSoloInfo} />
          </Pressable>

          <View style={[styles.separador, { backgroundColor: bordeSuave }]} />

          {/* ── HORARIO COMPACTO ── */}
          <View style={styles.infoFila}>
            <View style={[styles.infoIcono, { backgroundColor: fondoIconoInfo }]}>
              <IconoReloj color="#F5A623" size={19} />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoEtiqueta}>HORARIO · TODOS LOS DÍAS</Text>
              <Text style={[styles.infoValor, { color: tema.texto }]}>{sucursal.horarioTexto}</Text>
            </View>
          </View>

          <View style={styles.diasFila}>
            {ORDEN_SEMANA.map((dia) => {
              const esHoy = dia === hoy;
              return (
                <View
                  key={dia}
                  style={[styles.dia, { backgroundColor: esHoy ? '#F5A623' : fondoDia }]}
                  accessibilityLabel={esHoy ? 'Hoy' : undefined}
                >
                  <Text style={[styles.diaTexto, { color: esHoy ? '#1A1A1A' : tema.textoSecundario }]}>
                    {INICIALES[dia]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Espacio para que la barra flotante no tape el contenido */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const sombra = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  tituloGrande: { fontFamily: 'Poppins_700Bold', fontSize: 30, lineHeight: 38 },
  subtitulo: { fontFamily: 'Poppins_400Regular', fontSize: 13, marginBottom: 16 },

  hero: { height: 190, borderRadius: 20, justifyContent: 'flex-end', padding: 16 },
  heroMarca: { color: '#F5A623', fontFamily: 'Poppins_600SemiBold', fontSize: 10, letterSpacing: 3 },
  heroNombre: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 22, lineHeight: 28 },
  heroDetalle: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Poppins_400Regular', fontSize: 12 },

  estadoBadge: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  estadoPunto: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFF' },
  estadoTexto: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 0.5 },

  accionesRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  accionBtn: { flex: 1, alignItems: 'center', borderRadius: 18, paddingVertical: 16, ...sombra },
  accionIcono: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  accionLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },

  infoCard: { borderRadius: 18, marginTop: 14, overflow: 'hidden', ...sombra },
  infoFila: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  infoIcono: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  infoTextos: { flex: 1 },
  infoEtiqueta: { color: '#F5A623', fontFamily: 'Poppins_600SemiBold', fontSize: 9, letterSpacing: 1 },
  infoValor: { fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 18, marginTop: 2 },
  separador: { height: 1, marginLeft: 66, marginRight: 14 },

  diasFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 14,
    paddingBottom: 16,
    paddingLeft: 66,
  },
  dia: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaTexto: { fontFamily: 'Poppins_700Bold', fontSize: 11 },
});