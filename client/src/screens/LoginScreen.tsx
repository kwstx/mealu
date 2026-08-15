import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { setJwtPair } from '../storage';

export default function LoginScreen() {
  const handleLogin = () => {
    // Set a dummy JWT pair to trigger navigation state update
    setJwtPair({ access: 'dummy_access_token', refresh: 'dummy_refresh_token' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login Screen</Text>
      <Button title="Login" onPress={handleLogin} />
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
