import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Linking, Alert, Dimensions, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTema } from '../context/ThemeContext';
import { useDatos } from '../context/DatosContext';
import ImageBackground from '../components/ImagenFondo';
import BotonFavorito from '../components/BotonFavorito';
import { IconoChat, IconoTelefono } from '../components/IconosUI';

const { width } = Dimensions.get('window');

const trazo = (color, grosor = 2.2) => ({
  stroke: color,
  strokeWidth: grosor,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
});

function IconoAtras({ color, size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 6l-6 6 6 6" {...trazo(color)} />
    </Svg>
  );
}

function IconoCompartir({ color, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" {...trazo(color, 2)} />
    </Svg>
  );
}

function IconoInfo({ color, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="8.5" {...trazo(color, 1.8)} />
      <Path d="M12 11v5" {...trazo(color, 2)} />
      <Circle cx="12" cy="8" r="1" fill={color} />
    </Svg>
  );
}

export default function ProductoDetalleScreen({ route, navigation }) {
  const { tema, modoOscuro } = useTema();
  const { productos, sucursal } = useDatos();
  const insets = useSafeAreaInsets();
  const producto = productos.find((p) => p.id === route.params?.id);

  if (!producto) {
    return (
      <View style={[styles.noEncontrado, { backgroundColor: tema.fondo }]}>
        <Text style={{ fontSize: 48 }}>🍕</Text>
        <Text style={[styles.noEncontradoTexto, { color: tema.texto }]}>
          Este producto ya no está disponible
        </Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.volverTexto}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const relacionados = productos.filter(
    (p) => p.categoria === producto.categoria && p.id !== producto.id
  );

  const preguntar = async () => {
    const mensaje = `¡Hola Pizzeto's! Quiero información sobre "${producto.nombre}" ($${producto.precio}) 🍕`;
    try {
      await Linking.openURL(`https://wa.me/${sucursal.whatsapp}?text=${encodeURIComponent(mensaje)}`);
    } catch {
      Alert.alert('Ups', 'No se pudo abrir WhatsApp.');
    }
  };

  const llamar = async () => {
    try {
      await Linking.openURL(`tel:${sucursal.telefono}`);
    } catch {
      Alert.alert('Ups', 'No se pudo abrir el marcador.');
    }
  };

  const compartir = () => {
    Share.share({
      message: `🍕 ${producto.nombre} en Pizzeto's por $${producto.precio}\n${producto.descripcion}\n\nPide al ${sucursal.telefonoFormato}`,
    }).catch(() => {});
  };

  const bordeSuave = modoOscuro ? '#2C2C2C' : '#EEEEEE';

  return (
    <View style={[styles.contenedor, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── FOTO GRANDE ── */}
        <ImageBackground source={{ uri: producto.imagen }} style={styles.imagen}>
          {/* Degradado arriba para que los botones siempre se vean */}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
            style={[styles.degradadoSuperior, { height: insets.top + 90 }]}
          />
          <View style={[styles.barraSuperior, { top: insets.top + 8 }]}>
            <Pressable
              style={({ pressed }) => [styles.botonCircular, pressed && { opacity: 0.7 }]}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Regresar"
            >
              <IconoAtras color="#1A1A1A" />
            </Pressable>

            <View style={styles.botonesDerecha}>
              <BotonFavorito id={producto.id} size={42} />
              <Pressable
                style={({ pressed }) => [styles.botonCircular, pressed && { opacity: 0.7 }]}
                onPress={compartir}
                accessibilityLabel="Compartir producto"
              >
                <IconoCompartir color="#1A1A1A" />
              </Pressable>
            </View>
          </View>
        </ImageBackground>

        {/* ── INFO ── */}
        <View style={[styles.info, { backgroundColor: tema.fondo }]}>
          <View style={styles.etiquetasFila}>
            <View style={[styles.chipCategoria, { backgroundColor: modoOscuro ? '#2A2A2A' : '#F0F0F0' }]}>
              <Text style={[styles.chipCategoriaTexto, { color: tema.textoSecundario }]}>
                {producto.categoria}
              </Text>
            </View>
            {producto.oferta && (
              <View style={styles.badgeOferta}>
                <Text style={styles.badgeOfertaTexto}>🔥 Oferta especial</Text>
              </View>
            )}
          </View>

          <Text style={[styles.nombre, { color: tema.texto }]}>{producto.nombre}</Text>

          <View style={styles.precioRow}>
            <Text style={[styles.precio, { color: tema.precio }]}>${producto.precio}</Text>
            <Text style={[styles.moneda, { color: tema.textoSecundario }]}>MXN</Text>
          </View>

          <View style={[styles.linea, { backgroundColor: bordeSuave }]} />

          <Text style={styles.etiqueta}>DESCRIPCIÓN</Text>
          <Text style={[styles.descripcion, { color: tema.textoSecundario }]}>{producto.descripcion}</Text>

          <View style={[styles.aviso, { backgroundColor: modoOscuro ? '#2A2418' : '#FFF6E5' }]}>
            <IconoInfo color={modoOscuro ? '#E0C48A' : '#B07400'} />
            <Text style={[styles.avisoTexto, { color: modoOscuro ? '#E0C48A' : '#8A5A00' }]}>
              Precios informativos. Haz tu pedido directo en sucursal, por teléfono o WhatsApp.
            </Text>
          </View>

          {/* ── RELACIONADOS ── */}
          {relacionados.length > 0 && (
            <>
              <View style={styles.seccionHeader}>
                <Text style={[styles.seccionTitulo, { color: tema.texto }]}>TAMBIÉN TE PUEDE GUSTAR</Text>
                <View style={styles.lineaAmarilla} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relacionadosLista}
              >
                {relacionados.map((p) => (
                  <Pressable
                    key={p.id}
                    style={({ pressed }) => [
                      styles.miniCard,
                      { backgroundColor: tema.card },
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => navigation.push('ProductoDetalle', { id: p.id })}
                  >
                    <Image
                      source={{ uri: p.imagen }}
                      style={styles.miniImagen}
                      contentFit="cover"
                      transition={250}
                      cachePolicy="memory-disk"
                    />
                    <View style={styles.miniInfo}>
                      <Text style={[styles.miniNombre, { color: tema.texto }]} numberOfLines={1}>
                        {p.nombre}
                      </Text>
                      <Text style={[styles.miniPrecio, { color: tema.precio }]}>${p.precio}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* ── BOTONES FIJOS ABAJO ── */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: tema.header,
            paddingBottom: insets.bottom + 12,
            borderTopColor: bordeSuave,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.botonLlamar,
            { borderColor: modoOscuro ? '#3A3A3A' : '#E0E0E0' },
            pressed && { opacity: 0.7 },
          ]}
          onPress={llamar}
          accessibilityLabel="Llamar a la sucursal"
        >
          <IconoTelefono color={tema.texto} size={21} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.botonWhats, pressed && { opacity: 0.85 }]}
          onPress={preguntar}
          accessibilityLabel="Preguntar por WhatsApp"
        >
          <IconoChat color="#FFFFFF" size={20} />
          <Text style={styles.botonWhatsTexto}>Preguntar por WhatsApp</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },

  imagen: { width, height: width * 0.9 },
  degradadoSuperior: { position: 'absolute', top: 0, left: 0, right: 0 },
  barraSuperior: {
    position: 'absolute', left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  botonesDerecha: { flexDirection: 'row', gap: 10 },
  botonCircular: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },

  info: { marginTop: -28, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  etiquetasFila: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  chipCategoria: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  chipCategoriaTexto: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  badgeOferta: { backgroundColor: '#F5A623', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeOfertaTexto: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#1A1A1A' },

  nombre: { fontFamily: 'Poppins_700Bold', fontSize: 28, lineHeight: 34 },
  precioRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  precio: { fontFamily: 'Poppins_700Bold', fontSize: 32 },
  moneda: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  linea: { height: 1, marginVertical: 18 },

  etiqueta: { color: '#F5A623', fontFamily: 'Poppins_600SemiBold', fontSize: 10, letterSpacing: 1 },
  descripcion: { fontFamily: 'Poppins_400Regular', fontSize: 15, lineHeight: 23, marginTop: 4 },

  aviso: {
    flexDirection: 'row', gap: 10, borderRadius: 14,
    padding: 14, marginTop: 18, alignItems: 'center',
  },
  avisoTexto: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 17 },

  seccionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 12 },
  seccionTitulo: { fontFamily: 'Poppins_700Bold', fontSize: 12, letterSpacing: 1 },
  lineaAmarilla: { flex: 1, height: 2, backgroundColor: '#F5A623', marginLeft: 10, borderRadius: 2 },

  relacionadosLista: { gap: 12, paddingRight: 4, paddingBottom: 6 },
  miniCard: {
    width: 150, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  miniImagen: { width: 150, height: 100 },
  miniInfo: { padding: 10 },
  miniNombre: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  miniPrecio: { fontFamily: 'Poppins_700Bold', fontSize: 15, marginTop: 2 },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  botonLlamar: {
    width: 54, height: 54, borderRadius: 16, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  botonWhats: {
    flex: 1, flexDirection: 'row', gap: 8,
    backgroundColor: '#25D366', borderRadius: 16, height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  botonWhatsTexto: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 14 },

  noEncontrado: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, padding: 32 },
  noEncontradoTexto: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, textAlign: 'center' },
  volverTexto: { color: '#F5A623', fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginTop: 8 },
});