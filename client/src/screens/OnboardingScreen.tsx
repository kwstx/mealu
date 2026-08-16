import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Image, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { AppText as Text } from '../components/AppText';
import { ApiClient } from '../api/client';
import { Feather } from '@expo/vector-icons';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { CustomSlider } from '../components/CustomSlider';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const DIET_VOCABULARY = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Peanut Allergy',
  'Nut-Free',
  'Keto',
  'Pescatarian',
];

const MOODS_VOCABULARY = [
  'Quick Meals',
  'High Protein',
  'Gut Friendly',
  'Low Calorie',
  'Comfort Food',
  'Heart Healthy',
  'Low Carb',
];

const GOALS_VOCABULARY = [
  'Save money',
  'Eat healthier',
  'Save time cooking',
  'Reduce food waste',
  'Learn to cook',
  'Lose/Gain weight',
];

const HURDLES = [
  "I don't have enough time",
  "Groceries are too expensive",
  "I lack inspiration",
  "Cooking for picky eaters",
];

const COOKING_TIMES = [
  'Under 15 mins (Quick & Easy)',
  '~30 mins (Standard)',
  '45+ mins (I love to cook!)'
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const APPLIANCES = [
  { id: 'stove', name: 'Stove', emoji: '🍳' },
  { id: 'oven', name: 'Oven', emoji: '🥘' },
  { id: 'microwave', name: 'Microwave', emoji: '♨️' },
  { id: 'air_fryer', name: 'Air Fryer', emoji: '🌪️' },
  { id: 'blender', name: 'Blender', emoji: '🥤' },
  { id: 'slow_cooker', name: 'Slow Cooker', emoji: '🍲' },
  { id: 'grill', name: 'Grill', emoji: '🍖' },
];

const HOUSEHOLD_OPTIONS = [
  { label: 'Just me', value: '1' },
  { label: 'Me + 1', value: '2' },
  { label: 'A family', value: '4' },
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
  { id: 'EU', name: 'Europe', flag: '🇪🇺' },
  { id: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { id: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { id: 'OTHER', name: 'Other', flag: '🌍' },
];

const SUB_COUNTRIES: Record<string, {id: string, name: string, flag: string}[]> = {
  'EU': [
    { id: 'FR', name: 'France', flag: '🇫🇷' },
    { id: 'DE', name: 'Germany', flag: '🇩🇪' },
    { id: 'IT', name: 'Italy', flag: '🇮🇹' },
    { id: 'ES', name: 'Spain', flag: '🇪🇸' },
    { id: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { id: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { id: 'PL', name: 'Poland', flag: '🇵🇱' },
    { id: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { id: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { id: 'AT', name: 'Austria', flag: '🇦🇹' },
  ],
  'US': [
    { id: 'AL', name: 'Alabama', flag: '🇺🇸' },
    { id: 'AK', name: 'Alaska', flag: '🇺🇸' },
    { id: 'AZ', name: 'Arizona', flag: '🇺🇸' },
    { id: 'AR', name: 'Arkansas', flag: '🇺🇸' },
    { id: 'CA', name: 'California', flag: '🇺🇸' },
    { id: 'CO', name: 'Colorado', flag: '🇺🇸' },
    { id: 'CT', name: 'Connecticut', flag: '🇺🇸' },
    { id: 'DE', name: 'Delaware', flag: '🇺🇸' },
    { id: 'FL', name: 'Florida', flag: '🇺🇸' },
    { id: 'GA', name: 'Georgia', flag: '🇺🇸' },
    { id: 'HI', name: 'Hawaii', flag: '🇺🇸' },
    { id: 'ID', name: 'Idaho', flag: '🇺🇸' },
    { id: 'IL', name: 'Illinois', flag: '🇺🇸' },
    { id: 'IN', name: 'Indiana', flag: '🇺🇸' },
    { id: 'IA', name: 'Iowa', flag: '🇺🇸' },
    { id: 'KS', name: 'Kansas', flag: '🇺🇸' },
    { id: 'KY', name: 'Kentucky', flag: '🇺🇸' },
    { id: 'LA', name: 'Louisiana', flag: '🇺🇸' },
    { id: 'ME', name: 'Maine', flag: '🇺🇸' },
    { id: 'MD', name: 'Maryland', flag: '🇺🇸' },
    { id: 'MA', name: 'Massachusetts', flag: '🇺🇸' },
    { id: 'MI', name: 'Michigan', flag: '🇺🇸' },
    { id: 'MN', name: 'Minnesota', flag: '🇺🇸' },
    { id: 'MS', name: 'Mississippi', flag: '🇺🇸' },
    { id: 'MO', name: 'Missouri', flag: '🇺🇸' },
    { id: 'MT', name: 'Montana', flag: '🇺🇸' },
    { id: 'NE', name: 'Nebraska', flag: '🇺🇸' },
    { id: 'NV', name: 'Nevada', flag: '🇺🇸' },
    { id: 'NH', name: 'New Hampshire', flag: '🇺🇸' },
    { id: 'NJ', name: 'New Jersey', flag: '🇺🇸' },
    { id: 'NM', name: 'New Mexico', flag: '🇺🇸' },
    { id: 'NY', name: 'New York', flag: '🇺🇸' },
    { id: 'NC', name: 'North Carolina', flag: '🇺🇸' },
    { id: 'ND', name: 'North Dakota', flag: '🇺🇸' },
    { id: 'OH', name: 'Ohio', flag: '🇺🇸' },
    { id: 'OK', name: 'Oklahoma', flag: '🇺🇸' },
    { id: 'OR', name: 'Oregon', flag: '🇺🇸' },
    { id: 'PA', name: 'Pennsylvania', flag: '🇺🇸' },
    { id: 'RI', name: 'Rhode Island', flag: '🇺🇸' },
    { id: 'SC', name: 'South Carolina', flag: '🇺🇸' },
    { id: 'SD', name: 'South Dakota', flag: '🇺🇸' },
    { id: 'TN', name: 'Tennessee', flag: '🇺🇸' },
    { id: 'TX', name: 'Texas', flag: '🇺🇸' },
    { id: 'UT', name: 'Utah', flag: '🇺🇸' },
    { id: 'VT', name: 'Vermont', flag: '🇺🇸' },
    { id: 'VA', name: 'Virginia', flag: '🇺🇸' },
    { id: 'WA', name: 'Washington', flag: '🇺🇸' },
    { id: 'WV', name: 'West Virginia', flag: '🇺🇸' },
    { id: 'WI', name: 'Wisconsin', flag: '🇺🇸' },
    { id: 'WY', name: 'Wyoming', flag: '🇺🇸' }
  ],
  'GB': [
    { id: 'ENG', name: 'England', flag: '🇬🇧' },
    { id: 'SCT', name: 'Scotland', flag: '🇬🇧' },
    { id: 'WLS', name: 'Wales', flag: '🇬🇧' },
    { id: 'NIR', name: 'Northern Ireland', flag: '🇬🇧' }
  ],
  'CA': [
    { id: 'AB', name: 'Alberta', flag: '🇨🇦' },
    { id: 'BC', name: 'British Columbia', flag: '🇨🇦' },
    { id: 'MB', name: 'Manitoba', flag: '🇨🇦' },
    { id: 'NB', name: 'New Brunswick', flag: '🇨🇦' },
    { id: 'NL', name: 'Newfoundland and Labrador', flag: '🇨🇦' },
    { id: 'NS', name: 'Nova Scotia', flag: '🇨🇦' },
    { id: 'ON', name: 'Ontario', flag: '🇨🇦' },
    { id: 'PE', name: 'Prince Edward Island', flag: '🇨🇦' },
    { id: 'QC', name: 'Quebec', flag: '🇨🇦' },
    { id: 'SK', name: 'Saskatchewan', flag: '🇨🇦' },
    { id: 'NT', name: 'Northwest Territories', flag: '🇨🇦' },
    { id: 'NU', name: 'Nunavut', flag: '🇨🇦' },
    { id: 'YT', name: 'Yukon', flag: '🇨🇦' }
  ],
  'AU': [
    { id: 'NSW', name: 'New South Wales', flag: '🇦🇺' },
    { id: 'VIC', name: 'Victoria', flag: '🇦🇺' },
    { id: 'QLD', name: 'Queensland', flag: '🇦🇺' },
    { id: 'WA', name: 'Western Australia', flag: '🇦🇺' },
    { id: 'SA', name: 'South Australia', flag: '🇦🇺' },
    { id: 'TAS', name: 'Tasmania', flag: '🇦🇺' },
    { id: 'ACT', name: 'Australian Capital Territory', flag: '🇦🇺' },
    { id: 'NT', name: 'Northern Territory', flag: '🇦🇺' }
  ],
  'NZ': [
    { id: 'NTL', name: 'Northland', flag: '🇳🇿' },
    { id: 'AUK', name: 'Auckland', flag: '🇳🇿' },
    { id: 'WKO', name: 'Waikato', flag: '🇳🇿' },
    { id: 'BOP', name: 'Bay of Plenty', flag: '🇳🇿' },
    { id: 'GIS', name: 'Gisborne', flag: '🇳🇿' },
    { id: 'HKB', name: "Hawke's Bay", flag: '🇳🇿' },
    { id: 'TKI', name: 'Taranaki', flag: '🇳🇿' },
    { id: 'MWT', name: 'Manawatū-Whanganui', flag: '🇳🇿' },
    { id: 'WGN', name: 'Wellington', flag: '🇳🇿' },
    { id: 'TAS', name: 'Tasman', flag: '🇳🇿' },
    { id: 'NN', name: 'Nelson', flag: '🇳🇿' },
    { id: 'MBH', name: 'Marlborough', flag: '🇳🇿' },
    { id: 'WTC', name: 'West Coast', flag: '🇳🇿' },
    { id: 'CAN', name: 'Canterbury', flag: '🇳🇿' },
    { id: 'OTA', name: 'Otago', flag: '🇳🇿' },
    { id: 'STL', name: 'Southland', flag: '🇳🇿' }
  ],
  'BR': [
    { id: 'AC', name: 'Acre', flag: '🇧🇷' },
    { id: 'AL', name: 'Alagoas', flag: '🇧🇷' },
    { id: 'AP', name: 'Amapá', flag: '🇧🇷' },
    { id: 'AM', name: 'Amazonas', flag: '🇧🇷' },
    { id: 'BA', name: 'Bahia', flag: '🇧🇷' },
    { id: 'CE', name: 'Ceará', flag: '🇧🇷' },
    { id: 'DF', name: 'Distrito Federal', flag: '🇧🇷' },
    { id: 'ES', name: 'Espírito Santo', flag: '🇧🇷' },
    { id: 'GO', name: 'Goiás', flag: '🇧🇷' },
    { id: 'MA', name: 'Maranhão', flag: '🇧🇷' },
    { id: 'MT', name: 'Mato Grosso', flag: '🇧🇷' },
    { id: 'MS', name: 'Mato Grosso do Sul', flag: '🇧🇷' },
    { id: 'MG', name: 'Minas Gerais', flag: '🇧🇷' },
    { id: 'PA', name: 'Pará', flag: '🇧🇷' },
    { id: 'PB', name: 'Paraíba', flag: '🇧🇷' },
    { id: 'PR', name: 'Paraná', flag: '🇧🇷' },
    { id: 'PE', name: 'Pernambuco', flag: '🇧🇷' },
    { id: 'PI', name: 'Piauí', flag: '🇧🇷' },
    { id: 'RJ', name: 'Rio de Janeiro', flag: '🇧🇷' },
    { id: 'RN', name: 'Rio Grande do Norte', flag: '🇧🇷' },
    { id: 'RS', name: 'Rio Grande do Sul', flag: '🇧🇷' },
    { id: 'RO', name: 'Rondônia', flag: '🇧🇷' },
    { id: 'RR', name: 'Roraima', flag: '🇧🇷' },
    { id: 'SC', name: 'Santa Catarina', flag: '🇧🇷' },
    { id: 'SP', name: 'São Paulo', flag: '🇧🇷' },
    { id: 'SE', name: 'Sergipe', flag: '🇧🇷' },
    { id: 'TO', name: 'Tocantins', flag: '🇧🇷' }
  ]
};

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
  const totalSteps = 15;

  // Form State
  const [language, setLanguage] = useState<string>(getDeviceLanguage());
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date(2000, 5, 16)); // Default to June 16, 2020 or similar, but 2000 is safer for "age"
  const [goals, setGoals] = useState<string[]>([]);
  const [hurdle, setHurdle] = useState<string | null>(null);
  const [householdSize, setHouseholdSize] = useState('1');
  const [cookingTime, setCookingTime] = useState<string | null>(null);
  const [plannedDays, setPlannedDays] = useState<string[]>([]);
  const [appliances, setAppliances] = useState<string[]>(['stove', 'oven']); // Pre-select standard ones
  const [moods, setMoods] = useState<string[]>([]);
  const [country, setCountry] = useState<string>(getDeviceRegion());
  const [specificCountry, setSpecificCountry] = useState<string | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [preferredStoreIds, setPreferredStoreIds] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  const [weeklyBudget, setWeeklyBudget] = useState<number>(73);
  
  const [dietConstraints, setDietConstraints] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await ApiClient.get('/stores');
        if (data && data.length > 0) {
          setStores(data);
          setPreferredStoreIds([data[0].id]);
          return;
        }
      } catch (error) {
        console.warn('Failed to fetch stores, using fallback mock stores.');
      } finally {
        setIsLoadingStores(false);
      }
      
      // Fallback mock stores with highly reliable Google Favicon PNGs
      const mockStores = [
        { id: 'walmart', name: 'Walmart', logo_url: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=128' },
        { id: 'tesco', name: 'Tesco', logo_url: 'https://www.google.com/s2/favicons?domain=tesco.com&sz=128' },
        { id: 'aldi', name: 'Aldi', logo_url: 'https://www.google.com/s2/favicons?domain=aldi.us&sz=128' },
        { id: 'whole_foods', name: 'Whole Foods', logo_url: 'https://www.google.com/s2/favicons?domain=wholefoodsmarket.com&sz=128' },
        { id: 'trader_joes', name: "Trader Joe's", logo_url: 'https://www.google.com/s2/favicons?domain=traderjoes.com&sz=128' },
        { id: 'target', name: 'Target', logo_url: 'https://www.google.com/s2/favicons?domain=target.com&sz=128' }
      ];
      setStores(mockStores);
    };
    fetchStores();
  }, []);

  const handleNext = () => {
    if (step === 2 && !name.trim()) {
      return; // disabled visually, but block here just in case
    }
    if (step === 4 && goals.length === 0) {
      // Allow moving next even without goals, or require at least one? Let's just proceed.
    }
    if (step === 5 && !hurdle) {
      return;
    }
    if (step === 6 && !householdSize) {
      return;
    }
    if (step === 10 && !appliances) {
      return;
    }
    if (step === 11) {
      if (weeklyBudget <= 0) {
        Alert.alert('Validation Error', 'Please select a valid positive weekly budget.');
        return;
      }
    }
    if (step === 13) {
      if (!country) return;
      if (!SUB_COUNTRIES[country]) {
        setStep(15);
        return;
      }
    }
    if (step === 14 && !specificCountry) {
      return;
    }
    if (step === 15 && preferredStoreIds.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one preferred grocery store to continue.');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      submitProfile();
    }
  };

  const handleBack = () => {
    if (step === 15 && !SUB_COUNTRIES[country]) {
      setStep(13);
      return;
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleDay = (day: string) => {
    setPlannedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleAppliance = (appId: string) => {
    setAppliances(prev => 
      prev.includes(appId) ? prev.filter(a => a !== appId) : [...prev, appId]
    );
  };

  const toggleDiet = (diet: string) => {
    setDietConstraints(prev => 
      prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]
    );
  };

  const toggleMood = (mood: string) => {
    setMoods(prev => 
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
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
        goals,
        hurdle,
        cooking_time: cookingTime,
        planned_days: plannedDays,
        appliances,
        moods,
        country: specificCountry || country,
        household_size: parseInt(householdSize, 10),
        weekly_budget: weeklyBudget,
        preferred_store_ids: preferredStoreIds,
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
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
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
      <Text style={styles.title}>What are you trying to achieve?</Text>
      <Text style={styles.subtitle}>Select all the goals that apply to you.</Text>
      
      <View style={styles.pillsContainer}>
        {GOALS_VOCABULARY.map(goal => {
          const isSelected = goals.includes(goal);
          return (
            <TouchableOpacity
              key={goal}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => toggleGoal(goal)}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {goal}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What's your biggest hurdle right now?</Text>
      <Text style={styles.subtitle}>We'll use this to guide your experience.</Text>
      
      <View style={styles.storeList}>
        {HURDLES.map(h => (
          <TouchableOpacity 
            key={h} 
            style={[styles.storeOption, hurdle === h && styles.storeOptionSelected]}
            onPress={() => setHurdle(h)}
          >
            <Text style={[styles.storeText, hurdle === h && styles.storeTextSelected]}>
              {h}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>how many are you cooking for?</Text>
      <Text style={styles.subtitle}>we'll scale your plan and budget</Text>
      
      <View style={styles.bigStepperContainer}>
        <View style={styles.bigStepperRow}>
          <TouchableOpacity onPress={() => handleHouseholdChange(-1)} style={styles.bigStepperBtn}>
            <Text style={styles.bigStepperBtnText}>-</Text>
          </TouchableOpacity>
          <View style={styles.bigStepperValueContainer}>
            <Text style={styles.bigStepperValue}>{householdSize}</Text>
          </View>
          <TouchableOpacity onPress={() => handleHouseholdChange(1)} style={styles.bigStepperBtn}>
            <Text style={styles.bigStepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bigStepperLabel}>people</Text>
      </View>
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Are there any dietary preferences or allergies we should know about?</Text>
      <Text style={styles.subtitle}>Select all that apply.</Text>
      
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
                {diet}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep8 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>How much time do you realistically want to spend cooking a meal?</Text>
      <Text style={styles.subtitle}>We'll only suggest recipes that fit your schedule.</Text>
      
      <View style={styles.storeList}>
        {COOKING_TIMES.map(time => (
          <TouchableOpacity 
            key={time} 
            style={[styles.storeOption, cookingTime === time && styles.storeOptionSelected]}
            onPress={() => setCookingTime(time)}
          >
            <Text style={[styles.storeText, cookingTime === time && styles.storeTextSelected]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep9 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Which days do you want meals planned for?</Text>
      <Text style={styles.subtitle}>Select the days you typically cook at home.</Text>
      
      <View style={styles.pillsContainer}>
        {DAYS_OF_WEEK.map(day => {
          const isSelected = plannedDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep10 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What appliances do you have?</Text>
      <Text style={styles.subtitle}>We'll only show recipes you can actually make.</Text>
      
      <View style={styles.applianceGrid}>
        {APPLIANCES.map(app => {
          const isSelected = appliances.includes(app.id);
          return (
            <View key={app.id} style={styles.applianceItem}>
              <TouchableOpacity
                style={[styles.applianceBox, isSelected && styles.applianceBoxSelected]}
                onPress={() => toggleAppliance(app.id)}
              >
                <Text style={styles.applianceEmoji}>{app.emoji}</Text>
              </TouchableOpacity>
              <Text style={[styles.applianceLabel, isSelected && styles.applianceLabelSelected]}>{app.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderStep11 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>what's your weekly budget?</Text>
      <Text style={styles.subtitle}>slide to what you're happy to spend on those days</Text>
      
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetAmount}>€{weeklyBudget}</Text>
        <Text style={styles.budgetLabel}>this week</Text>
        
        <View style={styles.sliderWrapper}>
          <CustomSlider
            value={weeklyBudget}
            min={10}
            max={174}
            onChange={setWeeklyBudget}
            symbol="€"
          />
        </View>
      </View>
    </View>
  );

  const renderStep12 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What are you in the mood for?</Text>
      <Text style={styles.subtitle}>Select the types of meals you're currently craving.</Text>
      
      <View style={styles.pillsContainer}>
        {MOODS_VOCABULARY.map(mood => {
          const isSelected = moods.includes(mood);
          return (
            <TouchableOpacity
              key={mood}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => toggleMood(mood)}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {mood}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep14 = () => {
    const subCountries = SUB_COUNTRIES[country] || [];
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Where exactly in {COUNTRIES.find(c => c.id === country)?.name} are you from?</Text>
        <Text style={styles.subtitle}>This helps us tailor recipes with local ingredients.</Text>
        
        <ScrollView contentContainerStyle={styles.storeList} showsVerticalScrollIndicator={false}>
          {subCountries.map(c => (
            <TouchableOpacity 
              key={c.id} 
              style={[styles.storeOption, specificCountry === c.id && styles.storeOptionSelected]}
              onPress={() => setSpecificCountry(c.id)}
            >
              <Text style={[styles.storeText, specificCountry === c.id && styles.storeTextSelected]}>
                {c.flag}  {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStep15 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Where do you usually buy your groceries?</Text>
      <Text style={styles.subtitle}>We'll use this to get accurate pricing for your meal plans.</Text>
      
      {isLoadingStores ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.storeGrid}>
          {stores.map(store => {
            const isSelected = preferredStoreIds.includes(store.id);
            return (
              <TouchableOpacity 
                key={store.id} 
                style={styles.storeCircleContainer}
                onPress={() => {
                  setPreferredStoreIds(prev => 
                    prev.includes(store.id) ? prev.filter(id => id !== store.id) : [...prev, store.id]
                  );
                }}
              >
                <View style={[styles.storeCircle, isSelected && styles.storeCircleSelected]}>
                  {store.logo_url && !imageErrors[store.id] ? (
                    <Image 
                      source={{ uri: store.logo_url }} 
                      style={styles.storeLogoImage} 
                      onError={() => setImageErrors(prev => ({ ...prev, [store.id]: true }))}
                    />
                  ) : (
                    <Text style={styles.storeLogoText}>{store.name.charAt(0)}</Text>
                  )}
                </View>
                <Text style={[styles.storeLabel, isSelected && styles.storeLabelSelected]}>
                  {store.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderStep13 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Where are you from?</Text>
      <Text style={styles.subtitle}>This helps us tailor recipes with local ingredients and correct units.</Text>
      
      <ScrollView contentContainerStyle={styles.storeList} showsVerticalScrollIndicator={false}>
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
      </ScrollView>
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
        {step === 8 && renderStep8()}
        {step === 9 && renderStep9()}
        {step === 10 && renderStep10()}
        {step === 11 && renderStep11()}
        {step === 12 && renderStep12()}
        {step === 13 && renderStep13()}
        {step === 14 && renderStep14()}
        {step === 15 && renderStep15()}
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
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
    paddingTop: 16,
  },
  storeCircleContainer: {
    alignItems: 'center',
    width: 80,
  },
  storeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  storeCircleSelected: {
    borderColor: '#000000',
    borderWidth: 3,
  },
  storeLogoImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  storeLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  storeLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  storeLabelSelected: {
    color: '#000',
    fontFamily: 'Inter_700Bold',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: '#000000',
  },
  pillText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  pillTextSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  bigStepperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  bigStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  bigStepperBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigStepperBtnText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000',
    marginTop: -4,
  },
  bigStepperValueContainer: {
    minWidth: 70,
    alignItems: 'center',
  },
  bigStepperValue: {
    fontSize: 72,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  bigStepperLabel: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
  },
  applianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  applianceItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
  },
  applianceBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  applianceBoxSelected: {
    borderColor: '#000000',
  },
  applianceEmoji: {
    fontSize: 36,
  },
  applianceLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  applianceLabelSelected: {
    color: '#000',
    fontFamily: 'Inter_700Bold',
  },
  budgetContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  budgetAmount: {
    fontSize: 80,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  budgetLabel: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },
  sliderWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 60,
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
