// src/navigation/AppNavigator.js

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { useAuthState } from '../controllers/AuthController';
import { useAdminAuthState, AdminAuthController } from '../controllers/AdminAuthController';
import LoginScreen from '../views/screens/LoginScreen';
import RegisterScreen from '../views/screens/RegisterScreen';
import AdminLoginScreen from '../views/screens/AdminLoginScreen';
import HomeScreen from '../views/screens/HomeScreen';
import EventDetailsScreen from '../views/screens/EventDetailsScreen';
import CreateEventScreen from '../views/screens/CreateEventScreen';
import ProfileScreen from '../views/screens/ProfileScreen';
import AdminUsersScreen from '../views/screens/AdminUsersScreen';
import AdminEventsScreen from '../views/screens/AdminEventsScreen';
import AdminRequestsScreen from '../views/screens/AdminRequestsScreen';

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
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} userId={userId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppStack({ userId }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" options={{ headerShown: false }}>
        {() => <AppTabs userId={userId} />}
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
      {Platform.OS === 'web' ? (
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Login' }} />
      ) : null}
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
      {Platform.OS === 'web' && adminToken ? (
        <AdminStack token={adminToken} />
      ) : userId ? (
        <AppStack userId={userId} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
