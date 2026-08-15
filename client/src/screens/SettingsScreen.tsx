import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import type { HomeTabScreenProps } from '../navigation/types';

export default function SettingsScreen({ navigation }: HomeTabScreenProps<'Settings'>) {
  // Use focus effect to participate in status bar styling for this tab
  useFocusEffect(
    React.useCallback(() => {
      // Configure status bar specific to this screen
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Light status bar for settings to demonstrate styling */}
      <StatusBar style="light" />
      <Text style={styles.title}>Settings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  }
});
