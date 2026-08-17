import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import MealDetailScreen from '../screens/MealDetailScreen';
import GroceryListScreen from '../screens/GroceryListScreen';
import { getJwtPair, storage, STORAGE_KEYS, setJwtPair } from '../storage';
import { ApiClient } from '../api/client';
import * as Linking from 'expo-linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

let ReactNativeBiometrics: any;
if (Platform.OS !== 'web') {
  ReactNativeBiometrics = require('react-native-biometrics').default;
}

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
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const jwt = getJwtPair();
      if (jwt) {
        let authSuccess = false;
        try {
          if (Platform.OS !== 'web' && ReactNativeBiometrics) {
            const rnBiometrics = new ReactNativeBiometrics();
            const { available } = await rnBiometrics.isSensorAvailable();
            if (available) {
              const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Unlock to restore session' });
              authSuccess = success;
            } else {
              authSuccess = true;
            }
          } else {
            authSuccess = true;
          }
        } catch (error) {
          console.error('Biometric error', error);
          authSuccess = false;
        }

        if (authSuccess) {
          setIsAuthenticated(true);
          // Fetch profile to check if onboarding is needed
          try {
            const profile = await ApiClient.get('/profile');
            if (profile && profile.preferred_store_ids && profile.preferred_store_ids.length > 0 && profile.weekly_budget > 0) {
              setIsProfileComplete(true);
            } else {
              setIsProfileComplete(false);
            }
          } catch (e) {
            console.error('Failed to fetch profile during init', e);
            // If we fail to fetch profile, maybe token is expired.
            // For now, assume incomplete.
            setIsProfileComplete(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();

    const { DeviceEventEmitter } = require('react-native');
    const profileSub = DeviceEventEmitter.addListener('profile_completed', () => {
      setIsProfileComplete(true);
    });

    const listener = storage.addOnValueChangedListener((key) => {
      if (key === STORAGE_KEYS.JWT_PAIR) {
        const hasJwt = !!getJwtPair();
        setIsAuthenticated(hasJwt);
        if (!hasJwt) {
          setIsProfileComplete(false);
        } else {
          // A new login happened, we should re-check profile
          // But since listener is synchronous, we can just trigger a re-init
          // or assume incomplete and let Onboarding screen fetch it.
          // Setting it to false forces Onboarding where they can complete it or it will be skipped if already complete?
          // Actually, if we just logged in, we should check it.
          setIsInitializing(true);
          initializeAuth();
        }
      }
    });
    return () => {
      listener.remove();
      profileSub.remove();
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
          !isProfileComplete ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
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
              <Stack.Screen 
                name="GroceryList" 
                component={GroceryListScreen} 
                options={{
                  presentation: 'card',
                  gestureEnabled: true,
                }}
              />
            </>
          )
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
