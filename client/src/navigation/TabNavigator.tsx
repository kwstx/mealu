import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';

import type { MainTabParamList } from './types';
import PlannerScreen from '../screens/PlannerScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabsWrapper}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          let IconComponent;
          if (route.name === 'Planner') {
            IconComponent = <Ionicons name={isFocused ? 'home' : 'home-outline'} size={22} color={isFocused ? '#000' : '#8E8E93'} />;
          } else if (route.name === 'History') {
            IconComponent = <Ionicons name={isFocused ? 'heart' : 'heart-outline'} size={24} color={isFocused ? '#000' : '#8E8E93'} />;
          } else if (route.name === 'ShoppingList') {
            IconComponent = <Ionicons name={isFocused ? 'cart' : 'cart-outline'} size={24} color={isFocused ? '#000' : '#8E8E93'} />;
          } else if (route.name === 'Profile') {
            IconComponent = (
              <View style={[styles.avatarCircle, { backgroundColor: '#4CA4C5' }]}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabButton, isFocused && styles.tabButtonFocused]}
            >
              {IconComponent}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={styles.fabButton}>
        <Feather name="plus" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator 
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Planner" component={PlannerScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'Favorites' }} />
      <Tab.Screen name="ShoppingList" component={ShoppingListScreen} options={{ tabBarLabel: 'Shopping List' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  tabsWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    minWidth: 64,
  },
  tabButtonFocused: {
    backgroundColor: '#F0F0F0',
  },
  tabLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#000',
    fontWeight: 'bold',
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});
