import {
  View, Text, StyleSheet,
  TouchableOpacity, ImageBackground, Dimensions,
} from 'react-native';
import { useTema } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProductCard({ producto }) {
  const { tema } = useTema();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tema.card }]}
      activeOpacity={0.92}
    >
      {/* Imagen con overlays */}
      <ImageBackground
        source={{ uri: producto.imagen }}
        style={styles.imagen}
        imageStyle={styles.imagenStyle}
      >
        {/* Gradiente oscuro inferior */}
        <View style={styles.gradienteInferior} />

        {/* Badge oferta — esquina superior izquierda */}
        {producto.oferta && (
          <View style={styles.badgeOferta}>
            <Text style={styles.badgeOfertaTexto}>¡OFERTA!</Text>
          </View>
        )}

        {/* Badge categoría — esquina superior derecha */}
        <View style={styles.badgeCategoria}>
          <Text style={styles.badgeCategoriaTexto}>
            {producto.categoria.toUpperCase()}
          </Text>
        </View>

        {/* Nombre sobre la imagen */}
        <Text style={styles.nombreImagen}>
          {producto.nombre.toUpperCase()}
        </Text>
      </ImageBackground>

      {/* Info inferior */}
      <View style={[styles.info, { backgroundColor: tema.card }]}>
        <Text
          style={[styles.descripcion, { color: tema.textoSecundario }]}
          numberOfLines={2}
        >
          {producto.descripcion}
        </Text>

        <View style={styles.precioRow}>
          <View>
            <Text style={[styles.precio, { color: tema.precio }]}>
              ${producto.precio}
            </Text>
            {producto.oferta && (
              <View style={styles.ofertaTag}>
                <Text style={styles.ofertaTagTexto}>Precio especial</Text>
              </View>
            )}
          </View>
          <Text style={[styles.soloInfo, { color: tema.textoSoloInfo }]}>
            SOLO INFORMATIVO
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    // Sombra estilo Rappi
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  imagen: {
    height: width * 0.5,
    justifyContent: 'flex-end',
  },
  imagenStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gradienteInferior: {
    ...StyleSheet.absoluteFillObject,
    // Simulamos gradiente con dos capas
    backgroundColor: 'transparent',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  // Overlay solo en la mitad inferior
  nombreImagen: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    marginHorizontal: 12,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badgeOferta: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#F5A623',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeOfertaTexto: {
    color: '#000000',
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  badgeCategoria: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeCategoriaTexto: {
    color: '#000000',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  info: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  descripcion: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  precioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  precio: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 26,
  },
  ofertaTag: {
    backgroundColor: '#FFF3DC',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  ofertaTagTexto: {
    color: '#E8940A',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
  },
  soloInfo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
});