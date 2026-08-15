import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReactNativeBiometrics from 'react-native-biometrics';
import type { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import MealDetailScreen from '../screens/MealDetailScreen';
import { getJwtPair, storage, STORAGE_KEYS, setJwtPair } from '../storage';

import * as Linking from 'expo-linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['myapp://', Linking.createURL('/')],
  config: {
    initialRouteName: 'Main' as const,
    screens: {
      Main: {
        screens: {
          History: 'history',
        },
      },
      MealDetail: 'plan/:id',
    },
  },
};

export default function RootNavigation() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const jwt = getJwtPair();
      if (jwt) {
        const rnBiometrics = new ReactNativeBiometrics();
        try {
          const { available } = await rnBiometrics.isSensorAvailable();
          if (available) {
            const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Unlock to restore session' });
            if (success) {
              setIsAuthenticated(true);
            } else {
              // Failed biometric unlock, clear token or force re-login
              setIsAuthenticated(false);
            }
          } else {
            // Biometrics not available, fallback to true if we trust the token
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Biometric error', error);
          setIsAuthenticated(false);
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();

    const listener = storage.addOnValueChangedListener((key) => {
      if (key === STORAGE_KEYS.JWT_PAIR) {
        setIsAuthenticated(!!getJwtPair());
      }
    });
    return () => {
      listener.remove();
    };
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
