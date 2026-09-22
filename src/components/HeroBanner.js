import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet,
  FlatList, Pressable, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDatos } from '../context/DatosContext';
import ImageBackground from './ImagenFondo';

const INTERVALO = 4500;

export default function HeroBanner() {
  const navigation = useNavigation();
  const { productos } = useDatos();
  const { width } = useWindowDimensions();
  const anchoSlide = width - 32;

  // Busca productos por nombre para que el banner siempre abra el producto correcto
  const buscar = (nombre) => productos.find((p) => p.nombre === nombre);
  const promoMagno = buscar('Promo Magno');
  const delMar = buscar('Pizza Del Mar');
  const hawaiana = buscar('Hawaiana');

  const slides = [
    {
      id: 'tamanos',
      etiqueta: "PIZZETO'S",
      titulo: 'Elige tu Hambre',
      subtitulo: 'Chica, Mediana, Grande o Familiar · desde $190',
      imagen: hawaiana?.imagen ?? 'https://pizzetos.com.mx/img/hawaina.webp',
      producto: hawaiana,
    },
    {
      id: 'magno',
      etiqueta: 'PAQUETE',
      titulo: 'Promo Magno',
      subtitulo: promoMagno
        ? `${promoMagno.descripcion} · $${promoMagno.precio}`
        : '1 Pizza Familiar + 1 Refresco Jarrito',
      imagen: promoMagno?.imagen ?? 'https://pizzetos.com.mx/img/promo%20magno..webp',
      producto: promoMagno,
    },
    {
      id: 'mar',
      etiqueta: 'DEL MAR',
      titulo: 'Especialidades del Mar',
      subtitulo: 'Camarón y Pizza Del Mar',
      imagen: delMar?.imagen ?? 'https://pizzetos.com.mx/img/del%20mar..webp',
      producto: delMar,
    },
  ];

  const listaRef = useRef(null);
  const indiceRef = useRef(0);
  const timerRef = useRef(null);
  const [activo, setActivo] = useState(0);

  const detenerAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const iniciarAuto = () => {
    detenerAuto();
    timerRef.current = setInterval(() => {
      const siguiente = (indiceRef.current + 1) % slides.length;
      listaRef.current?.scrollToOffset({ offset: siguiente * anchoSlide, animated: true });
      indiceRef.current = siguiente;
      setActivo(siguiente);
    }, INTERVALO);
  };

  useEffect(() => {
    iniciarAuto();
    return detenerAuto;
  }, [anchoSlide]);

  const alTerminarScroll = (e) => {
    const indice = Math.round(e.nativeEvent.contentOffset.x / anchoSlide);
    indiceRef.current = indice;
    setActivo(indice);
    iniciarAuto();
  };

  const abrir = (slide) => {
    if (!slide.producto) return;
    navigation.navigate('ProductoDetalle', { id: slide.producto.id });
  };

  return (
    <View style={[styles.contenedor, { width: anchoSlide }]}>
      <FlatList
        ref={listaRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={detenerAuto}
        onMomentumScrollEnd={alTerminarScroll}
        getItemLayout={(_, index) => ({ length: anchoSlide, offset: anchoSlide * index, index })}
        renderItem={({ item }) => (
          <Pressable onPress={() => abrir(item)} disabled={!item.producto}>
            <ImageBackground
              source={{ uri: item.imagen }}
              style={[styles.slide, { width: anchoSlide }]}
            >
              {/* Degradado: transparente arriba, oscuro abajo donde va el texto */}
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.88)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.contenido}>
                <View style={styles.etiqueta}>
                  <Text style={styles.etiquetaTexto}>{item.etiqueta}</Text>
                </View>
                <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
                <View style={styles.filaInferior}>
                  <Text style={styles.subtitulo} numberOfLines={1}>{item.subtitulo}</Text>
                  {item.producto && <Text style={styles.verMas}>Ver más ›</Text>}
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
      />

      {/* Puntitos arriba a la derecha, lejos del texto */}
      <View style={styles.puntos} pointerEvents="none">
        {slides.map((s, i) => (
          <View key={s.id} style={[styles.punto, i === activo && styles.puntoActivo]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 210,
    marginTop: 12,
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },
  slide: {
    height: 210,
    justifyContent: 'flex-end',
  },
  contenido: {
    padding: 16,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5A623',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  etiquetaTexto: {
    color: '#1A1A1A',
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  filaInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  subtitulo: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  verMas: {
    color: '#F5A623',
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  puntos: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  puntoActivo: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
});