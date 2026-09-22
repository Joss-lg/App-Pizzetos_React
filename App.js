import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { View, ActivityIndicator } from 'react-native';

import { ThemeProvider, useTema } from './src/context/ThemeContext';
import { DatosProvider } from './src/context/DatosContext';
import { NotificacionesProvider } from './src/context/NotificacionesContext';
import { FavoritosProvider } from './src/context/FavoritosContext';
import AppNavigator from './src/navigation/AppNavigator';

function Root() {
  const { tema, modoOscuro } = useTema();
  
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const temaNavegacion = {
    ...(modoOscuro ? DarkTheme : DefaultTheme),
    colors: {
      ...(modoOscuro ? DarkTheme.colors : DefaultTheme.colors),
      background: tema.fondo,
      card: tema.header,
      text: tema.texto,
      primary: '#F5A623',
    },
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: tema.fondo }}>
        <ActivityIndicator color="#F5A623" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={tema.statusBar} />
      <NavigationContainer theme={temaNavegacion}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DatosProvider>
          <NotificacionesProvider>
            <FavoritosProvider>
              <Root />
            </FavoritosProvider>
          </NotificacionesProvider>
        </DatosProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}