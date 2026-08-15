import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AppText as Text } from '../components/AppText';
import { ApiClient } from '../api/client';

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

export default function ShoppingListScreen() {
  const [sections, setSections] = useState<AisleSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const fetchShoppingList = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch latest plan from history
      const history = await ApiClient.get('/plans/history');
      if (!history || history.length === 0) {
        setSections([]);
        return;
      }
      const latestPlanId = history[0].id;
      setCurrentPlanId(latestPlanId);

      // 2. Fetch the plan details which includes the shopping list
      const planDetails = await ApiClient.get(`/plans/${latestPlanId}`);
      const listItems = planDetails.shoppingList || [];

      // 3. Group by aisle
      const grouped: Record<string, ShoppingItem[]> = {};
      listItems.forEach((item: any) => {
        const aisle = item.aisle || 'Other';
        if (!grouped[aisle]) {
          grouped[aisle] = [];
        }
        grouped[aisle].push({
          id: item.ingredient_id,
          name: item.name,
          quantity: `${item.aggregated_quantity} ${item.unit}`,
          owned: !!item.owned,
        });
      });

      const newSections = Object.keys(grouped).map(key => ({
        title: key,
        data: grouped[key]
      }));

      setSections(newSections);
    } catch (error) {
      console.error('Failed to fetch shopping list', error);
      Alert.alert('Error', 'Could not load shopping list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const markOwned = async (item: ShoppingItem) => {
    try {
      // Patch to real backend using ApiClient
      await ApiClient.patch(`/plans/shopping-list/${item.id}`, { owned: true });
      
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

  const renderRightActions = useCallback((item: ShoppingItem) => {
    return (
      <TouchableOpacity style={styles.actionButton} onPress={() => markOwned(item)}>
        <Text style={styles.actionText}>Mark{'\n'}Owned</Text>
      </TouchableOpacity>
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: ShoppingItem }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
      <View style={[styles.itemContainer, item.owned && styles.itemOwned]}>
        <Text style={[styles.itemName, item.owned && styles.textOwned]}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
      </View>
    </Swipeable>
  ), [renderRightActions]);

  const renderSectionHeader = useCallback(({ section: { title } }: { section: AisleSection }) => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No shopping list available. Generate a meal plan first.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
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
