import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ApiClient } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'MealDetail'>;

interface RecipeDetail {
  id: string;
  title: string;
  prep_instructions: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
}

export default function MealDetailScreen({ route, navigation }: Props) {
  const { meal } = route.params;

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await ApiClient.get(`/recipes/${meal.id}`);
        setRecipe(data);
      } catch (error) {
        console.error('Failed to fetch recipe', error);
        Alert.alert('Error', 'Could not load recipe details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, [meal.id]);

  const toggleIngredient = (name: string) => {
    setCheckedIngredients(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text>Could not load recipe.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable 
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()} 
          style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Detail</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.type}>{meal.type}</Text>
        <Text style={styles.title}>{recipe.title || meal.title}</Text>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroBadge} accessible={true} accessibilityLabel={`Calories: ${recipe.calories || meal.calories || 0}`}>
            <Text style={styles.macroValue}>{recipe.calories || meal.calories || 0}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroBadge} accessible={true} accessibilityLabel={`Protein: ${recipe.protein || 0} grams`}>
            <Text style={styles.macroValue}>{parseFloat(recipe.protein || '0')}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroBadge} accessible={true} accessibilityLabel={`Carbs: ${recipe.carbs || 0} grams`}>
            <Text style={styles.macroValue}>{parseFloat(recipe.carbs || '0')}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroBadge} accessible={true} accessibilityLabel={`Fat: ${recipe.fat || 0} grams`}>
            <Text style={styles.macroValue}>{parseFloat(recipe.fat || '0')}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ingredients Checklist</Text>
        <View style={styles.checklistCard}>
          {recipe.ingredients?.map((ing, idx) => {
            const isChecked = !!checkedIngredients[ing.name];
            return (
              <Pressable 
                key={idx} 
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                accessibilityLabel={`${ing.name}, ${ing.quantity} ${ing.unit}`}
                style={styles.ingredientRow}
                onPress={() => toggleIngredient(ing.name)}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]} />
                <Text style={[styles.ingredientName, isChecked && styles.ingredientChecked]}>
                  {ing.name}
                </Text>
                <Text style={[styles.ingredientAmount, isChecked && styles.ingredientChecked]}>
                  {`${ing.quantity} ${ing.unit}`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.recipeCard}>
          <Text style={styles.recipeText}>{recipe.prep_instructions || "No instructions provided."}</Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
