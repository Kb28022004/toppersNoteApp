import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { useSavePushTokenMutation } from '../features/api/notificationApi';

// Define how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useFirebaseNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [savePushToken] = useSavePushTokenMutation();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        setExpoPushToken(token);
        if (token) {
           // Send to backend automatically on mount/login
           savePushToken(token).unwrap().catch(err => console.warn('Push token save error:', err));
        }
      })
      .catch(err => console.log('Push Token Error (expected in Expo Go):', err.message));

    // Listener for when notification is received while app is OPEN (Foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // You can trigger Redux actions or Toast here based on notification.request.content
      console.log("Foreground Notification Received:", notification.request.content);
    });

    // Listener for when user TAPS on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("Notification Tapped, data:", data);
      
      // Handle Navigation here if needed
      // e.g., if (data.type === 'NEW_SALE') { navigation.navigate('TransactionHistory'); }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return { expoPushToken };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
        if (isRunningInExpoGo()) {
            console.log('Push notifications are not supported in Expo Go with SDK 53+. Use a development build.');
            return '';
        }

        // For standalone/dev builds, we need the Native FCM token for Firebase Admin SDK
        token = (await Notifications.getDevicePushTokenAsync()).data;
    } catch (pushErr) {
        console.warn("Expo Push Token Error (Ignored in Expo Go):", pushErr.message);
    }
    
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
