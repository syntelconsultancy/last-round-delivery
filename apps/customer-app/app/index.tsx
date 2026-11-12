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
  Switch,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { CartItem, checkZambianLiquorHours, validateSingleStoreCart } from '../lib/storeRules';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key'
);

export default function CustomerHomeScreen() {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [landmarkNote, setLandmarkNote] = useState('');
  const [momoPhone, setMomoPhone] = useState('260');
  const [isOver18, setIsOver18] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const liquorStatus = checkZambianLiquorHours();

  useEffect(() => {
    loadExpressCatalog();
  }, []);

  async function loadExpressCatalog() {
    // Fetch inventory prioritizing internal warehouse first, then partner stores
    const { data, error } = await supabase
      .from('store_inventory')
      .select(
        id,
        store_id,
        product_id,
        price_zmw,
        stock_quantity,
        is_chilled,
        stores (id, name, is_internal_store),
        master_products (id, name, category, volume_ml, is_alcoholic)
      )
      .gt('stock_quantity', 0);

    if (!error && data) {
      // Sort internal warehouse items to the top ("Express Delivery")
      const sorted = data.sort((a: any, b: any) =>
        a.stores?.is_internal_store === b.stores?.is_internal_store
          ? 0
          : a.stores?.is_internal_store
          ? -1
          : 1
      );
      setCatalog(sorted);
    }
  }

  function handleAddToCart(item: any) {
    if (item.master_products?.is_alcoholic && !liquorStatus.isOpen) {
      Alert.alert('Outside Trading Hours', liquorStatus.bannerMessage);
      return;
    }

    const newItem: CartItem = {
      inventoryId: item.id,
      productId: item.product_id,
      storeId: item.store_id,
      storeName: item.stores?.name || 'Store',
      name: item.master_products?.name || 'Drink',
      priceZmw: Number(item.price_zmw),
      quantity: 1,
      isChilled: item.is_chilled,
      isAlcoholic: item.master_products?.is_alcoholic ?? true,
    };

    const check = validateSingleStoreCart(cart, newItem.storeId);
    if (check.conflict) {
      Alert.alert(
        'Switch Store?',
        Your cart contains items from . Clear cart to order from ?,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear & Add', onPress: () => setCart([newItem]) },
        ]
      );
      return;
    }

    const existing = cart.find((c) => c.inventoryId === newItem.inventoryId);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.inventoryId === newItem.inventoryId ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, newItem]);
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    if (!isOver18) {
      Alert.alert('Age Verification Required', 'You must confirm you are 18+ and will present a valid NRC on delivery.');
      return;
    }
    if (landmarkNote.trim().length < 5) {
      Alert.alert('Landmark Required', 'Please enter a clear landmark note (e.g. Red gate next to Total filling station).');
      return;
    }
    if (!/^260[0-9]{9}$/.test(momoPhone)) {
      Alert.alert('Invalid Phone', 'Enter a valid Zambian mobile money number starting with 260 (12 digits).');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('initiate-momo', {
        body: {
          customerId: '00000000-0000-0000-0000-000000000000', // Replace with auth.uid() session
          storeId: cart[0].storeId,
          paymentPhone: momoPhone,
          deliveryLat: -15.4167, // Replace with dragged MapPin latitude
          deliveryLng: 28.3333,  // Replace with dragged MapPin longitude
          landmarkNote,
          items: cart.map((c) => ({ inventoryId: c.inventoryId, quantity: c.quantity })),
        },
      });

      if (error) throw error;
      Alert.alert('USSD Prompt Sent', data?.message || 'Check your phone to enter your Mobile Money PIN.');
      setCart([]);
    } catch (err: any) {
      Alert.alert('Checkout Error', err.message || 'Could not initiate Mobile Money prompt.');
    } finally {
      setSubmitting(false);
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.priceZmw * item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header & Zambian Liquor Hours Banner */}
      <View style={styles.header}>
        <Text style={styles.title}>Last Round Delivery</Text>
        <View style={[styles.banner, { backgroundColor: liquorStatus.isOpen ? '#065f46' : '#991b1b' }]}>
          <Text style={styles.bannerText}>{liquorStatus.bannerMessage}</Text>
        </View>
      </View>

      {/* Catalog List */}
      <FlatList
        data={catalog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isExpress = item.stores?.is_internal_store;
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.badge}>
                  {isExpress ? '⚡ EXPRESS DELIVERY' : 🏪 }
                  {item.is_chilled ? ' • ❄️ CHILLED' : ''}
                </Text>
                <Text style={styles.productName}>{item.master_products?.name}</Text>
                <Text style={styles.meta}>
                  {item.master_products?.volume_ml}ml • K{item.price_zmw}
                </Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                <Text style={styles.addBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Checkout Footer */}
      {cart.length > 0 && (
        <View style={styles.checkoutBox}>
          <Text style={styles.checkoutTitle}>
            Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items) — Subtotal: K{subtotal.toFixed(2)} + K35 Delivery
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Landmark note (e.g. Black gate opp. Kabulonga Centro)"
            placeholderTextColor="#9ca3af"
            value={landmarkNote}
            onChangeText={setLandmarkNote}
          />
          <TextInput
            style={styles.input}
            placeholder="MoMo Number (26097... / 26096... / 26095...)"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={momoPhone}
            onChangeText={setMomoPhone}
          />
          <View style={styles.ageRow}>
            <Switch value={isOver18} onValueChange={setIsOver18} trackColor={{ true: '#f59e0b' }} />
            <Text style={styles.ageText}>I confirm I am 18+ and will show my NRC on delivery</Text>
          </View>
          <TouchableOpacity
            style={[styles.payBtn, submitting && { opacity: 0.6 }]}
            onPress={handleCheckout}
            disabled={submitting}
          >
            <Text style={styles.payBtnText}>
              {submitting ? 'Sending USSD Push...' : Pay K via Mobile Money}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fbbf24', marginBottom: 8 },
  banner: { padding: 8, borderRadius: 6 },
  bannerText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  card: {
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  badge: { fontSize: 11, color: '#fbbf24', fontWeight: '700', marginBottom: 4 },
  productName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  meta: { fontSize: 13, color: '#a1a1aa', marginTop: 2 },
  addBtn: { backgroundColor: '#f59e0b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#09090b', fontWeight: 'bold' },
  checkoutBox: {
    backgroundColor: '#18181b',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3f3f46',
  },
  checkoutTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  input: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 8,
  },
  ageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  ageText: { color: '#d4d4d8', fontSize: 12, flex: 1 },
  payBtn: { backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center' },
  payBtnText: { color: '#09090b', fontWeight: 'bold', fontSize: 16 },
});
