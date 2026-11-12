import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as Location from 'expo-location';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'
);

// Hardcoded driver ID for pilot testing (matches a driver profile row)
const DRIVER_ID = 'd0000000-0000-0000-0000-000000000001';

export default function DriverHomeScreen() {
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [deliveryPinInput, setDeliveryPinInput] = useState<{ [key: string]: string }>({});
  const [nrcInput, setNrcInput] = useState<{ [key: string]: string }>({});
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    fetchAssignedOrders();
    startLocationBroadcaster();
  }, []);

  // 10-second background GPS telemetry broadcaster
  async function startLocationBroadcaster() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required for dispatch tracking.');
      return;
    }

    setInterval(async () => {
      if (!isOnline) return;
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await supabase
          .from('profiles')
          .update({
            current_lat: loc.coords.latitude,
            current_lng: loc.coords.longitude,
            is_online: true,
          })
          .eq('id', DRIVER_ID);
      } catch (err) {
        console.log('GPS broadcast error:', err);
      }
    }, 10000); // Every 10 seconds
  }

  async function fetchAssignedOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, stores(name, latitude, longitude)')
      .eq('driver_id', DRIVER_ID)
      .in('status', ['OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssignedOrders(data);
    }
  }

  function openNavigationMap(lat: number, lng: number, label: string) {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = ${lat},;
    const url = Platform.select({
      ios: ${scheme}@,
      android: ${scheme}(),
    });
    if (url) Linking.openURL(url);
  }

  async function completeDelivery(order: any) {
    const enteredPin = deliveryPinInput[order.id] || '';
    const enteredNrc = nrcInput[order.id] || '';

    if (enteredPin !== order.delivery_pin) {
      Alert.alert('Incorrect PIN', 'Please ask the customer for their 4-digit delivery confirmation PIN.');
      return;
    }

    if (!enteredNrc || enteredNrc.length < 6) {
      Alert.alert('NRC Required', 'Enter the customer NRC number to satisfy Zambian liquor age compliance laws.');
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'DELIVERED',
        customer_nrc: enteredNrc,
      })
      .eq('id', order.id);

    if (error) {
      Alert.alert('Error', 'Could not complete delivery: ' + error.message);
    } else {
      Alert.alert('Success', 'Order marked as DELIVERED. Earnings logged.');
      fetchAssignedOrders();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Last Round Driver</Text>
          <Text style={styles.subtitle}>Lusaka Fleet Operations</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusToggle, { backgroundColor: isOnline ? '#059669' : '#dc2626' }]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={assignedOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No active deliveries assigned. Standby for dispatch.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
              <Text style={styles.statusBadge}>{item.status}</Text>
            </div>

            <Text style={styles.storeName}>Pickup: {item.stores?.name}</Text>
            <Text style={styles.landmark}>📍 Landmark: {item.landmark_note}</Text>
            <Text style={styles.amount}>Collect / Total: K{item.total_zmw}</Text>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => openNavigationMap(item.delivery_lat, item.delivery_lng, item.landmark_note)}
            >
              <Text style={styles.navBtnText}>🧭 Navigate via Google Maps</Text>
            </TouchableOpacity>

            <View style={styles.verificationBox}>
              <TextInput
                style={styles.input}
                placeholder="Customer 4-Digit PIN"
                placeholderTextColor="#71717a"
                keyboardType="number-pad"
                maxLength={4}
                value={deliveryPinInput[item.id] || ''}
                onChangeText={(val) => setDeliveryPinInput({ ...deliveryPinInput, [item.id]: val })}
              />
              <TextInput
                style={styles.input}
                placeholder="Customer NRC (e.g. 384920/10/1)"
                placeholderTextColor="#71717a"
                value={nrcInput[item.id] || ''}
                onChangeText={(val) => setNrcInput({ ...nrcInput, [item.id]: val })}
              />
              <TouchableOpacity style={styles.completeBtn} onPress={() => completeDelivery(item)}>
                <Text style={styles.completeBtnText}>Verify & Complete Delivery</P>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fbbf24' },
  subtitle: { fontSize: 12, color: '#a1a1aa' },
  statusToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyText: { color: '#71717a', textAlign: 'center', marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  orderId: { color: '#fbbf24', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  statusBadge: { color: '#34d399', fontSize: 12, fontWeight: '700' },
  storeName: { color: '#d4d4d8', fontSize: 13, marginBottom: 4 },
  landmark: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  amount: { color: '#34d399', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  navBtn: { backgroundColor: '#3f3f46', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 14 },
  navBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  verificationBox: { borderTopWidth: 1, borderTopColor: '#27272a', paddingTop: 12 },
  input: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 8,
    fontSize: 14,
  },
  completeBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
  completeBtnText: { color: '#09090b', fontWeight: 'bold', fontSize: 14 },
});
