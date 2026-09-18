import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTema } from './src/context/ThemeContext';
import TabNavigator from './src/navigation/TabNavigator';

function Root() {
  const { tema } = useTema();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

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
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}