import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'MealDetail'>;

export default function MealDetailScreen({ route, navigation }: Props) {
  const { meal } = route.params;
  const insets = useSafeAreaInsets();
  
  // Use passed meal data or fallbacks
  const imageUrl = (meal as any).image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop';
  const title = meal.title || 'Caesar Salad with Cherry Tomatoes';
  const time = (meal as any).time || '6:21 PM';
  const calories = meal.calories || 330;
  const protein = meal.protein || 8;
  const carbs = meal.carbs || 20;
  const fat = (meal as any).fat || 18;

  const [quantity, setQuantity] = useState(1);

  // Mock ingredients
  const ingredients = [
    { name: 'Lettuce', calories: 20, amount: '1.5 cups' },
    { name: 'Cherry Tomatoes', calories: 15, amount: '0.5 cups' },
    { name: 'Parmesan Cheese', calories: 110, amount: '2 tbsp' },
    { name: 'Croutons', calories: 60, amount: '1/4 cup' },
    { name: 'Caesar Dressing', calories: 125, amount: '2 tbsp' },
  ];

  // Mock instructions
  const instructions = [
    'Rinse the rice thoroughly and cook according to the packet instructions.',
    'Slice the pepper and half a red onion into thin strips.',
    'Heat a frying pan over high heat with a little oil. Season the steak with salt.',
    'Cook the steak for 2-4 minutes depending on thickness and preference.',
    'Remove the steak and allow it to rest for 5 minutes.',
    'In the same pan cook the pepper and half a red onion until softened.',
    'Slice the steak into thin strips.',
    'Drain the rice and fluff with a fork.',
    'Divide the rice between bowls.'
  ];

  return (
    <View style={styles.container}>
      
      {/* Absolute Background Image Layer */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Spacer to push content down over the image */}
        <View style={styles.spacer} />

        {/* Single Unified Card */}
        <View style={styles.unifiedCard}>
          
          {/* Top Section: Title & Time */}
          <View style={styles.topSection}>
            <View style={styles.timeTag}>
              <Feather name="bookmark" size={16} color="#1a1a1a" />
              <Text style={styles.timeText}>{time}</Text>
            </View>
            
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.stepperBtn}>
                  <Feather name="minus" size={14} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.stepperBtn}>
                  <Feather name="plus" size={14} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calories Pill inside the unified card */}
          <View style={styles.caloriesPillWrapper}>
            <View style={styles.caloriesPill}>
              <View style={styles.flameIconContainer}>
                <FontAwesome5 name="fire" size={24} color="#1a1a1a" />
              </View>
              <View style={styles.caloriesTextContainer}>
                <Text style={styles.caloriesLabel}>Calories</Text>
                <Text style={styles.caloriesValue}>{calories}</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section: Macros & Ingredients */}
          <View style={styles.bottomSection}>
            
            {/* Macros Row */}
            <View style={styles.macrosRow}>
              <View style={styles.macroCard}>
                <View style={styles.macroHeader}>
                  <MaterialCommunityIcons name="food-drumstick" size={14} color="#e57373" />
                  <Text style={styles.macroTitle}>Protein</Text>
                </View>
                <Text style={styles.macroAmount}>{protein}g</Text>
              </View>

              <View style={styles.macroCard}>
                <View style={styles.macroHeader}>
                  <FontAwesome5 name="wheat" size={12} color="#d4a373" />
                  <Text style={styles.macroTitle}>Carbs</Text>
                </View>
                <Text style={styles.macroAmount}>{carbs}g</Text>
              </View>

              <View style={styles.macroCard}>
                <View style={styles.macroHeader}>
                  <MaterialCommunityIcons name="water" size={16} color="#64b5f6" style={{ marginTop: -2 }} />
                  <Text style={styles.macroTitle}>Fats</Text>
                </View>
                <Text style={styles.macroAmount}>{fat}g</Text>
              </View>
            </View>

            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
            </View>

            {/* Ingredients Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <TouchableOpacity style={styles.addMoreBtn}>
                <Feather name="plus" size={16} color="#8e8e93" />
                <Text style={styles.addMoreText}>Add more</Text>
              </TouchableOpacity>
            </View>

            {/* Ingredients List Container */}
            <View style={styles.ingredientsContainer}>
              {ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.ingredientRow, idx === ingredients.length - 1 && styles.ingredientRowLast]}>
                  <Text style={styles.ingredientLeft}>
                    <Text style={styles.ingredientName}>{ing.name}</Text>
                    <Text style={styles.ingredientDot}> • </Text>
                    <Text style={styles.ingredientCalories}>{ing.calories} cal</Text>
                  </Text>
                  <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                </View>
              ))}
            </View>

            {/* Instructions Section */}
            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsTitle}>instructions</Text>
              <View style={styles.instructionsContainer}>
                {instructions.map((inst, idx) => (
                  <View key={idx} style={[styles.instructionRow, idx === instructions.length - 1 && styles.instructionRowLast]}>
                    <Text style={styles.instructionNumber}>{idx + 1}.</Text>
                    <Text style={styles.instructionText}>{inst}</Text>
                  </View>
                ))}
              </View>
            </View>
            
          </View>
        </View>
      </ScrollView>

      {/* Bottom Pinned Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.fixResultsBtn}>
          <Ionicons name="sparkles" size={18} color="#1a1a1a" />
          <Text style={styles.fixResultsText}>Fix Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Header Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.headerBtn, { marginRight: 8 }]}>
            <Feather name="share" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="more-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55, 
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 30, 30, 0.4)', // Dark translucent
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Leave space for the pinned bottom bar
  },
  spacer: {
    height: height * 0.4, // Pushes content down so the image is visible
  },
  unifiedCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -6 },
    elevation: 5,
    minHeight: 600,
  },
  topSection: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
    marginRight: 16,
    lineHeight: 30,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperBtn: {
    paddingHorizontal: 6,
  },
  stepperValue: {
    marginHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
  },
  caloriesPillWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  caloriesPill: {
    width: '100%', 
    backgroundColor: '#fff',
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20, 
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  flameIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#f4f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  caloriesTextContainer: {
    justifyContent: 'center',
  },
  caloriesLabel: {
    fontSize: 13,
    color: '#1a1a1a',
    fontFamily: 'Inter_500Medium',
    marginBottom: 0,
  },
  caloriesValue: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
    lineHeight: 34,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f4f4f7',
    alignItems: 'center',
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroTitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginLeft: 6,
    fontFamily: 'Inter_500Medium',
  },
  macroAmount: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d1d6',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#1a1a1a',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 15,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
    marginLeft: 4,
  },
  ingredientsContainer: {
    backgroundColor: '#f9f9fb', // Very faint blue/gray
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ebebf0',
  },
  ingredientRowLast: {
    borderBottomWidth: 0,
  },
  ingredientLeft: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
  },
  ingredientDot: {
    fontSize: 14,
    color: '#8e8e93',
  },
  ingredientCalories: {
    fontSize: 15,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
  },
  ingredientAmount: {
    fontSize: 15,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
  },
  instructionsSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionsContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e5c1',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  instructionRowLast: {
    marginBottom: 0,
  },
  instructionNumber: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
    marginRight: 10,
    width: 18,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#333',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  fixResultsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 30,
    paddingVertical: 16,
    marginRight: 12,
  },
  fixResultsText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  doneBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  }
});
