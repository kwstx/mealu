import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { AppText as Text } from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const mockData = [
  {
    category: 'FRUIT & VEG',
    items: [
      { id: '1', emoji: '🥦', name: 'Broccoli', note: 'half needed', qty: '' },
      { id: '2', emoji: '🥫', name: 'Chopped Tomatoes', note: '200g needed', qty: '400g' },
      { id: '3', emoji: '🧄', name: 'Garlic', note: '17.5g needed', qty: '1' },
      { id: '4', emoji: '🍋', name: 'Lime', note: '1 needed', qty: '1' },
      { id: '5', emoji: '🫑', name: 'Peppers', note: '½ needed', qty: '1' },
      { id: '6', emoji: '🧅', name: 'Red Onion', note: '¼ needed', qty: '1' },
      { id: '7', emoji: '🧅', name: 'Spring Onion', note: '1 needed', qty: '1' },
    ]
  },
  {
    category: 'MEAT & FISH',
    items: [
      { id: '8', emoji: '🍗', name: 'Chicken Breast', note: '300g needed', qty: '300g' },
    ]
  }
];

export default function GroceryListScreen() {
  const navigation = useNavigation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalItems = mockData.reduce((acc, cat) => acc + cat.items.length, 0);
  const doneItems = Object.values(checkedItems).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Grocery list</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressPill}>
          <View style={styles.storeLogo}>
            <Text style={styles.storeLogoText}>Lidl</Text>
          </View>
          <Text style={styles.progressText}>{doneItems}/{totalItems} done</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Copy list</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {mockData.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            {section.items.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.itemRow}
                onPress={() => toggleItem(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitleBlock}>
                    <Text style={[styles.itemName, checkedItems[item.id] && styles.itemNameChecked]}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemNote}> ({item.note})</Text>
                  </Text>
                </View>
                {item.qty ? <Text style={styles.itemQty}>{item.qty}</Text> : <View style={styles.qtyPlaceholder} />}
                <View style={[styles.checkbox, checkedItems[item.id] && styles.checkboxChecked]}>
                  {checkedItems[item.id] && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '800',
    color: '#1a1a1a',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5EEFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
  },
  storeLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffeb3b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0c020',
  },
  storeLogoText: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#0050aa',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: '#2A4365',
    paddingRight: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: '#4A5568',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  itemEmoji: {
    fontSize: 22,
    marginRight: 16,
    width: 28,
    textAlign: 'center',
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  itemTitleBlock: {
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  itemNote: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#8E8E93',
    fontWeight: '400',
  },
  itemQty: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#8E8E93',
    fontWeight: '500',
    marginRight: 16,
    width: 40,
    textAlign: 'right',
  },
  qtyPlaceholder: {
    width: 40,
    marginRight: 16,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#D1D1D6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
});
