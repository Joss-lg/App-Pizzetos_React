import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView, isLiquidGlassAvailable, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTema } from '../context/ThemeContext';
import {
  IconoInicio, IconoPromos, IconoSucursales, IconoNotificaciones,
} from './IconosTab';

const ICONOS = {
  Inicio: IconoInicio,
  Promos: IconoPromos,
  Sucursales: IconoSucursales,
  Notificaciones: IconoNotificaciones,
};

const ETIQUETAS = {
  Inicio: 'Inicio',
  Promos: 'Promos',
  Sucursales: 'Sucursal',
  Notificaciones: 'Avisos',
};

const ES_ANDROID = Platform.OS === 'android';

const TIENE_LIQUID_GLASS =
  Platform.OS === 'ios' && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

const PADDING = 6;

// Colores del fondo sólido que se usa en Android
const FONDO_ANDROID_CLARO = 'rgba(255,255,255,0.96)';
const FONDO_ANDROID_OSCURO = 'rgba(32,32,32,0.96)';

// iPhone modo claro: Liquid Glass real.
// iPhone modo oscuro: vidrio esmerilado que no apaga los colores.
// Android: fondo sólido casi opaco (el difuminado de Android no es confiable
// y en modo claro hacía que la barra desapareciera).
function FondoVidrio({ modoOscuro, style, children }) {
  if (ES_ANDROID) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: modoOscuro ? FONDO_ANDROID_OSCURO : FONDO_ANDROID_CLARO,
            borderWidth: 1,
            borderColor: modoOscuro ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
          },
        ]}
      >
        {children}
      </View>
    );
  }

  if (TIENE_LIQUID_GLASS && !modoOscuro) {
    return (
      <GlassView
        style={style}
        glassEffectStyle="regular"
        tintColor="rgba(255,255,255,0.12)"
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      intensity={modoOscuro ? 50 : 45}
      tint={modoOscuro ? 'dark' : 'light'}
      style={[
        style,
        modoOscuro
          ? {
              backgroundColor: 'rgba(40,40,40,0.55)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
            }
          : { backgroundColor: 'rgba(255,255,255,0.35)' },
      ]}
    >
      {children}
    </BlurView>
  );
}

// Cápsula que se desliza: cristalina en modo claro, naranja más sólido en modo oscuro
function Indicador({ modoOscuro }) {
  return (
    <View
      style={[
        styles.indicadorRelleno,
        styles.indicadorVidrio,
        // En Android el fondo es blanco sólido: la cápsula necesita más color para verse
        ES_ANDROID && !modoOscuro && {
          backgroundColor: 'rgba(245,166,35,0.45)',
          borderColor: 'rgba(245,166,35,0.35)',
        },
        modoOscuro && {
          backgroundColor: 'rgba(245,166,35,0.9)',
          borderColor: 'rgba(255,255,255,0.25)',
        },
      ]}
    >
      <View
        style={[
          styles.brillo,
          modoOscuro && { backgroundColor: 'rgba(255,255,255,0.14)' },
        ]}
      />
    </View>
  );
}

export default function TabBarPizzetos({ state, descriptors, navigation }) {
  const { modoOscuro } = useTema();
  const insets = useSafeAreaInsets();
  const [anchoItem, setAnchoItem] = useState(0);

  // Valores animados que NO se recrean nunca
  const posicionX = useRef(new Animated.Value(0)).current;
  const escalaX = useRef(new Animated.Value(1)).current;
  const escalaY = useRef(new Animated.Value(1)).current;
  const indiceAnimado = useRef(state.index);

  const total = state.routes.length;

  const animarA = (indice) => {
    if (!anchoItem) return;
    indiceAnimado.current = indice;

    // Detiene cualquier animación anterior para que no se encimen
    posicionX.stopAnimation();
    escalaX.stopAnimation();
    escalaY.stopAnimation();

    Animated.parallel([
      // Deslizamiento con resorte
      Animated.spring(posicionX, {
        toValue: indice * anchoItem,
        damping: 16,
        stiffness: 160,
        mass: 1,
        useNativeDriver: false,
      }),
      // Se estira mientras viaja y regresa con rebote
      Animated.sequence([
        Animated.parallel([
          Animated.timing(escalaX, { toValue: 1.25, duration: 150, useNativeDriver: false }),
          Animated.timing(escalaY, { toValue: 0.88, duration: 150, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.spring(escalaX, { toValue: 1, damping: 8, stiffness: 170, useNativeDriver: false }),
          Animated.spring(escalaY, { toValue: 1, damping: 8, stiffness: 170, useNativeDriver: false }),
        ]),
      ]),
    ]).start();
  };

  // Al medir la barra por primera vez, coloca la cápsula sin animar
  useEffect(() => {
    if (anchoItem) posicionX.setValue(state.index * anchoItem);
  }, [anchoItem]);

  // Si la pestaña cambia desde otro lado (botón Sucursal, notificaciones, etc.)
  useEffect(() => {
    if (state.index !== indiceAnimado.current) animarA(state.index);
  }, [state.index, anchoItem]);

  // Contraste para que se lea sobre las fotos
  const colorInactivo = modoOscuro ? '#D6D6D6' : '#3A3A3A';
  // Halo detrás del texto: claro en modo claro, oscuro en modo oscuro
  // (en Android el fondo ya es sólido, no hace falta halo)
  const colorHalo = ES_ANDROID
    ? 'transparent'
    : modoOscuro ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: Math.max(insets.bottom - 6, 10) }]}
    >
      <View
        style={[
          styles.sombra,
          modoOscuro && styles.sombraOscura,
          // En Android la sombra (elevation) solo se dibuja si el elemento tiene fondo
          ES_ANDROID && {
            backgroundColor: modoOscuro ? FONDO_ANDROID_OSCURO : FONDO_ANDROID_CLARO,
            elevation: 8,
          },
        ]}
        onLayout={(e) => {
          const ancho = e.nativeEvent.layout.width;
          setAnchoItem((ancho - PADDING * 2) / total);
        }}
      >
        <FondoVidrio modoOscuro={modoOscuro} style={styles.barra}>
          {anchoItem > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicador,
                {
                  width: anchoItem,
                  transform: [
                    { translateX: posicionX },
                    { scaleX: escalaX },
                    { scaleY: escalaY },
                  ],
                },
              ]}
            >
              <Indicador modoOscuro={modoOscuro} />
            </Animated.View>
          )}

          {state.routes.map((route, index) => {
            const enfocado = state.index === index;
            const { options } = descriptors[route.key];
            const Icono = ICONOS[route.name];
            const badge = options.tabBarBadge;
            const color = enfocado ? '#1A1A1A' : colorInactivo;

            const alPresionar = () => {
              const evento = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!enfocado && !evento.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                animarA(index); // la animación arranca al instante del toque
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={alPresionar}
                style={styles.item}
                accessibilityRole="button"
                accessibilityState={enfocado ? { selected: true } : {}}
                accessibilityLabel={ETIQUETAS[route.name]}
              >
                <View>
                  <Icono color={color} activo={enfocado} />
                  {badge !== undefined && !enfocado && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeTexto}>{badge}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.etiqueta,
                    {
                      color,
                      fontFamily: enfocado ? 'Poppins_700Bold' : 'Poppins_600SemiBold',
                      // Sin halo en la pestaña activa: sobre el naranja no hace falta
                      textShadowColor: enfocado ? 'transparent' : colorHalo,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {ETIQUETAS[route.name]}
                </Text>
              </Pressable>
            );
          })}
        </FondoVidrio>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  sombra: {
    borderRadius: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  sombraOscura: {
    // En oscuro la sombra negra casi no se ve; se refuerza para dar profundidad
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },
  barra: {
    flexDirection: 'row',
    borderRadius: 34,
    overflow: 'hidden',
    padding: PADDING,
  },
  indicador: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
  },
  indicadorRelleno: {
    flex: 1,
    borderRadius: 28,
  },
  indicadorVidrio: {
    backgroundColor: 'rgba(245,166,35,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  brillo: {
    position: 'absolute',
    top: 2,
    left: 10,
    right: 10,
    height: '42%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    gap: 2,
  },
  etiqueta: {
    fontSize: 10,
    letterSpacing: 0.2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTexto: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    lineHeight: 12,
  },
});