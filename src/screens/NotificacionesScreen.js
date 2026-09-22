import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTema } from '../context/ThemeContext';
import { useNotificaciones } from '../context/NotificacionesContext';
import { IconoPromos } from '../components/IconosTab';
import { IconoChevron } from '../components/IconosUI';
import { IconoChispa, IconoMegafono, IconoCampana } from '../components/IconosExtra';

const TIPOS = {
  promo: {
    Icono: (p) => <IconoPromos {...p} activo />,
    color: '#C0392B',
    etiqueta: 'PROMOCIÓN',
  },
  nuevo: { Icono: IconoChispa, color: '#F5A623', etiqueta: 'NOVEDAD' },
  aviso: { Icono: IconoMegafono, color: '#2C3E50', etiqueta: 'AVISO' },
};

const NOMBRES_DESTINO = {
  Promos: 'Ver promociones',
  Sucursales: 'Ver sucursal',
  Inicio: 'Ver menú',
};

function tiempoRelativo(fechaISO) {
  const minutos = Math.floor((Date.now() - new Date(fechaISO).getTime()) / 60000);
  if (minutos < 60) return `Hace ${Math.max(minutos, 1)} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  return new Date(fechaISO).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function TarjetaNotificacion({ notif, onPress }) {
  const { tema, modoOscuro } = useTema();
  const tipo = TIPOS[notif.tipo] ?? TIPOS.aviso;
  const { Icono } = tipo;
  // El azul oscuro se pierde en modo oscuro, se aclara solo ahí
  const colorEtiqueta = tipo.color === '#2C3E50' && modoOscuro ? '#8FA3B8' : tipo.color;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: tema.card },
        !notif.leida && styles.cardNoLeida,
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notif.leida ? '' : 'Sin leer. '}${notif.titulo}. ${notif.mensaje}`}
    >
      <View style={[styles.icono, { backgroundColor: tipo.color }]}>
        <Icono color="#FFFFFF" size={20} />
      </View>

      <View style={styles.cuerpo}>
        <View style={styles.cuerpoTop}>
          <Text style={[styles.etiqueta, { color: colorEtiqueta }]}>{tipo.etiqueta}</Text>
          <Text style={[styles.fecha, { color: tema.textoSoloInfo }]}>
            {tiempoRelativo(notif.fecha)}
          </Text>
        </View>
        <Text
          style={[
            styles.notifTitulo,
            { color: tema.texto, fontFamily: notif.leida ? 'Poppins_600SemiBold' : 'Poppins_700Bold' },
          ]}
        >
          {notif.titulo}
        </Text>
        <Text style={[styles.mensaje, { color: tema.textoSecundario }]} numberOfLines={2}>
          {notif.mensaje}
        </Text>
        {notif.destino && (
          <View style={styles.verMasFila}>
            <Text style={styles.verMas}>{NOMBRES_DESTINO[notif.destino] ?? 'Ver más'}</Text>
            <IconoChevron color="#F5A623" size={14} />
          </View>
        )}
      </View>

      {!notif.leida && <View style={styles.puntoNoLeida} />}
    </Pressable>
  );
}

export default function NotificacionesScreen() {
  const { tema } = useTema();
  const navigation = useNavigation();
  const { notificaciones, marcarLeida, marcarTodas, noLeidas } = useNotificaciones();

  const nuevas = notificaciones.filter((n) => !n.leida);
  const anteriores = notificaciones.filter((n) => n.leida);

  const abrir = (notif) => {
    marcarLeida(notif.id);
    if (notif.destino) navigation.navigate(notif.destino);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── TÍTULO GRANDE ── */}
        <View style={styles.tituloFila}>
          <Text style={[styles.tituloGrande, { color: tema.texto }]}>Avisos</Text>
          {noLeidas > 0 && (
            <Pressable onPress={marcarTodas} hitSlop={10}>
              <Text style={styles.marcarTodas}>Marcar todo leído</Text>
            </Pressable>
          )}
        </View>
        <Text style={[styles.subtitulo, { color: tema.textoSecundario }]}>
          {noLeidas > 0 ? `${noLeidas} sin leer` : 'Estás al día 🎉'}
        </Text>

        {notificaciones.length === 0 ? (
          <View style={styles.vacio}>
            <IconoCampana color={tema.textoSoloInfo} />
            <Text style={[styles.vacioTexto, { color: tema.textoSecundario }]}>
              No tienes avisos por ahora
            </Text>
          </View>
        ) : (
          <>
            {nuevas.length > 0 && (
              <>
                <Text style={[styles.grupo, { color: tema.textoSecundario }]}>NUEVAS</Text>
                {nuevas.map((n) => (
                  <TarjetaNotificacion key={n.id} notif={n} onPress={() => abrir(n)} />
                ))}
              </>
            )}

            {anteriores.length > 0 && (
              <>
                <Text style={[styles.grupo, { color: tema.textoSecundario }]}>ANTERIORES</Text>
                {anteriores.map((n) => (
                  <TarjetaNotificacion key={n.id} notif={n} onPress={() => abrir(n)} />
                ))}
              </>
            )}
          </>
        )}

        {/* Espacio para que la barra flotante no tape el contenido */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  tituloFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tituloGrande: { fontFamily: 'Poppins_700Bold', fontSize: 30, lineHeight: 38 },
  subtitulo: { fontFamily: 'Poppins_400Regular', fontSize: 13, marginBottom: 8 },
  marcarTodas: { color: '#F5A623', fontFamily: 'Poppins_600SemiBold', fontSize: 13 },

  grupo: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 10,
  },

  card: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  cardNoLeida: { borderLeftColor: '#F5A623' },

  icono: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  cuerpo: { flex: 1 },
  cuerpoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 14 },
  etiqueta: { fontFamily: 'Poppins_700Bold', fontSize: 9, letterSpacing: 1 },
  fecha: { fontFamily: 'Poppins_400Regular', fontSize: 10 },
  notifTitulo: { fontSize: 14, marginTop: 2 },
  mensaje: { fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 17, marginTop: 2 },
  verMasFila: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 },
  verMas: { color: '#F5A623', fontFamily: 'Poppins_600SemiBold', fontSize: 12 },

  puntoNoLeida: {
    width: 9, height: 9, borderRadius: 5, backgroundColor: '#F5A623',
    position: 'absolute', top: 16, right: 14,
  },

  vacio: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  vacioTexto: { fontFamily: 'Poppins_400Regular', fontSize: 14 },
});