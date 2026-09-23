// src/components/TarjetaTamano.js
// Tarjeta de un tamaño de pizza (Chica, Mediana, Grande, Familiar)
// con una pizza realista que crece según el tamaño.
// Al tocarla: la tarjeta se hunde, la pizza da un brinquito y media vuelta.

import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTema } from '../context/ThemeContext';
import PizzaRealista from './PizzaRealista';

const LADO_MIN = 34; // Chica
const PASO = 8; // cuánto crece por cada tamaño
const ALTO_CAJA = 66; // caja fija para que los textos queden alineados

export default function TarjetaTamano({ tamano, nivel = 0 }) {
  const { tema, modoOscuro } = useTema();
  const presion = useRef(new Animated.Value(1)).current;
  const brinco = useRef(new Animated.Value(0)).current;
  const vuelta = useRef(new Animated.Value(0)).current;
  const vueltas = useRef(0);

  const lado = LADO_MIN + nivel * PASO;

  const alPresionar = () => {
    Animated.spring(presion, { toValue: 0.95, friction: 6, tension: 200, useNativeDriver: true }).start();
  };
  const alSoltar = () => {
    Animated.spring(presion, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }).start();
  };

  const alTocar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    vueltas.current += 1;
    Animated.parallel([
      Animated.sequence([
        Animated.timing(brinco, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(brinco, { toValue: 0, friction: 4, tension: 120, useNativeDriver: true }),
      ]),
      Animated.timing(vuelta, {
        toValue: vueltas.current,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const subir = brinco.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const girar = vuelta.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const sombraEscala = brinco.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] });

  return (
    <Pressable
      onPressIn={alPresionar}
      onPressOut={alSoltar}
      onPress={alTocar}
      accessibilityRole="button"
      accessibilityLabel={`${tamano.nombre}, ${tamano.rebanadas} rebanadas, ${tamano.precio} pesos`}
    >
      <Animated.View
        style={[
          styles.tarjeta,
          { backgroundColor: tema.card, transform: [{ scale: presion }] },
        ]}
      >
        <View style={styles.caja}>
          {/* Sombrita bajo la pizza (no gira) */}
          <Animated.View
            style={[
              styles.sombra,
              {
                width: lado * 0.8,
                backgroundColor: modoOscuro ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)',
                transform: [{ scaleX: sombraEscala }],
              },
            ]}
          />
          <Animated.View style={{ transform: [{ translateY: subir }, { rotate: girar }] }}>
            <PizzaRealista
              size={lado}
              rebanadas={tamano.rebanadas}
              nivel={nivel}
              clave={`tam${nivel}`}
              retraso={nivel * 90}
            />
          </Animated.View>
        </View>

        <Text style={[styles.nombre, { color: tema.texto }]}>{tamano.nombre}</Text>
        <Text style={[styles.rebanadas, { color: tema.textoSecundario }]}>
          {tamano.rebanadas} rebanadas
        </Text>
        <Text style={[styles.precio, { color: tema.precio }]}>${tamano.precio}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    width: 104,
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  caja: {
    height: ALTO_CAJA,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sombra: {
    position: 'absolute',
    bottom: 0,
    height: 5,
    borderRadius: 3,
  },
  nombre: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  rebanadas: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
  },
  precio: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    marginTop: 4,
  },
});