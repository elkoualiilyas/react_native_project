// src/navigation/AppNavigator.js

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuthState } from '../controllers/AuthController';
import { useAdminAuthState, AdminAuthController } from '../controllers/AdminAuthController';
import LoginScreen from '../views/screens/LoginScreen';
import RegisterScreen from '../views/screens/RegisterScreen';
import AdminLoginScreen from '../views/screens/AdminLoginScreen';
import HomeScreen from '../views/screens/HomeScreen';
import EventDetailsScreen from '../views/screens/EventDetailsScreen';
import CreateEventScreen from '../views/screens/CreateEventScreen';
import ProfileScreen from '../views/screens/ProfileScreen';
import ProfileGateScreen from '../views/screens/ProfileGateScreen';
import ProfileSetupScreen from '../views/screens/ProfileSetupScreen';
import GlobalChatScreen from '../views/screens/GlobalChatScreen';
import MyEventsScreen from '../views/screens/MyEventsScreen';
import AdminUsersScreen from '../views/screens/AdminUsersScreen';
import AdminEventsScreen from '../views/screens/AdminEventsScreen';
import AdminRequestsScreen from '../views/screens/AdminRequestsScreen';
import TabBarBackground from '../views/components/TabBarBackground';

import { Feather } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs({ token }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <Pressable
            onPress={() => AdminAuthController.signOut()}
            style={({ pressed }) => [{ marginRight: 12, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={{ fontWeight: '900', color: '#111827' }}>Sign out</Text>
          </Pressable>
        ),
      }}
    >
      <Tab.Screen name="Users">
        {() => <AdminUsersScreen token={token} />}
      </Tab.Screen>
      <Tab.Screen name="Events">
        {() => <AdminEventsScreen token={token} />}
      </Tab.Screen>
      <Tab.Screen name="Requests">
        {() => <AdminRequestsScreen token={token} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AdminStack({ token }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminTabs" options={{ headerShown: false }}>
        {() => <AdminTabs token={token} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AppTabs({ userId }) {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#0F4C5C',
          tabBarInactiveTintColor: '#636E72',
          tabBarLabelStyle: { fontSize: 12, fontWeight: '900' },
          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 14,
            height: 64,
            borderRadius: 18,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            overflow: 'hidden',
          },
          tabBarBackground: () => <TabBarBackground />,
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Events') return <Feather name="calendar" size={size} color={color} />;
            if (route.name === 'My Events') return <Feather name="bookmark" size={size} color={color} />;
            if (route.name === 'Profile') return <Feather name="user" size={size} color={color} />;
            return null;
          },
        })}
      >
        <Tab.Screen name="Events">
          {(props) => <HomeScreen {...props} userId={userId} />}
        </Tab.Screen>
        <Tab.Screen name="My Events">
          {(props) => <MyEventsScreen {...props} userId={userId} />}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {(props) => <ProfileScreen {...props} userId={userId} />}
        </Tab.Screen>
      </Tab.Navigator>

      <Pressable
        onPress={() => navigation.navigate('GlobalChat')}
        style={({ pressed }) => [
          {
            position: 'absolute',
            right: 16,
            bottom: 96,
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: '#0F4C5C',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Feather name="message-circle" size={22} color="#F8F9FA" />
      </Pressable>
    </View>
  );
}

function AppStack({ userId }) {
  return (
    <Stack.Navigator initialRouteName="ProfileGate">
      <Stack.Screen name="ProfileGate" options={{ headerShown: false }}>
        {(props) => <ProfileGateScreen {...props} userId={userId} />}
      </Stack.Screen>
      <Stack.Screen name="ProfileSetup" options={{ headerShown: false }}>
        {(props) => <ProfileSetupScreen {...props} userId={userId} />}
      </Stack.Screen>
      <Stack.Screen name="Tabs" options={{ headerShown: false }}>
        {() => <AppTabs userId={userId} />}
      </Stack.Screen>
      <Stack.Screen name="GlobalChat" options={{ headerShown: false }}>
        {(props) => <GlobalChatScreen {...props} userId={userId} />}
      </Stack.Screen>
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Create Event' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Login' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { userId, initializing } = useAuthState();
  const { token: adminToken, initializing: adminInitializing } = useAdminAuthState();

  if (initializing || adminInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {adminToken ? (
        <AdminStack token={adminToken} />
      ) : userId ? (
        <AppStack userId={userId} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
