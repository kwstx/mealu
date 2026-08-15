import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export interface Meal {
  id: string;
  title: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
  cost?: number;
}

interface MealCardProps {
  meal: Meal;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MealCard = memo(({ meal }: MealCardProps) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
      onPress={() => navigation.navigate('MealDetail', { meal })}
    >
      <Text style={styles.type}>{meal.type}</Text>
      <Text style={styles.title}>{meal.title}</Text>
      {meal.calories && <Text style={styles.calories}>{meal.calories} cal</Text>}
      {meal.cost && <Text style={styles.cost}>${meal.cost.toFixed(2)}</Text>}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  type: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  calories: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  cost: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginTop: 4,
  }
});

export default MealCard;
