import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AppText as Text } from './AppText';
import { ApiClient } from '../api/client';

const DIET_VOCABULARY = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'paleo',
  'keto',
  'pescatarian',
];

interface ProfileFormProps {
  initialData?: any;
  onSubmitSuccess?: (data: any) => void;
  buttonLabel?: string;
}

export default function ProfileForm({ initialData, onSubmitSuccess, buttonLabel = 'Save Profile' }: ProfileFormProps) {
  const [stores, setStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  
  const [householdSize, setHouseholdSize] = useState(initialData?.household_size?.toString() || '1');
  const [weeklyBudget, setWeeklyBudget] = useState(initialData?.weekly_budget?.toString() || '0.00');
  const [preferredStoreIds, setPreferredStoreIds] = useState<string[]>(initialData?.preferred_store_ids || []);
  const [dietConstraints, setDietConstraints] = useState<string[]>(initialData?.diet_constraints || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await ApiClient.get('/stores');
        setStores(data);
        if (preferredStoreIds.length === 0 && data.length > 0) {
          setPreferredStoreIds([data[0].id]);
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setIsLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  const toggleDiet = (diet: string) => {
    setDietConstraints(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const handleHouseholdChange = (increment: number) => {
    const current = parseInt(householdSize, 10) || 1;
    const next = Math.max(1, current + increment);
    setHouseholdSize(next.toString());
  };

  const handleSubmit = async () => {
    const budget = parseFloat(weeklyBudget);
    const size = parseInt(householdSize, 10);

    if (isNaN(budget) || budget <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive weekly budget.');
      return;
    }
    if (isNaN(size) || size < 1) {
      Alert.alert('Validation Error', 'Household size must be at least 1.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        household_size: size,
        weekly_budget: budget,
        preferred_store_ids: preferredStoreIds,
        diet_constraints: dietConstraints,
        currency: 'USD',
        flexible_preferences: {}
      };
      
      const response = await ApiClient.put('/profile', payload);
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Household Details</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Household Size</Text>
          <View style={styles.stepper}>
            <TouchableOpacity onPress={() => handleHouseholdChange(-1)} style={styles.stepperBtn}>
              <Text style={styles.stepperText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{householdSize}</Text>
            <TouchableOpacity onPress={() => handleHouseholdChange(1)} style={styles.stepperBtn}>
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Weekly Budget ($)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weeklyBudget}
            onChangeText={setWeeklyBudget}
            placeholder="0.00"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Preferred Grocery Store</Text>
      <View style={styles.card}>
        {isLoadingStores ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.storeList}>
            {stores.map(store => {
              const isSelected = preferredStoreIds.includes(store.id);
              return (
                <TouchableOpacity 
                  key={store.id} 
                  style={[styles.storeOption, isSelected && styles.storeOptionSelected]}
                  onPress={() => {
                    setPreferredStoreIds(prev => 
                      prev.includes(store.id) ? prev.filter(id => id !== store.id) : [...prev, store.id]
                    );
                  }}
                >
                  <Text style={[styles.storeText, isSelected && styles.storeTextSelected]}>
                    {store.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Dietary Constraints</Text>
      <View style={styles.card}>
        <View style={styles.pillsContainer}>
          {DIET_VOCABULARY.map(diet => {
            const isSelected = dietConstraints.includes(diet);
            return (
              <TouchableOpacity
                key={diet}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => toggleDiet(diet)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {diet.charAt(0).toUpperCase() + diet.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{buttonLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
    minWidth: 80,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
    paddingVertical: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  stepperValue: {
    fontSize: 16,
    width: 32,
    textAlign: 'center',
  },
  storeList: {
    flexDirection: 'column',
    gap: 8,
  },
  storeOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  storeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  storeText: {
    fontSize: 16,
    color: '#333',
  },
  storeTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pillSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pillText: {
    fontSize: 14,
    color: '#333',
  },
  pillTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
