import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import MealDetailScreen from '../screens/MealDetailScreen';
import { getJwtPair, storage, STORAGE_KEYS } from '../storage';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getJwtPair());

  useEffect(() => {
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === STORAGE_KEYS.JWT_PAIR) {
        setIsAuthenticated(!!getJwtPair());
      }
    });
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="MealDetail" 
              component={MealDetailScreen} 
              options={{
                presentation: 'card',
                gestureEnabled: true,
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
