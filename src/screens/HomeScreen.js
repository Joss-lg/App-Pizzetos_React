import { useState, useMemo, useRef, useCallback, useDeferredValue } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, Pressable, RefreshControl,
  Animated, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
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

const NARANJA = '#F5A623';
const ES_ANDROID = Platform.OS === 'android';

// Cuántas tarjetas (las de arriba) repiten la animación al cambiar de filtro
const TARJETAS_ANIMADAS = 6;

// Detalle escondido: logo que aparece al seguir bajando cuando ya estás hasta abajo
const JALON_PARA_VERLO = 80; // cuánto hay que jalar en iPhone para verlo completo

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
  const {
    productos, promociones, tamanos, recargar, error, cargando,
  } = useDatos();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [subcategoria, setSubcategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [buscadorActivo, setBuscadorActivo] = useState(false);
  const [refrescando, setRefrescando] = useState(false);

  // Al tocar otra vez "Inicio" en la barra de abajo, sube hasta arriba
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  // ── Detalle escondido: el logo al final ──
  const scrollY = useRef(new Animated.Value(0)).current;
  const brinco = useRef(new Animated.Value(0)).current; // para Android
  const medidas = useRef({ contenido: 0, visible: 0 });
  const empezoAbajo = useRef(false);
  const [maxScroll, setMaxScroll] = useState(0);

  // Hasta dónde se puede bajar (alto del contenido menos lo que se ve)
  const actualizarMax = () => {
    const m = Math.max(0, Math.round(medidas.current.contenido - medidas.current.visible));
    setMaxScroll((prev) => (prev === m ? prev : m));
  };
  const alCambiarContenido = (_, alto) => {
    medidas.current.contenido = alto;
    actualizarMax();
  };
  const alMedirLista = (e) => {
    medidas.current.visible = e.nativeEvent.layout.height;
    actualizarMax();
  };

  // Android: el logo salta, se queda un momento y se va
  const mostrarBrinco = () => {
    brinco.stopAnimation();
    brinco.setValue(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.sequence([
      Animated.spring(brinco, { toValue: 1, speed: 14, bounciness: 12, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(brinco, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const alEmpezarArrastre = (e) => {
    empezoAbajo.current = maxScroll > 0 && e.nativeEvent.contentOffset.y >= maxScroll - 2;
  };

  const alTerminarArrastre = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    if (ES_ANDROID) {
      // Ya estaba hasta abajo e intentó seguir bajando
      if (empezoAbajo.current && y >= maxScroll - 2) mostrarBrinco();
    } else if (y - maxScroll > JALON_PARA_VERLO * 0.7) {
      // iPhone: jaló lo suficiente para ver el logo completo
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  // iPhone: el logo aparece según qué tanto jalas; Android: con el brinco
  const progresoLogo = ES_ANDROID
    ? brinco
    : scrollY.interpolate({
        inputRange: [maxScroll + 10, maxScroll + JALON_PARA_VERLO],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

  // ── Para que no haya lag ──
  // Los botones (filtros, buscador) cambian AL INSTANTE con los valores normales.
  // La lista de productos usa estas copias "diferidas", que se actualizan
  // justo después, sin frenar el toque.
  const categoriaLista = useDeferredValue(categoriaActiva);
  const subcategoriaLista = useDeferredValue(subcategoria);
  const busquedaLista = useDeferredValue(busqueda);

  const buscando = busqueda.trim().length > 0; // para las sugerencias del buscador
  const buscandoLista = busquedaLista.trim().length > 0; // para la lista
  const viendoPizzas = categoriaLista === 'Pizzas' && !buscandoLista;
  const mostrarBanner = !buscandoLista && categoriaLista === 'Todos';

  // ── Sin internet ──
  // Sin menú guardado: pantalla "Sin conexión". Con menú guardado: aviso pequeño arriba.
  const sinConexion = Boolean(error) && !cargando;
  const mostrarAvisoSinRed = sinConexion && productos.length > 0;

  // Cambia al cambiar de filtro: hace que las tarjetas de arriba repitan su animación.
  // (La búsqueda no está aquí para que no se anime con cada letra que escribes)
  const claveAnimacion = `${categoriaLista}|${subcategoriaLista}`;

  // Deslizar hacia abajo para actualizar desde Supabase
  const alRefrescar = async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  };

  // Siempre la misma función: así los filtros no se redibujan de más
  const cambiarCategoria = useCallback((nombre) => {
    setCategoriaActiva(nombre);
    setSubcategoria('Todas');
  }, []);

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
    const palabras = normalizar(busquedaLista).split(/\s+/).filter(Boolean);

    // Favoritos siempre filtra por favoritos
    if (categoriaLista === 'Favoritos') {
      const favs = productosInicio.filter((p) => favoritos.includes(p.id));
      return palabras.length ? favs.filter((p) => coincide(p, palabras)) : favs;
    }

    // Si hay búsqueda, busca en todo el menú
    if (palabras.length) {
      return productosInicio.filter((p) => coincide(p, palabras));
    }

    // Sin búsqueda, aplica el filtro de categoría
    if (categoriaLista === 'Todos') return productosInicio;

    let lista = productosInicio.filter((p) => p.categoria === categoriaLista);
    if (categoriaLista === 'Pizzas' && subcategoriaLista !== 'Todas') {
      lista = lista.filter((p) => p.subcategoria === subcategoriaLista);
    }
    return lista;
  }, [categoriaLista, subcategoriaLista, busquedaLista, favoritos, productosInicio]);

  // Lugar de cada tarjeta visible (0, 1, 2...). Las tarjetas se crean UNA sola vez;
  // el filtro solo las esconde o muestra, y las de arriba repiten su animación.
  const posiciones = useMemo(() => {
    const mapa = new Map();
    productosFiltrados.forEach((p, i) => mapa.set(p.id, i));
    return mapa;
  }, [productosFiltrados]);

  const fondoBoton = modoOscuro ? '#2A2A2A' : '#F2F2F2';
  const colorIconoSuave = '#8A8A8A';

  // Título de la sección de productos según lo que se esté viendo
  let tituloProductos = 'TODOS LOS PRODUCTOS';
  if (categoriaLista === 'Favoritos') tituloProductos = 'FAVORITOS';
  else if (buscandoLista) tituloProductos = 'RESULTADOS';
  else if (categoriaLista !== 'Todos') tituloProductos = categoriaLista.toUpperCase();

  const textoContador = buscandoLista
    ? `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'resultado' : 'resultados'} para "${busquedaLista.trim()}"`
    : `${productosFiltrados.length} productos disponibles`;

  // Qué mostrar cuando la lista está vacía (ícono, título, texto y botón)
  let vacio;
  if (productos.length === 0 && sinConexion) {
    vacio = {
      icono: 'cloud-offline-outline',
      titulo: 'Sin conexión',
      texto: 'No pudimos cargar el menú. Revisa tu internet e inténtalo de nuevo.',
      boton: { texto: 'Reintentar', alPresionar: recargar },
    };
  } else if (productos.length === 0) {
    vacio = {
      icono: 'pizza-outline',
      titulo: 'Cargando el menú...',
      texto: 'Esto solo tarda unos segundos.',
    };
  } else if (categoriaLista === 'Favoritos' && !buscandoLista) {
    vacio = {
      icono: 'heart-outline',
      titulo: 'Aún no tienes favoritos',
      texto: 'Toca el corazón de cualquier producto para guardarlo aquí.',
      boton: { texto: 'Ver el menú', alPresionar: () => cambiarCategoria('Todos') },
    };
  } else if (buscandoLista) {
    vacio = {
      icono: 'search-outline',
      titulo: 'Sin resultados',
      texto: `No encontramos "${busquedaLista.trim()}". Prueba con otra palabra, como "pizza" o "refresco".`,
      boton: { texto: 'Borrar búsqueda', alPresionar: () => setBusqueda('') },
    };
  } else {
    vacio = {
      icono: 'pizza-outline',
      titulo: 'Nada por aquí',
      texto: 'Por ahora no hay productos en esta categoría.',
    };
  }

  // Colores del aviso "sin internet"
  const fondoAviso = modoOscuro ? '#2A2418' : '#FFF6E5';
  const textoAviso = modoOscuro ? '#E0C48A' : '#8A5A00';

  // El logo escondido queda justo encima de la barra de abajo
  const alturaLogoEscondido = Math.max(insets.bottom - 6, 10) + 70 + 14;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: tema.fondo }]}>
      <Animated.ScrollView
        ref={scrollRef}
        style={{ backgroundColor: tema.fondo }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onContentSizeChange={alCambiarContenido}
        onLayout={alMedirLista}
        onScrollBeginDrag={alEmpezarArrastre}
        onScrollEndDrag={alTerminarArrastre}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={alRefrescar}
            tintColor={NARANJA}
            colors={[NARANJA]}
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
                ? <IconoLuna color={NARANJA} size={19} />
                : <IconoSol color={NARANJA} size={20} />}
            </TouchableOpacity>

            {/* Botón de sucursal */}
            <TouchableOpacity
              style={[styles.sucursalBtn, { backgroundColor: fondoBoton }]}
              onPress={() => navigation.navigate('Sucursales')}
              activeOpacity={0.7}
            >
              <IconoPin color={NARANJA} size={15} />
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
            <IconoBuscar color={buscadorActivo ? NARANJA : colorIconoSuave} size={19} />
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

          {/* Aviso pequeño: sin internet, pero se ve el menú guardado */}
          {mostrarAvisoSinRed && (
            <View style={[styles.avisoSinRed, { backgroundColor: fondoAviso }]}>
              <Ionicons name="cloud-offline-outline" size={16} color={textoAviso} />
              <Text style={[styles.avisoSinRedTexto, { color: textoAviso }]} numberOfLines={1}>
                Sin internet · mostrando el último menú guardado
              </Text>
              <Pressable
                onPress={recargar}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Reintentar cargar el menú"
              >
                <Text style={styles.avisoSinRedBoton}>Reintentar</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ── FILTROS (sticky) ── */}
        <View style={[styles.filtrosSticky, { backgroundColor: tema.fondo }]}>
          <FiltrosCategorias
            categoriaActiva={categoriaActiva}
            onSelect={cambiarCategoria}
          />
        </View>

        {/* Banner y promociones: se ESCONDEN en lugar de borrarse,
            así al regresar a "Todos" ya están listos */}
        <View style={mostrarBanner ? null : styles.oculto}>
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
        </View>

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

          {/* Sub-filtros de pizzas (la pastilla cambia al instante) */}
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
          {productosFiltrados.length === 0 && (
            <View style={styles.sinResultados}>
              {/* Ícono dibujado dentro de un círculo (sin emojis) */}
              <View style={[styles.circuloVacio, { backgroundColor: tema.card }]}>
                <Ionicons name={vacio.icono} size={34} color={NARANJA} />
              </View>
              <Text style={[styles.sinResultadosTitulo, { color: tema.texto }]}>
                {vacio.titulo}
              </Text>
              <Text style={[styles.sinResultadosTexto, { color: tema.textoSecundario }]}>
                {vacio.texto}
              </Text>
              {vacio.boton && (
                <Pressable
                  onPress={vacio.boton.alPresionar}
                  style={({ pressed }) => [styles.botonVacio, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                >
                  <Text style={styles.textoBotonVacio}>{vacio.boton.texto}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Todas las tarjetas existen siempre; el filtro esconde las que no tocan
              y las primeras visibles repiten su animación de entrada */}
          {productosInicio.map((producto) => {
            const posicion = posiciones.has(producto.id) ? posiciones.get(producto.id) : -1;
            const seAnima = posicion >= 0 && posicion < TARJETAS_ANIMADAS;
            return (
              <View key={producto.id} style={posicion >= 0 ? null : styles.oculto}>
                <ProductCard
                  producto={producto}
                  posicion={seAnima ? posicion : -1}
                  animarAl={seAnima ? claveAnimacion : null}
                />
              </View>
            );
          })}
        </View>

        {/* Espacio para que la barra flotante no tape el último producto */}
        <View style={{ height: 110 }} />
      </Animated.ScrollView>

      {/* ── DETALLE ESCONDIDO: logo al seguir bajando hasta el final ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.logoEscondido,
          {
            bottom: alturaLogoEscondido,
            opacity: progresoLogo,
            transform: [
              {
                translateY: progresoLogo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
              {
                scale: progresoLogo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: progresoLogo.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-120deg', '0deg'],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={['#FFC04D', '#F5A623', '#E0880A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <View style={styles.logoInterior}>
              <Image source={LOGO} style={styles.logoImagen} contentFit="contain" />
            </View>
          </LinearGradient>
        </Animated.View>
        <Text style={styles.logoEscondidoTexto}>LA PIZZA DE TU VIDA</Text>
      </Animated.View>

      {/* ── ALERTA DE PAQUETES (sale una vez al abrir la app) ── */}
      <AlertaPaquetes oscuro={modoOscuro} onVerPaquete={abrirPaqueteDeAlerta} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  oculto: {
    display: 'none',
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
    shadowColor: NARANJA,
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

  // Detalle escondido
  logoEscondido: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
  },
  logoEscondidoTexto: {
    color: NARANJA,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    letterSpacing: 2,
  },

  headerMarca: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  headerSlogan: {
    fontFamily: 'Poppins_400Regular',
    color: NARANJA,
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
    borderColor: NARANJA,
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

  // Aviso "sin internet"
  avisoSinRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 10,
  },
  avisoSinRedTexto: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },
  avisoSinRedBoton: {
    color: NARANJA,
    fontFamily: 'Poppins_700Bold',
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
    backgroundColor: NARANJA,
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

  // Lista vacía (sin emojis: ícono dibujado en un círculo)
  sinResultados: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  circuloVacio: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sinResultadosTitulo: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    textAlign: 'center',
  },
  sinResultadosTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 4,
  },
  botonVacio: {
    marginTop: 18,
    backgroundColor: NARANJA,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  textoBotonVacio: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A1A1A',
  },
});