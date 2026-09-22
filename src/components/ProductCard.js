import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  Dimensions, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useTema } from '../context/ThemeContext';
import ImageBackground from './ImagenFondo';
import BotonFavorito from './BotonFavorito';
import VistaRapida from './VistaRapida';

const { width } = Dimensions.get('window');

function Flecha({ color = '#1A1A1A', size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function ProductCard({ producto, indice = 0 }) {
  const { tema } = useTema();
  const navigation = useNavigation();
  const [vistaRapida, setVistaRapida] = useState(false);

  // Presión: se encoge un poquito al tocar
  const escala = useRef(new Animated.Value(1)).current;

  // Entrada: aparece subiendo, una tarjeta tras otra
  const aparicion = useRef(new Animated.Value(0)).current;
  const desplazamiento = useRef(
    aparicion.interpolate({ inputRange: [0, 1], outputRange: [28, 0] })
  ).current;

  useEffect(() => {
    Animated.timing(aparicion, {
      toValue: 1,
      duration: 450,
      delay: Math.min(indice, 6) * 70, // escalonado, máximo 6 para no tardar de más
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const presionar = () =>
    Animated.spring(escala, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const soltar = () =>
    Animated.spring(escala, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();

  const abrirVistaRapida = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setVistaRapida(true);
  };

  const irADetalle = () => navigation.navigate('ProductoDetalle', { id: producto.id });

  // Etiqueta sobre la foto: para pizzas, su subcategoría (Clásicas / Del Mar)
  const etiquetaCategoria = producto.subcategoria
    ? `PIZZA ${producto.subcategoria.toUpperCase()}`
    : producto.categoria.toUpperCase();

  return (
    <>
      <Animated.View
        style={[
          styles.sombra,
          {
            opacity: aparicion,
            transform: [{ translateY: desplazamiento }, { scale: escala }],
          },
        ]}
      >
        <Pressable
          onPress={irADetalle}
          onLongPress={abrirVistaRapida}
          delayLongPress={450}
          onPressIn={presionar}
          onPressOut={soltar}
          style={[styles.card, { backgroundColor: tema.card }]}
          accessibilityRole="button"
          accessibilityLabel={`${producto.nombre}, ${producto.precioDesde ? 'desde ' : ''}$${producto.precio}. Ver detalle`}
          accessibilityHint="Mantén presionado para vista rápida"
        >
          {/* ── FOTO ── */}
          <ImageBackground source={{ uri: producto.imagen }} style={styles.imagen}>
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.8)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />

            {producto.oferta && (
              <View style={styles.badgeOferta}>
                <Text style={styles.badgeOfertaTexto}>🔥 ¡OFERTA!</Text>
              </View>
            )}

            <BotonFavorito id={producto.id} size={38} style={styles.favorito} />

            <View style={styles.textoImagen}>
              <Text style={styles.categoria}>{etiquetaCategoria}</Text>
              <Text style={styles.nombre} numberOfLines={1}>{producto.nombre}</Text>
            </View>
          </ImageBackground>

          {/* ── INFO ── */}
          <View style={styles.info}>
            <View style={styles.infoIzq}>
              <Text
                style={[styles.descripcion, { color: tema.textoSecundario }]}
                numberOfLines={2}
              >
                {producto.descripcion}
              </Text>
              <View style={styles.precioRow}>
                {producto.precioDesde && (
                  <Text style={[styles.desde, { color: tema.textoSecundario }]}>Desde</Text>
                )}
                <Text style={[styles.precio, { color: tema.precio }]}>${producto.precio}</Text>
                <Text style={[styles.moneda, { color: tema.textoSoloInfo }]}>MXN</Text>
              </View>
            </View>

            <View style={styles.botonFlecha}>
              <Flecha />
            </View>
          </View>
        </Pressable>
      </Animated.View>

      <VistaRapida
        producto={producto}
        visible={vistaRapida}
        onCerrar={() => setVistaRapida(false)}
        onVerDetalle={irADetalle}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sombra: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  imagen: {
    height: width * 0.52,
    justifyContent: 'flex-end',
  },
  badgeOferta: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F5A623',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOfertaTexto: {
    color: '#1A1A1A',
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  favorito: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  textoImagen: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoria: {
    color: '#F5A623',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
  },
  nombre: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 21,
    lineHeight: 27,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  infoIzq: {
    flex: 1,
  },
  descripcion: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  precioRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    flexWrap: 'wrap',
  },
  desde: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },
  precio: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 26,
  },
  moneda: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
  },
  botonFlecha: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
});