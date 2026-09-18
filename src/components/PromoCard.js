import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PromoCard({ promo }) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: promo.color }]}>
      <Text style={styles.titulo}>{promo.titulo}</Text>
      <Text style={styles.descripcion}>{promo.descripcion}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    minHeight: 90,
    justifyContent: 'flex-end',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  descripcion: {
    color: '#EEEEEE',
    fontSize: 11,
    lineHeight: 15,
  },
});