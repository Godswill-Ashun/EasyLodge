import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route, navigation }: Props) {
  const { hostel } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{hostel.name}</Text>
      <Text>{hostel.location}</Text>
      <Text>Manager: {hostel.managerName} ({hostel.managerContact})</Text>

      <Text style={styles.section}>Available Rooms:</Text>
      <FlatList
        data={hostel.rooms}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.roomRow}>
            <Text style={styles.roomText}>
              {item.type} – {item.price}
            </Text>
            <Button
              title="Book Now"
              onPress={() =>
                navigation.navigate('Receipt', {
                  hostelName: hostel.name,
                  location: hostel.location,
                  roomType: item.type,
                  price: item.price,
                  managerName: hostel.managerName,
                  managerContact: hostel.managerContact,
                })
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  section: { marginTop: 16, fontWeight: 'bold', fontSize: 18 },
  roomRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  roomText: { fontSize: 16 },
});
