import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Pressable, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTema } from '../context/ThemeContext';
import { useFavoritos } from '../context/FavoritosContext';
import { useDatos } from '../context/DatosContext';
import HeroBanner from '../components/HeroBanner';
import PromoCard from '../components/PromoCard';
import FiltrosCategorias from '../components/FiltrosCategorias';
import ProductCard from '../components/ProductCard';
import TarjetaTamano from '../components/TarjetaTamano';
import AlertaPaquetes from '../components/AlertaPaquetes';
import { esPaqueteDePromos } from '../data/paquetes';
import {
  IconoBuscar, IconoPin, IconoSol, IconoLuna, IconoCerrar,
} from '../components/IconosUI';

// Logo horizontal de Pizzeto's (LogoPizzetos.png de la página, ya reducido)
const LOGO = require('../../assets/splash-logo.png');

// Sugerencias que aparecen al tocar el buscador
const SUGERENCIAS = ['Hawaiana', 'Pastor', 'Pepperoni', 'Alitas', 'Hamburguesa', 'Refresco'];

// Sub-filtros de pizzas (como en la página)
const SUBCATEGORIAS_PIZZA = ['Todas', 'Clásicas', 'Del Mar'];

// Quita acentos y mayúsculas: "Limón" → "limon"
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ¿El producto contiene TODAS las palabras buscadas (en nombre, descripción o categoría)?
function coincide(producto, palabras) {
  const texto = normalizar(
    `${producto.nombre} ${producto.descripcion} ${producto.categoria} ${producto.subcategoria ?? ''}`
  );
  return palabras.every((palabra) => texto.includes(palabra));
}

export default function HomeScreen() {
  const { tema, modoOscuro, toggleTema } = useTema();
  const { favoritos } = useFavoritos();
  const { productos, promociones, tamanos, recargar } = useDatos();
  const navigation = useNavigation();
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [subcategoria, setSubcategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [buscadorActivo, setBuscadorActivo] = useState(false);
  const [refrescando, setRefrescando] = useState(false);

  const buscando = busqueda.trim().length > 0;
  const viendoPizzas = categoriaActiva === 'Pizzas' && !buscando;

  // Deslizar hacia abajo para actualizar desde Supabase
  const alRefrescar = async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  };

  const cambiarCategoria = (nombre) => {
    setCategoriaActiva(nombre);
    setSubcategoria('Todas');
  };

  // Al tocar "Ver paquete" en la alerta, lleva a la pestaña Promos
  const abrirPaqueteDeAlerta = () => {
    navigation.navigate('Promos');
  };

  // Productos del Inicio: todo el menú MENOS los paquetes que solo van en Promos
  const productosInicio = useMemo(
    () => productos.filter((p) => !esPaqueteDePromos(p)),
    [productos]
  );

  const productosFiltrados = useMemo(() => {
    const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);

    // Favoritos siempre filtra por favoritos
    if (categoriaActiva === 'Favoritos') {
      const favs = productosInicio.filter((p) => favoritos.includes(p.id));
      return palabras.length ? favs.filter((p) => coincide(p, palabras)) : favs;
    }

    // Si hay búsqueda, busca en todo el menú
    if (palabras.length) {
      return productosInicio.filter((p) => coincide(p, palabras));
    }

    // Sin búsqueda, aplica el filtro de categoría
    if (categoriaActiva === 'Todos') return productosInicio;

    let lista = productosInicio.filter((p) => p.categoria === categoriaActiva);
    if (categoriaActiva === 'Pizzas' && subcategoria !== 'Todas') {
      lista = lista.filter((p) => p.subcategoria === subcategoria);
    }
    return lista;
  }, [categoriaActiva, subcategoria, busqueda, favoritos, productosInicio]);

  const fondoBoton = modoOscuro ? '#2A2A2A' : '#F2F2F2';
  const colorIconoSuave = '#8A8A8A';

  // Título de la sección de productos según lo que se esté viendo
  let tituloProductos = 'TODOS LOS PRODUCTOS';
  if (categoriaActiva === 'Favoritos') tituloProductos = 'FAVORITOS';
  else if (buscando) tituloProductos = 'RESULTADOS';
  else if (categoriaActiva !== 'Todos') tituloProductos = categoriaActiva.toUpperCase();

  const textoContador = buscando
    ? `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'resultado' : 'resultados'} para "${busqueda.trim()}"`
    : `${productosFiltrados.length} productos disponibles`;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: tema.fondo }]}>
      <ScrollView
        style={{ backgroundColor: tema.fondo }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={alRefrescar}
            tintColor="#F5A623"
            colors={['#F5A623']}
          />
        }
      >

        {/* ── HEADER ── */}
        <View style={[styles.header, { backgroundColor: tema.header }]}>
          <View style={styles.headerIzq}>
            {/* Aro naranja delgado con el logo sobre fondo blanco */}
            <LinearGradient
              colors={['#FFC04D', '#F5A623', '#E0880A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <View style={styles.logoInterior}>
                <Image
                  source={LOGO}
                  style={styles.logoImagen}
                  contentFit="contain"
                  accessibilityLabel="Logo de Pizzeto's"
                />
              </View>
            </LinearGradient>
            <View>
              <Text style={[styles.headerMarca, { color: tema.marcaTexto }]}>
                PIZZETO'S
              </Text>
              <Text style={styles.headerSlogan}>LA PIZZA DE TU VIDA</Text>
            </View>
          </View>

          <View style={styles.headerDer}>
            {/* Botón de modo claro / oscuro */}
            <TouchableOpacity
              style={[styles.botonRedondo, { backgroundColor: fondoBoton }]}
              onPress={toggleTema}
              activeOpacity={0.7}
              accessibilityLabel={modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {modoOscuro
                ? <IconoLuna color="#F5A623" size={19} />
                : <IconoSol color="#F5A623" size={20} />}
            </TouchableOpacity>

            {/* Botón de sucursal */}
            <TouchableOpacity
              style={[styles.sucursalBtn, { backgroundColor: fondoBoton }]}
              onPress={() => navigation.navigate('Sucursales')}
              activeOpacity={0.7}
            >
              <IconoPin color="#F5A623" size={15} />
              <Text style={[styles.sucursalTexto, { color: tema.sucursalTexto }]}>
                Sucursal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── BARRA DE BÚSQUEDA ── */}
        <View style={[styles.searchWrapper, { backgroundColor: tema.header }]}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: fondoBoton },
              buscadorActivo && styles.searchBoxActivo,
            ]}
          >
            <IconoBuscar color={buscadorActivo ? '#F5A623' : colorIconoSuave} size={19} />
            <TextInput
              placeholder="Busca pizza, alitas, refresco..."
              placeholderTextColor={modoOscuro ? '#6A6A6A' : '#9A9A9A'}
              value={busqueda}
              onChangeText={setBusqueda}
              onFocus={() => setBuscadorActivo(true)}
              onBlur={() => setBuscadorActivo(false)}
              returnKeyType="search"
              autoCorrect={false}
              style={[styles.searchInput, { color: tema.texto, fontFamily: 'Poppins_400Regular' }]}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity
                onPress={() => setBusqueda('')}
                style={[styles.botonLimpiar, { backgroundColor: modoOscuro ? '#3A3A3A' : '#DDDDDD' }]}
                accessibilityLabel="Borrar búsqueda"
              >
                <IconoCerrar color={modoOscuro ? '#CCCCCC' : '#666666'} size={12} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sugerencias rápidas: solo con el buscador activo y vacío */}
          {buscadorActivo && !buscando && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sugerencias}
            >
              {SUGERENCIAS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setBusqueda(s)}
                  style={({ pressed }) => [
                    styles.sugerencia,
                    { borderColor: modoOscuro ? '#3A3A3A' : '#E4E4E4' },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={[styles.sugerenciaTexto, { color: tema.textoSecundario }]}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── FILTROS (sticky) ── */}
        <View style={[styles.filtrosSticky, { backgroundColor: tema.fondo }]}>
          <FiltrosCategorias
            categoriaActiva={categoriaActiva}
            onSelect={cambiarCategoria}
          />
        </View>

        {/* Banner y promociones solo en la vista general */}
        {!buscando && categoriaActiva === 'Todos' && (
          <>
            {/* ── HERO BANNER ── */}
            <HeroBanner />

            {/* ── PROMOCIONES (solo si hay activas en Supabase) ── */}
            {promociones.length > 0 && (
              <View style={styles.seccion}>
                <View style={styles.seccionHeader}>
                  <Text style={[styles.seccionTitulo, { color: tema.texto }]}>
                    PROMOCIONES
                  </Text>
                  <View style={styles.lineaAmarilla} />
                </View>
                <View style={styles.promosRow}>
                  {promociones.slice(0, 2).map((promo) => (
                    <PromoCard
                      key={promo.id}
                      promo={promo}
                      onPress={() => navigation.navigate('Promos')}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* ── TAMAÑOS (solo al ver Pizzas) ── */}
        {viendoPizzas && tamanos.length > 0 && (
          <View style={styles.seccion}>
            <View style={styles.seccionHeader}>
              <Text style={[styles.seccionTitulo, { color: tema.texto }]}>ELIGE TU TAMAÑO</Text>
              <View style={styles.lineaAmarilla} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tamanosFila}
            >
              {tamanos.map((t, i) => (
                <TarjetaTamano key={t.id} tamano={t} nivel={i} />
              ))}
            </ScrollView>
            <Text style={[styles.notaTamanos, { color: tema.textoSoloInfo }]}>
              Precios de especialidades clásicas.
            </Text>
          </View>
        )}

        {/* ── TÍTULO SECCIÓN PRODUCTOS ── */}
        <View style={styles.seccion}>
          <View style={styles.seccionHeader}>
            <Text style={[styles.seccionTitulo, { color: tema.texto }]}>
              {tituloProductos}
            </Text>
            <View style={styles.lineaAmarilla} />
          </View>
          <Text style={[styles.contadorTexto, { color: tema.textoSecundario }]}>
            {textoContador}
          </Text>

          {/* Sub-filtros de pizzas */}
          {viendoPizzas && (
            <View style={styles.subFiltros}>
              {SUBCATEGORIAS_PIZZA.map((s) => {
                const activo = subcategoria === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setSubcategoria(s)}
                    style={[
                      styles.subFiltro,
                      activo
                        ? { backgroundColor: tema.texto }
                        : { borderColor: modoOscuro ? '#3A3A3A' : '#E0E0E0', borderWidth: 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.subFiltroTexto,
                        { color: activo ? tema.fondo : tema.textoSecundario },
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ── LISTA DE PRODUCTOS ── */}
        <View style={styles.productos}>
          {productosFiltrados.length === 0 ? (
            <View style={styles.sinResultados}>
              <Text style={styles.sinResultadosEmoji}>
                {categoriaActiva === 'Favoritos' && !buscando ? '🤍' : '🍕'}
              </Text>
              <Text style={[styles.sinResultadosTexto, { color: tema.textoSecundario }]}>
                {categoriaActiva === 'Favoritos' && !buscando
                  ? 'Aún no tienes favoritos.\nToca el corazón de cualquier producto.'
                  : buscando
                    ? `No encontramos "${busqueda.trim()}".\nPrueba con otra palabra, como "pizza" o "refresco".`
                    : productos.length === 0
                      ? 'Cargando el menú...\nDesliza hacia abajo para actualizar.'
                      : 'Por ahora no hay productos en esta categoría.'}
              </Text>
            </View>
          ) : (
            productosFiltrados.map((producto, index) => (
              <ProductCard key={producto.id} producto={producto} indice={index} />
            ))
          )}
        </View>

        {/* Espacio para que la barra flotante no tape el último producto */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── ALERTA DE PAQUETES (sale una vez al abrir la app) ── */}
      <AlertaPaquetes oscuro={modoOscuro} onVerPaquete={abrirPaqueteDeAlerta} />
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
    paddingBottom: 12,
  },
  headerIzq: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Logo: aro naranja delgado, interior blanco y el logo completo adentro
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoInterior: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  logoImagen: {
    width: '100%',
    height: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botonRedondo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sucursalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 13,
  },
  sucursalTexto: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },

  // Búsqueda
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchBoxActivo: {
    borderColor: '#F5A623',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  botonLimpiar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sugerencias: {
    gap: 8,
    paddingTop: 10,
  },
  sugerencia: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sugerenciaTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
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

  // Tamaños
  tamanosFila: {
    gap: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  notaTamanos: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 6,
  },

  // Sub-filtros de pizza
  subFiltros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  subFiltro: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  subFiltroTexto: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },

  // Productos
  productos: {
    marginTop: 8,
    paddingBottom: 24,
  },
  sinResultados: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  sinResultadosEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  sinResultadosTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});                                                                                                         