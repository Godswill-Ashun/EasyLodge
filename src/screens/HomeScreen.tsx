import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, hostels } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  // Find smallest price for a hostel
  const getLowestPrice = (rooms: { type: string; price: string }[]) => {
    return rooms.reduce((min, room) => {
      const priceValue = parseInt(room.price.replace('Ghc ', ''));
      return priceValue < min ? priceValue : min;
    }, Infinity);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Hostels</Text>
      <FlatList
        data={hostels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const lowestPrice = getLowestPrice(item.rooms);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Details', { hostel: item })}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.location}</Text>
              <Text style={styles.price}>Starting from Ghc {lowestPrice}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 16, marginVertical: 8, borderWidth: 1, borderRadius: 8, borderColor: '#ccc' },
  name: { fontSize: 18, fontWeight: 'bold' },
  price: { marginTop: 4, color: 'green', fontWeight: '600' },
});
