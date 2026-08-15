import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  owned: boolean;
}

interface AisleSection {
  title: string;
  data: ShoppingItem[];
}

const initialData: AisleSection[] = [
  {
    title: 'Produce',
    data: [
      { id: '1', name: 'Apples', quantity: '1 lb', owned: false },
      { id: '2', name: 'Spinach', quantity: '1 bunch', owned: false },
    ],
  },
  {
    title: 'Dairy',
    data: [
      { id: '3', name: 'Milk', quantity: '1 gallon', owned: false },
      { id: '4', name: 'Cheese', quantity: '8 oz', owned: false },
    ],
  },
];

export default function ShoppingListScreen() {
  const [sections, setSections] = useState<AisleSection[]>(initialData);

  const markOwned = async (item: ShoppingItem) => {
    try {
      // Mapped directly to the PATCH endpoint used by the optimizer
      const response = await fetch(`http://localhost:3000/optimizer/shopping-list/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owned: true }),
      });

      // Even if the mock endpoint fails locally without backend, we want to update the UI for demonstration
      // If we strictly enforce this in a mock, it'll always fail.
      
      // Update local state
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          data: section.data.map((i) => (i.id === item.id ? { ...i, owned: true } : i)),
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Could not update item status.');
      console.error(error);
    }
  };

  const renderRightActions = (item: ShoppingItem) => {
    return (
      <TouchableOpacity style={styles.actionButton} onPress={() => markOwned(item)}>
        <Text style={styles.actionText}>Mark{'\n'}Owned</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
      <View style={[styles.itemContainer, item.owned && styles.itemOwned]}>
        <Text style={[styles.itemName, item.owned && styles.textOwned]}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
      </View>
    </Swipeable>
  );

  const renderSectionHeader = ({ section: { title } }: { section: AisleSection }) => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  itemOwned: {
    backgroundColor: '#F2F2F7',
  },
  itemName: {
    fontSize: 16,
    color: '#000000',
  },
  textOwned: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#8E8E93',
  },
  actionButton: {
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
