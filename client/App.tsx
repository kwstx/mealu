import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
