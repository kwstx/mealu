import { registerRootComponent } from 'expo';
import App from './App';

// Register background handler (Mocked for Web)
console.log('Firebase background handlers are disabled on the web.');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
