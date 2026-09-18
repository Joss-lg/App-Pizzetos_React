import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/ThemeContext';

const categorias = ['Todos', 'Paquetes', 'Snacks', 'Bebidas'];

export default function FiltrosCategorias({ categoriaActiva, onSelect }) {
  const { tema } = useTema();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {categorias.map((cat) => {
        const activo = categoriaActiva === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.pill,
              {
                backgroundColor: activo ? tema.pillActivoBg : tema.pill,
                borderColor: activo ? tema.pillActivoBorde : tema.pillBorde,
              },
            ]}
            onPress={() => onSelect(cat)}
          >
            <Text
              style={[
                styles.texto,
                { color: activo ? tema.pillActivoTexto : tema.pillTexto },
              ]}
            >
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  texto: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});