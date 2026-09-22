import { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, Pressable, Animated,
  Share, Linking, Alert, useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useTema } from '../context/ThemeContext';
import { useDatos } from '../context/DatosContext';
import ImageBackground from './ImagenFondo';
import BotonFavorito from './BotonFavorito';
import { IconoChat } from './IconosUI';

function IconoCompartir({ color, size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function VistaRapida({ producto, visible, onCerrar, onVerDetalle }) {
  const { tema, modoOscuro } = useTema();
  const { sucursal } = useDatos();
  const { width } = useWindowDimensions();
  const anchoTarjeta = width - 40;

  const escala = useRef(new Animated.Value(0.85)).current;
  const opacidad = useRef(new Animated.Value(0)).current;

  const textoPrecio = `${producto.precioDesde ? 'desde ' : ''}$${producto.precio}`;

  // Animación de apertura: crece con resorte y aparece el fondo difuminado
  useEffect(() => {
    if (!visible) return;
    escala.setValue(0.85);
    opacidad.setValue(0);
    Animated.parallel([
      Animated.spring(escala, { toValue: 1, damping: 14, stiffness: 180, useNativeDriver: true }),
      Animated.timing(opacidad, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  // Animación de cierre; "despues" se ejecuta cuando termina (ej. navegar)
  const cerrar = (despues) => {
    Animated.parallel([
      Animated.timing(escala, { toValue: 0.9, duration: 150, useNativeDriver: true }),
      Animated.timing(opacidad, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      onCerrar();
      if (despues) despues();
    });
  };

  const compartir = () => {
    Share.share({
      message: `🍕 ${producto.nombre} en Pizzeto's ${textoPrecio}\n${producto.descripcion}\n\nPide al ${sucursal.telefonoFormato}`,
    }).catch(() => {});
  };

  const whatsapp = async () => {
    const mensaje = `¡Hola Pizzeto's! Quiero información sobre "${producto.nombre}" (${textoPrecio}) 🍕`;
    try {
      await Linking.openURL(`https://wa.me/${sucursal.whatsapp}?text=${encodeURIComponent(mensaje)}`);
    } catch {
      Alert.alert('Ups', 'No se pudo abrir WhatsApp.');
    }
  };

  const fondoBotonSecundario = modoOscuro ? '#333333' : '#F0F0F0';

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={() => cerrar()}>
      {/* Fondo difuminado: tocarlo cierra */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacidad }]}>
        <BlurView intensity={40} tint={modoOscuro ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => cerrar()} accessibilityLabel="Cerrar vista rápida" />
      </Animated.View>

      <View style={styles.centro} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.tarjeta,
            {
              width: anchoTarjeta,
              backgroundColor: tema.card,
              opacity: opacidad,
              transform: [{ scale: escala }],
            },
          ]}
        >
          {/* Foto grande */}
          <ImageBackground
            source={{ uri: producto.imagen }}
            style={[styles.imagen, { height: anchoTarjeta * 0.78 }]}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.85)']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
            <BotonFavorito id={producto.id} size={40} style={styles.favorito} />
            {producto.oferta && (
              <View style={styles.badgeOferta}>
                <Text style={styles.badgeOfertaTexto}>🔥 ¡OFERTA!</Text>
              </View>
            )}
            <View style={styles.textoImagen}>
              <Text style={styles.categoria}>
                {producto.subcategoria
                  ? `PIZZA ${producto.subcategoria.toUpperCase()}`
                  : producto.categoria.toUpperCase()}
              </Text>
              <Text style={styles.nombre}>{producto.nombre}</Text>
            </View>
          </ImageBackground>

          {/* Info */}
          <View style={styles.cuerpo}>
            <Text style={[styles.descripcion, { color: tema.textoSecundario }]}>
              {producto.descripcion}
            </Text>
            <View style={styles.precioRow}>
              {producto.precioDesde && (
                <Text style={[styles.desde, { color: tema.textoSecundario }]}>Desde</Text>
              )}
              <Text style={[styles.precio, { color: tema.precio }]}>${producto.precio}</Text>
              <Text style={[styles.moneda, { color: tema.textoSoloInfo }]}>MXN</Text>
            </View>

            {/* Acciones rápidas */}
            <View style={styles.acciones}>
              <Pressable
                style={({ pressed }) => [styles.botonPrincipal, pressed && { opacity: 0.85 }]}
                onPress={() => cerrar(onVerDetalle)}
              >
                <Text style={styles.botonPrincipalTexto}>Ver detalle</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botonCirculo, { backgroundColor: '#25D366' }, pressed && { opacity: 0.8 }]}
                onPress={whatsapp}
                accessibilityLabel="Preguntar por WhatsApp"
              >
                <IconoChat color="#FFFFFF" size={21} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botonCirculo, { backgroundColor: fondoBotonSecundario }, pressed && { opacity: 0.8 }]}
                onPress={compartir}
                accessibilityLabel="Compartir"
              >
                <IconoCompartir color={tema.texto} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjeta: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
  },
  imagen: {
    justifyContent: 'flex-end',
  },
  favorito: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  badgeOferta: {
    position: 'absolute',
    top: 16,
    left: 14,
    backgroundColor: '#F5A623',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOfertaTexto: {
    color: '#1A1A1A',
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
  },
  textoImagen: {
    padding: 18,
  },
  categoria: {
    color: '#F5A623',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 2,
  },
  nombre: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    lineHeight: 34,
  },
  cuerpo: {
    padding: 18,
  },
  descripcion: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  precioRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  desde: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  precio: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
  },
  moneda: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  botonPrincipal: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonPrincipalTexto: {
    color: '#1A1A1A',
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  botonCirculo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});