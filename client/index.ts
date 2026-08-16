import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

if (Platform.OS !== 'web') {
  const { getMessaging, setBackgroundMessageHandler } = require('@react-native-firebase/messaging');
  const { storage } = require('./src/storage/mmkv');

  // Register background handler
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async (remoteMessage: any) => {
    console.log('Message handled in the background!', remoteMessage);
    
    if (remoteMessage.data && remoteMessage.data.mealPlan) {
      // Write the MealPlan directly into MMKV
      storage.set('MealPlan', remoteMessage.data.mealPlan as string);
      console.log('MealPlan successfully saved to MMKV in the background.');
    }
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
