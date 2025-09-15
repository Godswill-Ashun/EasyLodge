import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Modal,
  TextInput,
  Button,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

enableScreens();

type Room = {
  type: string;
  price: number;
  available: number;
};

type Hostel = {
  id: string;
  name: string;
  managerName: string;
  managerContact: string;
  location: string;
  rooms: Room[];
};

const INITIAL_ROOMS: Room[] = [
  { type: '2-in-1', price: 5500, available: 20 },
  { type: '3-in-1', price: 6000, available: 20 },
  { type: '4-in-1', price: 4500, available: 20 },
];

const INITIAL_HOSTELS: Hostel[] = [
  { id: '1', name: 'JK Hostel', managerName: 'NSIAH', managerContact: '0509891340', location: 'Osborne Road', rooms: [...INITIAL_ROOMS] },
  { id: '2', name: 'De Grace Hostel', managerName: 'Kofi', managerContact: '0509895541', location: 'Near Osborne', rooms: [...INITIAL_ROOMS] },
  { id: '3', name: 'The Point Hostel', managerName: 'Tadi Man', managerContact: '0240584439', location: 'Near Osborne', rooms: [...INITIAL_ROOMS] },
  { id: '4', name: 'ACM Hostel', managerName: 'Kate', managerContact: '0595011446', location: 'Kabis Road, on campus', rooms: [...INITIAL_ROOMS] },
];

type RootStackParamList = {
  Home: undefined;
  Details: { hostel: Hostel };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeScreen = ({ navigation }: any) => {
  const [hostels, setHostels] = useState<Hostel[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const savedData = await AsyncStorage.getItem('hostels');
      if (savedData) setHostels(JSON.parse(savedData));
      else {
        setHostels(INITIAL_HOSTELS);
        await AsyncStorage.setItem('hostels', JSON.stringify(INITIAL_HOSTELS));
      }
    };
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={hostels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const lowestPrice = Math.min(...item.rooms.map((r) => r.price));
          return (
            <TouchableOpacity
              style={styles.hostelCard}
              onPress={() => navigation.navigate('Details', { hostel: item })}
            >
              <Text style={styles.hostelName}>{item.name}</Text>
              <Text>{item.location}</Text>
              <Text>From: {lowestPrice} GHc</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const DetailsScreen = ({ route }: any) => {
  const { hostel } = route.params;
  const [rooms, setRooms] = useState<Room[]>(hostel.rooms);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookQty, setBookQty] = useState<string>('');
  const [adminMode, setAdminMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const saveRooms = async (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    // Update in AsyncStorage
    const allHostelsStr = await AsyncStorage.getItem('hostels');
    if (!allHostelsStr) return;
    const allHostels: Hostel[] = JSON.parse(allHostelsStr);
    const idx = allHostels.findIndex((h) => h.id === hostel.id);
    if (idx >= 0) {
      allHostels[idx].rooms = updatedRooms;
      await AsyncStorage.setItem('hostels', JSON.stringify(allHostels));
    }
  };

  const handleBook = (room: Room) => {
    setSelectedRoom(room);
    setBookQty('');
    setModalVisible(true);
  };

  const confirmBooking = () => {
    if (!selectedRoom) return;
    const qty = parseInt(bookQty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid number', 'Please enter a valid number of beds.');
      return;
    }
    if (qty > selectedRoom.available) {
      Alert.alert('Not enough beds', `Only ${selectedRoom.available} beds available.`);
      return;
    }
    const updatedRooms = rooms.map((r) =>
      r.type === selectedRoom.type ? { ...r, available: r.available - qty } : r
    );
    saveRooms(updatedRooms);
    setModalVisible(false);
    Alert.alert('Booking Confirmed', `You have booked ${qty} bed(s) in ${selectedRoom.type}.`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${hostel.managerContact}`);
  };

  const toggleAdminMode = () => {
    if (adminMode) {
      setAdminMode(false);
      setPasswordInput('');
    } else {
      Alert.prompt(
        'Admin Password',
        'Enter admin password to update availability',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: (text) => {
              if (text === 'admin123') setAdminMode(true);
              else Alert.alert('Wrong password', 'You cannot access admin mode.');
            },
          },
        ],
        'secure-text'
      );
    }
  };

  const adminUpdate = (room: Room, newQty: string) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Invalid number', 'Please enter a valid number.');
      return;
    }
    const updatedRooms = rooms.map((r) =>
      r.type === room.type ? { ...r, available: qty } : r
    );
    saveRooms(updatedRooms);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.hostelName}>{hostel.name}</Text>
      <Text style={styles.subtitle}>{hostel.location}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manager</Text>
        <Text>Name: {hostel.managerName}</Text>
        <Text style={styles.linkText} onPress={handleCall}>
          Contact: {hostel.managerContact}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rooms & Prices</Text>
        {rooms.map((room, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text>
              {room.type}: {room.price} GHc | Available: {room.available}
            </Text>
            {room.available === 0 ? (
              <Text style={{ color: 'red' }}>Fully Booked</Text>
            ) : (
              <Button title="Book" onPress={() => handleBook(room)} />
            )}
            {adminMode && (
              <TextInput
                style={styles.adminInput}
                placeholder="Set available"
                keyboardType="numeric"
                onSubmitEditing={(e) => adminUpdate(room, e.nativeEvent.text)}
              />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={toggleAdminMode}>
        <Text style={{ color: 'blue', marginTop: 20 }}>
          {adminMode ? 'Exit Admin Mode' : 'Admin Mode'}
        </Text>
      </TouchableOpacity>

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Book {selectedRoom?.type}</Text>
            <Text>Available: {selectedRoom?.available}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Number of beds"
              keyboardType="numeric"
              value={bookQty}
              onChangeText={setBookQty}
            />
            <Button title="Confirm Booking" onPress={confirmBooking} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'EasyLodge Hostels' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Hostel Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  hostelCard: { padding: 15, borderWidth: 1, borderRadius: 8, marginBottom: 15 },
  hostelName: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: 'gray', marginBottom: 10 },
  section: { marginTop: 20 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 5 },
  linkText: { color: 'blue', textDecorationLine: 'underline' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '80%' },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 10, padding: 8 },
  adminInput: { borderWidth: 1, borderColor: '#888', borderRadius: 8, padding: 5, marginTop: 5 },
});
