import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, TouchableOpacity, Switch, TextInput,
} from 'react-native';
import { productos, promociones } from '../data/pizzas';
import { useTema } from '../context/ThemeContext';
import HeroBanner from '../components/HeroBanner';
import PromoCard from '../components/PromoCard';
import FiltrosCategorias from '../components/FiltrosCategorias';
import ProductCard from '../components/ProductCard';

export default function HomeScreen() {
  const { tema, modoOscuro, toggleTema } = useTema();
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const productosFiltrados = useMemo(() => {
    let lista = categoriaActiva === 'Todos'
      ? productos
      : productos.filter((p) => p.categoria === categoriaActiva);

    if (busqueda.trim()) {
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    return lista;
  }, [categoriaActiva, busqueda]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tema.fondo }]}>
      <ScrollView
        style={{ backgroundColor: tema.fondo }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
      >

        {/* ── HEADER ── */}
        <View style={[styles.header, { backgroundColor: tema.header }]}>
          <View style={styles.headerIzq}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetra}>P's</Text>
            </View>
            <View>
              <Text style={[styles.headerMarca, { color: tema.marcaTexto }]}>
                PIZZETO'S
              </Text>
              <Text style={styles.headerSlogan}>LA PIZZA DE TU VIDA</Text>
            </View>
          </View>

          <View style={styles.headerDer}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleEmoji}>{modoOscuro ? '🌙' : '☀️'}</Text>
              <Switch
                value={modoOscuro}
                onValueChange={toggleTema}
                trackColor={{ false: '#DDDDDD', true: '#F5A623' }}
                thumbColor='#FFFFFF'
                style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
              />
            </View>
            <TouchableOpacity style={[styles.sucursalBtn, { borderColor: tema.sucursalBorde }]}>
              <Text style={[styles.sucursalTexto, { color: tema.sucursalTexto }]}>
                📍 SUCURSAL
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── BARRA DE BÚSQUEDA ── */}
        <View style={[styles.searchWrapper, { backgroundColor: tema.header }]}>
          <View style={[styles.searchBox, { backgroundColor: modoOscuro ? '#2C2C2C' : '#F0F0F0' }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Buscar pizzas, snacks, bebidas..."
              placeholderTextColor={modoOscuro ? '#666' : '#999'}
              value={busqueda}
              onChangeText={setBusqueda}
              style={[styles.searchInput, { color: tema.texto, fontFamily: 'Poppins_400Regular' }]}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Text style={{ fontSize: 16, color: '#999' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── FILTROS (sticky) ── */}
        <View style={[styles.filtrosSticky, { backgroundColor: tema.fondo }]}>
          <FiltrosCategorias
            categoriaActiva={categoriaActiva}
            onSelect={setCategoriaActiva}
          />
        </View>

        {/* ── HERO BANNER ── */}
        <HeroBanner />

        {/* ── PROMOCIONES ── */}
        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Text style={[styles.seccionTitulo, { color: tema.texto }]}>
              PROMOCIONES
            </Text>
            <View style={styles.lineaAmarilla} />
          </View>
          <View style={styles.promosRow}>
            {promociones.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </View>
        </View>

        {/* ── TÍTULO SECCIÓN PRODUCTOS ── */}
        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Text style={[styles.seccionTitulo, { color: tema.texto }]}>
              {categoriaActiva === 'Todos' ? 'TODOS LOS PRODUCTOS' : categoriaActiva.toUpperCase()}
            </Text>
            <View style={styles.lineaAmarilla} />
          </View>
          <Text style={[styles.contadorTexto, { color: tema.textoSecundario }]}>
            {productosFiltrados.length} productos disponibles
          </Text>
        </View>

        {/* ── LISTA DE PRODUCTOS ── */}
        <View style={styles.productos}>
          {productosFiltrados.length === 0 ? (
            <View style={styles.sinResultados}>
              <Text style={styles.sinResultadosEmoji}>🍕</Text>
              <Text style={[styles.sinResultadosTexto, { color: tema.textoSecundario }]}>
                No encontramos "{busqueda}"
              </Text>
            </View>
          ) : (
            productosFiltrados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerIzq: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetra: {
    color: '#000',
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
  },
  headerMarca: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  headerSlogan: {
    fontFamily: 'Poppins_400Regular',
    color: '#F5A623',
    fontSize: 8,
    letterSpacing: 2,
  },
  headerDer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleEmoji: {
    fontSize: 14,
  },
  sucursalBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sucursalTexto: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // Búsqueda
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },

  // Filtros sticky
  filtrosSticky: {
    paddingVertical: 8,
  },

  // Secciones
  seccion: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  seccionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  seccionTitulo: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    letterSpacing: 1,
  },
  lineaAmarilla: {
    flex: 1,
    height: 2,
    backgroundColor: '#F5A623',
    marginLeft: 10,
    borderRadius: 2,
  },
  contadorTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginBottom: 4,
    marginTop: 2,
  },
  promosRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  // Productos
  productos: {
    marginTop: 8,
    paddingBottom: 24,
  },
  sinResultados: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  sinResultadosEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  sinResultadosTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
});