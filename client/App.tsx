import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CodePush from 'react-native-code-push';
import RootNavigation from './src/navigation';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import OfflineBanner from './src/components/OfflineBanner';

function App() {
  usePushNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <OfflineBanner />
        <RootNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const codePushOptions = { checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME };
export default CodePush(codePushOptions)(App);
