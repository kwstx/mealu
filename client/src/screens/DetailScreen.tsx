import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { RootStackScreenProps } from '../navigation/types';

export default function DetailScreen({ route, navigation }: RootStackScreenProps<'Detail'>) {
  return (
    <View style={styles.container}>
      {/* Auto status bar */}
      <StatusBar style="auto" />
      <Text style={styles.title}>Detail Screen</Text>
      <Text>ID parameter: {route.params.id}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  }
});
