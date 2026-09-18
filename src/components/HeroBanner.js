import { View, Text, StyleSheet, ImageBackground } from 'react-native';

export default function HeroBanner() {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800' }}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <View style={styles.overlay} />
      <Text style={styles.marca}>PIZZETO'S</Text>
      <Text style={styles.titulo}>Elige tu Hambre</Text>
      <Text style={styles.subtitulo}>SELECCIONA LA EXPERIENCIA IDEAL</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
  },
  marca: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 4,
  },
  titulo: {
    color: '#F5A623',
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  subtitulo: {
    color: '#CCCCCC',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },
});