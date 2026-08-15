import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { setJwtPair } from '../storage';

export default function ProfileScreen() {
  const handleLogout = () => {
    // Clear JWT pair to trigger navigation state update
    setJwtPair(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
