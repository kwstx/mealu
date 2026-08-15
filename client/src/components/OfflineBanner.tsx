import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOfflineQueue } from '../store/offlineQueueStore';

export default function OfflineBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  const { flushQueue } = useOfflineQueue();
  
  // To track transition from offline -> online
  const [wasOffline, setWasOffline] = useState(false);

  const isOffline = netInfo.isConnected === false;

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
    } else if (netInfo.isConnected === true && wasOffline) {
      // Reconnected!
      flushQueue();
      setWasOffline(false);
    }
  }, [isOffline, netInfo.isConnected, wasOffline, flushQueue]);

  if (!isOffline) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.text}>You are currently offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff4444',
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 4,
  },
});
