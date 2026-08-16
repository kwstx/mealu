export const usePushNotifications = () => {
  return {
    expoPushToken: undefined,
    notification: undefined,
    requestPermissions: async () => false,
  };
};
