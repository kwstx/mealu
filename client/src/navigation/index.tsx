import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import type { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import DetailScreen from '../screens/DetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL('/');

const config = {
  screens: {
    Tabs: {
      screens: {
        Home: 'home',
        Settings: 'settings',
      },
    },
    Detail: 'detail/:id',
  },
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix],
  config,
};

export default function RootNavigation() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} />
        {/* Detail screen allows back gesture on native platforms by default with native-stack */}
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen} 
          options={{ 
            headerShown: true,
            title: 'Detail',
            // Ensure back gesture works and native presentation
            presentation: 'card', 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
