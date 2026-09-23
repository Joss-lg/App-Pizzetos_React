// src/screens/PromocionesScreen.js
// Pestaña "Promos": SOLO Paquete 1, 2, 3 y Promo Magno.
// - Arriba: el paquete en oferta como tarjeta grande destacada.
// - Luego: los demás paquetes, cada uno con botón directo a WhatsApp.
// - Al final: cómo pedir en 3 pasos + botones de llamar y WhatsApp.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  RefreshControl, Linking, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useTema } from '../context/ThemeContext';
import { useDatos } from '../context/DatosContext';
import BotonFavorito from '../components/BotonFavorito';
import { IconoChat, IconoTelefono } from '../components/IconosUI';
import { IDS_PAQUETES_PROMOS, esPaqueteDePromos } from '../data/paquetes';

const NARANJA = '#F5A623';
const VERDE_WHATS = '#25D366';
const PROPORCION_FOTO = 16 / 9; // las fotos de los paquetes son horizontales

const PASOS = [
  { titulo: 'Elige tu paquete', texto: 'Revisa qué incluye cada uno.' },
  { titulo: 'Escríbenos o llama', texto: 'Por WhatsApp o por teléfono.' },
  { titulo: 'Disfrútalo', texto: 'La pizza de tu vida, lista para ti.' },
];

function formatoPrecio(valor) {
  const n = Number(valor);
  if (isNaN(n)) return '';
  return '$' + n.toFixed(Number.isInteger(n) ? 0 : 2);
}

// ¿La sucursal está abierta ahorita? (usa sucursal.horario, igual que la pantalla Sucursal)
function estaAbierta(sucursal) {
  if (!sucursal) return null;
  const abre = Number(sucursal.horario?.apertura ?? sucursal.horaApertura ?? sucursal.hora_apertura);
  const cierra = Number(sucursal.horario?.cierre ?? sucursal.horaCierre ?? sucursal.hora_cierre);
  if (isNaN(abre) || isNaN(cierra)) return null;
  const hora = new Date().getHours();
  return hora >= abre && hora < cierra;
}

export default function PromocionesScreen() {
  const { tema, modoOscuro } = useTema();
  const { productos, sucursal, recargar } = useDatos();
  const navigation = useNavigation();
  const [refrescando, setRefrescando] = useState(false);

  // Animación de entrada de la tarjeta destacada
  const entrada = useRef(new Animated.Value(0)).current;

  // Solo los paquetes de Promos, en el orden 1, 2, 3, Magno
  const paquetes = useMemo(() => {
    const lista = productos.filter((p) => esPaqueteDePromos(p));
    lista.sort(
      (a, b) =>
        IDS_PAQUETES_PROMOS.indexOf(Number(a.id)) - IDS_PAQUETES_PROMOS.indexOf(Number(b.id))
    );
    return lista;
  }, [productos]);

  // El destacado es el que está en oferta (si no hay, el primero)
  const destacado = paquetes.find((p) => p.oferta) || paquetes[0];
  const resto = paquetes.filter((p) => p.id !== destacado?.id);

  useEffect(() => {
    if (!destacado) return;
    entrada.setValue(0);
    Animated.spring(entrada, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [destacado?.id]);

  const abierta = estaAbierta(sucursal);

  const alRefrescar = async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  };

  const abrirDetalle = (p) => {
    navigation.navigate('ProductoDetalle', { id: p.id });
  };

  const pedirPorWhatsApp = async (paquete) => {
    if (!sucursal?.whatsapp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const mensaje = paquete
      ? `¡Hola Pizzeto's! Quiero pedir el ${paquete.nombre} (${formatoPrecio(paquete.precio)}).`
      : "¡Hola Pizzeto's! Quiero información sobre sus paquetes.";
    try {
      await Linking.openURL(
        `https://wa.me/${sucursal.whatsapp}?text=${encodeURIComponent(mensaje)}`
      );
    } catch {
      Alert.alert('Ups', 'No se pudo abrir WhatsApp.');
    }
  };

  const llamar = async () => {
    if (!sucursal?.telefono) return;
    try {
      await Linking.openURL(`tel:${sucursal.telefono}`);
    } catch {
      Alert.alert('Ups', 'No se pudo abrir el marcador.');
    }
  };

  const bordeSuave = modoOscuro ? '#333333' : '#E8E8E8';
  const fondoSuave = modoOscuro ? '#2A2A2A' : '#F4F1EC';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: tema.fondo }]}>
      <ScrollView
        style={{ backgroundColor: tema.fondo }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={alRefrescar}
            tintColor={NARANJA}
            colors={[NARANJA]}
          />
        }
      >
        {/* ── ENCABEZADO ── */}
        <View style={styles.encabezado}>
          <View style={styles.filaTitulo}>
            <Text style={[styles.titulo, { color: tema.texto }]}>Paquetes</Text>
            {abierta !== null && (
              <View style={[styles.estado, { backgroundColor: fondoSuave }]}>
                <View
                  style={[
                    styles.puntoEstado,
                    { backgroundColor: abierta ? '#27AE60' : '#C0392B' },
                  ]}
                />
                <Text style={[styles.textoEstado, { color: tema.texto }]}>
                  {abierta ? 'Abierto ahora' : 'Cerrado'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitulo, { color: tema.textoSecundario }]}>
            Pizza, refresco y más en un solo pedido.
          </Text>
        </View>

        {paquetes.length === 0 ? (
          <Text style={[styles.vacio, { color: tema.textoSecundario }]}>
            Cargando los paquetes...{'\n'}Desliza hacia abajo para actualizar.
          </Text>
        ) : (
          <>
            {/* ── DESTACADO ── */}
            {destacado && (
              <Animated.View
                style={[
                  styles.bloque,
                  {
                    opacity: entrada,
                    transform: [
                      {
                        translateY: entrada.interpolate({
                          inputRange: [0, 1],
                          outputRange: [24, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Pressable
                  onPress={() => abrirDetalle(destacado)}
                  style={({ pressed }) => [
                    styles.tarjetaDestacada,
                    { backgroundColor: tema.card, borderColor: NARANJA },
                    pressed && { transform: [{ scale: 0.985 }] },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${destacado.nombre}, ${formatoPrecio(destacado.precio)}`}
                >
                  <View style={styles.fotoDestacada}>
                    <Image
                      source={{ uri: destacado.imagen }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={250}
                      cachePolicy="memory-disk"
                    />
                    <View style={styles.favorito}>
                      <BotonFavorito id={destacado.id} size={38} />
                    </View>
                  </View>

                  <View style={styles.infoDestacada}>
                    <View style={styles.cintaDestacada}>
                      <Text style={styles.textoCinta}>
                        {destacado.oferta ? 'Oferta' : 'Destacado'}
                      </Text>
                    </View>

                    <View style={styles.filaNombrePrecio}>
                      <Text style={[styles.nombreDestacado, { color: tema.texto }]} numberOfLines={2}>
                        {destacado.nombre}
                      </Text>
                      <Text style={[styles.precioDestacado, { color: tema.precio }]}>
                        {formatoPrecio(destacado.precio)}
                      </Text>
                    </View>

                    {!!destacado.descripcion && (
                      <Text style={[styles.descripcionDestacada, { color: tema.textoSecundario }]}>
                        {destacado.descripcion}
                      </Text>
                    )}

                    <View style={styles.filaBotones}>
                      <Pressable
                        onPress={() => pedirPorWhatsApp(destacado)}
                        style={({ pressed }) => [styles.botonWhats, pressed && { opacity: 0.85 }]}
                        accessibilityLabel={`Pedir ${destacado.nombre} por WhatsApp`}
                      >
                        <IconoChat color="#FFFFFF" size={18} />
                        <Text style={styles.textoWhats}>Pedir por WhatsApp</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => abrirDetalle(destacado)}
                        style={({ pressed }) => [
                          styles.botonDetalle,
                          { borderColor: bordeSuave },
                          pressed && { opacity: 0.7 },
                        ]}
                        accessibilityLabel={`Ver detalle de ${destacado.nombre}`}
                      >
                        <Text style={[styles.textoDetalle, { color: tema.texto }]}>Ver</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            )}

            {/* ── LOS DEMÁS ── */}
            {resto.length > 0 && (
              <View style={styles.bloque}>
                <View style={styles.seccionHeader}>
                  <Text style={[styles.seccionTitulo, { color: tema.texto }]}>MÁS PAQUETES</Text>
                  <View style={styles.lineaAmarilla} />
                </View>

                {resto.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => abrirDetalle(p)}
                    style={({ pressed }) => [
                      styles.tarjeta,
                      { backgroundColor: tema.card },
                      pressed && { transform: [{ scale: 0.985 }] },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.nombre}, ${formatoPrecio(p.precio)}`}
                  >
                    <View style={styles.foto}>
                      <Image
                        source={{ uri: p.imagen }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={250}
                        cachePolicy="memory-disk"
                      />
                      <View style={styles.favorito}>
                        <BotonFavorito id={p.id} size={34} />
                      </View>
                    </View>

                    <View style={styles.infoTarjeta}>
                      <View style={styles.columnaTexto}>
                        <Text style={[styles.nombre, { color: tema.texto }]} numberOfLines={1}>
                          {p.nombre}
                        </Text>
                        {!!p.descripcion && (
                          <Text
                            style={[styles.descripcion, { color: tema.textoSecundario }]}
                            numberOfLines={2}
                          >
                            {p.descripcion}
                          </Text>
                        )}
                        <Text style={[styles.precio, { color: tema.precio }]}>
                          {formatoPrecio(p.precio)}
                          <Text style={[styles.moneda, { color: tema.textoSecundario }]}> MXN</Text>
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => pedirPorWhatsApp(p)}
                        hitSlop={8}
                        style={({ pressed }) => [styles.botonWhatsRedondo, pressed && { opacity: 0.85 }]}
                        accessibilityLabel={`Pedir ${p.nombre} por WhatsApp`}
                      >
                        <IconoChat color="#FFFFFF" size={20} />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* ── CÓMO PEDIR ── */}
            <View style={styles.bloque}>
              <View style={styles.seccionHeader}>
                <Text style={[styles.seccionTitulo, { color: tema.texto }]}>CÓMO PEDIR</Text>
                <View style={styles.lineaAmarilla} />
              </View>

              <View style={[styles.cajaPasos, { backgroundColor: tema.card }]}>
                {PASOS.map((paso, i) => (
                  <View key={paso.titulo} style={styles.paso}>
                    <View style={styles.columnaNumero}>
                      <View style={styles.numero}>
                        <Text style={styles.textoNumero}>{i + 1}</Text>
                      </View>
                      {i < PASOS.length - 1 && (
                        <View style={[styles.lineaPaso, { backgroundColor: bordeSuave }]} />
                      )}
                    </View>
                    <View style={styles.textoPaso}>
                      <Text style={[styles.tituloPaso, { color: tema.texto }]}>{paso.titulo}</Text>
                      <Text style={[styles.detallePaso, { color: tema.textoSecundario }]}>
                        {paso.texto}
                      </Text>
                    </View>
                  </View>
                ))}

                {!!sucursal && (
                  <View style={styles.filaBotones}>
                    <Pressable
                      onPress={llamar}
                      style={({ pressed }) => [
                        styles.botonLlamar,
                        { borderColor: bordeSuave },
                        pressed && { opacity: 0.7 },
                      ]}
                      accessibilityLabel="Llamar a la sucursal"
                    >
                      <IconoTelefono color={tema.texto} size={18} />
                      <Text style={[styles.textoLlamar, { color: tema.texto }]}>Llamar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => pedirPorWhatsApp(null)}
                      style={({ pressed }) => [styles.botonWhats, pressed && { opacity: 0.85 }]}
                      accessibilityLabel="Escribir por WhatsApp"
                    >
                      <IconoChat color="#FFFFFF" size={18} />
                      <Text style={styles.textoWhats}>WhatsApp</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* Espacio para que la barra flotante no tape el contenido */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  // Encabezado
  encabezado: { paddingHorizontal: 16, paddingTop: 12 },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: { fontFamily: 'Poppins_700Bold', fontSize: 30, lineHeight: 38 },
  subtitulo: { fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 19, marginTop: 2 },
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  puntoEstado: { width: 8, height: 8, borderRadius: 4 },
  textoEstado: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },

  bloque: { marginTop: 20, paddingHorizontal: 16 },

  // Destacado
  tarjetaDestacada: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
  },
  fotoDestacada: { width: '100%', aspectRatio: PROPORCION_FOTO, backgroundColor: '#1A1612' },
  favorito: { position: 'absolute', top: 10, right: 10 },
  infoDestacada: { padding: 16, paddingTop: 14 },
  cintaDestacada: {
    alignSelf: 'flex-start',
    backgroundColor: NARANJA,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  textoCinta: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#1A1A1A' },
  filaNombrePrecio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  nombreDestacado: { flex: 1, fontFamily: 'Poppins_700Bold', fontSize: 22, lineHeight: 28 },
  precioDestacado: { fontFamily: 'Poppins_700Bold', fontSize: 30, lineHeight: 34 },
  descripcionDestacada: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  // Botones
  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 14 },
  botonWhats: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: VERDE_WHATS,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoWhats: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#FFFFFF' },
  botonDetalle: {
    width: 76,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoDetalle: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
  botonLlamar: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoLlamar: { fontFamily: 'Poppins_700Bold', fontSize: 14 },

  // Secciones
  seccionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  seccionTitulo: { fontFamily: 'Poppins_700Bold', fontSize: 13, letterSpacing: 1 },
  lineaAmarilla: {
    flex: 1,
    height: 2,
    backgroundColor: NARANJA,
    marginLeft: 10,
    borderRadius: 2,
  },

  // Tarjetas normales
  tarjeta: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
  },
  foto: { width: '100%', aspectRatio: PROPORCION_FOTO, backgroundColor: '#1A1612' },
  infoTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  columnaTexto: { flex: 1 },
  nombre: { fontFamily: 'Poppins_700Bold', fontSize: 16 },
  descripcion: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 17, marginTop: 2 },
  precio: { fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 4 },
  moneda: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  botonWhatsRedondo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: VERDE_WHATS,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cómo pedir
  cajaPasos: { borderRadius: 20, padding: 16 },
  paso: { flexDirection: 'row', gap: 12 },
  columnaNumero: { alignItems: 'center', width: 30 },
  numero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: NARANJA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoNumero: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#1A1A1A' },
  lineaPaso: { width: 2, flex: 1, minHeight: 14, marginVertical: 4, borderRadius: 1 },
  textoPaso: { flex: 1, paddingBottom: 14 },
  tituloPaso: { fontFamily: 'Poppins_700Bold', fontSize: 14, lineHeight: 20, marginTop: 4 },
  detallePaso: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 17 },

  vacio: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
});