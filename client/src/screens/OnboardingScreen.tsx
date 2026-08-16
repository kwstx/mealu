import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { AppText as Text } from '../components/AppText';
import { ApiClient } from '../api/client';
import { Feather } from '@expo/vector-icons';
import { CustomDatePicker } from '../components/CustomDatePicker';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

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

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
];

const COUNTRIES = [
  { id: 'US', name: 'United States', flag: '🇺🇸' },
  { id: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'CA', name: 'Canada', flag: '🇨🇦' },
  { id: 'AU', name: 'Australia', flag: '🇦🇺' },
  { id: 'OTHER', name: 'Other', flag: '🌍' },
];

const getDeviceLanguage = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const code = locale.split('-')[0];
    return LANGUAGES.some(l => l.code === code) ? code : 'en';
  } catch (e) {
    return 'en';
  }
};

const getDeviceRegion = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.split('-')[1];
    return COUNTRIES.some(c => c.id === region) ? region : 'US';
  } catch (e) {
    return 'US';
  }
};

export default function OnboardingScreen({ navigation, route }: Props) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Form State
  const [language, setLanguage] = useState<string>(getDeviceLanguage());
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(2000, 5, 16)); // Default to June 16, 2020 or similar, but 2000 is safer for "age"
  const [country, setCountry] = useState<string>(getDeviceRegion());
  const [stores, setStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [preferredStoreId, setPreferredStoreId] = useState<string | null>(null);
  
  const [householdSize, setHouseholdSize] = useState('1');
  const [weeklyBudget, setWeeklyBudget] = useState('');
  
  const [dietConstraints, setDietConstraints] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await ApiClient.get('/stores');
        setStores(data);
        if (data.length > 0) {
          setPreferredStoreId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setIsLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  const handleNext = () => {
    if (step === 2 && !name.trim()) {
      return; // disabled visually, but block here just in case
    }
    if (step === 4 && !country) {
      return;
    }
    if (step === 5 && !preferredStoreId) {
      Alert.alert('Selection Required', 'Please select a preferred grocery store to continue.');
      return;
    }
    if (step === 6) {
      const budget = parseFloat(weeklyBudget);
      if (isNaN(budget) || budget <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid positive weekly budget.');
        return;
      }
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      submitProfile();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

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

  const submitProfile = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        language,
        name: name.trim(),
        date_of_birth: dateOfBirth.toISOString(),
        country,
        household_size: parseInt(householdSize, 10),
        weekly_budget: parseFloat(weeklyBudget),
        preferred_store_id: preferredStoreId,
        diet_constraints: dietConstraints,
        currency: 'USD',
        flexible_preferences: {}
      };
      
      await ApiClient.put('/profile', payload);
      
      // On success, notify RootNavigation to re-initialize by touching the JWT.
      const { getJwtPair, setJwtPair } = require('../storage');
      const tokens = getJwtPair();
      if (tokens) setJwtPair(tokens);
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to complete onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.indicatorContainer}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Choose Language</Text>
      <Text style={styles.subtitle}>We've detected your language. Please confirm or select your preferred language.</Text>
      
      <View style={styles.storeList}>
        {LANGUAGES.map(lang => (
          <TouchableOpacity 
            key={lang.code} 
            style={[styles.storeOption, language === lang.code && styles.storeOptionSelected]}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={[styles.storeText, language === lang.code && styles.storeTextSelected]}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enter your name</Text>
      <Text style={styles.subtitle}>This is how you'll appear to others</Text>
      
      <TextInput
        style={[styles.nameInput, { outlineStyle: 'none' } as any]}
        placeholder="Name"
        placeholderTextColor="#C7C7CC"
        value={name}
        onChangeText={setName}
        autoFocus
        autoCorrect={false}
        autoCapitalize="words"
        underlineColorAndroid="transparent"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Enter your age</Text>
      <Text style={styles.subtitle}>We'll use this to personalize your experience</Text>
      
      <View style={styles.datePickerContainer}>
        <CustomDatePicker
          value={dateOfBirth}
          onChange={setDateOfBirth}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Where are you from?</Text>
      <Text style={styles.subtitle}>This helps us tailor recipes with local ingredients and correct units.</Text>
      
      <View style={styles.storeList}>
        {COUNTRIES.map(c => (
          <TouchableOpacity 
            key={c.id} 
            style={[styles.storeOption, country === c.id && styles.storeOptionSelected]}
            onPress={() => setCountry(c.id)}
          >
            <Text style={[styles.storeText, country === c.id && styles.storeTextSelected]}>
              {c.flag}  {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Where do you shop?</Text>
      <Text style={styles.subtitle}>Select your preferred grocery store to get accurate pricing for your meal plans.</Text>
      
      {isLoadingStores ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.storeList}>
          {stores.map(store => (
            <TouchableOpacity 
              key={store.id} 
              style={[styles.storeOption, preferredStoreId === store.id && styles.storeOptionSelected]}
              onPress={() => setPreferredStoreId(store.id)}
            >
              <Text style={[styles.storeText, preferredStoreId === store.id && styles.storeTextSelected]}>
                {store.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Household & Budget</Text>
      <Text style={styles.subtitle}>Help us tailor recipes and portions to your needs.</Text>
      
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
            autoFocus
          />
        </View>
      </View>
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Dietary Preferences</Text>
      <Text style={styles.subtitle}>Select any dietary restrictions we should consider.</Text>
      
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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Feather name="chevron-left" size={32} color="#1a1a1a" />
          </TouchableOpacity>
        ) : <View style={styles.backBtn} />}
        {renderStepIndicator()}
        <View style={styles.backBtn} />
      </View>
      
      <View style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
        {step === 7 && renderStep7()}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.nextButton, 
            (isSubmitting || (step === 2 && !name.trim())) && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          disabled={isSubmitting || (step === 2 && !name.trim())}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>{step === totalSteps ? 'Complete Setup' : 'Continue'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    fontSize: 16,
    color: '#007AFF',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E5E5EA',
  },
  dotActive: {
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  nameInput: {
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    fontWeight: '500',
    color: '#000',
    paddingVertical: 8,
  },
  datePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flex: 1,
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
  storeList: {
    gap: 12,
  },
  storeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  storeOptionSelected: {
    borderColor: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  storeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  storeTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D1D6',
    marginVertical: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  stepperText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  input: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    minWidth: 100,
    borderBottomWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 4,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pillSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pillText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  pillTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D1D6',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
