import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTema } from '../context/ThemeContext';

export default function NotificacionesScreen() {
  const { tema } = useTema();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.fondo }]}>
      <Text style={[styles.texto, { color: tema.texto }]}>Notificaciones</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  texto: { fontSize: 24, fontWeight: 'bold' },
});