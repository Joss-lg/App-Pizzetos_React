import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useTema } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import PromocionesScreen from '../screens/PromocionesScreen';
import SucursalesScreen from '../screens/SucursalesScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';

const Tab = createBottomTabNavigator();

// Íconos SVG simples como componentes
function IconoHome({ color, size }) {
  return (
    <Text style={{ fontSize: size, color }}>🏠</Text>
  );
}
function IconoPromo({ color, size }) {
  return (
    <Text style={{ fontSize: size, color }}>🏷️</Text>
  );
}
function IconoSucursal({ color, size }) {
  return (
    <Text style={{ fontSize: size, color }}>📍</Text>
  );
}
function IconoNotif({ color, size }) {
  return (
    <Text style={{ fontSize: size, color }}>🔔</Text>
  );
}

export default function TabNavigator() {
  const { tema, modoOscuro } = useTema();

  const tabBarBg = modoOscuro ? '#1E1E1E' : '#FFFFFF';
  const borderColor = modoOscuro ? '#2C2C2C' : '#EEEEEE';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F5A623',
        tabBarInactiveTintColor: modoOscuro ? '#666666' : '#AAAAAA',
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins_600SemiBold',
          fontSize: 10,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <IconoHome color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Promos"
        component={PromocionesScreen}
        options={{
          tabBarIcon: ({ color }) => <IconoPromo color={color} size={22} />,
          tabBarBadge: '2',
          tabBarBadgeStyle: {
            backgroundColor: '#F5A623',
            color: '#000000',
            fontSize: 9,
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Sucursales"
        component={SucursalesScreen}
        options={{
          tabBarIcon: ({ color }) => <IconoSucursal color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Notificaciones"
        component={NotificacionesScreen}
        options={{
          tabBarIcon: ({ color }) => <IconoNotif color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
}