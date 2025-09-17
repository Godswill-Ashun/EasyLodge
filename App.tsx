// App.tsx
import React, { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import ReceiptScreen from './src/screens/ReceiptScreen'; // NEW screen

// Define navigation params
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Details: { hostel: Hostel }; // pass full hostel object
  Receipt: {
    hostelName: string;
    location: string;
    roomType: string;
    price: string;
    managerName: string;
    managerContact: string;
  };
};

// Hostel type
export interface Hostel {
  id: string;
  name: string;
  managerName: string;
  managerContact: string;
  location: string;
  rooms: { type: string; price: string }[];
}

// Define the hostels statically
export const hostels: Hostel[] = [
  {
    id: '1',
    name: 'JK Hostel',
    managerName: 'Insia',
    managerContact: '0509891340',
    location: 'Houseborne Road',
    rooms: [
      { type: '2 in 1', price: 'Ghc 5500' },
      { type: '4 in 1', price: 'Ghc 4500' },
    ],
  },
  {
    id: '2',
    name: 'De Grace Hostel',
    managerName: 'Kofi',
    managerContact: '0509895541',
    location: 'Near Houseborne',
    rooms: [
      { type: '2 in 1', price: 'Ghc 7500' },
      { type: '4 in 1', price: 'Ghc 4800' },
    ],
  },
  {
    id: '3',
    name: 'The Point Hostel',
    managerName: 'Thadyman',
    managerContact: '0240584439',
    location: 'Near Houseborne',
    rooms: [
      { type: '2 in 1', price: 'Ghc 6500' },
      { type: '3 in 1', price: 'Ghc 6500' },
      { type: '4 in 1', price: 'Ghc 5000' },
    ],
  },
];

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Details" component={DetailsScreen} />
              <Stack.Screen name="Receipt" component={ReceiptScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
