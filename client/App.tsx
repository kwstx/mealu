import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';
import { usePushNotifications } from './src/hooks/usePushNotifications';

export default function App() {
  usePushNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
