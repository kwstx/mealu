import { registerRootComponent } from 'expo';
import { getMessaging, setBackgroundMessageHandler, RemoteMessage } from '@react-native-firebase/messaging';
import { storage } from './src/storage/mmkv';

import App from './App';

// Register background handler
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, async (remoteMessage: RemoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
  
  if (remoteMessage.data && remoteMessage.data.mealPlan) {
    // Write the MealPlan directly into MMKV
    storage.set('MealPlan', remoteMessage.data.mealPlan as string);
    console.log('MealPlan successfully saved to MMKV in the background.');
  }
});
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
