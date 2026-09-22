import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTema } from '../context/ThemeContext';
import { useFavoritos } from '../context/FavoritosContext';
import { useDatos } from '../context/DatosContext';

const trazo = (color) => ({
  stroke: color,
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
});

function IconoTodos({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" {...trazo(color)} />
    </Svg>
  );
}

function IconoFavoritos({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" {...trazo(color)} />
    </Svg>
  );
}

function IconoPaquetes({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M4 8l8-4 8 4v8l-8 4-8-4ZM4 8l8 4 8-4M12 12v8" {...trazo(color)} />
    </Svg>
  );
}

function IconoSnacks({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M4 11C4 7 7.6 5 12 5s8 2 8 6ZM3.5 14.5h17M5 17.5h14v.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" {...trazo(color)} />
    </Svg>
  );
}

function IconoBebidas({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M6 8h12l-1.3 12H7.3ZM5 8h14M12 8l2-5h3" {...trazo(color)} />
    </Svg>
  );
}

const categorias = [
  { nombre: 'Todos', Icono: IconoTodos },
  { nombre: 'Favoritos', Icono: IconoFavoritos },
  { nombre: 'Paquetes', Icono: IconoPaquetes },
  { nombre: 'Snacks', Icono: IconoSnacks },
  { nombre: 'Bebidas', Icono: IconoBebidas },
];

export default function FiltrosCategorias({ categoriaActiva, onSelect }) {
  const { tema, modoOscuro } = useTema();
  const { favoritos } = useFavoritos();
  const { productos } = useDatos();

  // Cuántos productos hay en cada categoría
  const contar = (nombre) => {
    if (nombre === 'Todos') return productos.length;
    if (nombre === 'Favoritos') {
      // Solo cuenta favoritos que sigan existiendo en el menú
      return productos.filter((p) => favoritos.includes(p.id)).length;
    }
    return productos.filter((p) => p.categoria === nombre).length;
  };

  const seleccionar = (nombre) => {
    if (nombre === categoriaActiva) return;
    Haptics.selectionAsync().catch(() => {});
    onSelect(nombre);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {categorias.map(({ nombre, Icono }) => {
        const activo = categoriaActiva === nombre;
        const colorTexto = activo ? '#1A1A1A' : tema.texto;
        const colorIcono = activo
          ? '#1A1A1A'
          : nombre === 'Favoritos' ? '#E74C3C' : '#F5A623';

        return (
          <Pressable
            key={nombre}
            onPress={() => seleccionar(nombre)}
            style={({ pressed }) => [
              styles.pill,
              activo
                ? styles.pillActivo
                : {
                    backgroundColor: tema.card,
                    borderColor: modoOscuro ? '#333333' : '#E8E8E8',
                  },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
          >
            <Icono color={colorIcono} />
            <Text style={[styles.texto, { color: colorTexto }]}>{nombre}</Text>
            <View
              style={[
                styles.contador,
                {
                  backgroundColor: activo
                    ? 'rgba(0,0,0,0.12)'
                    : modoOscuro ? '#333333' : '#F2F2F2',
                },
              ]}
            >
              <Text style={[styles.contadorTexto, { color: activo ? '#1A1A1A' : tema.textoSecundario }]}>
                {contar(nombre)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillActivo: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  texto: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  contador: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contadorTexto: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
  },
});