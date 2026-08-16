import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import OfflineBanner from './src/components/OfflineBanner';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  usePushNotifications();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <OfflineBanner />
        <RootNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

let ExportedApp = App;
if (Platform.OS !== 'web') {
  const CodePush = require('react-native-code-push').default;
  const codePushOptions = { checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME };
  ExportedApp = CodePush(codePushOptions)(App);
}

export default ExportedApp;
