import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface Meal {
  id: string;
  title: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
}

interface MealCardProps {
  meal: Meal;
}

const MealCard = memo(({ meal }: MealCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.type}>{meal.type}</Text>
      <Text style={styles.title}>{meal.title}</Text>
      {meal.calories && <Text style={styles.calories}>{meal.calories} cal</Text>}
    </View>
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
  }
});

export default MealCard;
