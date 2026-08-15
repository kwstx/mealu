import { useEffect } from 'react';
import { getMessaging, onMessage, getToken, AuthorizationStatus, RemoteMessage } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { ApiClient } from '../api/client';

export function usePushNotifications() {
  useEffect(() => {
    const messaging = getMessaging();

    async function requestUserPermission() {
      // For iOS, this triggers the permission prompt.
      // For Android, permissions are granted by default (on Android 12 and below), 
      // but Android 13+ requires explicitly requesting it. This method handles it.
      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        await getFCMToken();
      } else {
        console.log('Push notification permission denied');
      }
    }

    async function getFCMToken() {
      try {
        // Register the device with FCM if it's not already
        if (!messaging.isDeviceRegisteredForRemoteMessages) {
          await messaging.registerDeviceForRemoteMessages();
        }

        // Get the token
        const token = await getToken(messaging);
        console.log('FCM Token:', token);

        // TODO: Send this token to the chosen backend API endpoint
        // e.g., POST /api/users/push-token
        await sendTokenToBackend(token);
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    }

    async function sendTokenToBackend(token: string) {
      try {
        await ApiClient.post('/profile/push-token', { token });
        console.log('Successfully sent push token to backend API');
      } catch (error) {
        console.error('Failed to send token to backend:', error);
      }
    }

    requestUserPermission();

    // Listen for foreground messages as well, just in case
    const unsubscribe = onMessage(messaging, async (remoteMessage: RemoteMessage) => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      // In foreground, we might not want to write to mmkv silently, or maybe we do
      // For now, just logging it
    });

    return unsubscribe;
  }, []);
}
