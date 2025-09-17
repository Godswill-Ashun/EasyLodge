import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

// Define props for navigation + route
type Props = NativeStackScreenProps<RootStackParamList, 'Receipt'>;

export default function ReceiptScreen({ route, navigation }: Props) {
  const { hostelName, location, price } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Congratulations!</Text>
      <Text style={styles.text}>You have successfully booked:</Text>

      <View style={styles.receiptBox}>
        <Text style={styles.receiptLine}>🏠 Hostel: {hostelName}</Text>
        <Text style={styles.receiptLine}>📍 Location: {location}</Text>
        <Text style={styles.receiptLine}>💰 Price: GHC {price}</Text>
      </View>

      <Button
        title="Back to Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, color: '#2e7d32' },
  text: { fontSize: 16, marginBottom: 20 },
  receiptBox: {
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
  receiptLine: { fontSize: 16, marginBottom: 5 },
});
