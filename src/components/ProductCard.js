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

// Curva tipo Apple: arranca rápido y frena muy suave al final
const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);

// Máxima inclinación 3D al presionar (grados)
const INCLINACION = 3.5;

// Tiempo para abrir la Vista Rápida al mantener presionado (ms)
const TIEMPO_VISTA_RAPIDA = 450;

// Espera antes de abrir el detalle, para que la animación de la flecha se vea completa (ms)
const ESPERA_NAVEGAR = 140;

// Solo las primeras tarjetas hacen animación de entrada (las demás ni se ven al abrir)
const MAX_ANIMADAS = 6;

// Margen lateral de la tarjeta (igual que styles.sombra.marginHorizontal)
const MARGEN = 16;

const limitar = (n) => Math.max(-1, Math.min(1, n));

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

// Crea todos los valores animados una sola vez por tarjeta
function crearAnimaciones(animarEntrada) {
  const inicio = animarEntrada ? 0 : 1;
  const aparicion = new Animated.Value(inicio); // entrada de la tarjeta
  const revelado = new Animated.Value(inicio);  // la foto se asienta y el texto aparece
  const presion = new Animated.Value(0);        // 0 = suelta, 1 = presionada
  const inclinacion = new Animated.Value(0);    // -1 izquierda … 1 derecha
  const progreso = new Animated.Value(0);       // barra de "mantén presionado"
  const brillo = new Animated.Value(0);         // destello que cruza la foto
  const flecha = new Animated.Value(0);         // cambio de flecha al abrir el detalle

  return {
    aparicion, revelado, presion, inclinacion, progreso, brillo, flecha,

    // Tarjeta: sube, crece un poco al entrar y se hunde al presionar
    entradaY: aparicion.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }),
    escalaTotal: Animated.multiply(
      aparicion.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }),
      presion.interpolate({ inputRange: [0, 1], outputRange: [1, 0.965] })
    ),
    rotY: inclinacion.interpolate({
      inputRange: [-1, 1],
      outputRange: [`-${INCLINACION}deg`, `${INCLINACION}deg`],
    }),

    // Aro naranja brillante al presionar (mucho más ligero que una sombra)
    aro: presion.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),

    // Foto: entra con zoom y se asienta; al presionar hace zoom suave
    zoomFoto: Animated.multiply(
      revelado.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] }),
      presion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07], extrapolate: 'clamp' })
    ),

    // Texto sobre la foto: aparece un poco después, subiendo
    textoOpacidad: revelado.interpolate({ inputRange: [0, 0.3, 0.75], outputRange: [0, 0, 1] }),
    textoY: revelado.interpolate({ inputRange: [0, 0.3, 0.9], outputRange: [18, 18, 0] }),

    // Destello diagonal
    brilloX: brillo.interpolate({ inputRange: [0, 1], outputRange: [-160, width + 60] }),

    // Flecha: la actual sale por la derecha y entra otra por la izquierda (siempre completa)
    flecha1X: flecha.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }),
    flecha1Op: flecha.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }),
    flecha2X: flecha.interpolate({ inputRange: [0, 1], outputRange: [-28, 0] }),
    flecha2Op: flecha.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    escalaBoton: presion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12], extrapolate: 'clamp' }),

    // Barra de progreso de la Vista Rápida
    progresoOp: progreso.interpolate({ inputRange: [0, 0.04, 1], outputRange: [0, 1, 1] }),
  };
}

export default function ProductCard({ producto, indice = 0 }) {
  const { tema } = useTema();
  const navigation = useNavigation();
  const [vistaRapida, setVistaRapida] = useState(false);

  // Candado para que dos toques rápidos no abran el detalle dos veces
  const navegando = useRef(false);
  const temporizador = useRef(null);

  const animarEntrada = indice < MAX_ANIMADAS;
  const anim = useRef(null);
  if (!anim.current) anim.current = crearAnimaciones(animarEntrada);
  const a = anim.current;

  // ── Entrada escalonada (solo las primeras tarjetas) ──
  useEffect(() => {
    if (animarEntrada) {
      const retraso = indice * 80;

      Animated.parallel([
        Animated.timing(a.aparicion, {
          toValue: 1,
          duration: 700,
          delay: retraso,
          easing: SUAVE,
          useNativeDriver: true,
        }),
        Animated.timing(a.revelado, {
          toValue: 1,
          duration: 1000,
          delay: retraso,
          easing: SUAVE,
          useNativeDriver: true,
        }),
        Animated.timing(a.brillo, {
          toValue: 1,
          duration: 900,
          delay: retraso + 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => clearTimeout(temporizador.current);
  }, []);

  // ── Presionar: hundir, inclinar hacia el dedo, aro naranja, barra de progreso ──
  const presionar = (e) => {
    // Inclinación calculada al instante con la posición horizontal del dedo
    const nx = limitar(((e.nativeEvent.pageX - MARGEN) / (width - MARGEN * 2)) * 2 - 1);

    a.progreso.setValue(0);
    Animated.parallel([
      Animated.spring(a.presion, { toValue: 1, speed: 50, bounciness: 0, useNativeDriver: true }),
      Animated.spring(a.inclinacion, { toValue: nx, speed: 40, bounciness: 2, useNativeDriver: true }),
      Animated.timing(a.progreso, {
        toValue: 1,
        duration: TIEMPO_VISTA_RAPIDA,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ── Soltar: todo regresa con rebote elástico ──
  const soltar = () => {
    Animated.parallel([
      Animated.spring(a.presion, { toValue: 0, speed: 16, bounciness: 10, useNativeDriver: true }),
      Animated.spring(a.inclinacion, { toValue: 0, speed: 16, bounciness: 9, useNativeDriver: true }),
      Animated.timing(a.progreso, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const abrirVistaRapida = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setVistaRapida(true);
  };

  // ── Tocar: primero la animación de la flecha, y un instante después el detalle ──
  const irADetalle = () => {
    if (navegando.current) return;
    navegando.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    a.flecha.setValue(0);
    Animated.timing(a.flecha, {
      toValue: 1,
      duration: 260,
      easing: SUAVE,
      useNativeDriver: true,
    }).start();

    // Se abre el detalle cuando la animación ya arrancó y se ve fluida
    temporizador.current = setTimeout(() => {
      navigation.navigate('ProductoDetalle', { id: producto.id });

      // Ya tapada por el detalle, la flecha y el candado quedan listos para la próxima vez
      temporizador.current = setTimeout(() => {
        a.flecha.setValue(0);
        navegando.current = false;
      }, 600);
    }, ESPERA_NAVEGAR);
  };

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
            backgroundColor: tema.card, // con fondo, iOS dibuja la sombra mucho más rápido
            opacity: a.aparicion,
            transform: [
              { perspective: 1000 },
              { translateY: a.entradaY },
              { scale: a.escalaTotal },
              { rotateY: a.rotY },
            ],
          },
        ]}
      >
        <Pressable
          onPress={irADetalle}
          onLongPress={abrirVistaRapida}
          delayLongPress={TIEMPO_VISTA_RAPIDA}
          onPressIn={presionar}
          onPressOut={soltar}
          style={[styles.card, { backgroundColor: tema.card }]}
          accessibilityRole="button"
          accessibilityLabel={`${producto.nombre}, ${producto.precioDesde ? 'desde ' : ''}$${producto.precio}. Ver detalle`}
          accessibilityHint="Mantén presionado para vista rápida"
        >
          {/* ── FOTO ── */}
          <View style={styles.imagen}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: a.zoomFoto }] }]}>
              <ImageBackground source={{ uri: producto.imagen }} style={StyleSheet.absoluteFill} />
            </Animated.View>

            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.8)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            {/* Destello de luz diagonal (solo al entrar) */}
            {animarEntrada && (
              <Animated.View
                pointerEvents="none"
                style={[styles.destello, { transform: [{ translateX: a.brilloX }, { rotate: '18deg' }] }]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.24)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            )}

            {producto.oferta && (
              <View style={styles.badgeOferta}>
                <Text style={styles.badgeOfertaTexto}>🔥 ¡OFERTA!</Text>
              </View>
            )}

            <BotonFavorito id={producto.id} size={38} style={styles.favorito} />

            <Animated.View
              style={[
                styles.textoImagen,
                { opacity: a.textoOpacidad, transform: [{ translateY: a.textoY }] },
              ]}
            >
              <Text style={styles.categoria}>{etiquetaCategoria}</Text>
              <Text style={styles.nombre} numberOfLines={1}>{producto.nombre}</Text>
            </Animated.View>
          </View>

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

            <Animated.View style={[styles.botonFlecha, { transform: [{ scale: a.escalaBoton }] }]}>
              <Animated.View
                style={[styles.flechaCapa, { opacity: a.flecha1Op, transform: [{ translateX: a.flecha1X }] }]}
              >
                <Flecha />
              </Animated.View>
              <Animated.View
                style={[styles.flechaCapa, { opacity: a.flecha2Op, transform: [{ translateX: a.flecha2X }] }]}
              >
                <Flecha />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Barra de "mantén presionado" */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.barraProgreso,
              { opacity: a.progresoOp, transform: [{ scaleX: a.progreso }] },
            ]}
          />
        </Pressable>

        {/* Aro naranja brillante encima de la orilla */}
        <Animated.View pointerEvents="none" style={[styles.aro, { opacity: a.aro }]} />
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
    marginHorizontal: MARGEN,
    marginBottom: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  aro: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F5A623',
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  imagen: {
    height: width * 0.52,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  destello: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    left: 0,
    width: 90,
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
    overflow: 'hidden',
  },
  flechaCapa: {
    position: 'absolute',
    top: 13,
    left: 13,
  },
  barraProgreso: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: '#F5A623',
    transformOrigin: 'left',
  },
});