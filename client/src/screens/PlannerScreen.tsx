import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { AppText as Text } from '../components/AppText';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PlannerScreen() {
  const daysData = [
    {
      day: 'MONDAY',
      title: 'Steak & Rice Bowls',
      calories: 550,
      protein: 35,
      carbs: 40,
      fat: 28,
      time: '12:37pm',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'
    },
    {
      day: 'TUESDAY',
      title: 'Spicy Sausage Tomato Spaghetti',
      calories: 620,
      protein: 28,
      carbs: 65,
      fat: 22,
      time: '12:37pm',
      image: 'https://images.unsplash.com/photo-1562014603-9b48b59828d1?w=400&h=400&fit=crop'
    },
    {
      day: 'WEDNESDAY',
      title: 'Garlic Lime Chicken',
      calories: 480,
      protein: 42,
      carbs: 15,
      fat: 24,
      time: '12:37pm',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop'
    },
    {
      day: 'THURSDAY',
      title: 'Cashew Honey Broccoli Noodles',
      calories: 510,
      protein: 18,
      carbs: 58,
      fat: 26,
      time: '12:37pm',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header section */}
        <View style={styles.header}>
          <View style={styles.storeLogoContainer}>
            <View style={styles.storeLogo}>
              <Text style={styles.storeLogoText}>Lidl</Text>
            </View>
          </View>
          <View style={styles.storeBadge}>
            <Text style={styles.storeBadgeText}>planned for Lidl</Text>
          </View>
        </View>

        {/* Cost & Grocery List summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.costSection}>
            <Text style={styles.costLabel}>EST. COST</Text>
            <View style={styles.costValues}>
              <Text style={styles.costCurrent}>£22.82</Text>
              <Text style={styles.costTotal}> / £23</Text>
            </View>
            {/* Progress bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '99%' }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.groceryListBtn}>
            <Text style={styles.groceryListTap}>TAP TO VIEW</Text>
            <Text style={styles.groceryListTitle}>Grocery list</Text>
            <Text style={styles.groceryListSub}>0/17 items bought</Text>
          </TouchableOpacity>
        </View>

        {/* Days List */}
        <View style={styles.daysList}>
          {daysData.map((item, index) => (
            <View key={index} style={styles.dayCardWrapper}>
              <Text style={styles.dayLabelText}>{item.day}</Text>
              
              <View style={styles.dayCard}>
                <Image source={{ uri: item.image }} style={styles.mealImage} />
                
                <View style={styles.mealInfo}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <Text style={styles.mealTitle} numberOfLines={1}>{item.title}</Text>
                  
                  <View style={styles.caloriesRow}>
                    <FontAwesome5 name="fire" size={16} color="#1a1a1a" />
                    <Text style={styles.caloriesText}>{item.calories} Calories</Text>
                  </View>
                  
                  <View style={styles.macrosRow}>
                    <View style={styles.macroItem}>
                      <MaterialCommunityIcons name="food-drumstick" size={16} color="#e57373" />
                      <Text style={styles.macroText}>{item.protein}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <FontAwesome5 name="wheat" size={14} color="#d4a373" />
                      <Text style={styles.macroText}>{item.carbs}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <MaterialCommunityIcons name="water" size={18} color="#64b5f6" style={{ marginTop: -2 }} />
                      <Text style={styles.macroText}>{item.fat}g</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  storeLogoContainer: {
    marginRight: 8,
  },
  storeLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffeb3b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0c020',
  },
  storeLogoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0050aa',
  },
  storeBadge: {
    backgroundColor: '#f1f8e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  storeBadgeText: {
    color: '#7cb342',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  costSection: {
    flex: 1,
    marginRight: 16,
  },
  costLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  costValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  costCurrent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  costTotal: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#cddc39',
    borderRadius: 3,
  },
  groceryListBtn: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 16,
    width: 140,
  },
  groceryListTap: {
    fontSize: 10,
    color: '#90caf9',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  groceryListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  groceryListSub: {
    fontSize: 12,
    color: '#64b5f6',
    fontWeight: '600',
  },
  daysList: {
    gap: 24,
  },
  dayCardWrapper: {
    gap: 8,
  },
  dayLabelText: {
    fontSize: 12,
    color: '#8e8e93',
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  dayCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F6F9',
    borderRadius: 24,
  },
  mealImage: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  mealInfo: {
    flex: 1,
    padding: 16,
    paddingLeft: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  timeText: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 13,
    color: '#8e8e93',
    fontFamily: 'Inter_400Regular',
  },
  mealTitle: {
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 4,
    marginBottom: 6,
    paddingRight: 50, // avoid overlapping with time
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    color: '#1a1a1a',
    marginLeft: 6,
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  macroText: {
    fontSize: 13,
    color: '#8e8e93',
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    marginLeft: 4,
  },
});
