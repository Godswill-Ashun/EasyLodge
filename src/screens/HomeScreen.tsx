import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Hostel {
  id: string;
  name: string;
  location: string;
  price: string;
}

export default function HomeScreen({ navigation }: Props) {
  const user = auth().currentUser;
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  // Optional: fields to add a new hostel
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  // Fetch hostels from Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('hostels')
      .onSnapshot(snapshot => {
        const hostelList: Hostel[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Hostel, 'id'>),
        }));
        setHostels(hostelList);
        setLoading(false);
      });
    return unsubscribe;
  }, []);

  // Add a new hostel (optional admin feature)
  const addHostel = async () => {
    if (!name || !location || !price) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      await firestore().collection('hostels').add({ name, location, price });
      Alert.alert('Success', 'Hostel added!');
      setName('');
      setLocation('');
      setPrice('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = async () => {
    await auth().signOut();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading hostels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.email}!</Text>

      {/* Optional: Add new hostel */}
      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Add New Hostel (Admin)</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
      />
      <Button title="Add Hostel" onPress={addHostel} />

      <Text style={{ fontWeight: 'bold', marginTop: 20 }}>Hostel Listings:</Text>
      <FlatList
        data={hostels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.hostelItem}>
            <Text style={styles.hostelName}>{item.name}</Text>
            <Text>{item.location}</Text>
            <Text>${item.price}</Text>
          </View>
        )}
      />

      <Button title="Go to Details" onPress={() => navigation.navigate('Details')} />
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  hostelItem: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  hostelName: { fontWeight: 'bold', fontSize: 16 },
});
