import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import type { HomeTabScreenProps } from '../navigation/types';

export default function HomeScreen({ navigation }: HomeTabScreenProps<'Home'>) {
  // Use focus effect to participate in status bar styling for this tab
  useFocusEffect(
    React.useCallback(() => {
      // Configure status bar specific to this screen
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Home Screen</Text>
      <Button
        title="Go to Detail"
        onPress={() => navigation.navigate('Tabs' as any, { screen: 'Detail', params: { id: '123' } })}
        // Wait, navigating from a tab screen to a root stack screen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  }
});
