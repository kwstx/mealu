import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MealDetail'>;

export default function MealDetailScreen({ route, navigation }: Props) {
  const { meal } = route.params;

  // Mock extended data since Meal currently only has basic info
  const macros = { protein: 35, carbs: 40, fat: 12 };
  const ingredients = [
    { id: '1', name: 'Rolled Oats', amount: '1/2 cup' },
    { id: '2', name: 'Almond Milk', amount: '1 cup' },
    { id: '3', name: 'Honey', amount: '1 tbsp' },
    { id: '4', name: 'Berries', amount: '1/4 cup' },
  ];
  const recipe = "1. Combine oats and almond milk in a pot over medium heat.\n2. Bring to a simmer and cook for 5 minutes, stirring occasionally.\n3. Remove from heat and stir in honey.\n4. Top with fresh berries and serve warm.";

  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Detail</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.type}>{meal.type}</Text>
        <Text style={styles.title}>{meal.title}</Text>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroBadge}>
            <Text style={styles.macroValue}>{meal.calories || 0}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroBadge}>
            <Text style={styles.macroValue}>{macros.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroBadge}>
            <Text style={styles.macroValue}>{macros.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroBadge}>
            <Text style={styles.macroValue}>{macros.fat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ingredients Checklist</Text>
        <View style={styles.checklistCard}>
          {ingredients.map(ing => {
            const isChecked = !!checkedIngredients[ing.id];
            return (
              <Pressable 
                key={ing.id} 
                style={styles.ingredientRow}
                onPress={() => toggleIngredient(ing.id)}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]} />
                <Text style={[styles.ingredientName, isChecked && styles.ingredientChecked]}>
                  {ing.name}
                </Text>
                <Text style={[styles.ingredientAmount, isChecked && styles.ingredientChecked]}>
                  {ing.amount}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.recipeCard}>
          <Text style={styles.recipeText}>{recipe}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  type: {
    fontSize: 13,
    color: '#007aff',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  macroBadge: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minWidth: 75,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  checklistCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  ingredientAmount: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  ingredientChecked: {
    color: '#a0a0a0',
    textDecorationLine: 'line-through',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recipeText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#444',
  }
});
