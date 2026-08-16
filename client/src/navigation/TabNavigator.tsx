import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import PlannerScreen from '../screens/PlannerScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Feather } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';
          if (route.name === 'Planner') iconName = 'home';
          else if (route.name === 'ShoppingList') iconName = 'shopping-cart';
          else if (route.name === 'History') iconName = 'heart';
          else if (route.name === 'Profile') iconName = 'user';
          
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#cddc39',
        tabBarInactiveTintColor: '#d1d1d6',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: '#FFFFFF',
        }
      })}
    >
      <Tab.Screen name="Planner" component={PlannerScreen} options={{ tabBarLabel: 'HOME' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'FAVORITES' }} />
      <Tab.Screen name="ShoppingList" component={ShoppingListScreen} options={{ tabBarLabel: 'SHOPPING LIST' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
}
